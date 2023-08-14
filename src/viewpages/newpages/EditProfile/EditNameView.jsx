import React, { memo, useState, useEffect } from "react";
import { errorToDisplay, sepNameReg } from "../../../helper/CommonFuncs";
import texts from "../../../helper/texts";
import "firebase/auth";
import { submitNameInfo } from "./actions/editProfileActions";
import LoadingIndicator from "../../../common/LoadingIndicator";
import "./edit.css";
import { useMutation } from "@apollo/client";
import { UPDATE_NOTIFICATION_SETTINGS } from "../NotificationSettingsModule/actions/notificationSettingsAction";
import { ShowAlert } from "../../../common/alert";
import { getProviderData } from "../../../actions";
import { capitalizeFirstLetter } from "../teamModule/action/teamAction";

function EditNameView(props) {
   const { providerName, buttonId, onModalTapped } = props;

   const [updateUser] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(res) {
         onModalTapped();
         ShowAlert(res.updateProfile?.status?.message);
         getProviderData(null, true);
      },
      onError(error) {
         ShowAlert(errorToDisplay(error), "error");
         setIsLoading(false);
      },
   });

   const [state, setState] = useState({
      firstName: "",
      middleName: "",
      lastName: "",
      errors: {
         firstName: null,
         middleName: null,
         lastName: null,
      },
   });
   const [isLoading, setIsLoading] = useState(false);

   const toggleLoading = () => {
      setIsLoading(!isLoading);
   };

   useEffect(() => {
      if (!providerName || providerName === "") return;
      setState({
         ...state,
         firstName: providerName?.fullName?.firstName || "",
         middleName: providerName?.fullName?.middleName?.trim() || "",
         lastName: providerName?.fullName?.lastName || "",
      });
   }, []);

   const validateNames = () => {
      let isValid = true;
      if (sepNameReg.test(state.firstName) || state.firstName.length < 2) {
         state.errors.firstName = texts.invalidName;
         isValid = false;
      }
      if (sepNameReg.test(state.middleName) && state.middleName !== "") {
         state.errors.middleName = texts.invalidName;
         isValid = false;
      }
      if (sepNameReg.test(state.lastName) || state.lastName.length < 2) {
         state.errors.lastName = texts.invalidName;
         isValid = false;
      }
      setState({ ...state });
      return isValid;
   };
   return (
      <div className="flex-center flex-column bg-white w-xlarge1  round-border-m">
         <div className="flex-center w-75 pt-2 title-degree-text">
            <div className="text-grey5 text-medium text-bold">Change your name</div>
         </div>
         <div className="text-grey5 pointer close-btn-title" style={{ fontSize: "30px" }} onClick={onModalTapped}>
            &times;
         </div>
         <div className="w-75 my-3">
            <input
               type="text"
               className="w-100 title-input p-3"
               placeholder="First Name"
               value={state.firstName}
               onChange={(e) => {
                  let val = capitalizeFirstLetter(e.target.value);

                  setState({
                     ...state,
                     firstName: val,
                     errors: { firstName: "" },
                  });
               }}
            />
            {state.errors.firstName && <div className="text-danger text-xsmall">{state.errors.firstName}</div>}
         </div>
         <div className="w-75 my-3">
            <input
               type="text"
               className="w-100 title-input p-3"
               placeholder="Middle Name"
               value={state.middleName}
               onChange={(e) => {
                  let val = capitalizeFirstLetter(e.target.value);
                  setState({
                     ...state,
                     middleName: val,
                     errors: { middleName: "" },
                  });
               }}
            />
            {state.errors.middleName && <div className="text-danger text-xsmall">{state.errors.middleName}</div>}
         </div>
         <div className="w-75 my-3">
            <input
               type="text"
               className="w-100 title-input p-3"
               placeholder="Last Name"
               value={state.lastName}
               onChange={(e) => {
                  let val = capitalizeFirstLetter(e.target.value);
                  setState({
                     ...state,
                     lastName: val,
                     errors: { lastName: "" },
                  });
               }}
            />
            {state.errors.lastName && <div className="text-danger text-xsmall">{state.errors.lastName}</div>}
         </div>
         <div className="my-4">
            {isLoading ? (
               <LoadingIndicator rootClass={"loader-edit-module"} />
            ) : (
               <>
                  <button
                     className=" btn-default-capture bg-disabled text-black round-border-s mx-3 text-normal"
                     onClick={onModalTapped}
                  >
                     Cancel
                  </button>
                  <button
                     id={buttonId}
                     className=" btn-default-capture btn-default round-border-s mx-3 text-normal"
                     style={{ paddingTop: "0.9rem" }}
                     onClick={() => {
                        toggleLoading();
                        submitNameInfo(validateNames, state, updateUser);
                     }}
                  >
                     Save
                  </button>
               </>
            )}
         </div>
      </div>
   );
}

export default memo(EditNameView);
