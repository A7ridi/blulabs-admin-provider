import {
   ALL_TEAMS,
   DEPARTMENT_ID,
   HOSPITAL_ID,
   MY_TEAMS,
   RESET_TEAM_LIST,
   SELECTED_TEAM,
   TEAM_DESCRIPTION,
   TEAM_NAME,
   TEAM_ROLE,
} from "../actions/teamList.action";

const INITIAL_STATE = {
   myTeams: {
      list: [],
      loading: true,
      limit: 1,
      offset: 0,
   },
   allTeams: {
      list: [],
      loading: true,
      limit: 1,
      offset: 0,
   },
   selectedTeam: null,
   teamName: "",
   teamDescription: "",
   hospitalId: null,
   departmentId: null,
};

export default function teamList(state = INITIAL_STATE, action) {
   switch (action.type) {
      case MY_TEAMS:
         return {
            ...state,
            myTeams: action.payload,
            teamName: "",
            teamDescription: "",
         };
      case ALL_TEAMS:
         return {
            ...state,
            allTeams: action.payload,
            teamName: "",
            teamDescription: "",
         };
      case SELECTED_TEAM:
         return {
            ...state,
            selectedTeam: action.payload,
            teamName: "",
            teamDescription: "",
         };
      case TEAM_NAME:
         return {
            ...state,
            teamName: action.payload,
         };
      case TEAM_DESCRIPTION:
         return {
            ...state,
            teamDescription: action.payload,
         };
      case HOSPITAL_ID:
         return {
            ...state,
            hospitalId: action.payload,
         };
      case DEPARTMENT_ID:
         return {
            ...state,
            departmentId: action.payload,
         };
      case RESET_TEAM_LIST:
         return {
            ...INITIAL_STATE,
         };
      default:
         return state;
   }
}
