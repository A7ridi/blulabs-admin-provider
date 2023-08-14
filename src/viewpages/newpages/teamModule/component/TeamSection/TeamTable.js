import React from "react";
import TeamDetailsView from "../TeamDetailsView";
import { getFormattedStampDate } from "../../../../../helper/CommonFuncs";
import { pendoIds } from "../../../../../Constants/pendoComponentIds/pendoConstants";
import { checkLoggedInUserRole, checkMemberRole, checkUserRole, showRemovePopup } from "../../action/teamAction";
import { connect } from "react-redux";
import { checkProviderName } from "../../../EditProfile/actions/editProfileActions";
import TeamRole from "./TeamRole";
import BtnDisableTooltip from "../BtnDisableTooltip";

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

const TeamTable = (props) => {
   const { eachTeam, loading, removeTeamMember, selectedTeam, selectedIndex, searchTeam, searchKey } = props;
   const showRemoveModal = (data) => {
      let obj = {
         variables: {
            team: {
               id: selectedTeam?.id,
               members: [
                  {
                     contactInformation: {
                        email: data?.contactInformation?.email,
                     },
                  },
               ],
            },
            removeMember: true,
         },
      };
      showRemovePopup(data, () => removeTeamMember(obj));
   };

   return (
      <table className={`w-100 ${loading ? "loading-shade table" : ""}`}>
         <thead className="text-small">
            <tr>
               <th style={{ width: "35%" }}>
                  <div
                     className="pl-4"
                     style={{
                        ...tableHeaderStyle,
                        borderTopLeftRadius: "8px",
                        borderLeft: "1px solid #ced4da",
                     }}
                  >
                     Name
                  </div>
               </th>
               <th style={{ width: "25%" }}>
                  <div style={tableHeaderStyleEx}>Added on</div>
               </th>
               <th style={{ width: "27%" }}>
                  <div style={tableHeaderStyleEx}>Role</div>
               </th>
               <th style={{ width: "13%" }}>
                  <div
                     style={{
                        ...tableHeaderStyle,
                        borderRight: "1px solid #ced4da",
                        borderTopRightRadius: "8px",
                     }}
                  >
                     Action
                  </div>
               </th>
            </tr>
         </thead>
         <tbody>
            {eachTeam?.members?.map((obj, i) => {
               const role = obj?.teamRole || null;
               const department = obj?.providerInfo?.department || "";
               const name = obj?.name?.fullName || "Member";
               const checkRole = checkUserRole() || checkMemberRole(eachTeam);
               const checkTeamRole = (checkRole && role !== "attending") || checkLoggedInUserRole(obj);

               return (
                  <tr key={i} className={`hover-default`} style={{ borderBottom: "none" }}>
                     <td className="p-0">
                        <TeamDetailsView
                           teamTable
                           imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${obj?.id}`}
                           imageRad={32}
                           className="pointer text-truncate"
                           textClass="text-class"
                           initialsApi={obj?.name?.initials || false}
                           userBg={obj?.colorCode || window.initialColors[i % window.initialColors.length]}
                           name={name}
                           details={[{ title: department }]}
                        />
                     </td>
                     <td className="p-0">{getFormattedStampDate(obj?.createdAt)}</td>
                     <td className="p-0">
                        <TeamRole
                           memberRole
                           role={role}
                           memberPayload={obj}
                           selectedIndex={selectedIndex}
                           checkRole={checkRole}
                           searchTeam={searchTeam}
                           searchKey={searchKey}
                        />
                     </td>
                     <td className="p-4 ">
                        <div
                           id={pendoIds.btnRemoveClinicalTeamMember}
                           onClick={() => {
                              if (checkTeamRole) showRemoveModal(obj);
                           }}
                           className={`removeButton ${
                              checkTeamRole ? "pointer" : "cursor-events disabled tooltipTeam"
                           } `}
                        >
                           Remove
                           <BtnDisableTooltip checkMemberRole={checkTeamRole} />
                        </div>
                     </td>
                  </tr>
               );
            })}
         </tbody>
      </table>
   );
};

const mapStateToProps = (state) => {
   return {
      selectedTeam: state.teamList?.selectedTeam,
   };
};

export default connect(mapStateToProps, null)(TeamTable);
