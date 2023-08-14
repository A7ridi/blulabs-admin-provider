import React, { memo, useMemo, useState, useEffect } from "react";
import DropdownToggle from "../../../../components/newcomponents/DropdownToggle";
import {
   getFormattedDate,
   formatPhoneNumber,
   isValidEmail,
   isValidMob,
   ageForDob,
} from "../../../../helper/CommonFuncs";
import "../../profile/profileHeader/ProfileHeader.css";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";
import resend from "../../../../images/profileSection/resend.svg";
import mergeIcon from "../../../../images/dashboard-action-icons/merge-icon.svg";
import FollowCont from "../../profileModule/container/followModalCont";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { copyPatientInfo, startPatientVideoCall, optionsMain, getStatus } from "../actions/profileActions";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import PatientInfoEditView from "../../../../components/newcomponents/PatientInfoEditView/PatientInfoEditView";
import PatientReferralView from "../../../../components/newcomponents/PatientReferralView/PatientReferralView";

function ProfileComponent(props) {
   const { className, loading, patientData, patientId, refetch, updateAfterEdit, state, resendInvitation } = props;
   const [editPatient, setEditPatientData] = useState(null);
   const [showReferal, setShowReferal] = useState(false);

   const name = useMemo(() => {
      return patientData?.name?.fullName || "";
   }, [patientData]);

   const initials = useMemo(() => {
      return patientData?.name?.initials || false;
   }, [patientData]);

   const color = useMemo(() => {
      return patientData?.colorCode || window.initialColors[0];
   }, [patientData]);

   const src = useMemo(() => {
      return `${process.env.REACT_APP_PROFILE_URL}/${patientData?.id}?ver=${Math.random()}` || null;
   }, [patientData]);

   const dob = useMemo(() => {
      return patientData?.dob ? "(" + ageForDob(patientData?.dob) + ")" : "";
   }, [patientData]);

   const dobFormatted = useMemo(() => {
      return patientData?.dob ? getFormattedDate(patientData?.dob) : "--/--/----";
   }, [patientData]);

   const isValidNumber = useMemo(() => {
      return isValidMob(patientData?.contactInformation?.mobileNumber);
   }, [patientData]);

   const phoneNumber = useMemo(() => {
      return patientData?.contactInformation?.mobileNumber;
   }, [patientData]);

   const isValidMail = useMemo(() => {
      return isValidEmail(patientData?.contactInformation?.email);
   }, [patientData]);

   const isFollow = useMemo(() => {
      return patientData?.isFollow || false;
   }, [patientData]);

   const email = useMemo(() => {
      return patientData?.contactInformation?.email || "-";
   }, [patientData]);

   const patientStatus = useMemo(() => {
      return patientData?.status;
   }, [patientData]);

   const handleOptionClicked = (obj) => {
      const id = obj.id;
      if (id === 0) {
         startPatientVideoCall(patientData?.id, name, phoneNumber);
      } else if (id === 4) {
         resendInvitation(
            patientData?.id,
            patientData?.contactInformation?.email,
            patientData?.contactInformation?.mobileNumber
         );
      } else if (id === 3) {
         copyPatientInfo({
            name,
            dob: patientData?.dob,
            email,
            mobileNo: phoneNumber,
         });
      } else if (id === 2) {
         var updatedObj = {
            id: patientData.id,
            name: {
               fullName: patientData.name.fullName,
            },
            dateOfBirth: patientData.dob,
            dob: patientData.dob,
            contactInformation: {
               email: patientData.contactInformation.email,
               mobileNumber: patientData?.contactInformation?.mobileNumber || "",
            },
         };
         setEditPatientData(updatedObj);
      } else if (id === 1) {
         setShowReferal(true);
      }
   };

   const getDropOptions = () => {
      let dropOptions = optionsMain.map((s) => s);
      if (isValidNumber || isValidMail) {
         dropOptions.push({
            id: 4,
            text: "Resend Invite",
            leftImg: resend,
            cls: "",
            pendoId: pendoIds.btnPatientProfileResendInvite,
         });
      }
      if (process.env.NODE_ENV === "development") {
         dropOptions.push({
            id: 6,
            text: "Merge",
            leftImg: mergeIcon,
            cls: "",
            pendoId: pendoIds.btnPatientProfileMerge,

            // id: 5,
            // text: "Link to EMR",
            // leftImg: "/assets/images/newimages/emr-connect-icon.svg",
            // cls: "",
         });
      }
      return dropOptions;
   };

   const options = getDropOptions();

   return (
      <>
         <div className={` p-4  w-100  ${className} ${loading ? "loading-shade" : ""}`}>
            <div className="pl-5 row w-100 flex-center align-items-center justify-content-between">
               <div className="row flex align-items-center">
                  <div className="mt-2 pr-2">
                     <Avatar
                        profile
                        className="flex-shrink-0 avatar-header"
                        radius={32}
                        name={name}
                        initialsApi={initials}
                        bgColor={color}
                        src={src}
                        provider={true}
                     />
                  </div>
                  <div className="text-truncate patient-name">
                     {name}
                     {dob}
                  </div>

                  <div className={getStatus(patientStatus)}>{patientStatus}</div>
               </div>
               <div className="flex-center align-items-start responsive-second">
                  <FollowCont
                     isFollow={isFollow}
                     refetch={refetch}
                     state={state}
                     userId={patientId}
                     patientDetails={true}
                  />
                  <DropdownToggle
                     profile
                     className="options-views-profile"
                     menuViewCls="box-shadow-dropdown no-border round-border-m pointer"
                     id="profile-header-actions"
                     onOptTapped={handleOptionClicked}
                     options={options}
                  >
                     <img
                        id={pendoIds.btnPatientProfileActions}
                        className="ml-2 bg-light-grey-100 round-border-s pointer dots-image"
                        data-toggle="dropdown"
                        src="/assets/images/newimages/dots-h.svg"
                        alt="Profile Actions"
                     />
                  </DropdownToggle>
               </div>
            </div>
            <div className="second-row-profile">
               <div className="info-div-profile">
                  <div className="info-header-profile">
                     DOB:&nbsp;
                     <span className="info-content-profile">{dobFormatted}</span>
                  </div>
                  <div
                     className="info-header-profile"
                     onClick={() => {
                        if (isValidNumber) {
                           window.location.href = `tel:${phoneNumber}`;
                        }
                     }}
                  >
                     Mobile:&nbsp;
                     <span className={` info-content-profile ${isValidNumber && "pointer"}`}>
                        {isValidNumber ? formatPhoneNumber(phoneNumber) : "-"}
                     </span>
                  </div>
                  <div
                     onClick={() => {
                        if (isValidMail) {
                           window.location.href = `mailto:${email}`;
                        }
                     }}
                     className="info-header-profile"
                  >
                     Email:&nbsp;
                     <span className="info-content-profile pointer">{email}</span>
                  </div>
               </div>
            </div>
         </div>
         {editPatient !== null ? (
            <ModalPopup
               id={pendoIds.btnUpdatePatientInfoModal}
               onModalTapped={() => {
                  setEditPatientData(null);
               }}
            >
               <PatientInfoEditView
                  buttonId={pendoIds.btnUpdatePatientInfoModal}
                  patientInfo={editPatient}
                  closeModalTapped={() => {
                     setEditPatientData(null);
                     refetch();
                     updateAfterEdit();
                  }}
               />
            </ModalPopup>
         ) : null}

         {showReferal ? (
            <ModalPopup
               isReferralView={true}
               id={pendoIds.btnPlaybackConnectModal}
               onModalTapped={() => {
                  setShowReferal(false);
               }}
            >
               <PatientReferralView
                  buttonId={pendoIds.btnPlaybackConnectModal}
                  closePatientReferralViewModalTapped={() => {
                     setShowReferal(false);
                  }}
                  patientReferralInfo={patientData}
               />
            </ModalPopup>
         ) : null}
      </>
   );
}
export default memo(ProfileComponent);
