import { store } from "../store";
// import { fetchQuery } from "../../actions/index";
import moment from "moment";

export const SEARCH_PATIENT_LIST = "SEARCH_PATIENT_LIST";
export const SEARCH_QUERY = "SEARCH_QUERY";
export const SEARCH_NAME = "SEARCH_NAME";
export const SEARCH_DATE_OF_BIRTH = "SEARCH_DATE_OF_BIRTH";
export const SEARCH_MRN = "SEARCH_MRN";
export const SEARCH_HOSPITAL_ID = "SEARCH_HOSPITAL_ID";
export const SEARCH_ENTERPRISE_ID = "SEARCH_ENTERPRISE_ID";
export const SEARCH_USER_TYPE = "SEARCH_USER_TYPE";
export const PLAYBACK_SEARCH_FLAG = "PLAYBACK_SEARCH_FLAG";
export const CLEAR_SEARCH_FIELDS = "CLEAR_SEARCH_FIELDS";
export const CHECK_FOR_REFRESH = "CHECK_FOR_REFRESH";
export const SET_INITIAL_STATE = "SET_INITIAL_STATE";

export const getPrevFilters = () => JSON.parse(localStorage.getItem("searchArr")) || [];
export const firstLastNameRegex = /(\w{2,}\s\w{2,})/;

export const setSearchPatientList = (object) => {
   return {
      type: SEARCH_PATIENT_LIST,
      payload: object,
   };
};
export const setSearchQuery = (object) => {
   return {
      type: SEARCH_QUERY,
      payload: object,
   };
};
export const setSearchName = (object) => {
   return {
      type: SEARCH_NAME,
      payload: object,
   };
};
export const setSearchDOB = (object) => {
   return {
      type: SEARCH_DATE_OF_BIRTH,
      payload: object,
   };
};
export const setSearchMRN = (object) => {
   return {
      type: SEARCH_MRN,
      payload: object,
   };
};
export const setSearchHospitalId = (object) => {
   return {
      type: SEARCH_HOSPITAL_ID,
      payload: object,
   };
};
export const setSearchEnterpriseId = (object) => {
   return {
      type: SEARCH_ENTERPRISE_ID,
      payload: object,
   };
};
export const setSearchUserType = (object) => {
   return {
      type: SEARCH_USER_TYPE,
      payload: object,
   };
};
export const setClearSearchFields = () => {
   return {
      type: CLEAR_SEARCH_FIELDS,
   };
};
export const setPlaybackSearchFlag = (object) => {
   return {
      type: PLAYBACK_SEARCH_FLAG,
      payload: object,
   };
};
export const setCheckForRefresh = () => {
   return {
      type: CHECK_FOR_REFRESH,
   };
};
export const setInitialState = () => {
   return {
      type: SET_INITIAL_STATE,
   };
};
export const setSearchPatientFollowStatus = (object) => {
   let reduxState = store.getState();
   let searchPatients = reduxState.searchpatientlist.searchPatients;
   let list = reduxState.searchpatientlist.searchPatients.list;
   let index = list.findIndex((o) => {
      return o?.id === object.id;
   });
   if (index > -1) {
      list[index].isFollow = !list[index].isFollow;
   }
   store.dispatch(
      setSearchPatientList({
         ...searchPatients,
         list: searchPatients.list,
      })
   );
};

export const checkAreSameObjects = () => {
   const searchStore = store.getState();
   const searchStoreValues = searchStore.searchpatientlist;
   const { dob, hospitalId, mrn } = searchStoreValues;
   if ((dob !== null && dob !== "") || (mrn !== null && mrn !== "") || (hospitalId !== null && hospitalId !== ""))
      return false;
   else return true;
};

export const isDisabled = () => {
   const searchStore = store.getState();
   const searchStoreValues = searchStore.searchpatientlist;
   const { playbackSearchFlag, name, hospitalId, mrn } = searchStoreValues;
   if (!playbackSearchFlag) {
      if (name !== "" && !firstLastNameRegex.test(name)) return true;
      if (mrn !== "" && hospitalId === null) return true;
      if (!firstLastNameRegex.test(name) && mrn === "") return true;
   }

   return false;
};

export const pushToSearchPatients = (history, manualSearch = false, searchFromSuggestions = false) => {
   const searchStore = store.getState();
   const searchStoreValues = searchStore.searchpatientlist;
   const { playbackSearchFlag, name, searchQuery, dob, enterpriseId, hospitalId, mrn, userType } = searchStoreValues;
   if (playbackSearchFlag && dob === null && hospitalId === null && (searchQuery.trim() === "" || searchQuery === null))
      return;

   if (!playbackSearchFlag && !firstLastNameRegex.test(name) && (mrn === "" || hospitalId === "")) return;

   let searchArr = getPrevFilters();
   if (searchArr.length > 5) searchArr.pop();
   const dateOfBirth = dob === null ? null : moment(dob).format("YYYYMMDD");
   const isSame = searchArr.filter((find) => {
      return find.searchQuery === searchQuery || find.name === name;
   });
   let filters = {
      playbackSearch: playbackSearchFlag,
      hospitalId: hospitalId,
      name: searchFromSuggestions ? searchFromSuggestions : name,
      searchQuery: searchFromSuggestions ? searchFromSuggestions : searchQuery,
      dob: dob,
      mrn: mrn,
      enterpriseId: enterpriseId,
      userType: userType,
   };
   let prevFilters = JSON.stringify(
      isSame.length === 0 && (searchQuery.trim() !== "" || name.trim() !== "")
         ? [filters, ...searchArr]
         : [...searchArr]
   );

   localStorage.setItem("searchArr", prevFilters);

   let queryparams = `?playback=${filters.playbackSearch}`;

   if (filters?.searchQuery !== "" && filters.playbackSearch && !manualSearch) {
      queryparams = `${queryparams}&query=${filters.searchQuery}`;
   }
   if (filters?.mrn) {
      queryparams = `${queryparams}&mrn=${filters?.mrn}`;
   }
   if (filters?.hospitalId?.value) {
      queryparams = `${queryparams}&hospitalId=${filters?.hospitalId?.value}`;
   }
   if (filters?.dob) {
      queryparams = `${queryparams}&dob=${dateOfBirth}`;
   }
   if (filters?.name && manualSearch) {
      queryparams = `${queryparams}&name=${filters?.name}`;
   }
   if (filters?.name && !manualSearch && !filters.playbackSearch) {
      queryparams = `${queryparams}&name=${filters?.name}`;
   }

   history.push({ pathname: "/search", search: queryparams });
};
