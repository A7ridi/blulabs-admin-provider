import React, { memo } from "react";
import * as Analytics from "../../../helper/AWSPinPoint";
import { connect } from "react-redux";

function ReferralDetailsView(props) {
   const { referralDetails } = props;
   let patientName = referralDetails?.patientName ? referralDetails?.patientName : "Patient";

   let referredViewedAnalyticsDetails = {
      referredEnterprise: referralDetails.toHealthSystem,
      title: `${referralDetails?.addedbyName} has referred ${patientName} to ${referralDetails?.toHealthSystem}`,
   };
   Analytics.record(
      referredViewedAnalyticsDetails,
      props.userCredentials?.user?.id,
      Analytics.EventType.referredViewed
   );

   let physicianArray = referralDetails.providers?.map((provider) => {
      return provider.firstname + " " + provider.lastname;
   });

   let finalPhysicianString = "";

   if (physicianArray?.length === 1) {
      finalPhysicianString = physicianArray?.join(", ");
   } else if (physicianArray?.length === 2) {
      finalPhysicianString = physicianArray[0] + ` and +1 other physician`;
   } else if (physicianArray?.length > 2) {
      finalPhysicianString = physicianArray?.[0] + ` and +${[physicianArray?.length - 1]} other physicians`;
   }
   return (
      <div className="referral-details-view flex-center referral-details-view bg-white round-border-l w-large flex-column p-4">
         <div className="referral-details-title text-black2 text-large text-extra-bold">
            {`${referralDetails?.addedbyName} has referred ${patientName} to ${referralDetails?.toHealthSystem}`}
         </div>
         <div className="w-100 referral-provider-list text-bold text-black2 text-medium mt-4">
            {finalPhysicianString}
         </div>
         {referralDetails?.messageContent && (
            <div className="referral-message-div w-100">
               <div className="message-heading text-extra-bold text-normal text-black2 mt-4">Note</div>
               <div className="message-description text-black2 text-small text-fit">
                  {referralDetails.messageContent}
               </div>
            </div>
         )}
         {referralDetails?.video && (
            <div className="referral-video-div w-100">
               <div className="message-heading text-extra-bold text-normal text-black2 mt-4">Video Message</div>
               <div className="message-description">
                  <video
                     src={referralDetails?.video}
                     style={{ height: "160px", width: "100%" }}
                     controls
                     disablePictureInPicture
                     controlsList="nodownload"
                  />
               </div>
            </div>
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(ReferralDetailsView));
