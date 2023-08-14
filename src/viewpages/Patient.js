import React from "react";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
import LoadingContent from "../common/LoadingContent";
import Apimanager from "../Apimanager/index";
import { withRouter } from "react-router";
import moment from "moment";
//import _ from 'lodash'
// import * as i18n from '../I18n/en.json'
//import { formatDate } from '../helper'
import ReactDOM from "react-dom";
import BaseComponent from "../components/BaseComponent";
import $ from "jquery";
import axios from "axios"
import { store } from "../redux/store";
import * as actions from "../redux/actions/auth.action";

var controller = new AbortController();
var signal = controller.signal;

function reverseString(str) {
  if (str) {
    var nameSrt = str.split("");
    var newname = [];
    var isemail = nameSrt.includes("@") ? 1 : 2;
    for (var i = 0; i < isemail; i++) {
      newname.push(nameSrt[i]);
    }
    str = newname.join("");
    return str;
  }
}

var pagination = { pagenumber: 1, itemperpage: 10 };

class Patient extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchtext: "",
      storedObject: null,
      searchPatientResult: [],
      isloading: false,
      loadmore: false,
      isDataIsEmpty: "",
      showVideoLoader: false,
      videoLoaderIndex: null,
    };
    window.search = 1;
  }
  componentDidMount() {
    this.setState({ storedObject: JSON.parse(this.props.data.northwelluser) });
    ReactDOM.findDOMNode(this.refs.patient_scroll).addEventListener(
      "scroll",
      this.handleScrollToElement
    );

    if (
      this.props &&
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.searchText
    ) {
      this.setState({}, () => {
        this.setState({
          searchtext: this.props.location.state.searchText,
          isloading: true,
        });
        this.fetchRemoteData(this.props.location.state.searchText);
      });
    }
  }

  handleScrollToElement = (event) => {
    let element = event.target;
    if (element.scrollTop + element.offsetHeight >= element.scrollHeight) {
      this.loadmore();
    }
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ storedObject: JSON.parse(nextProps.data.northwelluser) });
  }
  loadmore = () => {

    pagination.pagenumber++;
    // pagination.itemperpage = 10;
    this.setState({ loadmore: false, isloading: false }, () =>
      this.fetchRemoteData()
    );
  };
  fetchRemoteData = (preSearch = "") => {
    try {
      let { searchtext, storedObject, searchPatientResult } = this.state;
      var auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
      if (!storedObject && preSearch === "") {
        return;
      }
      if (!searchtext.length && preSearch === "") {
        this.setState({
          isloading: false,
          searchPatientResult: [],
        });
        return;
      }

      if (preSearch) {
        searchtext = preSearch;
      }

      var queryparams = {
        page: pagination.pagenumber,
        pageSize: pagination.itemperpage,
        searchTerm: searchtext,
      };
      //console.log(queryparams.searchTerm.replace(/ /g, ""), "mnmnmnmn");

      var endpoint =
        `${process.env.REACT_APP_URL}/user/search?` +
        $.param({
          key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
          searchTerm: encodeURIComponent(queryparams.searchTerm.trim()),
          page: queryparams.page,
          pageSize: queryparams.pageSize,
        });
      // "&searchTerm=" +
      // queryparams.searchTerm +
      // "&page=" +
      // queryparams.page +
      // "&pageSize=" +
      // queryparams.pageSize;

      fetch(endpoint, {
        method: "get",
        signal: signal,
        headers: new Headers({
          Authorization: auth,
          "Content-Type": "application/text",
          //Accept: "application/json",
        }),

        // body: "A=1&B=2",
      }).then(function (response) {
        if (response.status === 401) {
          throw response.status
        } else {
          return response.json()
        }
      })

        // .then((response) => response.json())
        .then((success) => {

          //return success.json()  //we only get here if there is no error

          if (success.settings.status === 1) {
            var data = searchPatientResult.concat(success && success.data);
            if (data.length > 0) {
              if (window.search === 1) {
                this.setState({
                  searchPatientResult: data,
                  isloading: false,
                  loadmore: false,
                });
              } else {
                this.setState({
                  searchPatientResult: [],
                  isloading: false,
                  loadmore: false,
                });
              }
            } else {
              this.setState({
                isloading: false,
                loadmore: false,
              });
            }
          } else {

            this.setState({
              isloading: false,
              loadmore: false,
            });
          }
        }).catch((error) => {
          if (error && error === 401) {
            var redux_store = store.getState();
            var northwelluser_store =
              redux_store &&
              redux_store.auth &&
              redux_store.auth.northwelluser &&
              JSON.parse(redux_store.auth.northwelluser);
            var refreshToken =
              northwelluser_store.user.stsTokenManager.refreshToken;
            var bodyFormData = {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
            };

            axios({
              method: "post",
              url: `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASEAPIKEY}`,
              data: bodyFormData,
              config: { headers: { "Content-Type": "multipart/form-data" } },
            })
              .then((response) => {
                var stsTokenManager = {
                  apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
                  refreshToken: response.data.refresh_token,
                  accessToken: response.data.access_token,
                  expirationTime: response.data.expires_in,
                };
                northwelluser_store.user.stsTokenManager = stsTokenManager;
                store.dispatch(
                  actions.savenorthwelluserobj(JSON.stringify(northwelluser_store))
                );
                var auth = `Bearer ${stsTokenManager.accessToken}`;
                fetch(endpoint, {
                  method: "get",
                  signal: signal,
                  headers: new Headers({
                    Authorization: auth,

                    "Content-Type": "application/text",

                    //Accept: "application/json",
                  }),

                  // body: "A=1&B=2",
                })
                  .then((response) => response.json())
                  .then((success) => {
                    if (success.settings && success.settings.status === 1) {
                      var data = searchPatientResult.concat(success && success.data);
                      if (data.length > 0) {
                        if (window.search === 1) {
                          this.setState({
                            searchPatientResult: data,
                            isloading: false,
                            loadmore: false,
                          });
                        } else {
                          this.setState({
                            searchPatientResult: [],
                            isloading: false,
                            loadmore: false,
                          });
                        }
                      } else {
                        this.setState({
                          isloading: false,
                          loadmore: false,
                        });
                      }
                    } else {
                      this.setState({
                        isloading: false,
                        loadmore: false,
                      });
                    }
                  })
                // header = { Authorization: `Bearer ${response.data.access_token}` };
                // this.callrestapi(
                //   endpoint,
                //   methodname,
                //   formBody,
                //   queryparams,
                //   header,
                //   success,
                //   error,
                //   (uploaded = undefined)
                // );
              })
              .catch((error) => {
                //let keysToRemove = ["isPBCSamlLoginDone", "userCredentials", "northwelluser"];
                sessionStorage.clear();
                //keysToRemove.forEach(async (k) => await localStorage.clear())
                localStorage.clear();
                store.dispatch(actions.logout());
                window.location.replace("/login");
              });
          }
          //         this.setState({ isloading: false });

        });
    } catch (err) {
      console.error(err.message);
    }
    // .then((data) => console.log(data, "data"));

    // Apimanager.searchPatientbyname(
    //   searchtext,
    //   pagination,
    //   (success) => {
    //     var data = searchPatientResult.concat(
    //       success && success.data && success.data.data
    //     );

    // if (data.length > 0) {
    //   if (window.search === 1) {
    //     this.setState({
    //       searchPatientResult: data,
    //       isloading: false,
    //       loadmore: false,
    //     });
    //   } else {
    //     this.setState({
    //       searchPatientResult: [],
    //       isloading: false,
    //       loadmore: false,
    //     });
    //   }
    // } else {
    //   this.setState({
    //     isloading: false,
    //     loadmore: false,
    //   });
    // }

    //     //this.setState({ ListSummaryDataArray: dataBinding, flterShowFine: true })
    //   },
    //   (error) => {
    //     console.log("2");
    //     if (error && error.status === 500) {
    //       console.log("_error", error);
    //       this.setState({ isloading: false });
    //       //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)

    //       return;
    //     }
    //   }
    // );
  };
  onChangeHandler = (event) => {
    try {
      pagination.pagenumber = 1;
      this.setState({
        searchtext: event.target.value,
        searchPatientResult: [],
        isloading: true,
      });
    } catch (error) {
      console.log("error", error);
    }
    if (event.target.value.length > 1) {
      window.search = 1;
      this.fetchRemoteData(event.target.value);
    } else {
      this.setState({
        searchtext: event.target.value,
        searchPatientResult: [],
        isloading: false,
      });
    }
  };

  //callUservisit = _.debounce((e) => { this.fetchRemoteData() }, 3000);

  findUserVisit(userObject, searchtext) {
    this.props.history.push(`/patient/${userObject.id}`, {
      patientObj: userObject,
      searchtext: searchtext,
    });
  }
  onError(object) {
    object.isHaveImage = false;
    this.setState({
      searchPatientResult: this.state.searchPatientResult,
    });
  }

  searchPatient = (searchtext) => {
    const { searchPatientResult } = this.state;
    //console.log('pa', searchPatientResult)
    return searchPatientResult.map((object, index) => {
      return (
        <div className="custom-box box-person" key={index}>
          <div className="box-title-item">
            <div
              class="box-left"
              onClick={() => this.findUserVisit(object, searchtext)}
            >
              <div className="box-icon">
                {object && object.isHaveImage ? (
                  <img
                    alt="Patient Profile"
                    src={`https://storage.googleapis.com/${process.env.REACT_APP_STORAGEBUCKET}/${object.id}`}
                    onError={() => this.onError(object)}
                  />
                ) : (
                    // <p style={{ textTransform: 'uppercase' }}>{reverseString((object.name || object.email).match(/\b(\w)/g).join(''))}</p>
                    <p style={{ textTransform: "uppercase" }}>
                      {object && object.name ? reverseString(object.name) : object && object.emal ? reverseString(object.email) : ""}
                    </p>
                  )}
              </div>
              <div
                className="box-details"
                onClick={() => this.findUserVisit(object, searchtext)}
              >
                <span className="box-title-sup">{""}</span>
                {object && object.name && <h2>{object && object.name} </h2>}
                <p className="box-title-sup email">{object && object.email} </p>
                <span className="box-title-sub">
                  {object &&
                    object.dob &&
                    object.dob != null &&
                    new moment(object.dob).utc().format("MM/DD/YYYY")
                    ? "DOB: " + moment(object.dob).utc().format("MM/DD/YYYY")
                    : ""}
                </span>
                <p className="box-title-sub">
                  {object && object.mobileNo && object.mobileNo != null
                    ? "Mob: " + object.mobileNo
                    : ""}
                </p>
              </div>
            </div>
            {object.isCallEnable ? (
              <button
                class="video-icon"
                onClick={() =>
                  this.patientVideoCall(object.id, object.name, index)
                }
              >
                <img src="assets/images/video-ico.png" alt="video icon" />
              </button>
            ) : (
                ""
              )}

            {this.state.showVideoLoader &&
              this.state.videoLoaderIndex === index ? (
                <div className="video-loader">
                  <LoadingIndicator />
                </div>
              ) : (
                ""
              )}
          </div>
        </div>
      );
    });
  };

  resetData = () => {
    controller.abort();
    controller = new AbortController();
    signal = controller.signal;
    this.setState({
      searchtext: "",
      searchPatientResult: [],
      isloading: false,
      loadmore: false,
      isDataIsEmpty: "",
    });

    window.search = 2;

    /**
     * Cancel Axios request
     */
    // var queryparams = {
    //   page: "1",
    //   pageSize: "10",
    //   searchTerm: "",
    // };

    // var endpoint =
    //   `${process.env.REACT_APP_URL}/user/search?key=${process.env.REACT_APP_FIREBASEAPIKEY}` +
    //   "&searchTerm=" +
    //   queryparams.searchTerm +
    //   "&page=" +
    //   queryparams.page +
    //   "&pageSize=" +
    //   queryparams.pageSize;

    // var auth = `Bearer ${this.state.storedObject.user.stsTokenManager.accessToken}`;

    // fetch(endpoint, {
    //   method: "get",
    //   auth,
    //   signal: signal, // <------ This is our AbortSignal
    // });
    // controller.abort();
  };

  patientVideoCall = (patientID, patientName, index) => {
    this.setState({
      showVideoLoader: true,
      videoLoaderIndex: index,
    });

    let queryparams = {
      room: patientID,
      receiverUserId: patientID,
      isSandbox: false,
    };

    Apimanager.getVideoCallToken(
      queryparams,
      (success) => {
        this.setState({
          showVideoLoader: false,
          videoLoaderIndex: null,
        });
        if (
          success &&
          success.data &&
          success.data.settings &&
          success.data.settings.status === 1
        ) {
          localStorage.setItem("videoCallToken", success.data.jwt);
          localStorage.setItem("patientNameVideo", patientName);
          localStorage.setItem("teleHealthID", success.data.telehealthId);
          localStorage.setItem("videoPatientID", patientID);
          window.open("/video-call", "_blank");
        } else {
          this.ErrorAlertbar(success.data.settings.message);
        }

        return;
      },
      (error) => {
        this.setState({
          showVideoLoader: false,
          videoLoaderIndex: null,
        });

        if (error && error.status === 400) {
          this.ErrorAlertbar(error.data.settings.message);

        }

        if (error && error.status === 500) {
          if (
            error.data &&
            error.data.settings &&
            error.data.settings.message
          ) {
            this.ErrorAlertbar(error.data.settings.message);
            return;
          }
        }

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          return;
        }

        return;
      }
    );
  };

  render() {
    const { searchPatientResult, searchtext, isloading, loadmore } = this.state;
    return (
      <>
        <div className="sidebar-fixed-search sidebar-fixed-date">
          <div className="custom-input-group sidebar-search-input">
            <div className="custom-input-prepend clear-input">
              <input
                type="text"
                className="form-control"
                placeholder="Search for Patients"
                aria-label=""
                name="searchtext"
                value={searchtext}
                aria-describedby="basic-addon1"
                onChange={this.onChangeHandler}
                autoComplete="off"
              />
              {searchtext ? (
                <button
                  className="icon-close"
                  style={{ marginRight: "10px" }}
                  onClick={() => this.resetData()}
                />
              ) : (
                  ""
                )}
            </div>
          </div>
        </div>
        <div className="sidebar-inner" ref="patient_scroll">
          <div className="sidebar-menu-wrapper">
            <div id="patient" className="search-patient">
              <ul className="sidebar-menu-list">
                <li
                  className="sidebar-list-item"
                  onEnded={() => alert("you reach at end ")}
                >
                  {isloading || loadmore ? (
                    <LoadingContent />
                  ) : searchPatientResult &&
                    Array.isArray(searchPatientResult) &&
                    searchPatientResult.length > 0 ? (
                        this.searchPatient(searchtext)
                      ) : (
                        searchtext && (
                          <p className="no-result">
                            <strong>No </strong>record found
                          </p>
                        )
                      )}
                </li>
                {/* {!(isloading || loadmore) && searchPatientResult && Array.isArray(searchPatientResult) && searchPatientResult.length >= 10 && pagination.itemperpage <= searchPatientResult.length && < button className="loadmore" onClick={() => this.loadmore()} > Load more</button>} */}
                {/* <button className="loadmore" onClick={() => this.loadmore()} > Load more</button> */}
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
  };
};
export default withRouter(connect(mapStateToProps)(Patient));