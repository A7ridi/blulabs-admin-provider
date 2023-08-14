import React from "react";
import { Freshchat } from "reactjs-freshchat";

function FreshChatComp(props) {
   const { userCredentials, color, step } = props;

   if (window.fcWidget) {
      window.fcWidget.user.update({
         firstName: userCredentials?.user?.name || "anonymous",
      });
   }

   if (userCredentials) {
      window.fcWidget &&
         window.fcWidget.user.update({
            firstName: userCredentials?.user?.name,
            externalId: userCredentials?.user?.userId,
            restoreId: userCredentials?.user?.userId,
            email: userCredentials?.user?.email,
         });
   }

   return (
      <div id="fresh">
         <Freshchat
            token={"be80a81c-98f0-47a3-8962-d7bd692bc2d7"}
            firstName={userCredentials?.user?.name || "anonymous"}
            externalId={userCredentials?.user?.userId || "anonymous"}
            restoreId={userCredentials?.user?.userId || "anonymous"}
            email={userCredentials?.user?.email}
            config={{
               headerProperty: {
                  backgroundColor: color,
                  foregroundColor: "#ffffff",
               },
            }}
         />
      </div>
   );
}

export default FreshChatComp;
