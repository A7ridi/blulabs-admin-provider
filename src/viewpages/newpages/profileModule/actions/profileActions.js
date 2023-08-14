import { ShowAlert, showSwal } from "../../../../common/alert";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import React from "react";
import moment from "moment";
import { resendInvitePatient } from "../../../../Apimanager/Networking";
import { gql } from "@apollo/client";
import editIcon from "../../../../images/dashboard-action-icons/edit-grey-icon.svg";
import videoIcon from "../../../../images/dashboard-action-icons/video-grey-icon.svg";
import referIcon from "../../../../images/dashboard-action-icons/pbconnect-grey-icon.svg";
import mergeIcon from "../../../../images/dashboard-action-icons/merge-icon.svg";
import resend from "../../../../images/profileSection/resend.svg";
import copy from "../../../../images/profileSection/copy.svg";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";

export const startPatientVideoCall = (patientID, patientName, patientNumber = false) => {
   if (!patientNumber) {
      showSwal(
         "The patient does not have the latest version of Playback Health or a mobile number on file to support video calling."
      );
   } else {
      swal(
         <AlertView
            showClose={false}
            titleText="Confirm"
            confirmText="Confirm"
            cancelText="Cancel"
            contentText="Are you sure you want to make a telehealth call?"
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  localStorage.setItem("videoPatientID", patientID);
                  localStorage.setItem("patientNameVideo", patientName);

                  let popUp = window.open("/video-call");

                  let imagePath = "/assets/images/chrome.png";
                  if (popUp == null || typeof popUp == "undefined") {
                     let navigator = window.navigator;
                     let nAgt = navigator.userAgent;

                     if (nAgt.indexOf("Chrome") !== -1) {
                        imagePath = "/assets/images/Chrome.png";
                     }
                     // In Safari, the true version is after "Safari" or after "Version"
                     else if (nAgt.indexOf("Safari") !== -1) {
                        imagePath = "/assets/images/Safari.png";
                     }
                     // In Firefox, the true version is after "Firefox"
                     else if (nAgt.indexOf("Firefox") !== -1) {
                        imagePath = "/assets/images/Firefox.png";
                     }
                  } else {
                     popUp.focus();
                  }
               }
            }}
         />,
         { buttons: false }
      );
   }
};

export const copyPatientInfo = (obj) => {
   navigator.clipboard.writeText(copyDetails(obj));
   ShowAlert("Copied", "success");
};
const copyDetails = (obj) => {
   let text = "";
   if (obj.name) {
      text = text.concat(`Name: ${obj.name}\n`);
   }
   if (obj.dob) {
      text = text.concat(`DOB: ${moment(obj.dob).format("MM/DD/YYYY")}\n`);
   }

   if (obj.email) {
      text = text.concat(`Email: ${obj.email}\n`);
   }
   if (obj.mobileNo) {
      text = text.concat(`Mobile: ${obj.mobileNo}`);
   }
   return text;
};

export const getStatusAndNorthwellData = (pData, accessToken, callback) => {
   if (!pData) {
      callback();
      return;
   }
   let onboardingStatusParams = {
      Authorization: `Bearer ${accessToken}`,
      action: socketActions.referral,
      subAction: socketSubActions.onBoardingStatus,
      patientId: pData.id,
   };
   window.socket.send(onboardingStatusParams, (resultStatus) => {
      let states = {};
      states = {
         onboardingStatus: resultStatus.data?.status?.toLowerCase(),
      };
      // if (pData.healthSystemData?.Northwell) {
      //   window.socket.send(
      //     {
      //       action: socketActions.northwell,
      //       subAction: socketSubActions.getPatientLocationNorthwell,
      //       Authorization: `Bearer ${accessToken}`,
      //       mrn: pData.mrnData.mrn,
      //       IdentifierSource: pData.mrnData.authority,
      //     },
      //     (result) => {
      //       states = {
      //         ...states,
      //         roomDetails: result.data,
      //         loadingRoomData: false,
      //       };
      //       callback(states);
      //     }
      //   );
      // }
      // else
      callback(states);
   });
};

export const ADD_TO_CARETEAM = gql`
   mutation Mutation($careTeam: AddCareTeamInput!, $follow: Boolean, $queryType: String, $careMemberId: String) {
      addCareMember(careTeam: $careTeam, follow: $follow, queryType: $queryType, careMemberId: $careMemberId) {
         message
         response
      }
   }
`;

export const optionsMain = [
   {
      id: 0,
      text: "Video Call",
      leftImg: videoIcon,
      cls: "",
      pendoId: pendoIds.btnPatientProfileVideoCall,
   },
   // {
   //    id: 1,
   //    text: "Playback Connect",
   //    leftImg: referIcon,
   //    cls: "",
   //    pendoId: pendoIds.btnPatientProfilePlaybackConnect,
   // },
   {
      id: 2,
      text: "Edit",
      leftImg: editIcon,
      cls: "",
      pendoId: pendoIds.btnPatientProfileEditInfo,
   },
   {
      id: 3,
      text: "Copy",
      leftImg: copy,
      cls: "copy-drop",
      pendoId: pendoIds.btnPatientProfileCopyLink,
   },
];

export const getStatus = (patientStatus) => {
   const status = patientStatus?.toLowerCase() || "";
   return status === "active"
      ? "active-profile-batch"
      : status === "not invited"
      ? "pending-profile-batch"
      : status === "disable"
      ? "disable-profile-batch"
      : "invitaion-sent";
};
