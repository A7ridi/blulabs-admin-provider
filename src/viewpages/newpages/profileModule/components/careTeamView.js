import React from "react";
import {
   getFormattedStampDate,
   checkEmpty,
   getDateStringFormat,
   formatPhoneNumber,
} from "../../../../helper/CommonFuncs";

import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

export const tableHeaderStyle = {
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

export const tableHeaderStyleEx = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   paddingTop: 10,
};

export const TableView = (props) => {
   const { posts, isLoading, removeTapped, care, teamSection, showProviderDetails } = props;
   if (isLoading)
      return (
         <>
            {teamSection ? (
               ""
            ) : (
               <table className={`w-100 bg-white h-100`}>
                  <tbody>
                     {Array(10)
                        .fill()
                        .map((o, index) => (
                           <tr key={index} className="loading-shade">
                              <td>
                                 <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            )}
         </>
      );
   else if (posts.length === 0)
      return (
         <div className="flex-center w-100 h-100 text-bold text-large text-grey5 no-content-available">
            {care ? "No Care team." : "No Family/Friends"}
         </div>
      );
   else
      return (
         <table className="w-100" style={{ maxWidth: "98.1%", marginLeft: "11px" }}>
            <thead className="text-small">
               <tr>
                  <th>
                     <div
                        className="pl-4 table-head-custom"
                        style={{
                           ...tableHeaderStyle,
                           borderTopLeftRadius: "8px",
                           borderLeft: "1px solid #ced4da",
                        }}
                     >
                        Name
                     </div>
                  </th>
                  <th>
                     <div className="table-head-custom" style={tableHeaderStyleEx}>
                        {care ? "Added on" : "Contact info"}
                     </div>
                  </th>

                  {!care && (
                     <th>
                        <div className=" table-head-custom" style={tableHeaderStyleEx}>
                           {"Relationship"}
                        </div>
                     </th>
                  )}
                  <th>
                     <div
                        className=" table-head-custom"
                        style={{
                           ...tableHeaderStyle,
                           borderRight: "1px solid #ced4da",
                           borderTopRightRadius: "8px",
                        }}
                     >
                        {" Action"}
                     </div>
                  </th>
               </tr>
            </thead>
            <tbody>
               {posts.map((obj, i) => {
                  const name = obj?.name || obj?.email || "Member";
                  const deparment = obj?.department || "";
                  const title = obj?.title || "";
                  const color = obj?.colorCode || window.initialColors[i % window.initialColors.length];
                  return (
                     <tr key={obj?.id || i} className={`hover-default ${isLoading ? " loading-shade" : ""}`}>
                        <td
                           onClick={() => {
                              if (care) {
                                 showProviderDetails && showProviderDetails(obj);
                              }
                           }}
                           className="p-0 pl-4"
                        >
                           <PatientDetailsView
                              imageRad={32}
                              className="pointer text-truncate"
                              userBg={color}
                              initialsApi={obj?.initials || false}
                              careTeam
                              name={name}
                              details={[{ title: title }, { title: deparment }]}
                           />
                        </td>
                        {/* {!care && (
                  <td title={formatPhoneNumber("+16503234147")} className="pointer text-truncate">
                    <div>{formatPhoneNumber("+16503234147")}</div>
                  </td>
                )} */}

                        <td title={obj?.lastUpdate} className="pointer text-truncate ">
                           <div className="table-title-custom">
                              {!care && obj.mobileNo && (
                                 <div className="mobile-no-family">{formatPhoneNumber(obj.mobileNo)}</div>
                              )}
                              {care ? getFormattedStampDate(obj?.lastUpdate) : obj?.email ? checkEmpty(obj.email) : ""}
                           </div>
                        </td>
                        {!care && (
                           <td className="p-4">
                              {" "}
                              <div className="care-relationship table-title-custom">{checkEmpty(obj.relationship)}</div>
                           </td>
                        )}
                        <td className="p-4 ">
                           <div
                              id={care ? pendoIds.btnRemoveCareTeam : pendoIds.btnRemoveFamilyFriend}
                              onClick={() => {
                                 removeTapped(obj);
                              }}
                              className="removeButton pointer"
                           >
                              Remove
                           </div>
                        </td>
                     </tr>
                  );
               })}
            </tbody>
         </table>
      );
};
