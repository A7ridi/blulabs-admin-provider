import { gql } from "@apollo/client";
import { showSwal2 } from "../../../../common/alert";
import { store } from "../../../../redux/store";
import * as actions from "../../../../redux/actions/teamList.action";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

export const GET_TEAMLIST_DATA = gql`
   query Query($hospitalId: String, $departmentId: String, $search: String, $myTeam: Boolean) {
      getTeams(hospitalId: $hospitalId, departmentId: $departmentId, search: $search, myTeam: $myTeam) {
         name
         id
         clinicalType
      }
   }
`;

export const GET_SELECTED_TEAM = gql`
   query Query($myTeam: Boolean, $teamId: String) {
      getTeams(myTeam: $myTeam, teamId: $teamId) {
         name
         id
         description
         clinicalType
         members {
            id
            contactInformation {
               email
            }
            name {
               fullName
               firstName
               lastName
               middleName
               initials
            }
            providerInfo {
               degree
               title
               settings
               department
            }
            teamRole
            colorCode
            createdAt
         }
      }
   }
`;

export const CREATE_NEW_TEAM = gql`
   mutation Mutation($team: TeamInput, $addTeam: Boolean) {
      team(team: $team, addTeam: $addTeam) {
         team {
            id
            name
            description
            clinicalType
            members {
               id
               contactInformation {
                  email
               }
               name {
                  fullName
                  firstName
                  lastName
                  middleName
                  initials
               }
               providerInfo {
                  degree
                  title
                  settings
                  department
               }
               teamRole
               colorCode
               createdAt
            }
         }
         status {
            message
         }
      }
   }
`;

export const UPDATE_TEAM = gql`
   mutation Mutation($team: TeamInput, $updateTeam: Boolean) {
      team(team: $team, updateTeam: $updateTeam) {
         team {
            id
            name
            description
            clinicalType
            members {
               id
               contactInformation {
                  email
               }
               name {
                  fullName
                  firstName
                  lastName
                  middleName
                  initials
               }
               providerInfo {
                  degree
                  title
                  settings
                  department
               }
               colorCode
               createdAt
            }
         }
         status {
            message
         }
      }
   }
`;

export const DELETE_TEAM = gql`
   mutation Mutation($team: TeamInput, $removeTeam: Boolean) {
      team(team: $team, removeTeam: $removeTeam) {
         team {
            id
         }
         status {
            message
         }
      }
   }
`;

export const ADD_MEMBER_TO_TEAM = gql`
   mutation Mutation($team: TeamInput, $updateMember: Boolean) {
      team(team: $team, updateMember: $updateMember) {
         team {
            id
            name
            description
            clinicalType
            members {
               id
               contactInformation {
                  email
               }
               name {
                  fullName
                  firstName
                  lastName
                  middleName
                  initials
               }
               providerInfo {
                  degree
                  title
                  settings
                  department
               }
               teamRole
               colorCode
               createdAt
            }
         }
         status {
            message
         }
      }
   }
`;

export const REMOVE_MEMBER = gql`
   mutation Mutation($team: TeamInput, $removeMember: Boolean) {
      team(team: $team, removeMember: $removeMember) {
         team {
            id
            name
            description
            clinicalType
            members {
               id
               contactInformation {
                  email
               }
               name {
                  fullName
                  firstName
                  lastName
                  middleName
                  initials
               }
               providerInfo {
                  degree
                  title
                  settings
                  department
               }
               teamRole
               colorCode
               createdAt
            }
         }
         status {
            message
         }
      }
   }
`;

export const teamRoleOption = [
   {
      label: "Attending",
      value: "attending",
   },
   {
      label: "Member",
      value: "member",
   },
];

export const clinicalTypeOption = [
   {
      label: "Inpatients",
      value: "inPatients",
   },
   {
      label: "Outpatients",
      value: "outPatients",
   },
];

export const segmentOptions = [
   {
      text: "My Teams",
      id: 1,
      pendoId: pendoIds.tabMyClinicalTeams,
   },
   {
      text: "All Teams",
      id: 2,
      pendoId: pendoIds.tabAllClinicalTeams,
   },
];

export const SEARCH_TEAM = gql`
   query Query(
      $hospitalId: String
      $departmentId: String
      $search: String
      $myTeam: Boolean
      $teamWithMembers: Boolean
   ) {
      getTeams(
         hospitalId: $hospitalId
         departmentId: $departmentId
         search: $search
         myTeam: $myTeam
         teamWithMembers: $teamWithMembers
      ) {
         id
         name
         isMyTeam
         description
         clinicalType
         members {
            id
            contactInformation {
               email
            }
            name {
               fullName
               firstName
               lastName
               middleName
               initials
            }
            providerInfo {
               degree
               title
               settings
               department
            }
            teamRole
            colorCode
            createdAt
         }
      }
   }
`;

let reduxStore = store.getState();
const user = reduxStore?.auth?.userCredentials?.user;

export const showRemovePopup = (obj, removeTeamMember) => {
   const titleText = "Confirm";
   const contentText = `Are you sure you want to ${
      obj?.id === user?.id ? "leave" : "remove " + obj?.name?.fullName + " from"
   }  this team?`;
   showSwal2(titleText, contentText, () => removeTeamMember(), true);
};

export const showDeleteTeamPopup = (deleteClinicalTeam, teamName) => {
   const titleText = "Delete";
   const contentText = `Are you sure you want to delete ${teamName}?`;
   showSwal2(titleText, contentText, () => deleteClinicalTeam(), true);
};

export const showRoleChangePopup = (changeRole, e) => {
   const titleText = "Confirm";
   const contentText = `Are you sure you want to `;
   const boldText = "Change Attending";
   const contentText2 = ", as you may loss edit access to the team?";
   showSwal2(titleText, contentText, () => changeRole(e), true, boldText, contentText2);
};

export const capitalizeFirstLetter = (input) => {
   return (
      input
         .toLowerCase()
         .split(" ")
         .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
         .join(" ") || ""
   );
};

export const updateTeamDetails = (allTeamList, myTeamList, selectedTeamObj, selectedIndex, myTeams) => {
   const selectedAllTeamIndex = allTeamList?.findIndex((teamId) => teamId.id === selectedTeamObj?.id);
   const selectedMyTeamIndex = myTeamList?.findIndex((teamId) => teamId.id === selectedTeamObj?.id);
   if (selectedIndex === 0) {
      if (selectedMyTeamIndex !== -1) {
         myTeamList[selectedMyTeamIndex] = selectedTeamObj;
      }
   } else {
      if (selectedAllTeamIndex !== -1) {
         allTeamList[selectedAllTeamIndex] = selectedTeamObj;
      }
   }
   const teamList = myTeams ? myTeamList : allTeamList;
   const newTeamList = {
      list: teamList,
      loading: false,
   };
   store.dispatch(actions.setTeamsList(newTeamList, myTeams));
};

export const teamListUpdateOnAction = (userCredentials, selectedTeam, allTeamList, myTeamList, myTeams) => {
   let userId = userCredentials?.user?.id;
   const findAllTeam = allTeamList?.filter((team) => team.id !== selectedTeam?.id);
   const findMyTeam = myTeamList?.filter((team) => team.id !== selectedTeam?.id);
   let checkHasMyTeam = selectedTeam?.members?.filter((team) => team.id === userId);
   let checkMyTeamsList = checkHasMyTeam?.length === 0 ? [...findMyTeam] : [selectedTeam, ...findMyTeam];
   const teamList = myTeams ? checkMyTeamsList : [selectedTeam, ...findAllTeam];
   const newTeamList = {
      list: teamList,
      loading: false,
   };
   store.dispatch(actions.setTeamsList(newTeamList, myTeams));
};

export const checkProvider = (provider) => {
   const { departmentName, hospitalName, title } = provider;
   if (
      departmentName !== undefined &&
      departmentName !== null &&
      departmentName !== "" &&
      hospitalName !== undefined &&
      hospitalName !== null &&
      hospitalName !== "" &&
      title !== undefined &&
      title !== null &&
      title !== ""
   )
      return true;
   else return false;
};

export const checkUserRole = () => {
   const checkRole = user?.role?.includes("admin") || user?.role?.includes("superadmin");
   return checkRole;
};

export const checkMemberRole = (eachTeam) => {
   let role = eachTeam?.members?.some((member) => member.teamRole === "attending" && member.id === user.id);
   return role;
};

export const checkLoggedInUserRole = (member) => {
   let role = member.teamRole !== "attending" && member.id === user.id;
   return role;
};

export const checkAttendingMember = (selectedTeam) => {
   let role = selectedTeam.members.find((obj) => {
      if (obj.id === user.id) return obj.teamRole === "attending";
   });
   return role;
};
