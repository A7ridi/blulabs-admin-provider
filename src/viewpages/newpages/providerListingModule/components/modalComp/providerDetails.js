import React from "react";
import Avatar from "../../../../../components/newcomponents/avatar/Avatar";
import mobile from "../../../../../images/providerListing/mobile.svg";
import email from "../../../../../images/providerListing/email.svg";
import team from "../../../../../images/providerListing/teams.svg";
import { getHospital } from "../../containers/providerQueries";
import { callMobileNumber, isValidEmail, isValidMob, sendMail } from "../../../../../helper/CommonFuncs";
import { showSwal } from "../../../../../common/alert";

export default function ProviderDetails({ showModal }) {
   const name = showModal?.name?.fullName || "Healthcare Professional";
   const color = showModal?.colorCode || window.initialColors[0];
   const src = `${process.env.REACT_APP_PROFILE_URL}/${showModal?.id}` || null;
   const initials = showModal?.name?.initials || false;
   const hospital = getHospital(showModal?.hospitals);
   const mobileNumber = showModal?.contactInformation?.mobileNumber || "";
   const mail = showModal?.contactInformation?.email || "";
   const isValidMail = isValidEmail(mail);
   const isValidNum = isValidMob(mobileNumber);
   const department = showModal?.providerInfo?.department || "-";
   return (
      <div className="providers-details-container">
         <Avatar
            className="flex-shrink-0 avatar-header mr-3"
            radius={120}
            name={name}
            initialsApi={initials}
            bgColor={color}
            src={src}
         />
         <div className="provider-details-name ">{name}</div>
         <div className="provider-details-sub-head">{hospital}</div>
         <div className="provider-details-sub-head">{department}</div>
         <div className="image-mod-cont">
            {isValidNum && (
               <img
                  onClick={(e) => {
                     e.stopPropagation();
                     callMobileNumber(mobileNumber);
                  }}
                  src={mobile}
                  alt="mobile"
                  className="img-connect-modal"
               />
            )}
            {isValidMail && (
               <img
                  onClick={(e) => {
                     e.stopPropagation();
                     showSwal(
                        "Email",
                        "You are leaving Playback Health to send this email. Please follow your corporate guidelines for information which can be shared in emails.",
                        () => {
                           sendMail(mail);
                        },
                        false,
                        false
                     );
                  }}
                  src={email}
                  alt="email"
                  className="img-connect-modal"
               />
            )}
            {isValidMail && (
               <img
                  onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://teams.microsoft.com/l/chat/0/0?users=${mail}`, "_blank").focus();
                  }}
                  src={team}
                  alt="team"
                  className="img-connect-modal"
               />
            )}
         </div>
      </div>
   );
}
