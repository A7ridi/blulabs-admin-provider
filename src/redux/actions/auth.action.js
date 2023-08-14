export const IS_PBCSAMLOGINDONE = "IS_PBCSAMLOGINDONE";
export const USER_CREDENTIALS = "USER_CREDENTIALS";
export const NORTHWELLUSER = "NORTHWELLUSER";
export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const SAVE_ACCESSTOKEN = "SAVE_ACCESSTOKEN";
export const RECENT_SEARCH_PLB = "RECENT_SEARCH_PLB";
export const RECENT_SEARCH_NORTH = "RECENT_SEARCH_NORTH";
export const SET_PROVIDER_DETAILS = "SET_PROVIDER_DETAILS";

export const pbcsamllogindone = () => {
   return {
      type: IS_PBCSAMLOGINDONE,
   };
};

export const saveusercredentials = (userObj) => {
   return {
      type: USER_CREDENTIALS,
      payload: { userObj },
   };
};
export const savenorthwelluserobj = (northwelluserobj) => {
   return {
      type: NORTHWELLUSER,
      payload: { northwelluserobj },
   };
};
export const saveaccesstoken = (tokenObj) => {
   return {
      type: SAVE_ACCESSTOKEN,
      payload: { tokenObj },
   };
};
export const logout = () => {
   return {
      type: AUTH_LOGOUT,
   };
};

export const recentsearchdataPLB = (obj) => {
   return {
      type: RECENT_SEARCH_PLB,
      payload: { obj },
   };
};

export const recentsearchdataNorth = (objNorth) => {
   return {
      type: RECENT_SEARCH_NORTH,
      payload: { objNorth },
   };
};

export const setProviderDetails = (provDetails) => {
   return {
      type: SET_PROVIDER_DETAILS,
      payload: provDetails,
   };
};
