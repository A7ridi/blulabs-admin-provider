import React from "react";
import InputMask from "react-input-mask";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager/index";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
import i18n from "../I18n/en.json";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import swal from "sweetalert";
// import InvitePatientView from "../components/InvitePatientView/InvitePatientView";
//import { resetState } from 'sweetalert/typings/modules/state';

//eslint-disable-next-line
var email_regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;

const Input = (props) => {
  return (
    <>
      {/* <span className="input-span">+1</span> */}
      <InputMask
        mask="+1 (999) 999-9999"
        value={props.value}
        onChange={props.onChange}
      >
        {(inputProps) => (
          <input
            className="custom-input"
            placeholder="e.g. +1 (212) 212-1212"
            {...inputProps}
            type="text"
            beforeMaskedValueChange={props.beforeMaskedValueChange}
          />
        )}
      </InputMask>
    </>
  );
};

class InviteuserNew extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchmrn: "",
      mrnsearchResult: null,
      isLoading: false,
      storedObject: null,
      selectedDepartment: "",
      selectedDoctor: "",
      selectedDepartmentName: "",
      selectedDoctorName: "",
      departmentDataList: [],
      doctorDataList: [],
      newMRNData: false,
      patientName: "",
      startDate: new Date("08/06/2007"),
      phoneNumber: "",
      patientEmail: "",
      isAdmin: false,
      MRN: false,
      isSuccess: false,
      showFamily: false,
      FamilyName: null,
      FamilyPhone: null,
      patientID: null,
      patientDatails: null,
      inviteErrorMessage: "",
      errorPatientData: "",
    };
  }
  componentDidMount() {
    this.props.headerupdate(null);
    this.departmentList();

    if (this.props.location && this.props.location.pId) {
      this.setState({
        isSuccess: true,
        patientID: this.props.location.pId,
        patientName: this.props.location.patientName,
      });
    }
  }
  static getDerivedStateFromProps(props) {
    if (props.storedObject && props.storedObject.userCredentials) {
      let userRole = JSON.parse(props.storedObject.userCredentials);
      if (userRole.user.role.includes("admin")) {
        return {
          storedObject: JSON.parse(props.data.northwelluser),
          isAdmin: true,
        };
      } else {
        let uData = JSON.parse(props.data.northwelluser);
        return {
          storedObject: JSON.parse(props.data.northwelluser),
          selectedDepartment: "abc",
          selectedDoctor: {
            label: uData.user.displayName,
          },
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
          let departmentDataList = success.data.data.departments
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
            //this.ErrorAlertbar(error.data.settings.message)
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

  patientlookup = async (e) => {
    const { searchmrn } = this.state;

    if (!searchmrn) {
      this.notify(i18n && i18n.inviteuser && i18n.inviteuser.entermrn);
      return;
    }

    this.setState({ isLoading: true });
    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }

    var hospitalCode = "";
    var queryparams = {
      mrn: searchmrn,
      enterpriseId: enterpriseId,
      hospitalCode: hospitalCode,
    };

    Apimanager.patientlookup(
      queryparams,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          var data = success.data;
          data.usemobilenumber = true;
          this.setState({
            isLoading: false,
            mrnsearchResult: data,
          });
        } else {
          this.setState({
            isLoading: false,
            newMRNData: true,
          });
        }
      },
      (error) => {
        this.setState({
          isLoading: false,
          mrnsearchResult: null,
          newMRNData: false,
        });

        if (error && error.status === 500) {
          if (
            error.data &&
            error.data.settings &&
            error.data.settings.message
          ) {
            this.ErrorAlertbar(error.data.settings.message);
            //return
          }
        }

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          //window.location.reload()
          //return
        }

        return;
      }
    );
  };

  handleChange(object = null, event) {
    typeof object === "object"
      ? (object.emailAddress = event.target.value)
      : this.setState({
          patientEmail: event.target.value,
        });
    if (!event.target.value.length && typeof object === "object") {
      object.useEmail = false;
    }

    if (typeof object === "object") {
      this.setState({ mrnsearchResult: this.state.mrnsearchResult });
    }
  }

  handleChangeSelect = (selectedDepartment) => {
    this.setState({
      selectedDepartment: selectedDepartment,
      doctorDataList: [],
      selectedDoctor: "",
    });

    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }

    let hospitalCode = "";
    let params = {
      enterpriseId: enterpriseId,
      hospitalName: hospitalCode,
      departmentName: selectedDepartment.value,
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
          this.setState({
            doctorDataList: doctorDataList,
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

        if (error && error.status === 401) {
          //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
          return;
        }

        return;
      }
    );
  };

  handleChangeSelectDoctor = (selectedDoctor) => {
    this.setState({
      selectedDoctor: selectedDoctor,
    });
  };

  inviteuserToPlayback(type, newMRN = null) {
    const { mrnsearchResult, storedObject, searchmrn } = this.state;
    var mobilenumber = "";
    if (newMRN !== "new") {
      mobilenumber =
        mrnsearchResult && mrnsearchResult.data && mrnsearchResult.data.phone
          ? mrnsearchResult.data.phone.replace(/[-/ /+()_]/g, "")
          : "";
      if (
        mrnsearchResult.data &&
        mrnsearchResult.data.emailAddress &&
        type === "email"
      ) {
        if (
          !email_regex.test(
            String(mrnsearchResult.data.emailAddress).toLowerCase()
          )
        ) {
          this.notify(
            i18n && i18n.inviteuser && i18n.inviteuser.validemailerror
          );
          return;
        }
      }
    } else {
      mobilenumber = this.state.phoneNumber;
      var patientEmailSend = this.state.patientEmail;
      if (patientEmailSend && type === "email") {
        if (!email_regex.test(String(patientEmailSend).toLowerCase())) {
          this.notify(
            i18n && i18n.inviteuser && i18n.inviteuser.validemailerror
          );
          return;
        }
      }
    }

    if (mobilenumber && mobilenumber.length < 10 && type === "mobile") {
      this.notify(i18n && i18n.inviteuser && i18n.inviteuser.validmobileerror);
      return;
    }

    //}
    this.setState({ isLoading: true });
    var bodyparams = {};
    bodyparams.emailNotification = false;
    if (newMRN === "new") {
      bodyparams.newMRN = "yes";
      bodyparams.firstName = this.state.patientName;
      bodyparams.birthDate = moment(this.state.startDate).format("YYYYMMDD");
      if (patientEmailSend && type === "email") {
        bodyparams.email = patientEmailSend;
        bodyparams.emailNotification = true;
      }
    } else {
      bodyparams.newMRN = "no";
      if (
        mrnsearchResult &&
        mrnsearchResult.data &&
        mrnsearchResult.data.emailAddress &&
        type === "email"
      ) {
        bodyparams.email = mrnsearchResult.data.emailAddress;
        bodyparams.emailNotification = true;
      }
    }
    bodyparams.type = "personal";
    bodyparams.hospitalName = "";
    //bodyparams.departmentId = this.state.selectedDepartment.value; //"DmqLLpnAUJ1PhuVWLSgl";
    //if (this.state.isAdmin) {
    if (this.state.selectedDepartment) {
      bodyparams.departmentName = this.state.selectedDepartment.label;
    }

    //}
    //bodyparams.doctorId = this.state.selectedDoctor.value; //"DmqLLpnAUJ1PhuVWLSgl";
    if (this.state.selectedDoctor) {
      bodyparams.doctorName = this.state.selectedDoctor.label; //"NEUROSURGERY";
    }

    let enterpriseId = "";
    if (this.props.storedObject && this.props.storedObject.userCredentials) {
      let userData = JSON.parse(this.props.storedObject.userCredentials);
      enterpriseId = userData.user.enterpriseId;
    }

    bodyparams.isAddToCareTeam = false;
    bodyparams.enterpriseId = enterpriseId;
    bodyparams.hospitalCode = "";
    bodyparams.slug = searchmrn;
    bodyparams.token =
      storedObject &&
      storedObject.user &&
      storedObject.user.stsTokenManager &&
      storedObject.user.stsTokenManager.accessToken;
    bodyparams.smsNotification = false;
    if (mobilenumber && type === "mobile") {
      bodyparams.mobileNo = "+" + mobilenumber.replace(/[^0-9]/g, "");
      bodyparams.smsNotification = true;
    }

    bodyparams.isAdmin = true;
    bodyparams.v = 1.2;

    Apimanager.inviteuser(
      bodyparams,
      (success) => {
        this.setState({
          isLoading: false,
          isSuccess: true,
          patientID: success.data.id,
        });
      },
      (error) => {
        this.setState({ isLoading: false, isSuccess: false });

        if (
          error &&
          error.data &&
          error.data.settings &&
          error.data.settings.status === 0
        ) {
          console.log("error.data", error.data);

          this.setState(
            {
              inviteErrorMessage: error.data.settings.message,
              errorPatientData: error.data.settings.data
                ? error.data.settings.data
                : "",
            },
            () => {
              document.getElementById("open-viewed-media-patient").click();
            }
          );

          // swal({
          //   icon: "info",
          //   text: error.data.settings.message,
          //   buttons: {
          //     cancel: "Close",
          //     confirm: "Re-Invite",
          //     roll: {
          //       text: "View Patient",
          //       value: "roll",
          //     },
          //   },
          // }).then(willDelete => {
          //   console.log("willDelete", willDelete)
          //   this.reinviteUser();
          // });

          //this.setState({ isLoading: false, isSuccess: false });
        }
        if (error && error.status === 500) {
          if (
            error.data &&
            error.data.settings &&
            error.data.settings.message
          ) {
            // swal({
            //   buttons: {
            //     cancel: true,
            //     confirm: "Confirm",
            //     roll: {
            //       text: "Do a barrell roll!",
            //       value: "roll",
            //     },
            //   },
            // });

            this.setState({ isLoading: false, isSuccess: false }, () =>
              this.ErrorAlertbar(error.data.settings.message)
            );
          }
        }
        return;
      }
    );
  }

  reinviteUser = () => {
    document.getElementById("open-viewed-media-patient").click();
    const { mrnsearchResult } = this.state;
    this.setState({ isLoading: true });
    let mobilenumber = "";
    let email = "";

    if (mrnsearchResult) {
      mobilenumber =
        mrnsearchResult && mrnsearchResult.data && mrnsearchResult.data.phone
          ? mrnsearchResult.data.phone.replace(/[-/ /+()_]/g, "")
          : "";
      email = mrnsearchResult.emailAddres;
    } else {
      mobilenumber = this.state.phoneNumber;
      email = this.state.patientEmail;
    }
    // console.log("mrnsearchResult", mrnsearchResult)
    // return;

    var queryparams = {};
    if (mobilenumber) {
      queryparams.mobileNo = "+" + mobilenumber.replace(/[^0-9]/g, "");
    }

    if (email) {
      queryparams.email = email;
    }

    Apimanager.reinviteUser(
      queryparams,
      (success) => {
        this.setState({
          isLoading: false,
          isSuccess: false,
          patientEmail: "",
          phoneNumber: "",
          patientName: "",
          mrnsearchResult: null,
        });

        this.sweetAlertbar(success.data.settings.message);
      },
      (error) => {
        this.setState({ isLoading: false });
      }
    );
  };
  useMobileSwitch(object) {
    const { mrnsearchResult } = this.state;
    object && object.usemobilenumber && object.usemobilenumber === true
      ? (object.usemobilenumber = false)
      : (object.usemobilenumber = true);
    if (!mrnsearchResult.data.phone.length) {
      this.notify(i18n && i18n.inviteuser && i18n.inviteuser.emptymobilenumber);
    } else {
      this.setState({
        mrnsearchResult: this.state.mrnsearchResult,
      });
    }
  }
  useEmailSwitch(object) {
    const { mrnsearchResult } = this.state;
    object && object.useEmail && object.useEmail === true
      ? (object.useEmail = false)
      : (object.useEmail = true);

    if (mrnsearchResult.data && !mrnsearchResult.data.emailAddress) {
      this.notify(i18n && i18n.inviteuser && i18n.inviteuser.emptyemailaddress);
    } else {
      this.setState({
        mrnsearchResult: this.state.mrnsearchResult,
      });
    }
  }
  resetData() {
    this.setState({
      searchmrn: "",
      mrnsearchResult: null,
      isLoading: false,
      storedObject: null,
      selectedDepartment: "",
      selectedDoctor: "",
      selectedDepartmentName: "",
      selectedDoctorName: "",
      doctorDataList: [],
      newMRNData: false,
      patientName: "",
      startDate: new Date("04/06/2007"),
      phoneNumber: "",
      patientEmail: "",
      isSuccess: false,
      patientID: null,
      //showFamily: false
    });
  }
  changeObjectvalue(object = null, event) {
    this.phone_number = event.target ? event.target.value : "";

    object && object.phone
      ? (object.phone = event.target.value)
      : this.setState({
          phoneNumber: event.target.value,
        });

    if (!this.phone_number.length) {
      if (object && object.phone) {
        object.usemobilenumber = false;
      }
    }
    if (object && object.phone) {
      this.setState({ mrnsearchResult: this.state.mrnsearchResult });
    }
  }

  closeModel = () => {
    //this.setState(initState)
    this.props.history.push("/");
    //this.resetData()
  };

  handleNameTextChange = (event) => {
    this.setState({
      patientName: event.target.value,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  MRNOptions = () => {
    this.resetData();
    this.setState((prevState) => ({
      MRN: !prevState.MRN,
    }));
  };

  inviteFamily = () => {
    this.setState({
      showFamily: true,
    });
  };

  changeFamilyName = (e) => {
    this.setState({
      FamilyName: e.target.value,
    });
  };

  changeFamilyPhone = (e) => {
    this.setState({
      FamilyPhone: e.target.value,
    });

    if (e.target.value.replace(/[^0-9]/g, "").length === 11) {
      let params = {
        mobileNo: "+" + e.target.value.replace(/[^0-9]/g, ""),
      };
      this.setState({
        isLoading: true,
      });
      Apimanager.callerlookup(
        params,
        (success) => {
          if (success && success.status === 200) {
            if (
              success.data &&
              success.data.data &&
              success.data.data.caller_name
            ) {
              this.setState({
                FamilyName: success.data.data.caller_name,
                isLoading: false,
              });
            } else {
              this.setState({
                isLoading: false,
              });
            }
          } else {
            this.setState({
              isLoading: false,
            });
          }
        },
        (error) => {
          this.setState({
            isLoading: false,
          });
        }
      );
    }
  };

  clearFamily = () => {
    this.setState({
      FamilyName: "",
      FamilyPhone: "",
    });
  };

  addFamilyMember = () => {
    this.setState({
      isLoading: true,
    });

    let params = {
      userId: this.state.patientID,
      mobileNo: "+" + this.state.FamilyPhone.replace(/[^0-9]/g, ""),
      name: this.state.FamilyName,
      type: "personal",
    };

    Apimanager.inviteuser(
      params,
      (success) => {
        if (
          success &&
          success.status === 200 &&
          success.data.settings &&
          success.data.settings.status === 1
        ) {
          this.setState({
            FamilyName: "",
            FamilyPhone: "",
            isSuccess: true,
            isLoading: false,
            showFamily: false,
          });
        } else {
          //if (error.data && error.data.settings && error.data.settings.message) {
          this.setState({
            isLoading: false,
          });
          this.ErrorAlertbar(success.data.settings.message);
          return;
          //}
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

  handleTextChange = (e) => {
    this.setState({
      searchmrn: e.target.value,
    });
  };

  patientSearch = () => {
    // let patientObject = {
    //     name: this.state.patientName,
    //     email: ''
    // }

    //console.log("")
    this.props.history.push(`/patient/${this.state.patientID}`, {
      searchText: this.state.patientName,
      patientObj: { name: this.state.patientName, email: "" },
    });
    //window.location.href = "/patient/" + this.state.patientID;
  };

  closeInviteModal = () => {
    document.getElementById("open-viewed-media-patient").click();
  };

  viewExistPatient = (id) => {
    document.getElementById("open-viewed-media-patient").click();
    this.props.history.push(`/patient/${id}`);
  };

  render() {
    const { searchmrn, mrnsearchResult, isLoading, patientName } = this.state;
    var mobilenumber =
      mrnsearchResult && mrnsearchResult.data && mrnsearchResult.data.phone
        ? mrnsearchResult.data.phone.replace(/[-/ /+()_]/g, "")
        : "";

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

    return (
      <div className="page-body-wrapper">
        {/* <div className="top-wrapper">
                    <h4 className="title">{i18n && i18n.inviteuser && i18n.inviteuser.invitepatientlabel}</h4>
                </div> */}
        <div className="inner-wrapper">
          <button
            id="open-viewed-media-patient"
            data-toggle="modal"
            data-target="#viewed-media-patient"
            style={{ display: "none" }}
          >
            open model
          </button>
          <div
            class="modal viewed-media-patient custom-modal fade"
            id="viewed-media-patient"
            tabindex="-1"
            role="dialog"
            aria-labelledby="viewed-media-patient"
            aria-hidden="true"
          >
            <div
              class="modal-dialog"
              role="document"
              style={{ maxWidth: "30%" }}
            >
              <div class="modal-content">
                <div class="modal-header">
                  {/* <h5 class="modal-title">Seen By</h5> */}
                  <img
                    style={{ maxWidth: "20%", marginLeft: "40%" }}
                    src="/assets/images/circle_7013068.png"
                    alt="info"
                    title=""
                  ></img>
                  {/* <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button> */}
                </div>
                <div style={{ paddingTop: "3%", textAlign: "center" }}>
                  <h4>{this.state.inviteErrorMessage}</h4>
                </div>
                <div class="modal-body" style={{ minHeight: "250px" }}>
                  {this.state.errorPatientData ? (
                    <div
                      className="search-result"
                      style={{ paddingTop: "2%", paddingLeft: "35%" }}
                    >
                      <button
                        type="button"
                        style={{ width: "55%" }}
                        className="btn btn-blue-block"
                        onClick={() =>
                          this.viewExistPatient(this.state.errorPatientData)
                        }
                      >
                        View Patient
                      </button>
                    </div>
                  ) : (
                    ""
                  )}

                  <div className="search-result" style={{ paddingLeft: "35%" }}>
                    <button
                      type="button"
                      style={{ width: "55%" }}
                      className="btn btn-blue-block"
                      onClick={() => this.reinviteUser()}
                    >
                      Re-Invite Patient
                    </button>
                  </div>
                  {/* style={{ width: '55%', fontSize: "14px", fontWeight: "600", border: "1px solid #0091ff", padding: "12px 16px", fontSize: "1.7rem", backgroundColor: "#add8e6" }} */}
                  <div className="search-result" style={{ paddingLeft: "35%" }}>
                    <button
                      type="button"
                      style={{
                        width: "55%",
                        fontSize: "14px",
                        fontWeight: "600",
                        border: "1px solid #0091ff",
                        padding: "12px 16px",
                        fontSize: "1.7rem",
                        color: "var(--theme-color-new)",
                      }}
                      className="btn"
                      onClick={() => this.closeInviteModal()}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {this.state.isSuccess ? (
            ""
          ) : (
            <div className="share-button mt-25">
              <div
                className={this.state.MRN ? "share-btn " : "share-btn active"}
                id="withoutmrn"
              >
                <button
                  onClick={() => this.MRNOptions()}
                  disabled={this.state.MRN ? false : true}
                  className="media-btn"
                >
                  Without MRN
                </button>
              </div>
              <div
                className={this.state.MRN ? "share-btn active" : "share-btn "}
                id="withmrn"
              >
                <button
                  onClick={() => this.MRNOptions()}
                  disabled={this.state.MRN ? true : false}
                  className="text-btn"
                >
                  With MRN
                </button>
              </div>
            </div>
          )}

          <div className="max-500">
            {isLoading ? (
              <div className="center-loader">
                <LoadingIndicator />
              </div>
            ) : (
              ""
            )}
            {!this.state.showFamily ? (
              <>
                {!this.state.isSuccess ? (
                  <>
                    {/* Without MRN Start */}

                    {this.state.MRN ? (
                      (mrnsearchResult && mrnsearchResult.data) ||
                      this.state.newMRNData ? (
                        ""
                      ) : (
                        <>
                          <div className="custom-filed">
                            <label>Patient MRN Number</label>
                            <input
                              className="custom-input"
                              placeholder="Please enter MRN "
                              type="number"
                              value={searchmrn}
                              name="searchmrn"
                              onChange={this.handleTextChange}
                            />
                          </div>
                          <div className="row">
                            <div className="col-sm-6 mt-4">
                              <button
                                className="btn btn-blue-block w-100"
                                disabled={
                                  isLoading || searchmrn.length === 0
                                    ? true
                                    : false
                                }
                                onClick={() => this.patientlookup()}
                              >
                                {i18n &&
                                  i18n.buttontext &&
                                  i18n.buttontext.searchtext}
                              </button>
                            </div>
                            <div className="col-sm-6 mt-4">
                              <button
                                className="btn btn-blue-border w-100"
                                onClick={() => this.closeModel()}
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </>
                      )
                    ) : (
                      <>
                        <div className="custom-filed">
                          <label>Patient Name</label>
                          <input
                            className="custom-input"
                            type="text"
                            placeholder="Full Name"
                            value={patientName}
                            name="patientName"
                            onChange={(e) => this.handleNameTextChange(e)}
                          />
                        </div>
                        <div className="custom-filed">
                          <label>Date of Birth</label>
                          <DatePicker
                            onSelect={this.handleDateChange}
                            value={this.state.startDate}
                            selected={this.state.startDate}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="custom-input"
                          />
                        </div>
                        {this.state.isAdmin ? (
                          <div className="custom-filed">
                            <Select
                              value={this.state.selectedDepartment}
                              onChange={this.handleChangeSelect}
                              options={optionsList}
                              placeholder="Please select department"
                              // menuIsOpen={true}
                            />
                          </div>
                        ) : (
                          ""
                        )}

                        {this.state.selectedDepartment &&
                        doctorList.length > 0 ? (
                          <div className="custom-filed">
                            <Select
                              value={this.state.selectedDoctor}
                              onChange={this.handleChangeSelectDoctor}
                              options={doctorList}
                              placeholder="Please select doctor"
                              openOnFocus={true}
                              autofocus={true}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                        <div className="custom-filed">
                          <label>Mobile Number</label>
                          <div className="with-button">
                            <Input
                              name="patientPhoneNumber"
                              value={this.state.phoneNumber}
                              onChange={this.changeObjectvalue.bind(
                                this,
                                this.state.phoneNumber
                              )}
                            />
                            <button
                              type="button"
                              className="btn btn-blue-block"
                              disabled={
                                this.state.phoneNumber &&
                                this.state.phoneNumber.replace(/[^0-9]/g, "")
                                  .length === 11 &&
                                this.state.patientName &&
                                this.state.startDate
                                  ? false
                                  : true
                              }
                              onClick={() =>
                                this.inviteuserToPlayback("mobile", "new")
                              }
                            >
                              Invite Patient
                            </button>
                          </div>
                        </div>
                        <div className="custom-filed">
                          <label>Email</label>
                          <div className="with-button">
                            <input
                              className="custom-input"
                              placeholder="abc@example.com"
                              value={this.state.patientEmail}
                              name="emailaddress"
                              onChange={this.handleChange.bind(
                                this,
                                this.state.patientEmail
                              )}
                            />
                            <button
                              type="button"
                              className="btn btn-blue-block"
                              disabled={
                                this.state.patientEmail &&
                                email_regex.test(
                                  String(this.state.patientEmail).toLowerCase()
                                ) &&
                                this.state.patientName &&
                                this.state.startDate
                                  ? false
                                  : true
                              }
                              onClick={() =>
                                this.inviteuserToPlayback("email", "new")
                              }
                            >
                              Invite Patient
                            </button>
                          </div>
                        </div>
                        <div className="row justify-content-center">
                          <div className="col-sm-6 mt-4">
                            <button
                              className="btn btn-blue-border w-100"
                              onClick={() => this.closeModel()}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {/* Without MRN End */}

                    {/* With MRN Form */}
                    {(mrnsearchResult && mrnsearchResult.data) ||
                    this.state.newMRNData ? (
                      <>
                        <div className="custom-filed">
                          <label>MRN</label>
                          <input
                            type="text"
                            className="custom-input"
                            placeholder="MRN#"
                            value={searchmrn}
                            onChange={this.handleTextChange}
                          />
                        </div>
                        <div className="custom-filed">
                          <label>
                            {i18n &&
                              i18n.inviteuser &&
                              i18n.inviteuser.namelabel}
                          </label>
                          {mrnsearchResult &&
                          mrnsearchResult.data &&
                          mrnsearchResult.data.firstName ? (
                            <p>
                              {mrnsearchResult.data.firstName +
                                " " +
                                mrnsearchResult.data.lastName}
                            </p>
                          ) : (
                            <input
                              className="custom-input"
                              type="text"
                              placeholder="Full Name"
                              value={patientName}
                              name="patientName"
                              onChange={(e) => this.handleNameTextChange(e)}
                            />
                          )}
                        </div>
                        <div className="custom-filed">
                          <label>
                            {i18n &&
                              i18n.inviteuser &&
                              i18n.inviteuser.DOBLabel}
                          </label>
                          <p>
                            {mrnsearchResult &&
                            mrnsearchResult.data &&
                            mrnsearchResult.data.birthDate ? (
                              moment(mrnsearchResult.data.birthDate).format(
                                "MM/DD/YYYY"
                              )
                            ) : (
                              <DatePicker
                                onSelect={this.handleDateChange}
                                value={this.state.startDate}
                                selected={this.state.startDate}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                className="custom-input"
                              />
                            )}
                          </p>
                        </div>

                        {this.state.isAdmin ? (
                          <div className="custom-filed">
                            <Select
                              value={this.state.selectedDepartment}
                              onChange={this.handleChangeSelect}
                              options={optionsList}
                              placeholder="Please select department"
                              // menuIsOpen={true}
                            />
                          </div>
                        ) : (
                          ""
                        )}

                        {this.state.selectedDepartment &&
                        doctorList.length > 0 ? (
                          <div className="custom-filed">
                            <Select
                              value={this.state.selectedDoctor}
                              onChange={this.handleChangeSelectDoctor}
                              options={doctorList}
                              placeholder="Please select doctor"
                              openOnFocus={true}
                              autofocus={true}
                            />
                          </div>
                        ) : (
                          ""
                        )}

                        <div className="custom-filed">
                          <label>
                            {i18n &&
                              i18n.inviteuser &&
                              i18n.inviteuser.mobilenumberlabel}
                          </label>
                          <div className="with-button">
                            {this.state.newMRNData ? (
                              <Input
                                name="patientPhoneNumber"
                                value={this.state.phoneNumber}
                                onChange={this.changeObjectvalue.bind(
                                  this,
                                  this.state.phoneNumber
                                )}
                              />
                            ) : (
                              <Input
                                value={
                                  mrnsearchResult &&
                                  mrnsearchResult.data &&
                                  mrnsearchResult.data.phone
                                    ? mobilenumber
                                    : ""
                                }
                                onChange={this.changeObjectvalue.bind(
                                  this,
                                  mrnsearchResult && mrnsearchResult.data
                                    ? mrnsearchResult.data
                                    : ""
                                )}
                              />
                            )}
                            {/* <input type="tel" className="custom-input" placeholder="e.g. (212) 212-1212" /> */}
                            {this.state.newMRNData ? (
                              <button
                                type="button"
                                className="btn btn-blue-block"
                                disabled={
                                  this.state.phoneNumber &&
                                  this.state.phoneNumber.replace(/[^0-9]/g, "")
                                    .length === 11 &&
                                  this.state.patientName &&
                                  this.state.startDate &&
                                  searchmrn
                                    ? false
                                    : true
                                }
                                onClick={() =>
                                  this.inviteuserToPlayback("mobile", "new")
                                }
                              >
                                Invite Patient
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-blue-block"
                                disabled={
                                  mobilenumber &&
                                  mobilenumber.length === 10 &&
                                  searchmrn
                                    ? false
                                    : true
                                }
                                onClick={() =>
                                  this.inviteuserToPlayback("mobile")
                                }
                              >
                                Invite Patient
                              </button>
                            )}
                            {/* <button className="btn btn-blue-block">Invite Patient</button> */}
                          </div>
                        </div>
                        <div className="custom-filed">
                          <label>Email</label>
                          <div className="with-button">
                            {this.state.newMRNData ? (
                              <input
                                className="custom-input"
                                placeholder="abc@example.com"
                                value={this.state.patientEmail}
                                name="emailaddress"
                                onChange={this.handleChange.bind(
                                  this,
                                  this.state.patientEmail
                                )}
                              />
                            ) : (
                              <input
                                className="custom-input"
                                placeholder="abc@example.com"
                                value={
                                  mrnsearchResult &&
                                  mrnsearchResult.data &&
                                  mrnsearchResult.data.emailAddress
                                    ? mrnsearchResult.data.emailAddress
                                    : ""
                                }
                                name="emailaddress"
                                onChange={this.handleChange.bind(
                                  this,
                                  mrnsearchResult && mrnsearchResult.data
                                    ? mrnsearchResult.data
                                    : ""
                                )}
                              />
                            )}

                            {this.state.newMRNData ? (
                              <button
                                type="button"
                                className="btn btn-blue-block"
                                disabled={
                                  this.state.patientEmail &&
                                  email_regex.test(
                                    String(
                                      this.state.patientEmail
                                    ).toLowerCase()
                                  ) &&
                                  this.state.patientName &&
                                  this.state.startDate &&
                                  searchmrn
                                    ? false
                                    : true
                                }
                                onClick={() =>
                                  this.inviteuserToPlayback("email", "new")
                                }
                              >
                                Invite Patient
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-blue-block"
                                disabled={
                                  mrnsearchResult &&
                                  mrnsearchResult.data &&
                                  mrnsearchResult.data.emailAddress &&
                                  email_regex.test(
                                    String(
                                      mrnsearchResult.data.emailAddress
                                    ).toLowerCase()
                                  ) &&
                                  searchmrn
                                    ? false
                                    : true
                                }
                                onClick={() =>
                                  this.inviteuserToPlayback("email")
                                }
                              >
                                Invite Patient
                              </button>
                            )}
                            {/* <button className="btn btn-blue-block">Invite Patient</button> */}
                          </div>
                        </div>
                        <div className="row justify-content-center">
                          <div className="col-sm-6 mt-4">
                            <button
                              className="btn btn-blue-border w-100"
                              onClick={() => this.closeModel()}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                        {/* With MRN End */}
                      </>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  <>
                    {" "}
                    {/* Success! Message Start */}
                    <h3 className="mb-2">Success!</h3>
                    <p className="your-request">
                      Your request for inviting people has been completed.
                    </p>
                    <div className="request-success">
                      <div className="success-image">
                        <img
                          src="./assets/images/success-icon.svg"
                          alt="Success"
                        />
                      </div>
                      <p className="want-invite">
                        Do you want to invite patient's family and friends?
                      </p>
                    </div>
                    <div className="row">
                      <div className="col-sm-6 mt-4">
                        <button
                          className="btn btn-blue-block w-100"
                          onClick={() => this.inviteFamily()}
                        >
                          Add family & friends
                        </button>
                      </div>
                      <div className="col-sm-6 mt-4">
                        <button
                          className="btn btn-blue-border w-100"
                          onClick={() => this.patientSearch()}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                    {/* Success! Message End */}
                  </>
                )}
              </>
            ) : (
              <>
                <h3>Add Family & Friends</h3>
                <div className="custom-filed">
                  <label>Mobile Number</label>
                  {/* <input type="tel" className="custom-input" onChange={(e) => this.changeFamilyPhone(e)} placeholder="e.g. (212) 212-1212" /> */}
                  <Input
                    name="patientPhoneNumber"
                    value={this.state.FamilyPhone}
                    onChange={(e) => this.changeFamilyPhone(e)}
                  />
                </div>
                <div className="custom-filed">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={this.state.FamilyName}
                    className="custom-input"
                    onChange={(e) => this.changeFamilyName(e)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="row">
                  <div className="col-sm-6 mt-4">
                    <button
                      disabled={
                        this.state.FamilyName && this.state.FamilyPhone
                          ? false
                          : true
                      }
                      className="btn btn-blue-block w-100"
                      onClick={() => this.addFamilyMember()}
                    >
                      Send invite
                    </button>
                  </div>
                  <div className="col-sm-6 mt-4">
                    <button
                      className="btn btn-blue-border w-100"
                      onClick={() => this.closeModel()}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Add Family & Friends Start */}

            {/*  */}

            {/* Add Family & Friends End */}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
  };
};
export default connect(mapStateToProps)(InviteuserNew);

// class InviteUser extends BaseComponent {
//   render() {
//     return <InvitePatientView />;
//   }
// }
// export default connect(mapStateToProps)(InviteUser);
