import React from "react";
import BaseComponent from "../../components/BaseComponent";
import Select from "react-select";
import LeftBar from "./leftbar";
import { connect } from "react-redux";
import Apimanager from "../../Apimanager/index";
//import { toast } from "react-toastify";
import LoaderIndicate from "../../common/LoadingIndicator";
import ReactAudioPlayer from "react-audio-player";
import { Line } from "rc-progress";
import swal from "sweetalert";
import { previewfileformat } from "../../helper";
import i18n from "../../I18n/en.json";
import { Multiselect } from "multiselect-react-dropdown";
import "./DocumentLibrary.css";
import { v4 as uuid } from "uuid";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
class DocLibrary extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isModalOpen: true,
      radioSelectionStatus: "",
      hospitalList: [],
      departmentList: [],
      perHospital: "",
      perDepartment: "",
      fileVal: "",
      fileTitle: "",
      fileDescription: "",
      selectDepartmetn: "",
      errormsgHsptl: "",
      errormsgHsptl1: "",
      errormsgDprt: "",
      uploadButtonLoader: false,
      isloading: true,
      mediaPath: "",
      mediaType: "",
      pdfType: "",
      mediaTitle: "",
      percentageUploaded: 0,
      isUploading: false,
      editFileObj: "",
      previewURL: "",
      editFileLoader: false,
      dragDropDiv:
        "drag-drop-overlay drag-drop-lib-overlay file-input hide-div",
      tags: [],
      files: null,
      uploadedFile: null,
      selectedTags: null,
      shareWithHospital: false,
      shareWithDepartment: false,
      shareWithPatient: false,
      doNotAutoShare: true,
      selectedTagValue: [],
    };
  }

  componentDidMount() {
    let currentUser = JSON.parse(this.props.data.userCredentials || "{}");
    if (!currentUser.user?.role.includes("admin")) {
      this.props.history.push("/");
    } else {
      this.getHospitalList();
      this.getMentionTags();
    }
  }

  checkStatusForCheckboxes = (obj) => {
    let newObject = {
      shareWithPatient: false,
      shareWithDepartment: false,
      shareWithHospital: false,
      doNotAutoShare: false,
    };
    if (
      obj.shareWithHospital &&
      obj.shareWithDepartment &&
      obj.shareWithAll === false
    ) {
      console.log("department");
      newObject.shareWithDepartment = true;
    } else if (
      obj.shareWithHospital &&
      !obj.shareWithDepartment &&
      obj.shareWithAll === false
    ) {
      console.log("hospital");
      newObject.shareWithHospital = true;
    } else if (
      !obj.shareWithHospital &&
      !obj.shareWithDepartment &&
      obj.shareWithAll
    ) {
      console.log("all");
      newObject.shareWithPatient = true;
    } else {
      newObject.doNotAutoShare = true;
    }
    return newObject;
  };

  getModalOpen = () => {
    document.getElementById("modal-open").click();
    this.resetData();
  };

  BackButton = () => {
    return (
      <div className="lib-back-button-div">
        <button
          className="LibBackButton"
          onClick={() => {
            this.setState({
              mediaType: "",
            });
          }}
        >
          Close preview
        </button>
      </div>
    );
  };

  getFileViewData = (obj) => {
    this.setState({
      isloading: true,
      mediaType: "",
      mediaPath: "",
      uploadButtonLoader: true,
    });
    let requestparams = {
      location: obj.location,
    };
    let params = {
      operationType: "read",
    };
    let split = obj.location.split(".");
    Apimanager.getMediaURL(
      requestparams,
      params,
      (success) => {
        if (
          success &&
          success.data &&
          success.data.data &&
          success.data.data.signedUrl
        ) {
          if (
            split[1].toLowerCase() === "pdf" ||
            obj.type.includes("application")
          ) {
            this.setState({
              isloading: false,
              mediaPath: success.data.data.signedUrl,
              mediaType: "else",
              pdfType:
                split[1].toLowerCase() === "pdf"
                  ? "pdf"
                  : "This file can't be previewed in the browser. We are downloading it for you.",
              mediaTitle: obj.title,
              uploadButtonLoader: false,
            });
          } else {
            this.setState({
              isloading: false,
              mediaPath: success.data.data.signedUrl,
              mediaType: obj.type,
              pdfType: "",
              mediaTitle: obj.title,
              uploadButtonLoader: false,
            });
          }
          if (obj.type === "text/plain") {
            this.setState({
              isloading: false,
              mediaPath: success.data.data.signedUrl,
              mediaType: "else",
              pdfType: "pdf",
              mediaTitle: obj.title,
              uploadButtonLoader: false,
            });

            // var req = new XMLHttpRequest();
            // req.overrideMimeType("application/json");
            // req.open("GET", success.data.data.signedUrl, true);
            // req.onload = function () {
            //   //var jsonResponse = JSON.parse(req.responseText);
            //   const element = document.createElement("a");
            //   const file = new Blob([req.responseText], {
            //     type: "text/plain",
            //   });
            //   element.href = URL.createObjectURL(file);
            //   element.download = obj.title;
            //   document.body.appendChild(element); // Required for this to work in FireFox
            //   element.click();
            // };
            // req.send(null);
          }
        }
      },
      (error) => {
        this.setState({
          isloading: false,
        });
        if (error && error.status === 500) {
          return;
        }
      }
    );
  };

  getMentionTags = () => {
    Apimanager.getTagList(
      "",
      (success) => {
        this.setState({
          tags: success.data,
        });
      },
      (error) => {
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

  getHospitalList = () => {
    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }
    let queryparams = {
      enterpriseId: enterpriseId,
      page: "",
      pageSize: "",
    };

    Apimanager.getHospitalListing(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          this.setState({
            hospitalList: success.data.data,
            //isloading: false,
          });
        }
      },
      (error) => {
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

  departmentList = (id, departmentId = false) => {
    let params = {
      id: id,
    };
    Apimanager.getDepartmentListing(
      params,
      (success) => {
        if (success && success.data) {
          let selectDep;

          if (departmentId && success.data.length > 0) {
            for (let i = 0; i < success.data.length; i++) {
              if (departmentId === success.data[i].id) {
                selectDep = {
                  value: departmentId,
                  label: success.data[i].name,
                };
              }
            }
          }

          this.setState({
            departmentList: success.data,
            selectDepartmetn: departmentId ? selectDep : null,
          });
        }
      },
      (error) => {
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

        return;
      }
    );
  };

  getSelectHospital = (val) => {
    let object = {
      shareWithHospital: false,
      shareWithDepartment: false,
      shareWithPatient: false,
      doNotAutoShare: false,
    };
    if (this.state.shareWithHospital) {
      object.shareWithHospital = true;
    } else if (this.state.shareWithPatient) {
      object.shareWithPatient = true;
    } else {
      object.doNotAutoShare = true;
    }

    this.setState({
      ...object,
      perHospital: val,
      errormsgHsptl: "",
      selectDepartmetn: null,
    });
    this.departmentList(val.value);
  };

  resetData = () => {
    this.setState({
      fileVal: "",
      fileTitle: "",
      fileDescription: "",
      perDepartment: "",
      perHospital: "",
      selectDepartmetn: "",
      radioSelectionStatus: "",
      files: null,
      uploadedFile: null,
      selectedTags: null,
      shareWithHospital: false,
      shareWithDepartment: false,
      shareWithPatient: false,
      doNotAutoShare: true,
      selectedTagValue: [],
      editFileObj: null,
      uploadButtonLoader: false,
    });
    // document.getElementById("inlineCheckbox1").checked = false;
    // document.getElementById("inlineCheckbox2").checked = false;
    // document.getElementById("inlineCheckbox3").checked = false;
  };

  validate = () => {
    let validCheck = true;
    let errorMsgHospital,
      errorMsgHospital2,
      errorMsgDprt = "";
    if (this.state.radioSelectionStatus === "per-hospital") {
      if (!this.state.perHospital) {
        validCheck = false;
        errorMsgHospital = "Please select hospital";
      }
    }
    if (this.state.radioSelectionStatus === "per-department") {
      if (!this.state.perDepartment) {
        validCheck = false;
        errorMsgHospital2 = "Please select hospital";
      }
      if (!this.state.selectDepartmetn) {
        validCheck = false;
        errorMsgDprt = "Please select department";
      }
    }

    this.setState({
      errormsgHsptl: errorMsgHospital,
      errormsgHsptl1: errorMsgHospital2,
      errormsgDprt: errorMsgDprt,
    });

    return validCheck;
  };

  getSubmitFile = () => {
    if (this.state.files && this.state.files.length > 0) {
      let resultReturn;
      this.state.files.forEach((list) => {
        if (
          list.title === "" ||
          list.title === null ||
          list.title === undefined
        ) {
          swal({
            title: "Please enter file title!",
            icon: "error",
            dangerMode: true,
          });
          resultReturn = 1;
          return;
        } else if (
          list.order === "" ||
          list.order === null ||
          list.order === undefined
        ) {
          swal({
            title: "Please enter file order!",
            icon: "error",
            dangerMode: true,
          });
          resultReturn = 1;
          return;
        }
      });
      if (resultReturn === 1) {
        return;
      }
    } else {
      swal({
        title: "No files selected",
        text: "Please select at least one file",
        icon: "error",
        dangerMode: true,
      });
      return;
    }
    let hospitalId = null;
    if (this.state.perHospital && this.state.perHospital.value) {
      hospitalId = this.state.perHospital.value;
    }

    let tName;

    if (this.state.selectedTagValue && this.state.selectedTagValue.length > 0) {
      tName = this.state.selectedTagValue.map((list) => {
        return list.name;
      });
    }
    let qParam = {
      documents: this.state.files,
      tags: tName,
      autoSend: {
        shareWithAll: this.state.shareWithPatient,
        shareWithDepartment: this.state.shareWithPatient
          ? null
          : this.state.shareWithDepartment
          ? this.state.selectDepartmetn
            ? this.state.selectDepartmetn.value
            : null
          : null,
        shareWithHospital:
          this.state.shareWithPatient || this.state.doNotAutoShare
            ? null
            : hospitalId,
      },
    };
    this.setState({
      uploadButtonLoader: true,
    });

    Apimanager.multipleLibrary(
      qParam,
      (success) => {
        //return;

        //success.data.forEach((result) => {
        // for (let j = 0; j < success.data.length; j++) {
        //   this.state.files.forEach((file) => {
        //     if (success.data[j].id === file.id) {
        //       for (let i = 0; i < this.state.uploadedFile.length; i++) {
        //         if (
        //           file.location === this.state.uploadedFile[i].name &&
        //           file.type === this.state.uploadedFile[i].type
        //         ) {
        //           let uploadObj = {
        //             imageObject: this.state.uploadedFile[i],
        //             filename: this.state.uploadedFile[i].name,
        //             token: {},
        //             signedUrl: success.data[j].signedUrl,
        //           };

        //           //this.setState({ isUploading: !this.state.isUploading }, () =>
        //           if (j === success.data.length - 1) {
        //             this.uploadmedia(uploadObj, true);
        //           } else {
        //             this.uploadmedia(uploadObj);
        //           }

        //           //);
        //         }
        //       }
        //     }
        //   });
        // }
        // this.resetData();
        this.uploadMediaFiles(success.data);
      },
      (error) => {
        if (error.status === 422) {
          this.ErrorAlertbar("This file format not supported");
          this.setState({
            fileVal: "",
            fileTitle: "",
          });
        }
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

        this.setState({
          uploadButtonLoader: false,
        });

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
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

  uploadMediaFiles(successData, index = 0) {
    if (index === this.state.uploadedFile.length) {
      // this.LeftBarEvent.getLibraryList();
      // this.resetData();
      window.location.reload();
      return;
    }
    let uploadObj = {
      imageObject: this.state.uploadedFile[index],
      filename: this.state.uploadedFile[index].name,
      token: {},
      signedUrl: successData[index].signedUrl,
    };

    let isLast = index === this.state.uploadedFile.length - 1;
    this.uploadmediaTest(uploadObj, isLast, () => {
      let indx = index + 1;
      this.uploadMediaFiles(successData, indx);
    });
  }

  getFile = (event) => {
    // let reader = new FileReader();
    // let file =
    //   event && event.target && event.target.files
    //     ? event.target.files[0]
    //     : null;
    // reader.onloadend = (e) => {
    //   this.setState({
    //     previewURL: URL.createObjectURL(file),
    //   });
    // };

    // reader.readAsDataURL(file);

    // this.setState(
    //   {
    //     fileVal: event.target.files,
    //   },
    //   function () {
    //     this.setState({
    //       fileTitle: this.state.fileVal[0].name,
    //     });
    //   }
    // );

    let files = [];
    var fSExt = new Array("Bytes", "KB", "MB", "GB");

    if (event.target.files.length > 0) {
      for (var i = 0; i < event.target.files.length; i++) {
        let list = event.target.files[i];

        var _size = list.size;

        var j = 0;
        while (_size > 900) {
          _size /= 1024;
          j++;
        }
        var exactSize = Math.round(_size * 100) / 100 + " " + fSExt[j];
        files = [
          ...files,
          {
            location: list.name,
            type: list.type,
            size: exactSize,
            id: i + 1,
            description: "",
            printEnable: false,
            title: "",
            order: "",
          },
        ];
      }
    }

    this.setState({
      files: files,
      uploadedFile: event.target.files,
    });
  };

  getListingResponse = () => {
    this.setState({
      isloading: false,
    });
  };

  // uploadmedia = async (fileObject, last = false) => {
  //   var params = fileObject.imageObject;
  //   fileObject.token["Content-Type"] = "application/octet-stream";
  //   Apimanager.uploadmedia(
  //     fileObject.signedUrl,
  //     params,
  //     (success) => {
  //       if (last) {
  //         this.sweetAlertbar("File uploaded successfully");
  //         this.setState({
  //           uploadButtonLoader: false,
  //           isloading: true,
  //           mediaPath: "",
  //           mediaType: "",
  //         });
  //         this.LeftBarEvent.getLibraryList();
  //         this.resetData();
  //       }

  //       //document.getElementById("close-doc-modal").click();
  //     },

  //     (error) => {
  //       this.sweetAlertbar("File uploaded successfully");
  //       document.getElementById("close-doc-modal").click();
  //       this.setState({
  //         uploadButtonLoader: false,
  //         isloading: true,
  //         mediaPath: "",
  //         mediaType: "",
  //       });
  //       this.LeftBarEvent.getLibraryList();
  //       //toast.success("Error");
  //       //this.csvUploadPatientFile(fileObject);
  //       // this.setState({
  //       //   csvFileLoader: false,
  //       // });
  //       if (error && error.status === 500) {
  //         // this.setState(initState, () =>
  //         //   this.notify(
  //         //     i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg
  //         //   )
  //         // );
  //       }
  //     },
  //     (uploadmedia) => {
  //       let FileProgress = Math.floor(
  //         (uploadmedia / fileObject.imageObject.size) * 100
  //       );
  //       this.setState({ percentageUploaded: FileProgress });
  //     }
  //   );
  // };

  uploadmediaTest = async (
    fileObject,
    last = false,
    uploadComplete = () => {}
  ) => {
    var params = fileObject.imageObject;
    fileObject.token["Content-Type"] = "application/octet-stream";
    Apimanager.uploadmedia(
      fileObject.signedUrl,
      params,
      (success) => {},
      (error) => {},
      (uploadmedia) => {
        let FileProgress = Math.floor(
          (uploadmedia / fileObject.imageObject.size) * 100
        );
        if (FileProgress === 100) {
          setTimeout(() => uploadComplete(), last ? 15000 : 0);
        }
        this.setState({ percentageUploaded: FileProgress });
      }
    );
  };

  showPreview = () => {
    window.open(this.state.previewURL, "_blank");
  };

  dragFile = (e) => {
    this.setState({
      dragDropDiv:
        "drag-drop-overlay drag-drop-lib-overlay file-input open-div",
      fileVal: "",
      isloading: false,
      percentageUploaded: 0,
      previewURL: "",
      fileTitle: "",
    });
  };

  dragLeave = () => {
    this.setState({
      dragDropDiv:
        "drag-drop-overlay drag-drop-lib-overlay file-input hide-div",
    });
  };

  getDragFile = (event) => {
    this.setState({ fileVal: "" });

    let reader = new FileReader();
    let file =
      event && event.target && event.target.files
        ? event.target.files[0]
        : null;
    reader.onloadend = (e) => {
      this.setState({
        previewURL: URL.createObjectURL(file),
      });
    };

    reader.readAsDataURL(file);

    this.setState({
      fileVal: event.target.files,
      dragDropDiv:
        "drag-drop-overlay drag-drop-lib-overlay file-input hide-div",
      fileTitle: event.target.files[0].name,
    });

    document.getElementById("modal-open").click();
  };

  setEditFile = () => {
    // let qParam = {
    //   filename: this.state.fileRename,
    //   id: this.state.editFileObj.id,
    //   title: this.state.fileRename,
    //   description: "",
    // };

    let hospitalId = null;
    let hospitalIndex = null;
    if (this.state.perHospital && this.state.perHospital.length >= 0) {
      hospitalIndex = this.state.perHospital.findIndex((obj) => obj !== null);
      hospitalId = this.state.perHospital[hospitalIndex]?.value;
    } else if (this.state.perHospital && this.state.perHospital.value) {
      hospitalId = this.state.perHospital.value;
    }

    let tName;
    if (this.state.selectedTagValue && this.state.selectedTagValue.length > 0) {
      tName = this.state.selectedTagValue.map((list) => {
        return { name: list.name, order: list.order };
      });
    }

    let qParam = {
      title: this.state.fileRename,
      printEnable: this.state.editFileObj.printEnable,
      id: this.state.editFileObj.id,
      tags: tName,
      autoSend: {
        shareWithAll: this.state.shareWithPatient,
        shareWithDepartment: this.state.shareWithPatient
          ? null
          : this.state.shareWithDepartment
          ? this.state.selectDepartmetn
            ? this.state.selectDepartmetn.value
            : null
          : null,
        shareWithHospital: this.state.shareWithPatient ? null : hospitalId,
      },
    };

    this.setState({
      uploadButtonLoader: true,
    });
    Apimanager.editMediaFileName(
      qParam,
      (success) => {
        if (success && success.data) {
          this.sweetAlertbar(success.data.message);
          this.setState({
            uploadButtonLoader: false,
            editFileObj: null,
            selectedTagValue: null,
            perHospital: null,
            selectDepartmetn: null,
          });
          this.LeftBarEvent.getCallAfterUpdate();
          // if (document.getElementById("close-doc-modal-edit")) {
          //   document.getElementById("close-doc-modal-edit").click();
          // }
          this.resetData();
        }
      },
      (error) => {
        this.setState({
          editFileLoader: false,
        });
        if (error && error.status === 500) {
          return;
        }
      }
    );
  };

  editFileData = (editobj, status, bundleObject = "") => {
    if (status === "delete" && bundleObject.docListType === "bundle") {
      swal({
        title: editobj.title,
        text: `Are you sure you want to remove this document from ${bundleObject.tagName} bundle?`,
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          this.removeFile(editobj.id, bundleObject.tagName);
          this.resetData();
        }
      });
    } else if (status === "delete") {
      swal({
        title: editobj.title,
        text: "Are you sure you want to delete this file?",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          this.deleteFile(editobj.id);
          this.resetData();
        }
      });
    } else {
      this.resetData();
      let selectedTagValue;
      let obj = { ...editobj };
      obj.tags = obj?.tags?.filter((e) => e !== null);
      if (obj?.tags && obj?.tags?.length > 0) {
        selectedTagValue = obj?.tags?.map((list, i) => {
          return { name: list?.name, order: i };
        });
      }

      let hosVal;
      if (obj.shareWithHospital && this.state.hospitalList) {
        hosVal = this.state.hospitalList.map((list) => {
          if (obj.shareWithHospital === list.id) {
            this.departmentList(obj.shareWithHospital, obj.shareWithDepartment);
            return { value: obj.shareWithHospital, label: list.name };
          }
        });
      }

      let checkBoxes = this.checkStatusForCheckboxes(obj);

      this.setState({
        editFileObj: obj,
        fileRename: obj.title,
        selectedTagValue: selectedTagValue,
        perHospital: hosVal || null,
        mediaType: "",
        ...checkBoxes,
      });
      // this.checkStatusForCheckboxes(obj);
      //document.getElementById("modal-open-rename").click();
    }
  };

  deleteFile = (fileId) => {
    let qPm = {
      id: fileId,
    };
    this.LeftBarEvent.loadingStatus(true);
    Apimanager.deleteMediaFIle(
      qPm,
      (success) => {
        if (success && success.data) {
          this.sweetAlertbar(success.data.message);
          this.setState({
            isloading: false,
            mediaType: "",
            mediaPath: "",
          });
          this.LeftBarEvent.getCallAfterUpdate("delete");
          this.LeftBarEvent.loadingStatus(false);
        }
      },
      (error) => {
        this.setState({
          isloading: false,
        });
        this.LeftBarEvent.loadingStatus(false);
        if (error && error.status === 500) {
          return;
        }
      }
    );
  };

  removeFile = (fileId, tag = "") => {
    let qPm = {
      id: fileId,
      tag: tag,
    };
    this.LeftBarEvent.loadingStatus(true);
    Apimanager.removeMediaFile(
      qPm,
      (success) => {
        if (success && success.data) {
          this.sweetAlertbar(success.data.message);
          this.setState({
            isloading: false,
            mediaType: "",
            mediaPath: "",
          });
          this.LeftBarEvent.getCallAfterUpdate("delete");
          this.LeftBarEvent.loadingStatus(false);
        }
      },
      (error) => {
        this.setState({
          isloading: false,
        });
        this.LeftBarEvent.loadingStatus(false);
        if (error && error.status === 500) {
          return;
        }
      }
    );
  };

  onSelect = (selectedList, selectedItem) => {
    let newData = selectedList.map((list, i) => {
      return { name: list.name, order: i };
    });

    // this.setState({
    //   selectedTags: newData,
    //   selectedTagValue: [
    //     ...(this.state.selectedTagValue || []),
    //     { name: selectedItem.name, order: selectedList.length - 1 },
    //   ],
    // });
    this.setState({
      selectedTags: newData,
      selectedTagValue: newData,
    });
  };

  onRemove = (selectedList, removedItem) => {
    let newData = selectedList.filter((list) => {
      if (list.id !== removedItem.id) {
        return list;
      }
    });

    let newVal = this.state.selectedTagValue.filter((list) => {
      if (list.name !== removedItem.name) {
        return list;
      }
    });

    this.setState({
      selectedTags: newData,
      selectedTagValue: newVal,
    });
  };

  deleteFiles = (id) => {
    let remainingFiles = this.state.files.filter((list) => {
      if (list.id !== id) {
        return list;
      }
    });

    this.setState({
      files: remainingFiles,
    });
  };

  titleChange = (e, obj, type, index) => {
    let FilesArray = this.state.files;
    FilesArray[index] = { ...obj };
    FilesArray[index].order =
      type === "order" ? e.target.value : obj.order ? obj.order : "";
    FilesArray[index].title =
      type === "title" ? e.target.value : obj.title ? obj.title : "";
    this.setState({
      files: FilesArray,
    });
  };

  clearTitle = (id) => {
    let files = [];

    this.state.files.map((list) => {
      if (list.id === id) {
        files = [
          ...files,
          {
            location: list.location,
            type: list.type,
            size: list.size,
            id: list.id,
            title: "",
            order: list.order ? list.order : "",
            description: "",
          },
        ];
      } else {
        files = [
          ...files,
          {
            location: list.location,
            type: list.type,
            size: list.size,
            id: list.id,
            title: list.title ? list.title : "",
            order: list.order ? list.order : "",
            description: "",
          },
        ];
      }
    });

    this.setState({
      files: files,
    });
  };

  shareWithHospital = (e) => {
    this.setState({
      shareWithHospital: true,
      shareWithDepartment: false,
      shareWithPatient: false,
      doNotAutoShare: false,
    });
  };

  shareWithDepartment = (e) => {
    this.setState({
      shareWithPatient: false,
      shareWithHospital: false,
      doNotAutoShare: false,
      shareWithDepartment: true,
    });
  };

  shareWithPatient = (e) => {
    this.setState({
      shareWithPatient: true,
      shareWithHospital: false,
      shareWithDepartment: false,
      doNotAutoShare: false,
    });
  };

  noAutoShare = () => {
    this.setState({
      shareWithPatient: false,
      shareWithHospital: false,
      shareWithDepartment: false,
      doNotAutoShare: true,
    });
  };

  assignNewTab = () => {
    swal({
      className: "AddTagPopup",
      text: "Add tag name here",
      content: "input",
      button: {
        text: "Add",
        closeModal: true,
      },
    })
      .then((name) => {
        if (!name) throw null;
        this.setState({
          tags: [
            ...this.state.tags,
            { id: Math.random().toString(), name: name },
          ],
          selectedTagValue: [
            ...this.state.selectedTagValue,
            { name: name, order: 1 },
          ],
        });
        return name;
      })
      .catch((err) => {
        if (err) {
          swal("Something went wrong", "error");
        } else {
          swal.stopLoading();
          swal.close();
        }
      });
  };

  editTitleChange = (e) => {
    this.setState({
      fileRename: e.target.value,
    });
  };

  editToggled = (value) => {
    let editObj = this.state.editFileObj;
    editObj.printEnable = !value;
    this.setState({
      editFileObj: editObj,
    });
  };

  redirecthome = () => {
    this.props.history.push("/");
  };

  resetAllData = () => {
    if (
      (this.state.files && this.state.files.length > 0) ||
      (this.state.selectedTagValue && this.state.selectedTagValue.length > 0)
    ) {
      swal({
        title: "",
        text: "You have unsaved changes, are you sure you want to cancel?",
        // buttons: ["Yes", "No"],
        buttons: ["No", "Yes"],
        dangerMode: true,
      }).then((willDelete) => {
        if (willDelete) {
          this.resetData();
        }
      });
    } else {
      this.resetData();
    }
  };

  toggled = (index) => {
    let arr = this.state.files;
    arr[index].printEnable = !arr[index].printEnable;
    this.setState({
      files: arr,
    });
  };

  render() {
    let hospitalList = [];
    let departMentList = [];
    let tags = [];

    if (this.state.hospitalList && this.state.hospitalList.length > 0) {
      hospitalList = this.state.hospitalList.map((list) => {
        return { value: list.id, label: list.name };
      });
    }

    if (this.state.departmentList && this.state.departmentList.length > 0) {
      departMentList = this.state.departmentList.map((list) => {
        return { value: list.id, label: list.name };
      });
    }

    // if (this.state.tags && this.state.tags.length > 0) {
    //   tags = this.state.tags.map((list) => {
    //     return { id: list.id, name: list.name };
    //   });
    // }

    const { percentageUploaded } = this.state;
    //let options = [{ name: 'Srigar', id: 1 }, { name: 'Sam', id: 2 }]
    //tags = [...tags, { id: "tag", name: 'Add new Tag' }]

    let uploadedFilesList;

    if (this.state.files && this.state.files.length > 0) {
      uploadedFilesList = this.state.files.map((list, index) => {
        return (
          <div key={list.id} className="col-sm-4 upload-file-lib">
            <div style={{ height: "40px", overflow: "hidden" }}>
              <span>{list.location}</span>
            </div>
            <div className="file-size">
              {list.size}{" "}
              <a href="javascript:void(0)">
                <img src="/assets/images/check-green.svg" />
              </a>{" "}
              <a
                href="javascript:void(0)"
                onClick={() => this.deleteFiles(list.id)}
              >
                {" "}
                <img src="/assets/images/delete-icon.svg" />
              </a>
              <div style={{ marginTop: "15px" }}>
                Allow Download{" "}
                <ToggleSwitch
                  width={"38px"}
                  height={"22px"}
                  value={list.printEnable}
                  toggled={() => {
                    this.toggled(index);
                  }}
                />
              </div>
            </div>
            {/* <img className="remove-ic" src="/assets/images/remove-ic.svg" onClick={() => this.clearTitle(list.id)} /> */}
            <div className="file-title">
              <label>Title</label>
              <div className="input-type">
                {" "}
                <input
                  type="text"
                  name="title"
                  onChange={(e) => this.titleChange(e, list, "title", index)}
                />
              </div>
            </div>
            <div className="file-title order-col">
              <label>Sort Order</label>
              <input
                type="number"
                name="order"
                onChange={(e) => this.titleChange(e, list, "order", index)}
                onKeyDown={(e) =>
                  ["e", "+", "-", "."].includes(e.key) && e.preventDefault()
                }
              />
            </div>
          </div>
        );
      });
    }

    if (this.state.editFileObj) {
      uploadedFilesList = (
        <div class="col-sm-12 upload-file-lib upload-w100">
          <div className="d-flex align-items-center mb-3">
            <span>{this.state.editFileObj.location}</span>
            {/* <div className="file-size">{(list.size)} <a href="javascript:void(0)"><img src="/assets/images/check-green.svg" /></a>   <a href="javascript:void(0)" onClick={() => this.deleteFiles(list.id)}> <img src="/assets/images/delete-icon.svg" /></a></div> */}
          </div>

          {/* <img className="remove-ic" src="/assets/images/remove-ic.svg" onClick={() => this.clearTitle(list.id)} /> */}
          <div className="row w-100 d-flex align-items-center">
            <div className="file-title col-sm-8">
              <label>Title</label>
              <div className="input-type">
                {" "}
                <input
                  type="text"
                  value={this.state.fileRename}
                  name="title"
                  onChange={(e) => this.editTitleChange(e)}
                />
              </div>
              <div style={{ marginTop: "15px", fontSize: "15px" }}>
                Allow Download{" "}
                <ToggleSwitch
                  width={"38px"}
                  height={"22px"}
                  value={this.state.editFileObj.printEnable}
                  toggled={() =>
                    this.editToggled(this.state.editFileObj.printEnable)
                  }
                />
              </div>
            </div>

            {/* <div className="file-title order-col col-sm-4"><label>Order</label><input type="number" name="order" onChange={(e) => this.titleChange(e, list.id, 'order')} /></div> */}
          </div>
        </div>
      );
    }

    return (
      <>
        <LeftBar
          onRef={(ref) => (this.LeftBarEvent = ref)}
          getModalOpen={this.getModalOpen}
          getFileViewData={this.getFileViewData}
          getListingResponse={this.getListingResponse}
          editFile={this.editFileData}
        />
        {/* {this.state.isloading ? (
          <div className="document-load">
            <LoaderIndicate />
          </div>
        ) : (
            ""
          )} */}

        {this.state.mediaType.includes("video") ? (
          <div className="document-view-content">
            {this.BackButton()}
            <video
              controls
              className="play-record-video"
              controlsList="nodownload"
              src={this.state.mediaPath}
            ></video>
          </div>
        ) : (
          ""
        )}
        {this.state.mediaType.includes("audio") ? (
          <div className="document-view-content">
            {this.BackButton()}
            <ReactAudioPlayer src={this.state.mediaPath} controls />
          </div>
        ) : (
          ""
        )}
        {this.state.mediaType.includes("image") ? (
          <div className="document-view-content">
            {this.BackButton()}
            <img alt="" src={this.state.mediaPath} width="auto" height="auto" />
          </div>
        ) : (
          ""
        )}

        {this.state.mediaType.includes("else") ? (
          this.state.pdfType === "pdf" ? (
            <div className="document-view-content">
              {this.BackButton()}
              <iframe
                title={this.state.mediaTitle}
                src={this.state.mediaPath}
                width="100%"
                height="100%"
              ></iframe>
            </div>
          ) : (
            <div className="document-view-content">
              {this.BackButton()}
              <embed
                style={{ height: "0", width: "0" }}
                src={this.state.mediaPath}
              />

              <span className="downloadfile-text">{this.state.pdfType}</span>
            </div>
          )
        ) : (
          ""
        )}
        {/* {this.state.mediaType ? <div className="modal-footer">
          
          <button
            type="button"
            className="btn btn-blue-block"
            onClick={this.state.editFileObj ? () => this.setEditFile() : () => this.getSubmitFile()}
            disabled={
              this.state.files !== "" ? false : true
            }
            style={{ width: "20%" }}
          >
            Upload
                </button>
        </div>
          : ""} */}
        <button
          type="button"
          className="btn btn-info btn-lg"
          data-toggle="modal"
          data-target="#myModal"
          id="modal-open"
          style={{ display: "none" }}
        >
          Open Modal
        </button>

        {/* <div
          className="library-drag"
          onDragOver={(e) => this.dragFile(e)}
          onMouseMove={() => this.dragLeave()}
        >
          <div className={this.state.dragDropDiv}>
            <input
              type="file"
              name="doc"
              onChange={(e) => this.getDragFile(e)}
              accept="/*"
              value={this.state.fileVal ? this.state.fileVal.FileList : ""}
            />
            <span className="drag-content">
              Drop Files to instantly upload them to:Activity
              </span>
          </div>
        </div> */}

        {this.state.mediaType ? (
          ""
        ) : (
          <div id="myModal1" className="document-modal" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Create New</h4>
                  <button type="button" className="close" data-dismiss="modal">
                    &times;
                  </button>
                </div>
                <div className="create-recent-media create-library-media">
                  <div className="modal-body">
                    <div className="file-wrap">
                      <label htmlFor="doc-upload">Upload File</label>

                      <div className="invite-user-page template-page p-0">
                        <form action="">
                          <div className="file-input">
                            {this.state.editFileObj ? (
                              <input
                                type="file"
                                accept="/*"
                                value={this.state.inputValue}
                                multiple
                                onChange={(e) => this.getFile(e)}
                                disabled
                              />
                            ) : (
                              <input
                                type="file"
                                onChange={(e) => this.getFile(e)}
                                accept="/*"
                                value={this.state.inputValue}
                                multiple
                              />
                            )}

                            <div className="dropzone-placeholder screen-record">
                              <span>
                                <img
                                  src="/assets/images/cloud.svg"
                                  alt="Cloud Upload"
                                  className=""
                                />
                                <span>
                                  {i18n &&
                                    i18n.share &&
                                    i18n.share.fileplaceholder}
                                </span>
                              </span>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* <label className="btn btn-import">
                      <input
                        type="file"
                        name="doc"
                        id="doc-upload"
                        onChange={(e) => this.getFile(e)}
                        value={
                          this.state.fileVal ? this.state.fileVal.FileList : ""
                        }
                      />
                    Choose file
                  </label> */}
                      {/* <span>
                      {this.state.fileVal && this.state.fileVal[0]
                        ? this.state.fileVal[0].name
                        : "No files chosen"}
                    </span> */}
                      {this.state.fileVal &&
                      this.state.fileVal[0] &&
                      previewfileformat.includes(
                        this.state.fileVal[0].name.split(".").pop()
                      ) ? (
                        <span
                          onClick={() => this.showPreview()}
                          style={{ cursor: "pointer" }}
                        >
                          <svg
                            width="40px"
                            height="40px"
                            viewBox="0 0 40 40"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            xlink="http://www.w3.org/1999/xlink"
                          >
                            <title>Preview</title>
                            <g
                              id="Page-1"
                              stroke="none"
                              strokeWidth="1"
                              fill="none"
                              fillRule="evenodd"
                            >
                              <g
                                id="Send-create-R"
                                transform="translate(-1033.000000, -142.000000)"
                                fillRule="nonzero"
                              >
                                <g
                                  id="Group-4"
                                  transform="translate(495.000000, 23.000000)"
                                >
                                  <g
                                    id="Group-6"
                                    transform="translate(32.000000, 83.000000)"
                                  >
                                    <g
                                      id="Group-16"
                                      transform="translate(0.000000, 36.000000)"
                                    >
                                      <g
                                        id="Preview"
                                        transform="translate(506.000000, 0.000000)"
                                      >
                                        <rect
                                          id="Rectangle"
                                          fill="#0063E8"
                                          x="0"
                                          y="0"
                                          width="40"
                                          height="40"
                                          rx="4"
                                        ></rect>
                                        <path
                                          d="M30.8366667,18.7666667 C28.7376861,14.7245692 24.6130595,12.13738 20.0603333,12.0071667 C15.5073656,12.1371411 11.382429,14.7243647 9.28333333,18.7666667 C8.87132917,19.4958253 8.87132917,20.387508 9.28333333,21.1166667 C11.3823139,25.1587641 15.5069405,27.7459533 20.0596667,27.8761667 C24.6125916,27.7460511 28.7374625,25.1588687 30.8366667,21.1166667 C31.2491668,20.3876386 31.2491668,19.4956948 30.8366667,18.7666667 Z M20.0605,25.4901667 C17.8573942,25.4901667 15.8712203,24.1630477 15.0281282,22.1276433 C14.1850361,20.0922389 14.6510583,17.7493871 16.2088894,16.191556 C17.7667204,14.6337249 20.1095723,14.1677027 22.1449767,15.0107949 C24.1803811,15.853887 25.5075,17.8400608 25.5075,20.0431667 C25.5075,21.4878586 24.9337487,22.87341 23.9122285,23.8949928 C22.8907083,24.9165755 21.505192,25.4905 20.0605,25.4905 L20.0605,25.4901667 Z"
                                          id="Shape"
                                          fill="#FFFFFF"
                                        ></path>
                                        <circle
                                          id="Oval"
                                          fill="#FFFFFF"
                                          cx="20.0605"
                                          cy="20.0433333"
                                          r="2.74633333"
                                        ></circle>
                                      </g>
                                    </g>
                                  </g>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                    {/* <div>
                    Only pdf,mp4, m4a, mp3, mov, txt, text, xls, xlsx, png, jpg
                  and jpeg extension file preview will be available{" "}
                  </div> */}
                    {this.state.isUploading && (
                      <>
                        <Line
                          percent={percentageUploaded}
                          strokeWidth="1"
                          strokeColor="#009ADF"
                          trailColor="#D9D9D9"
                          gapDegree={0}
                          gapPosition="right"
                        />{" "}
                        <p>{`${percentageUploaded}% completed`}</p>
                      </>
                    )}
                    <div class="row">{uploadedFilesList}</div>
                    <div className="row">
                      {/* <div className="col-md-6">
                      <div className="block-wrap">
                        <label htmlFor="doc-title">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          name="doc-title"
                          id="doc-title"
                          placeholder="e.g. Instruction for body"
                          value={this.state.fileTitle}
                          onChange={(e) => {
                            this.setState({
                              fileTitle: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </div> */}
                      <div className="col-md-12">
                        <div className="block-wrap">
                          <label htmlFor="doc-title">Add to bundle</label>
                          <div className="select select-option-col">
                            {/* <Select
                            placeholder="Select Hospital"
                            value={this.state.perHospital}
                            options={hospitalList}
                            onChange={(val) => {
                              this.setState({
                                perHospital: val,
                                errormsgHsptl: "",
                              });
                            }}
                            isMulti={true}

                          /> */}
                            <Multiselect
                              placeholder={
                                this.state.selectedTagValue &&
                                this.state.selectedTagValue.length > 0
                                  ? ""
                                  : "Select bundle"
                              }
                              avoidHighlightFirstOption={true}
                              options={this.state.tags} // Options to display in the dropdown
                              onSelect={this.onSelect} // Function will trigger on select event
                              onRemove={this.onRemove} // Function will trigger on remove event
                              displayValue="name" // Property name to display in the dropdown options
                              showCheckbox={true}
                              closeOnSelect={true}
                              selectedValues={this.state.selectedTagValue}
                              // disable={this.state.editFileObj ? true : false}
                            />
                            <img
                              className="dropdown-ic"
                              src="/assets/images/arrow-right.svg"
                            />
                            <span className="error-select">
                              {this.state.errormsgHsptl}
                            </span>
                          </div>
                          <div className="add-new-tag">
                            <button
                              style={{
                                border: "none",
                                background: "none",
                                color: "#2680bc",
                                fontSize: "12px",
                              }}
                              href="javascript:void(0)"
                              onClick={() => this.assignNewTab()}
                              // disabled={this.state.editFileObj}
                            >
                              Add new bundle here
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="col-md-6"
                        style={{ marginBottom: "30px" }}
                      >
                        <div className="block-wrap">
                          <label htmlFor="doc-title">Select Hospital</label>
                          <div className="date-select">
                            <Select
                              className="Select"
                              placeholder="Select Hospital"
                              value={this.state.perHospital}
                              options={hospitalList}
                              onChange={(hsptl) =>
                                this.getSelectHospital(hsptl)
                              }
                              // isDisabled={this.state.editFileObj ? true : false}
                              maxMenuHeight="180px"
                            />
                            <span className="error-select">
                              {this.state.errormsgHsptl}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="col-md-6"
                        style={{ marginBottom: "30px" }}
                      >
                        <div className="block-wrap">
                          <label htmlFor="doc-title">Select Department</label>
                          <div className="date-select">
                            <Select
                              className="Select"
                              placeholder="Select Department"
                              value={this.state.selectDepartmetn}
                              options={departMentList}
                              onChange={(val) => {
                                let object = {
                                  shareWithDepartment: false,
                                  doNotAutoShare: false,
                                };
                                if (this.state.shareWithHospital) {
                                  object.shareWithHospital = true;
                                } else if (this.state.shareWithPatient) {
                                  object.shareWithPatient = true;
                                } else {
                                  object.doNotAutoShare = true;
                                }
                                this.setState({
                                  selectDepartmetn: val,
                                  errormsgDprt: "",
                                });
                              }}
                              // isDisabled={this.state.editFileObj ? true : false}
                              maxMenuHeight="180px"
                            />
                            <span className="error-select">
                              {this.state.errormsgHsptl}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="block-wrap">
                          <form>
                            <div class="form-check form-check-inline">
                              <input
                                class="form-check-input"
                                type="radio"
                                id="inlineCheckbox1"
                                onChange={(e) => this.shareWithHospital(e)}
                                checked={this.state.shareWithHospital}
                                disabled={
                                  !this.state.perHospital ? true : false
                                }
                              />

                              <label
                                class="form-check-label"
                                for="inlineCheckbox1"
                              >
                                Share with all the patients in this hospital{" "}
                              </label>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="block-wrap">
                          <form>
                            <div class="form-check form-check-inline">
                              <input
                                class="form-check-input"
                                type="radio"
                                id="inlineCheckbox2"
                                value="option2"
                                checked={this.state.shareWithDepartment}
                                onChange={(e) => this.shareWithDepartment(e)}
                                disabled={
                                  this.state.selectDepartmetn ? false : true
                                }
                              />

                              <label
                                class="form-check-label"
                                for="inlineCheckbox2"
                              >
                                Share with all the patients in this department
                              </label>
                            </div>
                          </form>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="block-wrap">
                          <form>
                            <div class="form-check form-check-inline">
                              <input
                                class="form-check-input"
                                type="radio"
                                id="inlineCheckbox3"
                                value="option3"
                                onChange={(e) => this.shareWithPatient(e)}
                                checked={this.state.shareWithPatient}
                                // disabled={
                                //   !this.state.perHospital ? true : false
                                // }
                              />

                              <label
                                class="form-check-label"
                                for="inlineCheckbox3"
                              >
                                Share with all patients
                              </label>
                            </div>
                          </form>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="block-wrap">
                          <form>
                            <div class="form-check form-check-inline">
                              <input
                                class="form-check-input"
                                type="radio"
                                id="inlineCheckbox4"
                                value="option4"
                                onChange={(e) => this.noAutoShare(e)}
                                checked={this.state.doNotAutoShare}
                              />

                              <label
                                class="form-check-label"
                                for="inlineCheckbox4"
                              >
                                Do not auto share
                              </label>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* <div className="block-wrap">
                    <label htmlFor="doc-description">Description</label>
                    <textarea
                      value={this.state.fileDescription}
                      name="doc-description"
                      className="form-control"
                      id="doc-title"
                      placeholder="e.g. Updates for covid-19"
                      onChange={(e) => {
                        this.setState({
                          fileDescription: e.target.value,
                        });
                      }}
                    />
                  </div> */}
                    {/* {this.state.uploadButtonLoader ? <LoaderIndicate /> : ""} */}
                    {/* <div className="block-wrap">
                    <input
                      type="radio"
                      id="all-patient"
                      name="patient"
                      value="all-patient"
                      onChange={(e) => {
                        this.setState({
                          radioSelectionStatus: e.target.value,
                          perHospital: "",
                          perDepartment: "",
                          selectDepartmetn: "",
                          errormsgHsptl: "",
                          errormsgHsptl1: "",
                          errormsgDprt: "",
                        });
                      }}
                    />
                    <label htmlFor="all-patient">All Patient</label>
                  </div> */}
                    <div className="block-wrap">
                      <input
                        type="radio"
                        id="per-hospital"
                        name="patient"
                        value="per-hospital"
                        onChange={(e) => {
                          this.setState({
                            radioSelectionStatus: e.target.value,
                            perDepartment: "",
                            selectDepartmetn: "",
                            errormsgHsptl: "",
                            errormsgHsptl1: "",
                            errormsgDprt: "",
                          });
                        }}
                      />
                    </div>
                    <div className="block-wrap">
                      <input
                        type="radio"
                        id="per-department"
                        name="patient"
                        value="per-department"
                        onChange={(e) => {
                          this.setState({
                            radioSelectionStatus: e.target.value,
                            perHospital: "",
                            errormsgHsptl: "",
                            errormsgHsptl1: "",
                            errormsgDprt: "",
                          });
                        }}
                      />

                      {/* <label htmlFor="per-department">Per Department</label>
                    <div className="select">
                      <Select
                        value={this.state.perDepartment}
                        placeholder="Select Hospital"
                        options={hospitalList}
                        isDisabled={
                          this.state.radioSelectionStatus === "" ||
                            this.state.radioSelectionStatus === "all-patient" ||
                            this.state.radioSelectionStatus === "per-hospital"
                            ? true
                            : false
                        }
                        onChange={(hsptl) => this.getSelectHospital(hsptl)}
                      />
                      <span className="error-select">
                        {this.state.errormsgHsptl1}
                      </span>
                    </div> */}
                      {/* <div className="select">
                      <Select
                        value={this.state.selectDepartmetn}
                        options={departMentList}
                        onChange={(val) => {
                          this.setState({
                            selectDepartmetn: val,
                            errormsgDprt: "",
                          });
                        }}
                        isDisabled={
                          this.state.radioSelectionStatus === "" ||
                            this.state.radioSelectionStatus === "all-patient" ||
                            this.state.radioSelectionStatus === "per-hospital"
                            ? true
                            : false
                        }
                      />
                      <span className="error-select">
                        {this.state.errormsgDprt}
                      </span>
                    </div> */}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {/* <button
                  type="button"
                  className="btn btn-blue-border"
                  data-dismiss="modal"
                  id="close-doc-modal"
                  style={{ width: "20%" }}
                  onClick={() => this.redirecthome()}
                >
                  Close
                </button> */}
                  <button
                    type="button"
                    className="btn btn-blue-border"
                    data-dismiss="modal"
                    id="close-doc-modal"
                    style={{ width: "20%" }}
                    onClick={() => this.resetAllData()}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-blue-block"
                    id="uploadButton"
                    onClick={
                      this.state.editFileObj
                        ? () => this.setEditFile()
                        : () => this.getSubmitFile()
                    }
                    disabled={this.state.files !== "" ? false : true}
                    style={{ width: "20%" }}
                  >
                    Upload
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          className="btn btn-info btn-lg"
          data-toggle="modal"
          data-target="#myModal-rename"
          id="modal-open-rename"
          style={{ display: "none" }}
        >
          Open Modal
        </button>
        <div
          id="myModal-rename"
          className="modal fade document-modal"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Rename</h4>
                <button type="button" className="close" data-dismiss="modal">
                  &times;
                </button>
              </div>
              {/* {this.state.editFileLoader ? (
                <div className="library-loader">
                  <LoaderIndicate />
                </div>
              ) : (
                ""
              )} */}
              <div className="modal-body">
                <div className="block-wrap">
                  <label htmlFor="doc-title">Enter new name</label>
                  <input
                    autoComplete="off"
                    type="text"
                    className="form-control"
                    name="doc-title"
                    id="doc-title"
                    placeholder="Enter name"
                    value={this.state.fileRename}
                    onChange={(e) => {
                      this.setState({
                        fileRename: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-blue-border"
                  data-dismiss="modal"
                  id="close-doc-modal-edit"
                ></button>
                <button
                  type="button"
                  className="btn btn-blue-block"
                  onClick={() => this.setEditFile()}
                  disabled={!this.state.fileRename}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
        {this.state.uploadButtonLoader || this.state.editFileLoader ? (
          <div id="document-lib-loader">
            <LoaderIndicate />
          </div>
        ) : (
          ""
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.auth,
  };
};

export default connect(mapStateToProps, "")(DocLibrary);
