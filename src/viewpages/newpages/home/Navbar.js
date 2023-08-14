import React, { memo } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { setActivityNil } from "../../../actions";
import { logout } from "../../../Apimanager/Networking";
import { showSwal } from "../../../common/alert";
import Avatar from "../../../components/newcomponents/avatar/Avatar";
import BadgeView from "../../../components/newcomponents/BadgeView";
import DropdownToggle from "../../../components/newcomponents/DropdownToggle";
import PatientSearchField from "../../../components/newcomponents/PatientSearchField";
import ProfileDropDown from "../../../components/newcomponents/ProfileDropDown";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";

const Navbar = memo(
   ({
      className,
      notifCount,
      logoTapped,
      user,
      hospitals = [],
      proPic,
      proName,
      activePage,
      navigateTo,
      enterpriseDetails,
      loggedInProviderDetails,
      history,
      setNotification,
      ...props
   }) => {
      const name = user?.name || "";
      const enterPriseId = loggedInProviderDetails?.enterpriseInfo?.id || "";
      const altLogoText = loggedInProviderDetails?.enterpriseInfo?.name || "";
      const notificationCount = loggedInProviderDetails?.activityNotViewed || 0;

      const setNotifications = () => {
         setActivityNil(loggedInProviderDetails);
         setNotification();
      };
      const initials = loggedInProviderDetails?.fullName?.initials || false;
      const color = loggedInProviderDetails?.colorCode || window.initialColors[0];
      const id = loggedInProviderDetails?.id || "";

      return (
         <nav id="navbar" className={`flex-center justify-content-between p-2  ${className}`}>
            <div
               id={pendoIds.logoProviderDashboard}
               className="nav-logo-div h-100 pointer "
               onClick={() => history.push("/")}
            >
               {enterPriseId && (
                  <img
                     className="h-100"
                     src={`${process.env.REACT_APP_PROFILE_URL}/${enterPriseId}_logo?id=${Date.now()}`}
                     alt={altLogoText}
                     onError={(e) => {
                        e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                        e.target.alt = "";
                        let entpName = document.getElementById("entp-name");
                        entpName.style.opacity = "1";
                        entpName.style.position = "absolute";
                        entpName.style.top = "10px";
                        entpName.style.left = "20px";
                        entpName.style.fontSize = "22px";
                     }}
                  />
               )}
               <span id="entp-name" style={{ opacity: "0" }} className="text-black2">
                  {altLogoText}
               </span>
            </div>
            <div className="nav-view-div flex-center py-5">
               <PatientSearchField />
            </div>
            <div className="nav-options-div d-flex justify-content-end">
               <BadgeView
                  id={pendoIds.iconNotifications}
                  className="icon mx-2 pointer"
                  text={notificationCount}
                  onClick={() => setNotifications()}
               />
               <div id="iconProviderProfile" className="icon mx-3">
                  <DropdownToggle
                     id="userToggle"
                     className="h-100 options-view"
                     menuViewCls="no-border bg-transparent"
                     onOptTapped={(obj) => {}}
                     options={[{ text: "Profile" }, { text: "reset-password" }, { text: "Logout" }]}
                     dropDownView={() => (
                        <ProfileDropDown
                           user={user}
                           onActionTapped={(type) => {
                              if (type === 0) {
                                 history.push("/edit-profile");
                              } else if (type === 1) {
                                 history.push("/change-password");
                              } else if (type === 2) {
                                 showSwal(
                                    "Log Out",
                                    "Are you sure you want to Log Out",
                                    () => {
                                       logout();
                                    },
                                    false,
                                    false
                                 );
                              } else if (type === 3) {
                                 history.push("/notification-settings");
                              }
                           }}
                           pic={proPic}
                        />
                     )}
                  >
                     <Avatar
                        datatoggle="dropdown"
                        src={`${process.env.REACT_APP_PROFILE_URL}/${id}?ver=${Math.random()}`}
                        className="flex-shrink-0 flex-grow-1 pointer"
                        bgColor={color}
                        initialsApi={initials}
                        radius={32}
                        name={name}
                        isProvider={true}
                        // name={user.name}
                     />
                  </DropdownToggle>
               </div>
            </div>
         </nav>
      );
   }
);
const mapStateToProps = (state) => {
   return {
      loggedInProviderDetails: state.auth?.loggedInProviderDetails,
   };
};

export default withRouter(connect(mapStateToProps, null)(Navbar));
