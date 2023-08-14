import React, { useState } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import NotificationSettings from "../../NotificationSettingsModule/component/NotificationSettings";
import "./NotificationSettings.css";
import { useQuery, useMutation } from "@apollo/client";
import { GET_NOTIFICATION_SETTINGS, UPDATE_NOTIFICATION_SETTINGS } from "../actions/notificationSettingsAction";
import { ShowAlert } from "../../../../common/alert";

function NotificationSettingsCont(props) {
   const [notifStates, setNotifStates] = useState({
      // allowNotification: false,
      notifyByText: false,
      notifyByEmail: false,
      notifyByPush: false,
   });
   const { refetch: queryRefetch } = useQuery(GET_NOTIFICATION_SETTINGS, {
      fetchPolicy: "no-cache",
      onCompleted(result) {
         const notifications = result.getProfile?.notificationSettings;
         setNotifStates({
            // allowNotification: notifications.notification,
            ...notifStates,
            notifyByText: notifications?.sms || false,
            notifyByEmail: notifications?.email || false,
            notifyByPush: notifications?.push || false,
         });
      },
   });

   const [updateNotification] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(res) {
         if (res.updateProfile?.status?.code === 200) {
            let notifObj = res.updateProfile.user.notificationSettings;
            setNotifStates({
               ...notifStates,
               notifyByText: notifObj.sms || false,
               notifyByEmail: notifObj.email || false,
               notifyByPush: notifObj.push || false,
            });
            ShowAlert(res.updateProfile?.status?.message);
         }
      },
      onError(error) {
         console.log(error?.message);
         ShowAlert("Something went wrong!", "error");
      },
   });

   const toggled = (key) => {
      let allowNotifValue = !notifStates.allowNotification;
      if (key === "allowNotif") {
         updateNotification({
            variables: {
               user: {
                  notificationSettings: {
                     sms: allowNotifValue,
                     email: allowNotifValue,
                     push: allowNotifValue,
                  },
               },
            },
         });
         return setNotifStates({
            ...notifStates,
            // allowNotification: allowNotifValue,
            notifyByText: allowNotifValue,
            notifyByEmail: allowNotifValue,
            notifyByPush: allowNotifValue,
         });
      }
      if (key === "text") {
         updateNotification({
            variables: {
               user: {
                  notificationSettings: {
                     sms: !notifStates.notifyByText,
                     email: notifStates.notifyByEmail,
                     push: notifStates.notifyByPush,
                  },
               },
            },
         });
         return setNotifStates({
            ...notifStates,
            notifyByText: !notifStates.notifyByText,
         });
      }
      if (key === "email") {
         updateNotification({
            variables: {
               user: {
                  notificationSettings: {
                     sms: notifStates.notifyByText,
                     email: !notifStates.notifyByEmail,
                     push: notifStates.notifyByPush,
                  },
               },
            },
         });
         return setNotifStates({
            ...notifStates,
            notifyByEmail: !notifStates.notifyByEmail,
         });
      }
      if (key === "push") {
         updateNotification({
            variables: {
               user: {
                  notificationSettings: {
                     sms: notifStates.notifyByText,
                     email: notifStates.notifyByEmail,
                     push: !notifStates.notifyByPush,
                  },
               },
            },
         });
         return setNotifStates({
            ...notifStates,
            notifyByPush: !notifStates.notifyByPush,
         });
      }
   };

   return <NotificationSettings notification={notifStates} refetch={queryRefetch} toggled={toggled} {...props} />;
}
const mapStateToProps = (state) => {
   return {
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      userCredentials: state.auth.userCredentials,
   };
};

export default withRouter(connect(mapStateToProps, null)(NotificationSettingsCont));
