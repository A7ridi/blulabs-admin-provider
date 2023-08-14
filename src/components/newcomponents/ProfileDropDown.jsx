import React, { memo } from "react";
import { formatPhoneNumber } from "../../helper/CommonFuncs";
import Avatar from "./avatar/Avatar";
import * as firebase from "firebase/app";
import "firebase/auth";
import { connect } from "react-redux";
import { pendoIds } from "../../Constants/pendoComponentIds/pendoConstants";

const ImageTitleBtn = (props) => {
   const { title, src, clsName } = props;
   return (
      <div
         className={`w-100 flex-center justify-content-start hover-default text-normal pointer py-2 px-3 round-border-s ${clsName}`}
         {...props}
      >
         <img className="mr-4" src={src} alt="" />
         <div>{title}</div>
      </div>
   );
};

const CareTeamBox = (props) => {
   const { count, title, src, className } = props;
   return (
      <div className={`p-2 h-large text-small flex-center flex-column border-grey ${className}`}>
         <div>{count}</div>
         <div className="flex-center">
            <img className="mr-2" src={src} alt="" />
            {title}
         </div>
      </div>
   );
};

function ProfileDropDown(props) {
   const { onActionTapped, featureFlags, userCredentials, loggedInProviderDetails } = props;
   const name = userCredentials?.name || "";
   const initials = userCredentials?.initials || false;
   const color = loggedInProviderDetails?.colorCode || window.initialColors[0];
   const showNotificationsSettings = featureFlags?.graphqlNotification || false;
   const providerName = loggedInProviderDetails?.fullName?.fullName || "";

   return (
      <div
         style={{ boxShadow: "0px 10px 40px rgba(3, 100, 230, 0.08)" }}
         className="ProfileDropDown w-medium px-2 pb-1 mt-3 bg-white round-border-m mr-4"
      >
         <div className="flex-center justify-content-start separator p-4">
            <Avatar
               isProvider={true}
               src={`${process.env.REACT_APP_PROFILE_URL}/${userCredentials?.id}?ver=${Math.random()}`}
               className="flex-shrink-0 pointer mr-4"
               radius={48}
               bgColor={color}
               initialsApi={initials}
               name={name}
            />
            <div className="text-medium text-black font-weight-bold">{providerName}</div>
         </div>

         <div className="separator py-4">
            <ImageTitleBtn
               id={pendoIds.btnProviderSettings}
               src="/assets/images/newimages/profile-action-icons/settings.svg"
               title="Settings"
               onClick={() => onActionTapped && onActionTapped(0)}
            />
            {userCredentials?.email?.toLowerCase().includes("northwell") ? null : (
               <ImageTitleBtn
                  id={pendoIds.btnProviderChangePassword}
                  src="/assets/images/newimages/profile-action-icons/password-key.svg"
                  title="Change Password"
                  clsName="my-3"
                  onClick={() => onActionTapped && onActionTapped(1)}
               />
            )}
            {showNotificationsSettings && (
               <ImageTitleBtn
                  id={pendoIds.btnProviderNotificationSettings}
                  src="/assets/images/newimages/profile-action-icons/profile-notification-icon.svg"
                  title="Notifications"
                  onClick={() => onActionTapped && onActionTapped(3)}
               />
            )}
            {/* <ImageTitleBtn
          src="/assets/images/newimages/profile-action-icons/help.svg"
          // src="/assets/images/newimages/profile-action-icons/shortcuts-option-icon.svg"
          title="Help"
          // onClick={() => onActionTapped && onActionTapped(3)}
        /> */}
         </div>

         <ImageTitleBtn
            id={pendoIds.btnProviderLogout}
            src="/assets/images/newimages/profile-action-icons/logout.svg"
            title="Log Out"
            clsName="my-2"
            onClick={() => onActionTapped && onActionTapped(2)}
         />
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials?.user,
      featureFlags: state.launchdarkly.ldFeatureFlags,
      loggedInProviderDetails: state.auth?.loggedInProviderDetails,
   };
};

export default connect(mapStateToProps)(memo(ProfileDropDown));
