import React, { memo, useState } from "react";
import InputMask from "react-input-mask";
import { errorToDisplay, isValidMob } from "../../../helper/CommonFuncs";
import texts from "../../../helper/texts";
import { connect } from "react-redux";
import { UPDATE_NOTIFICATION_SETTINGS } from "../NotificationSettingsModule/actions/notificationSettingsAction";
import { useMutation } from "@apollo/client";
import { ShowAlert } from "../../../common/alert";
import CheckBox from "../../../shared/components/CheckBox";
import { getProviderData } from "../../../actions";

const Input = (props) => {
   let {
      phoneErrorValue = "",
      onfocus,
      onblur,
      fieldType = "text",
      classname = ` ${phoneErrorValue ? "border-danger" : "title-input"} p-3 w-100`,
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
                  placeholder="(000) 000-0000"
                  {...inputProps}
                  type={fieldType}
                  // beforeMaskedValueChange={props.beforeMaskedValueChange}
               />
            )}
         </InputMask>
      </>
   );
};

function EditMobileEmailView(props) {
   const { isEmailTrue, email, mobile, userSettings, close, buttonId } = props;

   const [updateUser] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(res) {
         if (res.updateProfile?.status?.code === 200) {
            close();
            ShowAlert(res.updateProfile?.status?.message);
            getProviderData(null, true);
         }
      },
      onError(error) {
         ShowAlert(errorToDisplay(error), "error");
      },
   });

   const [state, setState] = useState({
      phone: mobile,
      phoneError: "",
      providerCheckbox: isEmailTrue ? userSettings?.emailToProvider : userSettings?.cellToProvider,
      patientCheckbox: isEmailTrue ? userSettings?.emailToPatient : userSettings?.cellToPatient,
   });

   const validateInformation = () => {
      let isValid = true;
      let phoneError = "";
      if ((!isValidMob(state.phone) && state.phone.length > 0) || state.phone.length === 0) {
         phoneError = texts.invalidMob;
         isValid = false;
      }
      setState({ ...state, phoneError: phoneError });
      return isValid;
   };
   const updateEmailMobileInfo = (emailKey) => {
      var settings = {};
      if (isEmailTrue) {
         settings = {
            emailToProvider: state.providerCheckbox,
            emailToPatient: state.patientCheckbox,
            cellToProvider: userSettings?.cellToProvider || false,
            cellToPatient: userSettings?.cellToPatient || false,
         };
      } else {
         settings = {
            emailToProvider: userSettings?.emailToProvider || false,
            emailToPatient: userSettings?.emailToPatient || false,
            cellToProvider: state.providerCheckbox,
            cellToPatient: state.patientCheckbox,
         };
      }

      if (validateInformation()) {
         updateUser({
            variables: {
               user: {
                  providerInfo: {
                     settings,
                  },
                  ...(!isEmailTrue &&
                     mobile !== state.phone && {
                        contactInformation: {
                           mobileNumber: state.phone,
                        },
                     }),
               },
            },
         });
      }
   };
   return (
      <div className="flex-center flex-column bg-white w-xlarge1 round-border-m" style={{ height: "325px" }}>
         <div className="flex-center w-xlarge">
            <div className="text-grey5 text-medium text-bold mb-3">
               {isEmailTrue ? "Your email" : "Change your mobile number"}
            </div>
         </div>
         <div
            className="text-grey5 pointer close-btn-title"
            style={{ fontSize: "30px" }}
            onClick={() => close && close()}
         >
            &times;
         </div>
         <div className="w-xlarge mx-3 flex-center my-4">
            {isEmailTrue ? (
               <div className="w-100">
                  <input type="text" className="w-100 title-input p-3" value={email} disabled />
                  <img
                     alt="lock-icon"
                     width="18px"
                     height="18px"
                     src="/assets/images/newimages/lock-black-icon.svg"
                     style={{ position: "absolute", right: "10px", top: "10px" }}
                  />
               </div>
            ) : (
               <div className="w-100">
                  <Input
                     value={state.phone}
                     onChange={(e) => {
                        setState({
                           ...state,
                           phone: e.target.value.replace(/(\+\d{1})\s\((\d{3})\)\s(\d{3})\-(\d{4})/, "$1$2$3$4"),
                           phoneError: "",
                        });
                     }}
                  />
                  {state.phoneError && <div className="text-danger text-xsmall">{state.phoneError}</div>}
               </div>
            )}
         </div>
         <div className="w-xlarge flex-center justify-content-between my-4">
            <div className="text-medium text-grey5">{`Show ${isEmailTrue ? "email" : "mobile"} to providers `}</div>
            <CheckBox
               value={1}
               checked={state.providerCheckbox}
               id={1}
               className="change-mobile-email"
               onClick={() => setState({ ...state, providerCheckbox: !state.providerCheckbox })}
            />
         </div>
         <div className="w-xlarge flex-center justify-content-between my-4">
            <div className="text-medium text-grey5">{`Show ${isEmailTrue ? "email" : "mobile"} to patients`} </div>
            <CheckBox
               value={2}
               checked={state.patientCheckbox}
               id={2}
               className="change-mobile-email"
               onClick={() => setState({ ...state, patientCheckbox: !state.patientCheckbox })}
            />
         </div>
         <div className="my-4">
            <button
               className=" btn-default-capture bg-disabled text-black round-border-s mx-3 text-normal"
               onClick={() => close && close()}
            >
               Cancel
            </button>
            <button
               id={buttonId}
               className=" btn-default-capture  btn-default round-border-s mx-3 text-normal"
               style={{ paddingTop: "0.9rem" }}
               onClick={() => updateEmailMobileInfo()}
            >
               Save
            </button>
         </div>
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials.user,
      userObject: state.auth.northwelluser.user,
   };
};

export default connect(mapStateToProps)(memo(EditMobileEmailView));
