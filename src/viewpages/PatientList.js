import React from "react";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager/index";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
import i18n from "../I18n/en.json";
// import { formatDate } from '../helper'
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Pagination from "react-js-pagination";
import swal from "sweetalert";
//import { Link } from "react-router-dom"
//import $ from 'jquery';

class PatientList extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchmrn: "",
      isLoading: false,
      selectedDepartment: "",
      selectedDoctor: "",
      departmentDataList: [],
      doctorDataList: [],
      searchPatientName: "",
      startDate: "",
      patientList: [],
      activePage: 1,
      itemperpage: 15,
      pageRangeDisplayed: 5,
      totalIteamCount: "",
      recordMessage: "",
      isAdmin: false,

      patientName: "",
      patientDOB: new Date(),
      selectedPatientDepartment: "",
      selectedPatientDoctor: "",
      patientMRN: "",
      patientMobile: "",
      patientEmail: "",
      patientDoctorList: [],
      patientID: "",
      blockerImagePath: "",
    };
  }
  componentDidMount() {
    this.departmentList();
    this.getDoctorList();
    let queryparams = {
      page: this.state.activePage,
      pageSize: this.state.itemperpage,
    };
    this.getPatientList(queryparams);

    window.addEventListener(
      "keypress",
      function (event) {
        if (event.keyCode === 13 && event.key === "Enter") {
          if (this.checkSearchVal()) {
            this.filterData();
          }
        }
      }.bind(this)
    );
  }

  static getDerivedStateFromProps(props) {
    if (props.storedObject && props.storedObject.userCredentials) {
      let userRole = JSON.parse(props.storedObject.userCredentials);

      if (userRole.user.role.includes("admin")) {
        return {
          isAdmin: true,
        };
      } else {
        return {
          selectedPatientDepartment: "abc",
          selectedPatientDoctor: "abc",
        };
      }
    } else {
      window.location.replace("/");
    }

    return null;
  }

  departmentList = () => {
    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }

    //let enterpriseId = "o8OHJtkptlayiTwxNrYN";
    let hospitalCode = "";
    let params = {
      enterpriseId: enterpriseId,
      hospitalName: hospitalCode,
    };
    Apimanager.postDepartmentList(
      params,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          let departmentDataList =
            success &&
              success.data &&
              success.data.data &&
              success.data.data.departments
              ? success.data.data.departments
              : [];
          this.setState({
            departmentDataList: departmentDataList,
          });
        } else {
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

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          return;
        }

        return;
      }
    );
  };

  getDoctorList = (departmentName = null) => {
    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }

    //let enterpriseId = "o8OHJtkptlayiTwxNrYN";
    let hospitalCode = "";
    let params = {
      enterpriseId: enterpriseId,
      hospitalName: hospitalCode,
      departmentName: departmentName ? departmentName : "abc",
      ignoreDepartment: departmentName ? false : true,
      allProvider: true,
    };

    Apimanager.getDoctorList(
      params,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          let doctorDataList =
            success.data && success.data.data && success.data.data.list
              ? success.data.data.list
              : [];
          //console.log('data', success);
          if (departmentName) {
            this.setState({
              patientDoctorList: doctorDataList,
            });
          } else {
            this.setState({
              doctorDataList: doctorDataList,
            });
          }
        } else {
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

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          return;
        }

        return;
      }
    );
  };

  getPatientList = (queryparams) => {
    Apimanager.getPatientList(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          let patientDataList =
            success.data && success.data.data ? success.data.data : [];
          this.setState({
            patientList: patientDataList,
            totalIteamCount: success.data.totalRecords,
            recordMessage: "yes",
            isLoading: false,
          });
        } else {
          this.setState({
            recordMessage: "yes",
            isLoading: false,
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
            //this.ErrorAlertbar(error.data.settings.message)
            this.setState({
              recordMessage: "yes",
              isLoading: false,
            });
            return;
          }
        }

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          this.setState({
            recordMessage: "yes",
            isLoading: false,
          });
          return;
        }

        return;
      }
    );
  };

  handleDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  handleChangeSelect = (selectedDepartment) => {
    this.setState({
      selectedDepartment: selectedDepartment,
    });
  };

  handleChangeSelectDoctor = (selectedDoctor) => {
    this.setState({
      selectedDoctor: selectedDoctor,
    });
  };

  handleChangeMRN = (e) => {
    this.setState({
      searchmrn: e.target.value,
    });
    // if (e.target.value === '') {
    //     console.log('done')
    // }
  };

  handleChangePatientName = (e) => {
    this.setState({
      searchPatientName: e.target.value,
    });
  };

  checkSearchVal = () => {
    let checkVal = false;
    if (
      this.state.startDate ||
      this.state.searchPatientName ||
      this.state.searchmrn ||
      this.state.selectedDepartment ||
      this.state.selectedDoctor
    ) {
      checkVal = true;
    } else {
      checkVal = false;
    }
    return checkVal;
  };

  resetData = () => {
    let queryparams = {
      doctorName: "",
      department: "",
      dob: "",
      name: "",
      mrn: "",
      page: 1,
      pageSize: this.state.itemperpage,
    };
    if (this.checkSearchVal()) {
      this.setState({
        selectedDepartment: "",
        selectedDoctor: "",
        searchmrn: "",
        startDate: "",
        searchPatientName: "",
        activePage: 1,
        isLoading: true,
        patientList: [],
      });
      this.getPatientList(queryparams);
    }
  };

  pageChange = async (pageNumber = null) => {
    this.setState({
      activePage: pageNumber,
      isLoading: true,
    });
    let queryparams = {
      doctorName: this.state.selectedDoctor
        ? this.state.selectedDoctor.value
        : "",
      department: this.state.selectedDepartment
        ? this.state.selectedDepartment.value
        : "",
      dob: this.state.startDate
        ? moment(this.state.startDate).format("YYYYMMDD")
        : "",
      name: this.state.searchPatientName,
      mrn: this.state.searchmrn,
      page: pageNumber,
      pageSize: this.state.itemperpage,
    };

    this.getPatientList(queryparams);
  };

  filterData = () => {
    let queryparams = {
      doctorName: this.state.selectedDoctor
        ? this.state.selectedDoctor.value
        : "",
      department: this.state.selectedDepartment
        ? this.state.selectedDepartment.value
        : "",
      dob: this.state.startDate
        ? moment(this.state.startDate).format("YYYYMMDD")
        : "",
      name: this.state.searchPatientName,
      mrn: this.state.searchmrn,
      page: 1,
      pageSize: this.state.itemperpage,
    };

    if (this.checkSearchVal()) {
      this.getPatientList(queryparams);
      this.setState({
        activePage: 1,
        isLoading: true,
        patientList: [],
      });
    }
  };

  //  Edit Patient
  handleDOBDateChange = (date) => {
    this.setState({
      patientDOB: date,
    });
  };

  handleChangeSelectDepartment = (selectedDepartment) => {
    this.setState({
      selectedPatientDepartment: selectedDepartment,
      selectedPatientDoctor: "",
    });
    this.getDoctorList(selectedDepartment.value);
  };

  handleChangePatientDoctor = (selectedDoctor) => {
    this.setState({
      selectedPatientDoctor: selectedDoctor,
    });
  };

  handleNameTextChange = (e) => {
    this.setState({
      patientName: e.target.value,
    });
  };

  handleMRNTextChange = (e) => {
    this.setState({
      patientMRN: e.target.value,
    });
  };

  getPatientDetails = (id) => {
    this.setState({
      isLoading: true,
    });
    let queryparams = { userId: id };

    Apimanager.getPatientDetails(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          let patientDatails =
            success.data && success.data.data ? success.data.data : "";

          let dob = "";
          if (patientDatails && patientDatails.dob) {
            dob = moment(patientDatails.dob, "YYYYMMDD").format("MM/DD/YYYY");
            dob = new Date(dob);
          }

          this.setState({
            patientDOB: dob,
            patientName:
              patientDatails && patientDatails.name ? patientDatails.name : "",
            patientMRN:
              patientDatails && patientDatails.mrn ? patientDatails.mrn : "",
            patientMobile:
              patientDatails && patientDatails.mobileNo
                ? patientDatails.mobileNo
                : "",
            patientEmail:
              patientDatails && patientDatails.email
                ? patientDatails.email
                : "",
            selectedPatientDepartment:
              patientDatails && patientDatails.department
                ? {
                  label: patientDatails.department,
                  value: patientDatails.department,
                }
                : "",
            selectedPatientDoctor:
              patientDatails && patientDatails.doctorName
                ? {
                  label: patientDatails.doctorName,
                  value: patientDatails.doctorName,
                }
                : "",
            isLoading: false,
            patientID: patientDatails.id,
          });

          if (patientDatails && patientDatails.department) {
            this.getDoctorList(patientDatails.department);
          }
        } else {
          this.setState({
            isLoading: false,
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
              isLoading: false,
            });
            return;
          }
        }

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          this.setState({
            isLoading: false,
          });
          return;
        }

        return;
      }
    );
  };

  resetPatientData = () => {
    setTimeout(() => {
      this.setState({
        patientName: "",
        patientDOB: "",
        selectedPatientDepartment: "",
        selectedPatientDoctor: "",
        patientMRN: "",
        patientMobile: "",
        patientEmail: "",
        patientDoctorList: [],
      });
    }, 2000);
  };

  updatePatient = (patientId) => {
    this.setState({
      isLoading: true,
    });
    let queryparams = "";
    if (this.state.isAdmin) {
      queryparams = {
        name: this.state.patientName,
        mrn: this.state.patientMRN,
        dob: this.state.patientDOB
          ? moment(this.state.patientDOB).format("YYYYMMDD")
          : "",
        department: this.state.selectedPatientDepartment.value,
        doctorName: this.state.selectedPatientDoctor.value,
        patientId: patientId,
      };
    } else {
      queryparams = {
        name: this.state.patientName,
        mrn: this.state.patientMRN,
        dob: this.state.patientDOB
          ? moment(this.state.patientDOB).format("YYYYMMDD")
          : "",
        patientId: patientId,
      };
    }

    Apimanager.putPatientDetails(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          this.sweetAlertbar("Patient information updated successfully.");
          let queryparams = {
            doctorName: this.state.selectedDoctor
              ? this.state.selectedDoctor.value
              : "",
            department: this.state.selectedDepartment
              ? this.state.selectedDepartment.value
              : "",
            dob: this.state.startDate
              ? moment(this.state.startDate).format("YYYYMMDD")
              : "",
            name: this.state.searchPatientName,
            mrn: this.state.searchmrn,
            page: this.state.activePage,
            pageSize: this.state.itemperpage,
          };

          this.getPatientList(queryparams);
        } else {
          this.setState({
            isLoading: false,
          });
          this.ErrorAlertbar(
            "There is some error, please try after some time."
          );
          return;
        }
      },
      (error) => {
        this.setState({
          isLoading: false,
        });
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

  deletePatinet = (id, bool) => {
    this.setState({
      isLoading: true,
    });

    let queryparams = {
      patientId: id,
      disabled: bool,
    };

    Apimanager.putPatientDetails(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          this.sweetAlertbar(success.data.settings.message);
          let queryparams = {
            page: this.state.activePage,
            pageSize: this.state.itemperpage,
          };
          this.getPatientList(queryparams);
        } else {
          this.ErrorAlertbar(success.data.settings.message);
          this.setState({
            isLoading: false,
          });
          return;
        }
      },
      (error) => {
        this.setState({
          isLoading: false,
        });

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

  patientVideoCall = (patientID, patientName) => {
    this.setState({
      isLoading: true,
    });

    let queryparams = {
      room: patientID,
      receiverUserId: patientID,
      isSandbox: false,
    };

    Apimanager.getVideoCallToken(
      queryparams,
      (success) => {
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
          var popUp = window.open("/video-call");
          // $.post("/ajax/friendlyPrintPage", postData).done(function (htmlContent) {
          //   myWindow.document.write(htmlContent);
          //   myWindow.focus();
          // });
          let imagePath = "/assets/images/chrome.png";
          if (popUp == null || typeof popUp == "undefined") {
            var navigator = window.navigator;

            //var nVer = navigator.appVersion;
            var nAgt = navigator.userAgent;
            var browserName = navigator.appName;
            //var fullVersion = "" + parseFloat(navigator.appVersion);
            //var majorVersion = parseInt(navigator.appVersion, 10);
            var nameOffset, verOffset;

            // In Opera, the true version is after "Opera" or after "Version"
            if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
              browserName = "Opera";
              //fullVersion = nAgt.substring(verOffset + 6);
              //if ((verOffset = nAgt.indexOf("Version")) !== -1)
              //fullVersion = nAgt.substring(verOffset + 8);
            }
            // In MSIE, the true version is after "MSIE" in userAgent
            else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
              browserName = "Microsoft Internet Explorer";
              //fullVersion = nAgt.substring(verOffset + 5);
            }
            // In Chrome, the true version is after "Chrome"
            else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
              browserName = "Chrome";
              //fullVersion = nAgt.substring(verOffset + 7);
              imagePath = "/assets/images/Chrome.png";
            }
            // In Safari, the true version is after "Safari" or after "Version"
            else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
              browserName = "Safari";
              imagePath = "/assets/images/Safari.png";
              //fullVersion = nAgt.substring(verOffset + 7);
              //if ((verOffset = nAgt.indexOf("Version")) !== -1)
              //fullVersion = nAgt.substring(verOffset + 8);
            }
            // In Firefox, the true version is after "Firefox"
            else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
              browserName = "Firefox";
              //fullVersion = nAgt.substring(verOffset + 8);
              imagePath = "/assets/images/Firefox.png";
            }
            // In most other browsers, "name/version" is at the end of userAgent
            else if (
              (nameOffset = nAgt.lastIndexOf(" ") + 1) <
              (verOffset = nAgt.lastIndexOf("/"))
            ) {
              browserName = nAgt.substring(nameOffset, verOffset);
              ///fullVersion = nAgt.substring(verOffset + 1);
              if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
              }
            }
            document.getElementById("modal-btn-open").click();
            this.setState({
              blockerImagePath: imagePath,
            });
          } else {
            popUp.focus();
          }
          //this.redirectUrl("/video-call")
          //window.open("/video-call", "_blank");
        } else {
          this.ErrorAlertbar(success.data.settings.message);
          // this.setState({
          //     isLoading: false
          // })
          // return
        }

        this.setState({
          isLoading: false,
        });
        return;
      },
      (error) => {
        this.setState({
          isLoading: false,
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

  deletePatientRecord = (id) => {
    Apimanager.deletePatientData(
      id,
      (success) => {
        if (success && success.data.settings.status === 1) {
          this.sweetAlertbar(success.data.settings.message);
          let queryparams = {
            page: this.state.activePage,
            pageSize: this.state.itemperpage,
          };
          this.getPatientList(queryparams);
        } else {
          this.ErrorAlertbar(success.data.settings.message);
          this.setState({
            isLoading: false,
          });
          return;
        }
      },
      (error) => {
        this.setState({
          isLoading: false,
        });
        if ((error && error.status === 500) || error.status === 400) {
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

  getRedirectOnName = (id, name, patientObj) => {
    this.props.history.push("/patient/" + id, {
      patientObj: patientObj,
      searchtext: name,
    });
  };

  render() {
    //console.log('name', this.state.patientName)
    let optionsList = [];
    optionsList =
      this.state.departmentDataList.length > 0
        ? this.state.departmentDataList.map((dmp) => {
          return {
            value: dmp,
            label: dmp,
          };
        })
        : [];

    let doctorList = [];
    doctorList =
      this.state.doctorDataList.length > 0
        ? this.state.doctorDataList.map((dmp) => {
          return {
            value: dmp,
            label: dmp,
          };
        })
        : [];

    let patientDoctorList = [];
    patientDoctorList =
      this.state.patientDoctorList.length > 0
        ? this.state.patientDoctorList.map((dmp) => {
          return {
            value: dmp,
            label: dmp,
          };
        })
        : [];

    let patientList = "";
    patientList =
      this.state.patientList.length > 0
        ? this.state.patientList.map((list) => {
          // let deleteIcon = (
          //   <span
          //     style={{ cursor: "pointer" }}
          //     title="Delete"
          //     onClick={() =>
          //       swal({
          //         title: "Are you Sure?",
          //         text: "You want to delete this patient!",
          //         buttons: true,
          //         dangerMode: true,
          //       }).then((willDelete) => {
          //         if (willDelete) {
          //           this.deletePatientRecord(list.id, false);
          //         }
          //       })
          //     }
          //   >
          //     Delete
          //   </span>
          // );
          let deletedPatient = list.disabled ? (
            <span
              title="Inactive"
              onClick={() =>
                swal({
                  title: "Are you Sure?",
                  text: "You want to active this patient!",
                  buttons: true,
                  dangerMode: true,
                }).then((willDelete) => {
                  if (willDelete) {
                    this.deletePatinet(list.id, false);
                  }
                })
              }
            >
              Unlock
            </span>
          ) : (
              <span
                title="Active"
                onClick={() =>
                  swal({
                    title: "Are you Sure?",
                    text: "You want to Inactive this patient!",
                    buttons: true,
                    dangerMode: true,
                  }).then((willDelete) => {
                    if (willDelete) {
                      this.deletePatinet(list.id, true);
                    }
                  })
                }
              >
                Lock
              </span>
            );
          let enableVideocall = list.isCallEnable ? (
            <span
              style={{ cursor: "pointer" }}
              title="Video Call"
              onClick={() => {
                this.patientVideoCall(list.id, list.name);
              }}
            >
              Video Call
            </span>
          ) : (
              ""
            );
          return (
            <tr key={list.id}>
              <td>{list.mrn}</td>
              <td
                style={{ cursor: "pointer" }}
                onClick={() =>
                  this.getRedirectOnName(list.id, list.name, list)
                }
              >
                {list.name}
              </td>
              <td>{list.dob ? moment(list.dob).format("MM/DD/YYYY") : ""}</td>
              <td>{list.department}</td>
              <td>{list.doctorName}</td>
              <td>{list.invitedBy}</td>
              <td>{list.addedByName}</td>
              <td>
                {list.createdAt
                  ? moment(list.createdAt).format("MM/DD/YYYY HH:mm")
                  : ""}
              </td>
              <td className="action-btn-box">
                {list.disabled ? (
                  ""
                ) : (
                    <>
                      {enableVideocall}{" "}
                      <span
                        title="Edit"
                        data-toggle="modal"
                        data-target="#myModal"
                        onClick={() => this.getPatientDetails(list.id)}
                        aria-hidden="true"
                      >
                        Edit
                      </span>
                    </>
                  )}
                {deletedPatient}
                {/* {this.state.isAdmin ? deleteIcon : ""} */}
              </td>
            </tr>
          );
        })
        : [];

    return (
      <div className="page-body-wrapper patient-list-wrap">
        <div className="row">
          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-4">
            <div className="form-group">
              <input
                type="number"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                onChange={(e) => this.handleChangeMRN(e)}
                autoComplete="off"
                value={this.state.searchmrn}
                placeholder="#MRN"
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-4">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail2"
                aria-describedby="emailHelp"
                onChange={(e) => this.handleChangePatientName(e)}
                autoComplete="off"
                value={this.state.searchPatientName}
                placeholder="Name"
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-4">
            <div className="form-group">
              <DatePicker
                onSelect={this.handleDateChange}
                value={this.state.startDate}
                selected={this.state.startDate}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="form-control"
                placeholderText="Date of Birth"
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-6">
            <div className="form-group">
              <Select
                value={this.state.selectedDepartment}
                onChange={this.handleChangeSelect}
                options={optionsList}
                placeholder="Department"
              // menuIsOpen={true}
              />
            </div>
          </div>
          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-6">
            <div className="form-group">
              <Select
                value={this.state.selectedDoctor}
                onChange={this.handleChangeSelectDoctor}
                options={doctorList}
                placeholder="Provider"
                openOnFocus={true}
                autofocus={true}
              />
            </div>
          </div>

          <div className="col-md-4 col-lg-3 col-xl-2 col-sm-4">
            <div className="general-btns-group">
              <button
                id="patient-list-search"
                type="button"
                className="btn btn-blue-block"
                onClick={() => this.filterData()}
                disabled=""
              >
                Search
              </button>
              <button
                type="button"
                className="btn btn-blue-border"
                onClick={() => this.resetData()}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          {this.state.isLoading ? (
            <div className="patient-list-loading">
              <LoadingIndicator />
            </div>
          ) : (
              ""
            )}
          {/* <Link id="video-open-redirect" target="_blank" >Hello</Link> */}
          <table id="example" className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>#MRN</th>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Department</th>
                <th>Doctor</th>
                <th>Invited By</th>
                <th>Added By</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.recordMessage ? (
                this.state.totalIteamCount ? (
                  patientList
                ) : (
                    <tr>
                      <td colSpan="9" style={{ textAlign: "center" }}>
                        No record found
                    </td>
                    </tr>
                  )
              ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center" }}>
                      Loading patients please wait.
                  </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        {this.state.totalIteamCount ? (
          <div className="row">
            <div className="col-lg-6">
              <div className="table Info">
                Showing{" "}
                {this.state.activePage === 1
                  ? 1
                  : this.state.itemperpage * (this.state.activePage - 1)}{" "}
                to {this.state.itemperpage * this.state.activePage} of{" "}
                {this.state.totalIteamCount} records
              </div>
            </div>
            <div className="col-lg-6 d-flex justify-content-end">
              <Pagination
                activePage={this.state.activePage}
                itemsCountPerPage={this.state.itemperpage}
                totalItemsCount={this.state.totalIteamCount}
                pageRangeDisplayed={this.state.pageRangeDisplayed}
                onChange={this.pageChange}
                itemClass="page-item"
                linkClass="page-link"
                lastPageText="⟩⟩"
                firstPageText="⟨⟨"
              />
            </div>
          </div>
        ) : (
            ""
          )}

        <div
          id="myModal"
          className="modal fade patient-edit-popup"
          role="dialog"
        >
          <div className="modal-dialog">
            {/* <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                                <h4 className="modal-title">Modal Header</h4>
                            </div>
                            <div className="modal-body">
                                <p>Some text in the modal.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            </div>
                        </div> */}
            <div className="modal-content invite-patient-sec">
              <div className="invite-patient-block">
                <div className="invite-patient-header">
                  <h4 className="title">Update a Patient</h4>
                </div>
                <div className="invite-patient-content patient-form">
                  <div className="floating-form how-to-invite">
                    <label>
                      {i18n && i18n.inviteuser && i18n.inviteuser.mrnlabel}
                    </label>

                    <input
                      className="theme-input"
                      type="number"
                      value={this.state.patientMRN}
                      name="patientMRN"
                      onChange={(e) => this.handleMRNTextChange(e)}
                    />
                  </div>

                  <div className="floating-form how-to-invite">
                    <label>
                      {i18n && i18n.inviteuser && i18n.inviteuser.namelabel}
                    </label>
                    <input
                      className="theme-input"
                      type="text"
                      value={this.state.patientName}
                      name="patientName"
                      onChange={(e) => this.handleNameTextChange(e)}
                    />
                  </div>

                  <div className="floating-form how-to-invite">
                    <label>
                      {i18n && i18n.inviteuser && i18n.inviteuser.DOBLabel}
                    </label>
                    <p>
                      <DatePicker
                        onSelect={this.handleDOBDateChange}
                        value={this.state.patientDOB}
                        selected={this.state.patientDOB}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className="theme-input"
                      />
                    </p>
                  </div>
                  {this.state.isAdmin ? (
                    <>
                      <div className="floating-form how-to-invite">
                        <Select
                          value={this.state.selectedPatientDepartment}
                          onChange={this.handleChangeSelectDepartment}
                          options={optionsList}
                          placeholder="Please select department"
                        // menuIsOpen={true}
                        />
                      </div>
                      <div className="floating-form how-to-invite">
                        <Select
                          value={this.state.selectedPatientDoctor}
                          onChange={this.handleChangePatientDoctor}
                          options={patientDoctorList}
                          placeholder="Please select doctor"
                          openOnFocus={true}
                          autofocus={true}
                        />
                      </div>
                    </>
                  ) : (
                      ""
                    )}
                  <div className="floating-form how-to-invite">
                    <label>
                      {i18n &&
                        i18n.inviteuser &&
                        i18n.inviteuser.mobilenumberlabel}
                    </label>
                    <div className="input-with-icon">
                      <input
                        className="theme-input readonly-info"
                        readOnly={true}
                        type="text"
                        value={this.state.patientMobile}
                        name="patientMobile"
                        onChange={(e) => this.handleMobileTextChange(e)}
                      />
                      <span>
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 20 20"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          xlink="http://www.w3.org/1999/xlink"
                        >
                          <title>
                            iconfinder_ic_not_interested_48px_352568
                          </title>
                          <desc>Created with Sketch.</desc>
                          <g
                            id="Page-1"
                            stroke="none"
                            stroke-width="1"
                            fill="none"
                            fill-rule="evenodd"
                          >
                            <g
                              id="Blocked"
                              transform="translate(-1047.000000, -494.000000)"
                            >
                              <g
                                id="iconfinder_ic_not_interested_48px_352568"
                                transform="translate(1045.000000, 492.000000)"
                              >
                                <polygon
                                  id="Path"
                                  points="0 0 24 0 24 24 0 24"
                                ></polygon>
                                <path
                                  d="M12,2 C6.475,2 2,6.475 2,12 C2,17.525 6.475,22 12,22 C17.525,22 22,17.525 22,12 C22,6.475 17.525,2 12,2 Z M12,20 C7.58,20 4,16.42 4,12 C4,10.15 4.635,8.455 5.685,7.1 L16.9,18.315 C15.545,19.365 13.85,20 12,20 Z M18.315,16.9 L7.1,5.685 C8.455,4.635 10.15,4 12,4 C16.42,4 20,7.58 20,12 C20,13.85 19.365,15.545 18.315,16.9 Z"
                                  id="Shape"
                                  fill="#B4B4B4"
                                  fill-rule="nonzero"
                                ></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="floating-form how-to-invite">
                    <label>
                      {i18n && i18n.inviteuser && i18n.inviteuser.emaillabel}
                    </label>
                    <div className="input-with-icon">
                      <input
                        className="theme-input readonly-info"
                        readOnly="true"
                        type="text"
                        value={this.state.patientEmail}
                        name="patientEmail"
                        onChange={(e) => this.handleEmailTextChange(e)}
                      />
                      <span>
                        <svg
                          width="20px"
                          height="20px"
                          viewBox="0 0 20 20"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                          xlink="http://www.w3.org/1999/xlink"
                        >
                          <title>
                            iconfinder_ic_not_interested_48px_352568
                          </title>
                          <desc>Created with Sketch.</desc>
                          <g
                            id="Page-1"
                            stroke="none"
                            stroke-width="1"
                            fill="none"
                            fill-rule="evenodd"
                          >
                            <g
                              id="Blocked"
                              transform="translate(-1047.000000, -494.000000)"
                            >
                              <g
                                id="iconfinder_ic_not_interested_48px_352568"
                                transform="translate(1045.000000, 492.000000)"
                              >
                                <polygon
                                  id="Path"
                                  points="0 0 24 0 24 24 0 24"
                                ></polygon>
                                <path
                                  d="M12,2 C6.475,2 2,6.475 2,12 C2,17.525 6.475,22 12,22 C17.525,22 22,17.525 22,12 C22,6.475 17.525,2 12,2 Z M12,20 C7.58,20 4,16.42 4,12 C4,10.15 4.635,8.455 5.685,7.1 L16.9,18.315 C15.545,19.365 13.85,20 12,20 Z M18.315,16.9 L7.1,5.685 C8.455,4.635 10.15,4 12,4 C16.42,4 20,7.58 20,12 C20,13.85 19.365,15.545 18.315,16.9 Z"
                                  id="Shape"
                                  fill="#B4B4B4"
                                  fill-rule="nonzero"
                                ></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="general-btns-group invite-patient-btns">
                  <button
                    type="button"
                    className="btn btn-blue-border"
                    data-dismiss="modal"
                    onClick={() => this.resetPatientData()}
                  >
                    {i18n && i18n.buttontext && i18n.buttontext.closeText}
                  </button>
                  <button
                    type="button"
                    className="btn btn-blue-block"
                    data-dismiss="modal"
                    disabled={
                      this.state.patientName &&
                        this.state.selectedPatientDoctor &&
                        this.state.selectedPatientDepartment
                        ? false
                        : true
                    }
                    onClick={() => this.updatePatient(this.state.patientID)}
                  >
                    {i18n && i18n.buttontext && i18n.buttontext.update}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <React.Fragment>
          <div class="modal fade" id="myModal-1" role="dialog">
            <div class="modal-dialog modal-blocker">
              <div class="modal-content">
                <div class="modal-header">
                  {/* <h4 class="modal-title"></h4> */}
                  <p>Please disable your pop-up blocker</p>
                  <button type="button" class="close" data-dismiss="modal">
                    &times;
                  </button>
                </div>
                <div class="modal-body">
                  <div className="general-btns-group invite-patient-btns">
                    <img src={this.state.blockerImagePath} alt=""></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
        <button
          type="button"
          style={{ display: "none" }}
          id="modal-btn-open"
          class="btn btn-info btn-lg"
          data-toggle="modal"
          data-target="#myModal-1"
        >
          Open Modal
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.auth,
  };
};

export default connect(mapStateToProps, "")(PatientList);
