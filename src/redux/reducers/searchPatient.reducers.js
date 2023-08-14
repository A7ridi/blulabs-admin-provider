import * as types from "../actions/searchPatient.action";

const INITIAL_STATE = {
   searchPatients: {
      list: [],
      loading: true,
      limit: 10,
      offset: 0,
      totalCount: 0,
      hasMore: false,
   },
   searchQuery: "",
   dob: null,
   name: "",
   mrn: "",
   hospitalId: null,
   enterpriseId: "",
   userType: "patient",
   playbackSearchFlag: true,
   checkForRefresh: true,
};

export default function searchpatientlist(state = INITIAL_STATE, action) {
   switch (action.type) {
      case types.SEARCH_PATIENT_LIST:
         return {
            ...state,
            searchPatients: action.payload,
         };
      case types.SEARCH_QUERY:
         return {
            ...state,
            searchQuery: action.payload,
         };
      case types.SEARCH_NAME:
         return {
            ...state,
            name: action.payload,
         };
      case types.SEARCH_DATE_OF_BIRTH:
         return {
            ...state,
            dob: action.payload,
         };
      case types.SEARCH_MRN:
         return {
            ...state,
            mrn: action.payload,
         };
      case types.SEARCH_HOSPITAL_ID:
         return {
            ...state,
            hospitalId: action.payload,
         };
      case types.SEARCH_ENTERPRISE_ID:
         return {
            ...state,
            enterpriseId: action.payload,
         };
      case types.PLAYBACK_SEARCH_FLAG:
         return {
            ...state,
            playbackSearchFlag: action.payload,
         };
      case types.CHECK_FOR_REFRESH:
         return {
            ...state,
            checkForRefresh: false,
         };
      case types.CLEAR_SEARCH_FIELDS:
         return {
            ...state,
            searchQuery: "",
            dob: null,
            name: "",
            mrn: "",
            hospitalId: null,
            enterpriseId: "",
            playbackSearchFlag: true,
         };
      case types.SET_INITIAL_STATE:
         return {
            ...state,
            searchPatients: {
               list: [],
               loading: false,
               limit: 10,
               offset: 0,
               totalCount: 0,
               hasMore: false,
            },
         };
      default:
         return state;
   }
}
