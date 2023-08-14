import React from "react";
import captions from "../../../../../I18n/en.json";
import Avatar from "../../../../../components/newcomponents/avatar/Avatar";
import { ageForDob, calculateDateLabel, getFormattedDate } from "../../../../../helper/CommonFuncs";
import EmptyState from "../../../../../common/emptyState";
import { withRouter } from "react-router-dom";
import CustomLoader from "../../../../../shared/components/loaderList/customLoader";

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

const TableProviderListing = ({ loading, providerList, history }) => {
   if (providerList.length === 0 && !loading) {
      return <EmptyState text={"patient"} />;
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
                     {captions.providerListing.PatientName}
                  </div>
               </th>
               <th width="25%">
                  <div style={tableHeaderStyleEx}> {captions.providerListing.dateOfBirth}</div>
               </th>
               <th width="16%">
                  <div style={tableHeaderStyleEx}> {captions.providerListing.age}</div>
               </th>
               <th>
                  <div
                     style={{
                        ...tableHeaderStyle,
                        borderRight: "1px solid #ced4da",
                        borderTopRightRadius: "8px",
                     }}
                  >
                     {captions.providerListing.Added_On}
                  </div>
               </th>
            </tr>
         </thead>
         <tbody>
            {providerList.map((obj, i) => {
               const name = obj?.name?.fullName || "Patient";
               const color = obj?.colorCode || window.initialColors[0];
               const src = `${process.env.REACT_APP_PROFILE_URL}/${obj?.id}` || null;
               const initials = obj?.name?.initials || false;
               const dob = obj?.dob || "-";
               return (
                  <tr
                     key={i}
                     onClick={() => {
                        history.push(`/patient/${obj.id}`);
                     }}
                     className={`hover-default pointer  ${!loading && "table-border-provider-listing"}`}
                  >
                     <td className="p-4 pl-4 name-list ">
                        <div className="d-flex align-items-center">
                           <Avatar
                              profile
                              className="flex-shrink-0 avatar-header mr-3"
                              radius={32}
                              name={name}
                              initialsApi={initials}
                              bgColor={color}
                              src={src}
                              provider={true}
                           />
                           <span className="text-capitalize">{name}</span>
                        </div>
                     </td>
                     <td className="p-0 sub-head-list"> {getFormattedDate(dob)}</td>
                     <td className="p-0 sub-head-list">{ageForDob(dob)}</td>
                     <td className="p-0 sub-head-list py-2 ">{calculateDateLabel(obj.createdAt)}</td>
                  </tr>
               );
            })}
         </tbody>
      </table>
   );
};

export default withRouter(TableProviderListing);
