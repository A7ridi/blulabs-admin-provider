export const MY_TEAMS = "MY_TEAMS";
export const ALL_TEAMS = "ALL_TEAMS";
export const SELECTED_TEAM = "SELECTED_TEAM";
export const TEAM_NAME = "TEAM_NAME";
export const TEAM_DESCRIPTION = "TEAM_DESCRIPTION";
export const RESET_TEAM_LIST = "RESET_TEAM_LIST";
export const HOSPITAL_ID = "HOSPITAL_ID";
export const DEPARTMENT_ID = "DEPARTMENT_ID";

export const setMyTeamsList = (teamsObj) => {
   return {
      type: MY_TEAMS,
      payload: teamsObj,
   };
};

export const setAllTeamsList = (teamsObj) => {
   return {
      type: ALL_TEAMS,
      payload: teamsObj,
   };
};

export const setSelectedTeam = (teamsObj) => {
   return {
      type: SELECTED_TEAM,
      payload: teamsObj,
   };
};

export const setTeamName = (teamsObj) => {
   return {
      type: TEAM_NAME,
      payload: teamsObj,
   };
};

export const setTeamDescription = (teamsObj) => {
   return {
      type: TEAM_DESCRIPTION,
      payload: teamsObj,
   };
};

export const resetTeamList = () => {
   return {
      type: RESET_TEAM_LIST,
   };
};

export const setHospitalId = (teamsObj) => {
   return {
      type: HOSPITAL_ID,
      payload: teamsObj,
   };
};

export const setDepartmentId = (teamsObj) => {
   return {
      type: DEPARTMENT_ID,
      payload: teamsObj,
   };
};

export const setTeamsList = (teamsObj, isMyTeams = false) => {
   return (dispatch) => {
      if (isMyTeams) {
         dispatch(setMyTeamsList(teamsObj));
      } else {
         dispatch(setAllTeamsList(teamsObj));
      }
   };
};
