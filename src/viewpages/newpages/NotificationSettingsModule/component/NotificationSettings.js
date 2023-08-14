import React from "react";
import CheckboxToggle from "../../../../components/newcomponents/CheckboxToggle/CheckboxToggle";

const NotificationSettings = ({ notification, refetch, toggled }) => {
   return (
      <div className="w-100 h-100 flex-center">
         <div className="notification-label" style={{ width: "50%" }}>
            <div className="text-large w-75 my-5 text-bold text-large2 notification-label">Notifications</div>
            <div>
               {/* <div className="flex-center justify-content-between my-5">
                  <div className="text-bold text-medium">Allow Notification</div>
                  <div className="flex-center">
                     <CheckboxToggle
                        width="40px"
                        height="21px"
                        value={notification.allowNotification}
                        toggled={() => toggled("allowNotif")}
                     />
                  </div>
               </div>
               <div className="separator w-100"></div> */}
            </div>
            <div className="flex-center justify-content-between my-5">
               <div className="text-bold text-medium">SMS</div>
               <div className="flex-center">
                  <CheckboxToggle
                     width="40px"
                     height="21px"
                     value={notification.notifyByText}
                     toggled={() => toggled("text")}
                  />
               </div>
            </div>
            <div className="separator w-100"></div>
            <div className="flex-center justify-content-between my-5">
               <div className="text-bold text-medium">Email</div>
               <div className="flex-center">
                  <CheckboxToggle
                     width="40px"
                     height="21px"
                     value={notification.notifyByEmail}
                     toggled={() => toggled("email")}
                  />
               </div>
            </div>
            <div className="separator w-100"></div>
            <div className="flex-center justify-content-between my-5">
               <div className="text-bold text-medium">Push Notification</div>
               <div className="flex-center">
                  <CheckboxToggle
                     width="40px"
                     height="21px"
                     value={notification.notifyByPush}
                     toggled={() => toggled("push")}
                  />
               </div>
            </div>
            <div className="separator w-100"></div>
         </div>
      </div>
   );
};

export default NotificationSettings;
