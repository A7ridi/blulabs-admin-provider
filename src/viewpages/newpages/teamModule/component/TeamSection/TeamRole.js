import { useMutation } from "@apollo/client";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { ShowAlert } from "../../../../../common/alert";
import { errorToDisplay } from "../../../../../helper/CommonFuncs";
import { setSelectedTeam } from "../../../../../redux/actions/teamList.action";
import CustomSelect from "../../../../../shared/components/customSelect/CustomSelect";
import { ADD_MEMBER_TO_TEAM, checkAttendingMember, showRoleChangePopup, teamRoleOption } from "../../action/teamAction";
import BtnDisableTooltip from "../BtnDisableTooltip";

const TeamRole = ({
   memberRole,
   role = false,
   memberPayload,
   teamsList,
   selectedIndex,
   checkRole,
   userCredentials,
   searchTeam,
   searchKey,
   setSelectedTeam,
}) => {
   const selectedTeam = teamsList.selectedTeam;
   let teamRole = { label: role === "attending" ? "Attending" : "Member", value: role } || null;
   const [selectedRole, setSelectedRole] = useState(teamRole);

   const user = userCredentials?.user || "";

   useEffect(() => {
      if (!role) return;
      setSelectedRole({ label: role === "attending" ? "Attending" : "Member", value: role } || null);
   }, [role]);

   const inputBox = {
      marginTopValue: "-3px",
      marginTopIcon: "-5px",
      height: "35px",
      borderRadius: "5px",
      hoverInput: "#007AFF",
   };

   const [updateMemberRole] = useMutation(ADD_MEMBER_TO_TEAM, {
      onCompleted(result) {
         const isMyTeam = teamsList.myTeams.list.some((team) => team.id === selectedTeam.id);
         const index = !isMyTeam ? 1 : selectedIndex;
         if (teamsList.hospitalId !== null) searchTeam(searchKey, index, teamsList);
         setSelectedTeam(result.team.team);
         ShowAlert(result?.team?.status?.message);
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
         setSelectedRole(teamRole);
      },
   });

   const updateRole = (data) => {
      const members = data?.members || [];
      const teamRole = data?.teamRole || "";
      let emails = members?.map((s) => {
         return s?.contactInformation?.email || s?.data?.contactInformation?.email;
      });
      let obj = {
         variables: {
            team: {
               id: selectedTeam?.id,
               members: emails?.map((email) => {
                  return {
                     contactInformation: {
                        email,
                     },
                     role: teamRole?.value,
                  };
               }),
            },
            updateMember: true,
         },
      };
      updateMemberRole(obj);
   };

   const changeRole = (e) => {
      setSelectedRole(e);
      updateRole({ members: [memberPayload], teamRole: e });
   };

   const isLoggedinUserAttending = checkAttendingMember(selectedTeam);

   return (
      <div
         style={{ width: `${memberRole ? "50%" : "100%"}`, cursor: `${!checkRole && "not-allowed"}` }}
         className="tooltipTeam"
      >
         <CustomSelect
            className="h-100"
            placeholder="Role"
            onChange={(e) => {
               if (selectedRole?.value === e?.value) return;
               else if (memberPayload?.id !== user?.id && role === "member" && isLoggedinUserAttending)
                  showRoleChangePopup(changeRole, e);
               else changeRole(e);
            }}
            components={{
               IndicatorSeparator: () => null,
            }}
            value={selectedRole}
            options={teamRoleOption}
            inputBox={inputBox}
            isDisabled={!checkRole}
         />
         <BtnDisableTooltip checkMemberRole={checkRole} />
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      teamsList: state.teamList,
      userCredentials: state.auth?.userCredentials,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setSelectedTeam: setSelectedTeam,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(TeamRole);
