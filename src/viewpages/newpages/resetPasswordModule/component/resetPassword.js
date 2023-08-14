import React from "react";
import { showSwal } from "../../../../common/alert";
import EachRow from "./singleRow";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

function ResetPassword(props) {
   const { updatePassword, isLoading, setIsLoading, userCredentials } = props;
   const [currentPassword, setCurrentPassword] = React.useState("");
   const [newPassword, setNewPassword] = React.useState("");
   const [confirmPassword, setConfirmPassword] = React.useState("");

   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <div style={{ width: "100%" }}>
               <div className="change-password-label">Change Password</div>
               <EachRow
                  text={"Current Password"}
                  placeholder={"Current password"}
                  value={currentPassword}
                  setValue={setCurrentPassword}
               />
               <EachRow
                  text={"New Password"}
                  placeholder={"New password"}
                  value={newPassword}
                  setValue={setNewPassword}
               />
               <EachRow
                  text={"Confirm Password"}
                  placeholder={"Confirm password"}
                  value={confirmPassword}
                  setValue={setConfirmPassword}
               />
               <div className="button-container">
                  <button
                     id={pendoIds.btnResetProviderPassword}
                     className="btn-reset"
                     onClick={() => {
                        if (currentPassword === "" || newPassword === "" || confirmPassword === "") {
                           let param =
                              currentPassword === ""
                                 ? "Current Password"
                                 : newPassword === ""
                                 ? "New password"
                                 : confirmPassword === "" && "Confirm Password";
                           showSwal(param + " cannot be empty");
                        } else if (newPassword !== confirmPassword) {
                           showSwal("Confirm password does not match new password");
                        } else {
                           setIsLoading(true);
                           updatePassword({
                              variables: {
                                 newProviderPassword: {
                                    id: userCredentials?.user?.id,
                                    password: newPassword,
                                    currentPassword: currentPassword,
                                 },
                              },
                           });
                        }
                     }}
                  >
                     Continue
                  </button>
               </div>
            </div>
         )}
      </>
   );
}
export default ResetPassword;
