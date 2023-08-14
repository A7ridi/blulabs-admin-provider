import React from "react";
import BaseComponent from "../../components/BaseComponent";
import Apimanager from "../../Apimanager/index";
import moment from "moment";
import LoadingContent from "../../common/LoadingContent";
import Select from "react-select";
import _ from "lodash";
import { v4 as uuid } from "uuid";
import Loader from "react-loader-spinner";

class LeftBar extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      docList: [],
      bundleList: [],
      bundleListCopy: [],
      isModalOpen: true,
      selectedFile: "",
      isloading: false,
      active: "",
      searchName: null,
      previousData: null,
      sortValue: null,
      isDocument: true,
      bundleSelected: null,
      loadingDocumentsForBundle: null,
    };
  }

  componentDidMount() {
    this.getLibraryList();
    this.getLibraryTags();
    this.props.onRef(this);
  }

  getCallAfterUpdate = (status) => {
    this.getLibraryList();
    this.getLibraryTags();
    if (status === "delete") {
      this.setState({
        active: "",
        selectedFile: "",
      });
    } else {
      this.setState({
        active: "",
      });
    }
  };

  getLibraryList = () => {
    this.setState({
      isloading: true,
    });

    Apimanager.getLibraryList(
      {},
      (success) => {
        if (success && success.status === 200 && success.data && success.data) {
          this.setState({
            docList: success.data,
            isloading: false,
            previousData: success.data,
          });
          this.props.getListingResponse();
        }
      },
      (error) => {
        this.props.getListingResponse();
        if (error && error.status === 500) {
          if (
            error.data &&
            error.data.settings &&
            error.data.settings.message
          ) {
            this.ErrorAlertbar(error.data.settings.message);
            this.setState({
              isloading: false,
            });
            return;
          }
        }

        if (error && error.status === 401) {
          this.setState({
            recordMessage: "yes",
            isloading: false,
          });
          return;
        }

        return;
      }
    );
  };

  getLibraryTags = () => {
    Apimanager.getTagList({}, (success) => {
      this.setState({
        bundleList: success?.data?.map((e) => {
          return { name: e.name, id: uuid() };
        }),
        bundleListCopy: success?.data?.map((e) => {
          return { name: e.name, id: uuid() };
        }),
      });
    });
  };

  selectFile = (index, obj) => {
    this.setState({
      selectedFile: index,
    });
    this.props.getFileViewData(obj);
  };

  getEdit = (obj, status, bundleObject) => {
    this.props.editFile(obj, status, bundleObject);
  };

  openTooltip = (index) => {
    this.setState({
      active: this.state.active === index ? "" : index,
    });
  };

  loadingStatus = (status) => {
    this.setState({
      isloading: status,
    });
  };

  searchLibrary = (e) => {
    let list;
    if (e.target.value) {
      list = this.state.docList.filter((list) => {
        if (list.title.toLowerCase().includes(e.target.value)) {
          return list;
        } else {
          if (list.tags) {
            let result = _.find(list.tags, function (n) {
              if (n.name.toLowerCase().includes(e.target.value)) {
                return true;
              }
            });

            return result;
          }
          //return null
        }
      });
    } else {
      list = this.state.previousData;
    }

    this.setState({
      searchName: e.target.value,
      docList: list,
    });
  };

  sortList = (val) => {
    this.setState({
      sortValue: val,
    });

    let newData = this.state.docList;

    if (val?.value === 2) {
      newData.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return a.createdAt - b.createdAt;
      });
    } else if (val === null || val?.value === 1 || val?.value === 3) {
      newData.sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return b.createdAt - a.createdAt;
      });
    } else if (val?.value === 4 || val?.value === 5) {
      newData.sort((a, b) => {
        let fa = a.title.toLowerCase(),
          fb = b.title.toLowerCase();
        if (val?.value === 4) {
          if (fa < fb) {
            return -1;
          }
          if (fa > fb) {
            return 1;
          }
          return 0;
        } else {
          if (fa > fb) {
            return -1;
          }
          if (fa < fb) {
            return 1;
          }
          return 0;
        }
      });
    }

    this.setState({
      docList: newData,
    });
  };

  mediaTypeIcon = (contentType, type = "") => {
    let iconClass = "doc-lib-icon";
    if (type === "bundle") {
      iconClass = "lib-bundle-icon";
    }
    if (contentType?.includes("image")) {
      return (
        <img src="/assets/images/image-icon.svg" alt="" className={iconClass} />
      );
    } else if (contentType?.includes("audio")) {
      return (
        <img src="/assets/images/audio-icon.svg" alt="" className={iconClass} />
      );
    } else if (contentType?.includes("video")) {
      return (
        <img src="/assets/images/video-icon.svg" alt="" className={iconClass} />
      );
    } else if (contentType?.includes("pdf")) {
      return (
        <img src="/assets/images/pdf-icon.svg" alt="" className={iconClass} />
      );
    } else if (
      contentType?.includes("application/docx") ||
      contentType?.includes("application/document") ||
      contentType?.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      contentType?.includes("text/rtf") ||
      contentType?.includes("text/plain") ||
      contentType?.includes("application/msword")
    ) {
      return (
        <img
          src="/assets/images/document-icon.svg"
          alt=""
          className={iconClass}
        />
      );
    } else {
      return (
        <img
          src="/assets/images/attachment-icon.svg"
          alt=""
          className={iconClass}
        />
      );
    }
  };

  render() {
    //console.log("hello", this.state.docList);

    let documentList = [];
    if (this.state.docList && this.state.docList.length > 0) {
      documentList = this.state.docList.map((list, index) => {
        return (
          <li
            className={this.state.selectedFile === index ? "active" : ""}
            key={"docList" + index}
          >
            <div
              className="doc-wrap"
              onClick={() => this.selectFile(index, list)}
            >
              <div>{this.mediaTypeIcon(list?.type)}</div>
              <div className="doc-info-div">
                <span className="doc-date">
                  {moment.unix(list.createdAt).format("MM/DD/YYYY")}
                </span>

                <div className="doc-name">{list.title}</div>
              </div>
            </div>
            {/* <span
              className="option-list-toggle"
              onClick={() => this.openTooltip(index)}
            ></span> */}
            <div className="button-group">
              <span onClick={() => this.getEdit(list)}>Edit</span>
              <span onClick={() => this.getEdit(list, "delete")}>Delete</span>
            </div>
            <ul
              className={
                this.state.active === index ? "option-list open" : "option-list"
              }
            >
              <li onClick={() => this.getEdit(list)}>
                <span>Rename</span>
              </li>
              <li onClick={() => this.getEdit(list, "delete")}>
                <span style={{ color: "red" }}>Delete</span>
              </li>
            </ul>
          </li>
        );
      });
    }

    let bundleList = [];
    if (this.state.bundleList && this.state.bundleList.length > 0) {
      bundleList = this.state.bundleList.map((bundle, index) => {
        return (
          <li
            key={index}
            style={{ cursor: "pointer" }}
            className={this.state.isDocument ? "not-expanded" : ""}
          >
            <div className="doclib-user-content">
              <div
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                }}
              >
                <div className="doclib-listing-left">
                  <div
                    className="doclib-bundle-name"
                    onClick={(e) => {
                      if (this.state.bundleSelected?.id === bundle.id) {
                        this.setState({
                          bundleSelected: null,
                        });
                        return;
                      }
                      Apimanager.getTagDocuments(bundle.name, (success) => {
                        this.setState({
                          bundleSelected: {
                            id: bundle.id,
                            data: success.data,
                            tag: bundle.name,
                          },
                          loadingDocumentsForBundle: null,
                        });
                      });
                      this.setState({
                        loadingDocumentsForBundle: bundle.id,
                      });
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <img
                        src="/assets/images/webhook-icon.svg"
                        alt=""
                        style={{ marginRight: "10px", height: "40px" }}
                      />
                      <div className="doclib-bundle-name-text">
                        {bundle.name}
                      </div>
                    </div>
                  </div>
                  {this.state.loadingDocumentsForBundle === bundle.id ? (
                    <Loader
                      type="ThreeDots"
                      color="#c9c9c9"
                      height={30}
                      width={30}
                      timeout={0}
                      style={{ marginRight: "10px" }}
                    />
                  ) : null}

                  <div
                    style={{ display: "inline-block", marginLeft: "15px" }}
                    onClick={() => {
                      if (this.state.bundleSelected?.id === bundle.id) {
                        this.setState({
                          bundleSelected: null,
                        });
                        return;
                      }
                      Apimanager.getTagDocuments(bundle.name, (success) => {
                        this.setState({
                          bundleSelected: { id: bundle.id, data: success.data },
                          loadingDocumentsForBundle: null,
                        });
                      });
                      this.setState({
                        loadingDocumentsForBundle: bundle.id,
                      });
                    }}
                  >
                    {this.state.bundleSelected?.id === bundle.id ? (
                      <img src="./assets/images/uparrow-icon.svg" alt="" />
                    ) : (
                      <img src="./assets/images/downarrow-icon.svg" alt="" />
                    )}
                  </div>
                </div>
                {this.state.bundleSelected?.id === bundle.id
                  ? this.state.bundleSelected?.data?.map((document) => {
                      return (
                        <div className="doclib-tag-document">
                          <div className="doc-info-inside-bundle">
                            <div>
                              {this.mediaTypeIcon(document?.type, "bundle")}
                            </div>
                            <label className="doclib-tag-document-text">
                              {document.title}
                            </label>
                          </div>
                          <div className="button-group">
                            <span onClick={() => this.getEdit(document)}>
                              Edit
                            </span>
                            <span
                              onClick={() =>
                                this.getEdit(document, "delete", {
                                  docListType: "bundle",
                                  tagName: this.state.bundleSelected.tag,
                                })
                              }
                            >
                              Remove
                            </span>
                          </div>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          </li>
        );
      });
    }

    return (
      <div className="document-leftbar">
        {this.state.isloading ? <LoadingContent /> : ""}

        <ul>
          <div className="library-searc-select">
            <div className="form-group search-new">
              <input
                type="text"
                className="form-control get-focus-close"
                id="exampleInputEmail2Search"
                aria-describedby="emailHelp"
                autoComplete="off"
                placeholder="Search by title"
                onChange={(e) => this.searchLibrary(e)}
                value={this.state.searchName}
              />
              <span className="material-icons">search</span>
            </div>
            {this.state.isDocument && (
              <Select
                className="sort-select"
                placeholder="Sort By"
                value={this.state.sortValue}
                options={[
                  { value: 2, label: "Oldest to Newest" },
                  { value: 1, label: "Newest to Oldest" },
                  { value: 3, label: "Remove All" },
                  { value: 4, label: "From A to Z" },
                  { value: 5, label: "From Z to A" },
                ]}
                onChange={(val) => {
                  if (val.value === 3) {
                    val = null;
                  }
                  this.sortList(val);
                }}
              />
            )}
          </div>
          <div>
            <div
              className="segment-control"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "10px 0",
                marginBottom: "20px",
              }}
            >
              <div
                className={
                  "share-btn " + (this.state.isDocument ? "active" : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  // if (!this.state.isDocumentLibrary) {
                  this.setState({
                    ...this.state,
                    isDocument: true,
                  });
                  // }
                }}
              >
                <button className="media-btn">Documents</button>
              </div>
              <div
                className={
                  "share-btn " + (!this.state.isDocument ? "active" : "")
                }
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({
                    ...this.state,
                    isDocument: false,
                  });
                }}
              >
                <button className="text-btn">Bundles</button>
              </div>
            </div>
          </div>
          {this.state.isDocument ? documentList : bundleList}
        </ul>
        {/* <button
          type="button"
          className="btn btn-blue-block"
          data-dismiss="modal"
          onClick={() => this.props.getModalOpen()}
        >
          Create New
        </button> */}
      </div>
    );
  }
}

export default LeftBar;
