import React, { memo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InputMask from "react-input-mask";
import "./PatientInfoEditView.css";
import { isValidEmail, nameRegexProfile } from "../../../helper/CommonFuncs";
import moment from "moment";
import { connect } from "react-redux";
import texts from "../../../helper/texts";
import { bindActionCreators } from "redux";
import { fetchViewedPatient } from "../../../redux/actions/patientList.action";
import { ShowAlert } from "../../../common/alert";
import { useMutation } from "@apollo/client";
import { UPDATE_NOTIFICATION_SETTINGS } from "../../../viewpages/newpages/NotificationSettingsModule/actions/notificationSettingsAction";
import { errorToDisplay } from "../../../viewpages/newpages/careTeamModule/action/careTeamAction";
import { capitalizeFirstLetter } from "../../../viewpages/newpages/teamModule/action/teamAction";

const Input = (props) => {
   let {
      phoneErrorValue,
      onfocus,
      onblur,
      fieldType = "text",
      classname = ` ${phoneErrorValue ? "border-danger" : "default-text-input"} p-4 w-100`,
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
                  placeholder="(000)000-0000"
                  {...inputProps}
                  type={fieldType}
                  // beforeMaskedValueChange={props.beforeMaskedValueChange}
               />
            )}
         </InputMask>
      </>
   );
};

function PatientInfoEditView(props) {
   const { buttonId, refetch = () => {}, patientInfo, myPatients } = props;
   let patientInfoObject = patientInfo;
   const { id = "", name = "", contactInformation, dob = null } = patientInfoObject;
   const patientEmail = contactInformation.email;
   const patientMob = contactInformation.mobileNumber;
   const patientFullName = name.fullName;

   const [updateUser] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(res) {
         if (res.updateProfile?.status?.code === 200) {
            ShowAlert(res.updateProfile?.status?.message);
            refetch(
               {
                  index: patientInfoObject.index,
                  patientName: state.patientName,
                  patientDOB: state.patientDOB,
                  patientMobile: state.patientPhone,
                  patientEmail: state.patientEmail,
               },
               myPatients
            );
            clearPatientInfo();
            props.closeModalTapped();
         }
      },
      onError(error) {
         setState({
            ...state,
            isLoading: false,
         });
         ShowAlert(errorToDisplay(error), "error");
      },
   });

   let date = null;
   if (
      patientInfoObject &&
      patientInfoObject.dob &&
      patientInfoObject.dob !== "Invalid date" &&
      patientInfoObject.dob !== ""
   ) {
      date = moment(patientInfoObject.dob).format("MM/DD/YYYY");
      date = new Date(date);
   }
   const [state, setState] = useState({
      isLoading: false,
      patientName: patientFullName ? patientFullName : "",
      patientDOB: date,
      patientPhone: patientMob ? patientMob : "",
      patientEmail: patientEmail ? patientEmail : "",
      patientErrorObj: {
         patientNameError: null,
         patientDOBError: null,
         patientPhoneError: null,
         patientEmailError: null,
      },
   });

   const validatePatientInfo = () => {
      let patientNameError, patientDOBError, patientEmailError, patientPhoneError;
      let validateInfo = true;
      if (!nameRegexProfile.test(state.patientName)) {
         patientNameError = texts.invalidNameError;
         validateInfo = false;
      }
      if (dob && state.patientDOB === null) {
         patientDOBError = texts.requiredDob;
         validateInfo = false;
      }
      if (state?.patientEmail && state?.patientEmail?.trim()?.length === 0) {
         patientEmailError = texts.requireEmail;
         validateInfo = false;
      } else if (state.patientEmail?.trim()?.length > 0 && !isValidEmail(state.patientEmail)) {
         patientEmailError = texts.invalidEmail;
         validateInfo = false;
      }
      if (patientMob.length > 0 && state.patientPhone.trim().length === 0) {
         patientPhoneError = texts.requirePhone;
         validateInfo = false;
      } else if (
         state.patientPhone.replace(/\D/g, "").length > 0 &&
         state.patientPhone.replace(/\D/g, "").length !== 11
      ) {
         patientPhoneError = texts.invalidMob;
         validateInfo = false;
      }
      setState({
         ...state,
         patientErrorObj: {
            patientNameError: patientNameError,
            patientDOBError: patientDOBError,
            patientPhoneError: patientPhoneError,
            patientEmailError: patientEmailError,
         },
      });
      return validateInfo;
   };

   const updatePatientInfo = () => {
      if (validatePatientInfo()) {
         let mobileWithoutFormat = state.patientPhone?.replace(/\D/g, "");
         setState({
            ...state,
            isLoading: true,
         });

         updateUser({
            variables: {
               user: {
                  id,
                  name: {
                     fullName: state.patientName.trim().replace(/\s+/g, " "),
                  },
                  dateOfBirth: state.patientDOB !== null ? moment(state.patientDOB).format() : "",
                  contactInformation: {
                     email: state.patientEmail,
                     mobileNumber: mobileWithoutFormat.length === 11 ? "+" + mobileWithoutFormat : "",
                  },
               },
            },
         });
      }
   };
   const clearPatientInfo = () => {
      setState({
         ...state,
         patientName: "",
         patientDOB: null,
         patientPhone: "",
         patientEmail: "",
         patientErrorObj: {
            patientNameError: null,
            patientDOBError: null,
            patientPhoneError: null,
            patientEmailError: null,
         },
      });
   };
   return (
      <div className="patient-info-edit-view d-flex flex-column">
         <div className="patient-info-edit-header flex-center justify-content-end mt-4">
            <div className="flex-center justify-content-end flex-grow-1"></div>
            <div className="patient-info-edit-title flex-grow-1 .text-black2 position-absolute w-100 text-center h1 text-bold">
               Update patient profile
            </div>

            <button className="px-3 pb-2 mr-4" style={{ fontSize: "28px" }} onClick={props.closeModalTapped}>
               &times;
            </button>
         </div>
         <div className="w-100 flex-center flex-column flex-grow-1 justify-content-between my-5 text-black text-normal">
            <div className="w-75">
               <div className="info-field-title-div text-bold mb-2">Name</div>

               <input
                  type="text"
                  className={`${
                     state.patientErrorObj?.patientNameError ? "border-danger" : "default-text-input"
                  } p-4 w-100`}
                  placeholder="Enter Full Name"
                  value={state.patientName}
                  onChange={(e) => {
                     let name = capitalizeFirstLetter(e.target.value);
                     setState({
                        ...state,
                        patientName: name,
                     });
                  }}
               />
               {state.patientErrorObj?.patientNameError && (
                  <div className="text-danger text-xsmall">{state.patientErrorObj?.patientNameError}</div>
               )}
            </div>
            <div className="w-75">
               <div className="info-field-title-div text-bold mb-2">Date of birth</div>
               <div>
                  <img
                     className="position-absolute mr-3 mb-3"
                     src="/assets/images/newimages/datepicker-icon.svg"
                     alt=""
                     style={{ padding: "5px", right: "5px", bottom: "0px" }}
                  />
                  <DatePicker
                     onSelect={(date) => {
                        setState({
                           ...state,
                           patientDOB: date,
                        });
                     }}
                     value={state.patientDOB}
                     selected={state.patientDOB}
                     showMonthDropdown
                     showYearDropdown
                     dropdownMode="select"
                     className={`${
                        state.patientErrorObj?.patientDOBError ? "border-danger" : "default-text-input"
                     } p-4 w-100 bg-transparent"`}
                     autoComplete="off"
                     placeholderText="00/00/0000"
                     dateFormat="MM/dd/yyyy"
                     maxDate={new Date()}
                     customInput={
                        <InputMask mask="99/99/9999" value={state.patientDOB}>
                           {(inputProps) => <input {...inputProps} />}
                        </InputMask>
                     }
                  />
               </div>
               {state.patientErrorObj?.patientDOBError && (
                  <div className="text-danger text-xsmall">{state.patientErrorObj?.patientDOBError}</div>
               )}
            </div>
            <div className="w-75">
               <div className="info-field-title-div text-bold mb-2">Phone Number</div>
               <Input
                  phoneErrorValue={state.patientErrorObj?.patientPhoneError}
                  value={state.patientPhone}
                  onChange={(e) => {
                     setState({
                        ...state,
                        patientPhone: e.target.value,
                     });
                  }}
               />
               {state.patientErrorObj?.patientPhoneError && (
                  <div className="text-danger text-xsmall">{state.patientErrorObj?.patientPhoneError}</div>
               )}
            </div>
            <div className="w-75">
               <div className="info-field-title-div text-bold mb-2">Email</div>

               <input
                  type="text"
                  className={`${
                     state.patientErrorObj?.patientEmailError ? "border-danger" : "default-text-input"
                  } p-4 w-100`}
                  placeholder="abc@example.com"
                  value={state.patientEmail}
                  onChange={(e) => {
                     setState({
                        ...state,
                        patientEmail: e.target.value,
                     });
                  }}
               />
               {state.patientErrorObj?.patientEmailError && (
                  <div className="text-danger text-xsmall">{state.patientErrorObj?.patientEmailError}</div>
               )}
            </div>
         </div>

         {state.isLoading ? (
            <div className="w-100 flex-center mb-4">
               <img width="40px" height="40px" src="/assets/gif/newgifs/loader.gif" alt="" />
            </div>
         ) : (
            <div className="patient-info-edit-footer h-xsmall w-100 flex-center mb-5 text-small fw-bold ">
               <button
                  id={buttonId}
                  style={{ zIndex: 2 }}
                  className="w-xsmall h-100 bg-prime text-white round-border-s mx-3"
                  onClick={() => updatePatientInfo()}
               >
                  Update
               </button>
            </div>
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser.user,
      userCredentials: state.auth.userCredentials,
      patientList: state.patientlist,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         fetchPatients: fetchViewedPatient,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(PatientInfoEditView));
