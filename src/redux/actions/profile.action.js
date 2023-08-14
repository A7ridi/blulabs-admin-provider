export const SET_SELECTED_PATIENT = "SET_SELECTED_PATIENT";
export const SET_PROVIDER_ABOUT_MODAL = "SET_PROVIDER_ABOUT_MODAL";
export const SET_PROVIDER_MAIL = "SET_PROVIDER_MAIL";

export const setSelectedPatient = (payload) => {
   return {
      type: SET_SELECTED_PATIENT,
      payload,
   };
};
export const setProviderAboutModal = (payload) => {
   return {
      type: SET_PROVIDER_ABOUT_MODAL,
      payload,
   };
};

export const setOnboardProviderEmail = (payload) => {
   return {
      type: SET_PROVIDER_MAIL,
      payload,
   };
};
