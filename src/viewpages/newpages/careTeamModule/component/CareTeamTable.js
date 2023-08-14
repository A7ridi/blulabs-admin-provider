import React from "react";
import { getFormattedStampDate } from "../../../../helper/CommonFuncs";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import EmptyStateComp from "../../EmptyStateComp";
import CareTeam from "../../../../images/empty-states/no-careteam.svg";
import * as i18n from "../../../../I18n/en.json";

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

export const CareTeamTable = (props) => {
   const { posts, isLoading, removeTapped, showProviderDetails, setShowCareteam } = props;
   const noCareMembers = i18n?.emptyState?.noCareMembers;
   const noCareMembersDesc = i18n?.emptyState?.noCareMembersDesc;
   const addMembersBtn = i18n?.emptyState?.addMembersBtn;
   if (isLoading)
      return (
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
      );
   else if (posts?.length === 0)
      return (
         <EmptyStateComp
            careTeam
            src={CareTeam}
            headerText={noCareMembers}
            description={noCareMembersDesc}
            btnText={addMembersBtn}
            className="margin-viewd-screen"
            onClick={() => setShowCareteam(true)}
         />
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
                        {"Added on"}
                     </div>
                  </th>
                  <th>
                     <div
                        className=" table-head-custom"
                        style={{
                           ...tableHeaderStyle,
                           borderRight: "1px solid #ced4da",
                           borderTopRightRadius: "8px",
                        }}
                     >
                        {"Action"}
                     </div>
                  </th>
               </tr>
            </thead>
            <tbody>
               {posts?.map((obj, i) => {
                  const name = obj?.careMember?.name?.fullName || "Member";
                  const department = obj?.careMember?.providerInfo?.department || "";
                  const title = obj?.careMember?.providerInfo?.title || "";
                  const color = obj?.careMember?.colorCode || window.initialColors[i % window.initialColors.length];
                  return (
                     <tr key={obj?.id || i} className={`hover-default ${isLoading ? "loading-shade" : ""}`}>
                        <td
                           onClick={() => showProviderDetails && showProviderDetails(obj)}
                           className={`p-0 pl-4 ${department && title ? "pt-1 pb-1" : "pt-4 pb-4"}`}
                        >
                           <PatientDetailsView
                              imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${obj?.careMember?.id}?ver=${Math.random()}`}
                              imageRad={32}
                              className="pointer text-truncate"
                              userBg={color}
                              initialsApi={obj?.careMember?.name?.initials || false}
                              careTeam
                              name={name}
                              details={[{ title: title }, { title: department }]}
                           />
                        </td>

                        <td title={obj?.lastUpdate} className="pointer text-truncate ">
                           <div className="table-title-custom">{getFormattedStampDate(obj?.lastUpdate) || ""}</div>
                        </td>

                        <td className="p-4 ">
                           <div
                              id={pendoIds.btnRemoveCareTeam}
                              onClick={() => removeTapped(obj)}
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
