import React, { memo, useState, useEffect } from "react";
import { errorToDisplay, isValidEmail, isValidMob } from "../../../helper/CommonFuncs";
import CheckboxToggle from "../CheckboxToggle/CheckboxToggle";
import ContactView from "../ContactView";
import "./PatientSendMessageView.css";
import { MentionsInput, Mention } from "react-mentions";
import "../../../MentionInput.css";

import "firebase/firestore";
import { connect } from "react-redux";
import AlertView from "../AlertView";
import texts from "../../../helper/texts";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import { useMutation } from "@apollo/client";
import { CREATE_CONTENT } from "../../../viewpages/newpages/profileModule/actions/profileQueries";
import { ShowAlert } from "../../../common/alert";
import LoadingIndicator from "../../../common/LoadingIndicator";

function PatientSendMessageView(props) {
   let patientInfoSendMessageObject = {};

   const [createContent] = useMutation(CREATE_CONTENT, {
      onCompleted(res) {
         if (!res.createContent?.signedUrl?.url) {
            props.onSuccess();
            props.closeSendMessageModalTapped();
            ShowAlert("Content shared successfully");
         }
      },
      onError(err) {
         setState({
            ...state,
            uploadingLoader: false,
         });

         ShowAlert(errorToDisplay(err), "error");
      },
   });

   if (props.patientSendMessageInfo.accessUser) {
      patientInfoSendMessageObject = props.patientSendMessageInfo.accessUser;
   } else {
      patientInfoSendMessageObject = props.patientSendMessageInfo;
   }
   const { name = "Patient", email = "", mobileNo = "", contactInformation = "" } = patientInfoSendMessageObject;
   const patientEmail = contactInformation.email;
   const patientMob = contactInformation.mobileNumber;
   const [state, setState] = useState({
      textareaMessage: "",
      textareaMessageError: "",
      isProviderOnly: false,
      originalDescriptions: "",
      title: "",
      hashTagsArray: [],
      mentionTagsArray: [],
      shortcutTagsArray: [],
      isLoading: false,
      hashTagsId: [],
      uploadingLoader: false,
   });

   const [selected, setSelected] = useState({
      hashTagsArray: [],
      mentionTagsArray: [],
      shortcutTagsArray: [],
   });

   const toggled = () => {
      setState({
         ...state,
         isProviderOnly: !state.isProviderOnly,
      });
   };

   const handleTextChange = (e, _, __, list) => {
      const hashTagsArray = list.filter((item) => item.display.startsWith("#"));
      const mentionTagsArray = list.filter((item) => item.display.startsWith("@"));
      const shortcutTagsArray = list.filter((item) => !item.display.startsWith("#") && !item.display.startsWith("@"));
      setSelected((prevState) => ({
         ...prevState,
         hashTagsArray,
         mentionTagsArray,
         shortcutTagsArray,
      }));

      setState({
         ...state,
         title: e.target.value,
         textareaMessageError: "",
      });
   };

   const selectTags = (e) => {
      setState({
         ...state,
         originalDescriptions: e.target.value,
      });
   };

   const getPatientData = () => ({
      patientId: patientInfoSendMessageObject?.id || null,
      patientName: name || null,
      patientNumber: mobileNo || null,
      patientEmail: email || null,
   });

   const analyticsContentParams = (object) => ({
      addedByName: object.addedByName || null,
      addedBy: object.addedBy || null,
      title: object.title || null,
      type: object.fileType || null,
      location: object.location || null,
      ...getPatientData(),
   });

   const sendMessageToPatient = () => {
      if (state.originalDescriptions.length > 0) {
         setState({
            ...state,
            uploadingLoader: true,
         });
         const title = state.originalDescriptions.replaceAll("\n", " \n");
         createContent({
            variables: {
               media: {
                  title: title,
                  description: "",

                  patient: {
                     userId: patientInfoSendMessageObject?.id,
                  },
                  type: "text",
                  isDoctorsOnly: state.isProviderOnly,
               },
            },
         });
      } else {
         setState({
            ...state,
            textareaMessageError: texts.textMessageRequired,
         });
      }
   };

   return (
      <AlertView
         message={true}
         buttons={[]}
         showLoader={false}
         onClose={props.closeSendMessageModalTapped}
         alertclass="h-4xl-md bg-white p-4 round-border-m"
         titleText={name?.fullName ? name?.fullName : name}
         contentView={() => (
            <div className="w-2xl my-5 patient-send-message-view">
               <div className={`email-phone-info flex-center  w-100`}>
                  <div className="d-flex justify-content-start w-75">
                     {patientEmail ? (
                        <ContactView
                           className={`flex-grow-1 mr-3`}
                           src="/assets/images/newimages/mail.svg"
                           title="Email"
                           value={isValidEmail(patientEmail) ? patientEmail : ""}
                        />
                     ) : null}
                     {patientMob ? (
                        <ContactView
                           className={`flex-grow-1`}
                           src="/assets/images/newimages/phone.svg"
                           title="Phone"
                           value={isValidMob(patientMob) ? patientMob : ""}
                        />
                     ) : null}
                  </div>
               </div>
               <div className="flex-center w-100">
                  <div className={`my-3 w-75  ${state.isLoading ? "loading-shade" : ""}`}>
                     <div className="p-2 default-border round-border-s mention-wrapper">
                        <MentionsInput
                           markup="{{__id__}}"
                           displayTransform={(id) => `<<${id}>>`}
                           className="mention-input"
                           placeholder="Type message here..."
                           singleLine={false}
                           allowSuggestionsAboveCursor={false}
                           onSelect={selectTags}
                           name="description"
                           value={state.title}
                           onChange={handleTextChange}
                        >
                           <Mention
                              trigger="#"
                              data={state.hashTagsArray}
                              appendSpaceOnAdd={true}
                              className="mention-input__mention"
                           />
                           <Mention
                              trigger="@"
                              data={state.mentionTagsArray}
                              appendSpaceOnAdd={true}
                              className="mention-input__mention"
                           />
                           <Mention
                              trigger={/(([A-Za-z0-9_.]+$))/}
                              data={(search) =>
                                 state.shortcutTagsArray.filter(
                                    (tag) =>
                                       tag.id.toLowerCase().includes(search) ||
                                       tag.display.toLowerCase().includes(search)
                                 )
                              }
                              appendSpaceOnAdd={true}
                           />
                        </MentionsInput>
                     </div>
                     {<span className="text-danger text-xsmall">{state.textareaMessageError}</span>}
                  </div>
               </div>
               <div className="flex-center w-100">
                  <div className="w-75 flex-center justify-content-between mt-4">
                     <div className="text-grey5 text-small text-bold-500 mb-4">Provider only</div>
                     <CheckboxToggle width="40px" height="21px" value={state.isProviderOnly} toggled={toggled} />
                  </div>
               </div>

               <div className="flex-center">
                  {state.uploadingLoader ? (
                     <LoadingIndicator rootClass="w-1xs" />
                  ) : (
                     <button
                        className="btn-default bg-prime text-white text-small w-xsmall h-xsmall round-border-s font-weight-bold"
                        onClick={() => sendMessageToPatient()}
                        id={pendoIds.btnSendPatientMessageModals}
                     >
                        {"send"}
                     </button>
                  )}
               </div>
            </div>
         )}
      />
   );
}

const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser.user,
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(PatientSendMessageView));
