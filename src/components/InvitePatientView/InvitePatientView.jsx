import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import "./InvitePatientView.css";
import FieldView from "../FieldView/FieldView";
import { v4 as uuid } from "uuid";
import { connect } from "react-redux";
import Select from "react-select";
import * as dasboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import {
  sendInvite,
  getDepartmentList,
  getTagList,
  getDoctorList,
  formatPhoneNumber,
  checkForAlphabets,
  isValidEmail,
  checkValidation,
  phoneEmailValidation,
  getHospitalList,
  compare_to_sort,
} from "./InvitePatientViewModel";
import DatePicker from "react-datepicker";
import moment from "moment";
import LoadingIndicator from "../../common/LoadingIndicator";
import InputMask from "react-input-mask";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import * as Analytics from "../../helper/AWSPinPoint";
import Socket, {
  socketActions,
  socketSubActions,
} from "../../helper/Websocket";

const InvitePatientContext = createContext(null);

const Input = (props) => {
  let {
    onfocus,
    onblur,
    fieldType = "text",
    classname = "custom-input",
  } = props;
  return (
    <>
      {/* <span className="input-span">+1</span> */}
      <InputMask
        mask="+1 (999) 999-9999"
        value={props.value}
        onChange={props.onChange}
        onBlur={onblur}
        onFocus={onfocus}
      >
        {(inputProps) => (
          <input
            className={classname}
            placeholder="e.g. +1 (212) 212-1212"
            {...inputProps}
            type={fieldType}
            beforeMaskedValueChange={props.beforeMaskedValueChange}
          />
        )}
      </InputMask>
    </>
  );
};

function InvitePatientView({
  hospitalList = [],
  tagList = [],
  userdata = {},
  details = {},
  showLoader = false,
}) {
  let [lists, setLists] = useState({ departments: [], doctors: [] });
  let context = useContext(InvitePatientContext);
  let [fetchDepartments, setFetchDepartments] = useState(false);
  let [fetchDoctors, setFetchDoctors] = useState(false);
  let [errorStates, setErrorStates] = useState(null);

  useEffect(() => {
    if (details?.department?.length === 0) setLists({ ...lists, doctor: [] });
    setErrorStates(details?.errorMessages);
  }, [details.errorMessages]);

  let updateContext = (key, val) => {
    context.setUploadObject({
      ...details,
      [key]: val,
    });
  };

  let updateDropDownContext = (key, val) => {
    let obj = {
      ...details,
      [key]: val,
    };

    if (key === "hospital") {
      obj.department = null;
      obj.doctor = null;
    }

    if (key === "department") {
      if (val === null) {
        obj.doctor = null;
      }
    }
    context.setUploadObject(obj);
  };

  return (
    <div className="InvitePatientView">
      <div className="details-box animate-popup-appear">
        <img className="cross-button" src="/assets/images/cross.png" alt="" />
        <label className="heading-label flex-center text-style">
          Invite Patient
        </label>
        <div className="fields-div">
          <FieldView
            title="Patient Name"
            placeholder="Enter First Name"
            value={details.fname}
            onchange={(val) => {
              setErrorStates({
                ...errorStates,
                fnameMessage: val.length > 2 ? "" : errorStates?.fnameMessage,
              });
              updateContext("fname", checkForAlphabets(val));
            }}
            labelText={errorStates?.fnameMessage}
          />
          <FieldView
            title=""
            placeholder="Enter Last Name"
            value={details.lname}
            onchange={(val) => {
              setErrorStates({
                ...errorStates,
                lnameMessage: val.length > 2 ? "" : errorStates?.lnameMessage,
              });
              updateContext("lname", checkForAlphabets(val));
            }}
            labelText={errorStates?.lnameMessage}
          />

          <FieldView
            title="Mobile Number"
            placeholder="+1 (000) 000-0000"
            component={() => {
              return (
                <Input
                  value={details.phone}
                  onChange={(val) => {
                    let rawVal = val.target.value.replace(
                      /(\+\d{1})\s\((\d{3})\)\s(\d{3})\-(\d{4})/,
                      "$1$2$3$4"
                    );
                    updateContext("phone", rawVal || "");
                  }}
                  classname="custom-phone-input"
                />
              );
            }}
            labelText={errorStates?.phoneMessage}
          />
          <FieldView
            title="Email"
            placeholder="abc@example.com"
            value={details.email}
            onchange={(val) => {
              let status = phoneEmailValidation(details.phone, val).finalStatus;
              setErrorStates({
                ...errorStates,
                phoneMessage: status ? "" : errorStates?.phoneMessage,
                emailMessage: status ? "" : errorStates?.emailMessage,
              });
              updateContext("email", val);
            }}
            labelText={errorStates?.emailMessage}
          />
          <FieldView
            title="Date Of Birth"
            labelText={errorStates?.dobMessage}
            component={() => (
              <>
                <div className="DatePicker">
                  <DatePicker
                    selected={details.dob}
                    onChange={(e) => {
                      let ndate = new Date(e?.getTime());
                      setErrorStates({
                        ...errorStates,
                        dobMessage:
                          ndate !== null ? "" : errorStates?.dobMessage,
                      });
                      updateContext("dob", e?.getTime() || "");
                    }}
                    maxDate={new Date()}
                    id="dob"
                    autoComplete="off"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="MM/DD/YYYY"
                    customInput={
                      <InputMask mask="99/99/9999" value={details.dob}>
                        {(inputProps) => <input {...inputProps} />}
                      </InputMask>
                    }
                  />
                  {/* <span class="spacer"></span> */}
                  <div
                    aria-hidden="true"
                    class="css-tlfecz-indicatorContainer flex-center"
                  >
                    <span class="css-1okebmr-indicatorSeparator"></span>
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                      focusable="false"
                      class="css-6q0nyr-Svg"
                    >
                      <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                    </svg>
                  </div>
                </div>
              </>
            )}
          />
          <FieldView appendClass="null-field" />
          <FieldView
            title="Hospital (Optional)"
            component={() => {
              return (
                <Select
                  value={details.hospital}
                  onChange={(name) => {
                    updateDropDownContext("hospital", name);
                    if (name === null) {
                      setLists({ ...lists, departments: [], doctors: [] });
                    } else {
                      setFetchDepartments(true);
                      getDepartmentList(name.value, (data) => {
                        setFetchDepartments(false);
                        let departments =
                          data
                            ?.sort((a, b) => compare_to_sort(a, b, "name"))
                            .map((department) => ({
                              label: department.name,
                              value: department.id,
                            })) || [];
                        setLists({
                          ...lists,
                          departments: departments,
                          doctors: [],
                        });
                      });
                    }
                  }}
                  options={hospitalList}
                  placeholder="Select Hospital"
                  className="select-wrap-media"
                  isClearable={true}
                  isSearchable={true}
                  maxMenuHeight="120px"
                />
              );
            }}
          />
          <FieldView
            title="Department (Optional)"
            component={() => {
              return (
                <Select
                  value={details.department}
                  onChange={(selectObj) => {
                    updateDropDownContext("department", selectObj);
                    if (selectObj === null) {
                      setLists({ ...lists, doctors: [] });
                    } else {
                      setFetchDoctors(true);
                      getDoctorList(
                        userdata.enterpriseId,
                        details.hospital.label,
                        selectObj.label,
                        (data) => {
                          let doctorList =
                            data?.map((doctorName) => ({
                              label: doctorName,
                              value: uuid(),
                            })) || [];
                          setLists({
                            ...lists,
                            doctors:
                              doctorList.sort((a, b) =>
                                compare_to_sort(a, b, "label")
                              ) || [],
                          });
                          setFetchDoctors(false);
                        }
                      );
                    }
                  }}
                  isLoading={fetchDepartments}
                  options={lists.departments}
                  placeholder="Select Department"
                  className="select-wrap-media"
                  isClearable={true}
                  isSearchable={true}
                  maxMenuHeight="120px"
                />
              );
            }}
          />
          <FieldView
            title="Doctor (Optional)"
            component={() => {
              return (
                <Select
                  value={details.doctor}
                  isLoading={fetchDoctors}
                  onChange={(name) => updateDropDownContext("doctor", name)}
                  options={lists.doctors}
                  placeholder="Select Doctor"
                  className="select-wrap-media"
                  isClearable={true}
                  isSearchable={true}
                  maxMenuHeight="120px"
                />
              );
            }}
          />

          <FieldView
            title="Document Bundle (Optional)"
            component={() => (
              <Select
                value={details.document}
                // defaultValue={details.document}
                onChange={(name) => updateDropDownContext("document", name)}
                options={tagList}
                placeholder="Select Document"
                className="select-wrap-media"
                isClearable={true}
                isSearchable={true}
                maxMenuHeight="120px"
              />
            )}
          />
        </div>
        <div className="buttons-div">
          <button
            className="clear-button text-style action-button flex-center"
            id="clear-button"
            onClick={(e) => {
              e.preventDefault();
              context.clearUploadValues();
            }}
          >
            Clear
          </button>
          <div
            type="submit"
            onClick={(e) => {
              context.sendInviteTapped(context.object);
            }}
            className="send-button text-style action-button flex-center"
          >
            Send Invite
          </div>
        </div>
        {showLoader ? (
          <div className="create-content-loading">
            <LoadingIndicator />
          </div>
        ) : null}
      </div>
    </div>
  );
}

let InvitationSentView = (props) => {
  let { onProfileClick = () => {}, onclick = () => {}, data = {} } = props;
  return (
    <div className="InvitePatientView flex-center">
      <div className="details-box flex-center uploaded">
        <label className="heading-label flex-center text-style">Great!</label>
        <label className="flex-center text-style">
          Your invitation has been sent successfully.
        </label>
        <img
          style={{ width: "358px", height: "200px" }}
          src="/assets/images/send-icon.png"
          alt=""
        />
        <div className="buttons-container">
          <div
            className="button-style text-style action-button flex-center"
            onClick={() => {
              onProfileClick();
            }}
          >
            Continue to patient profile
          </div>
          <div
            className="button-style text-style action-button flex-center"
            onClick={() => onclick()}
          >
            Close
          </div>
        </div>
      </div>
    </div>
  );
};

function InvitePatientPortal(props) {
  let socket = useRef();
  let { obj, crossTapped, profileTapped } = props;
  let [state, setstate] = useState(true);
  let [object, setUploadObject] = useState({
    fname: obj?.firstName || "",
    lname: obj?.lastName || "",
    phone: obj?.mobileNo.slice(2) || "",
    email: obj?.email || "",
    dob: obj?.dob ? new Date(moment(obj?.dob)).getTime() : "",
    hospital: null,
    doctor: null,
    department: null,
    document: null,
    errorMessages: null,
  });
  let [departments, setdepartment] = useState([]);
  let [hospitals, setHospitals] = useState([]);
  let [tags, setTags] = useState([]);
  let [userData] = useState(JSON.parse(props.credentials).user);
  let [apiStates, setApiState] = useState({
    showLoader: false,
    uploadSuccessful: null,
    data: null,
  });

  useEffect(() => {
    let crossButton = document.getElementsByClassName("cross-button")[0];
    if (crossButton) {
      crossButton.onclick = () => {
        if (crossTapped) {
          crossTapped();
        }
        props.setInvitePatient({
          invitePatientData: { isInvitePatient: false, dataObj: null },
        });
        props.setInvitePatientModal({
          displayInviteModal: false,
        });
      };
    }

    // if (
    //   props.invitePatientData.isEmr &&
    //   props.invitePatientData.assigningAuthority !== "AIPB"
    // ) {
    //   socket.current = new Socket();
    //   let patientData = props.invitePatientData.dataObj;
    //   let socketObj = {
    //     mrn: patientData.mrn,
    //     birthDate: patientData.dob,
    //     firstName: patientData.firstName,
    //     lastName: patientData.lastName,
    //     mobileNo: patientData.mobileNo,
    //     healthSystemData: obj,
    //     email: patientData.email,
    //     Authorization: `Bearer ${props.user.stsTokenManager.accessToken}`,
    //     subAction: socketSubActions.addPatient,
    //     action: socketActions.referral,
    //   };
    //   setApiState({ ...apiStates, showLoader: true });
    //   socket.current.send(JSON.stringify(socketObj), (result) => {
    //     setApiState({
    //       ...apiStates,
    //       showLoader: false,
    //       uploadSuccessful: result.settings.status === 1,
    //       data: result.data,
    //     });
    //     if (result.settings.status === 1) runAnalytics(result.data);
    //     socket.current.close();
    //   });
    //   return;
    // }

    let user = JSON.parse(props.credentials).user;

    getTagList((data) =>
      setTags(data.sort((a, b) => compare_to_sort(a, b, "name")))
    );

    getHospitalList(user.enterpriseId, (success) => {
      setHospitals(success.sort((a, b) => compare_to_sort(a, b, "name")));
    });

    // return () => {
    //   socket.current.close();
    //   socket.current = null;
    // };
  }, []);

  function runAnalytics(data) {
    let providerDetails = JSON.parse(props.credentials).user;
    let analytics = {
      invitedUserBirthDate: data?.dob,
      invitedUserMobile: data?.mobileNo,
      invitedUserName: data?.name,
      invitedUserEmail: data?.email,
      invitedPatientId: data?.id,
    };
    if (props.invitePatientData.isEmr) {
      delete analytics.invitedPatientId;
      analytics["invitedUserId"] = data?.id;
    }
    Analytics.record(
      analytics,
      providerDetails.id,
      props.invitePatientData.isEmr
        ? Analytics.EventType.inviteEMR
        : Analytics.EventType.invitePatient
    );
  }

  function clearUploadValues() {
    setUploadObject({
      fname: "",
      lname: "",
      phone: "",
      email: "",
      hospital: null,
      doctor: null,
      department: null,
      document: null,
      dob: "", //new Date("08/06/2007").getTime(),
      errorMessages: null,
    });
  }

  function sendInviteTapped(reqobj) {
    let user = JSON.parse(props.credentials).user;
    let vObj = checkValidation(reqobj);
    if (!vObj.allValid) {
      setUploadObject({ ...object, errorMessages: vObj });
      return;
    }

    let phone = reqobj.phone || "";
    let body = {
      // firstName: reqobj.fname.trim(),
      // lastName: reqobj.lname.trim(),
      email: reqobj.email || "",
      // mobileNo: phone.length === 10 ? "+1" + phone : "",
      mobileNo: phone || "",
      type: "personal",
      enterpriseId: user.enterpriseId || "",
      name: reqobj.fname.trim() + " " + reqobj.lname.trim(),
      departmentId: reqobj.department?.value || "",
      hospitalCode: object?.hospital?.value || "",
      hospitalName: object?.hospital?.label || "",
      tag: reqobj.document?.label || "",
      birthDate: moment(new Date(reqobj.dob)).format("YYYYMMDD") || "",
      doctorName: reqobj.doctor?.label || "",
      smsNotification: phone?.length === 10,
      emailNotification: isValidEmail(reqobj.email) || false,
      isAdmin: true,
      isAddToCareTeam: false,
      healthSystemData: obj,
      newMRN: obj?.mrn ? "yes" : "",
      dob: moment(new Date(reqobj.dob)).format("YYYYMMDD") || "",
      // token: accesstoken,
      slug: obj?.mrn,
      // v: 1.2,
    };

    setApiState({ ...apiStates, showLoader: true });
    sendInvite(
      body,
      (success) => {
        setApiState({
          showLoader: false,
          uploadSuccessful: true,
          data: success.data,
        });
        runAnalytics(success.data);
      },
      (error) => {
        setApiState({ ...apiStates, showLoader: false });
        let message = error?.data?.settings?.message;
        swal("OOPS!", message ? message : "Something went wrong!", "error");
      }
    );
  }
  return state
    ? ReactDOM.createPortal(
        <InvitePatientContext.Provider
          value={{
            object,
            setUploadObject,
            clearUploadValues,
            sendInviteTapped,
          }}
        >
          {apiStates.uploadSuccessful ? (
            <InvitationSentView
              onProfileClick={() => {
                profileTapped(apiStates.data.id);
              }}
              onclick={() => {
                if (window.location.href.includes("/patient/")) {
                  let providerDetails = JSON.parse(props.credentials).user;
                  Analytics.record(
                    {
                      invitedUserId: apiStates.data?.id,
                      invitedUserMobile: apiStates.data?.mobileNo,
                      invitedUserName: apiStates.data?.name,
                      invitedUserBirthDate: apiStates.data?.dob,
                      invitedUserEmail: apiStates.data?.email,
                    },
                    providerDetails.id,
                    Analytics.EventType.addFamilyAfterPatientInvite
                  );
                }
                props.setInvitePatient({
                  invitePatientData: { isInvitePatient: false, dataObj: null },
                });
                props.setInvitePatientModal({ displayInviteModal: false });
              }}
              data={apiStates.data}
            />
          ) : (
            <InvitePatientView
              details={object}
              userdata={userData}
              hospitalList={hospitals.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              departmentList={departments.map((e) => ({
                label: e.name,
                value: e.id,
              }))}
              tagList={tags.map((e) => ({ label: e.name, value: uuid() }))}
              showLoader={apiStates.showLoader}
            />
          )}
        </InvitePatientContext.Provider>,
        document.getElementById("portal")
      )
    : null;
}

const mapStateToProps = (state) => {
  return {
    credentials: state.auth.userCredentials,
    invitePatientData: state.dashboardStates.invitePatientData,
    displayInviteModal: state.dashboardStates.displayInviteModal,
    user: JSON.parse(state.auth.northwelluser).user,
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setInvitePatient: dasboardActions.setInvitePatient,
      setInvitePatientModal: dasboardActions.setInvitePatientModal,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(InvitePatientPortal));
