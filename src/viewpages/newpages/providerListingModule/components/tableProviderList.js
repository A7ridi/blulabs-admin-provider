import React from "react";
import captions from "../../../../I18n/en.json";
import mobile from "../../../../images/providerListing/mobileSmall.svg";
import email from "../../../../images/providerListing/emailSmall.svg";
import team from "../../../../images/providerListing/teamsSmall.svg";
import { getHospital } from "../containers/providerQueries";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";
import { callMobileNumber, isValidEmail, isValidMob, sendMail } from "../../../../helper/CommonFuncs";
import EmptyState from "../../../../common/emptyState";
import { showSwal } from "../../../../common/alert";
import CustomLoader from "../../../../shared/components/loaderList/customLoader";

const tableHeaderStyle = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   paddingLeft: 10,
};

const tableHeaderStyleEx = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   paddingTop: 10,
};

const TableProviderListing = ({ loading, setShowModal, providerList }) => {
   if (providerList.length === 0 && !loading) {
      return (
         <div className="center-slack-listing">
            <EmptyState text={"provider"} />
         </div>
      );
   }
   if (loading) return <CustomLoader />;
   return (
      <table className={`w-100 `}>
         <thead className="text-small">
            <tr>
               <th width="30%">
                  <div
                     className="pl-4"
                     style={{
                        ...tableHeaderStyle,
                        borderTopLeftRadius: "8px",
                        borderLeft: "1px solid #ced4da",
                     }}
                  >
                     {captions.providerListing.ProviderName}
                  </div>
               </th>
               <th width="20%">
                  <div style={tableHeaderStyleEx}> {captions.providerListing.Hospital}</div>
               </th>
               <th width="20%">
                  <div style={tableHeaderStyleEx}> {captions.providerListing.Department}</div>
               </th>
               <th>
                  <div
                     style={{
                        ...tableHeaderStyle,
                        borderRight: "1px solid #ced4da",
                        borderTopRightRadius: "8px",
                        // justifyContent: "center",
                     }}
                  >
                     {captions.providerListing.Connect}
                  </div>
               </th>
            </tr>
         </thead>
         <tbody>
            {providerList.map((obj, i) => {
               const name = obj?.name?.fullName || "Healthcare Professional";
               const color = obj?.colorCode || window.initialColors[0];
               const src = `${process.env.REACT_APP_PROFILE_URL}/${obj?.id}` || null;
               const initials = obj?.name?.initials || false;
               const hospital = getHospital(obj?.hospitals);
               const department = obj?.providerInfo?.department || "-";
               const mobileNumber = obj?.contactInformation?.mobileNumber || "";
               const mail = obj?.contactInformation?.email || "";
               const isValidMail = isValidEmail(mail);
               const isValidNum = isValidMob(mobileNumber);

               return (
                  <tr
                     key={i}
                     onClick={() => {
                        setShowModal(obj);
                     }}
                     className={`hover-default pointer  ${!loading && "table-border-provider-listing"}`}
                  >
                     <td className="p-0 pl-4 name-list py-4 ">
                        <div className="d-flex align-items-center py-2">
                           <Avatar
                              className="flex-shrink-0  mr-3"
                              radius={38}
                              name={name}
                              initialsApi={initials}
                              bgColor={color}
                              src={src}
                              qrcode={true}
                              provider={true}
                           />
                           <span className="text-capitalize">{name}</span>
                        </div>
                     </td>
                     <td className="p-0 sub-head-list">{hospital}</td>
                     <td className="p-0 sub-head-list truncate... ">{department}</td>
                     <td className="p-0 ">
                        {isValidNum && (
                           <img
                              onClick={(e) => {
                                 e.stopPropagation();
                                 callMobileNumber(mobileNumber);
                              }}
                              src={mobile}
                              alt="mobile"
                              className="img-connect"
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
                              className="img-connect"
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
                              className="img-connect"
                           />
                        )}
                     </td>
                  </tr>
               );
            })}
         </tbody>
      </table>
   );
};

export default TableProviderListing;
