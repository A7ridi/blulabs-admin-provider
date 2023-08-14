import { SET_SELECTED_PATIENT, SET_PROVIDER_ABOUT_MODAL, SET_PROVIDER_MAIL } from "../actions/profile.action";

const INITIAL_STATE = {
   selectedPatient: {
      list: null,
      loading: true,
   },
   showProviderAboutModal: false,
   callback: null,
   email: "",
};

export default function patientProfile(state = INITIAL_STATE, action) {
   switch (action.type) {
      case SET_PROVIDER_MAIL:
         return {
            ...state,
            email: action.payload,
         };
      case SET_SELECTED_PATIENT:
         return {
            ...state,
            selectedPatient: action.payload,
         };
      case SET_PROVIDER_ABOUT_MODAL:
         return {
            ...state,
            showProviderAboutModal: !state.showProviderAboutModal,
            callback: action.payload,
         };
      default:
         return state;
   }
}
