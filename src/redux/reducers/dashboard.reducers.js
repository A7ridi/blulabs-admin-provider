import * as types from "../actions/dashboard.action";

const INITIAL_STATE = {
   isAudioRecording: false,
   isVideoRecording: false,
   notificationObject: null,
   showMediaPopup: false,
   isInvitePatient: false,
   invitePatientData: {
      isInvitePatient: false,
      dataObject: null,
      isEmr: false,
   },
   displayInviteModal: false,
   referralDetailsObject: {},
   notificationCount: 0,
   enterPriseDetails: {},
   showContent: null,
   // folders: [],
   // files: [],
};

export default function dashboard(state = INITIAL_STATE, action) {
   switch (action.type) {
      case types.SHOW_POPUP:
         return {
            ...state,
            showContent: action.payload,
         };

      case types.ENTERPRISE_DETAILS:
         return {
            ...state,
            enterPriseDetails: action.payload.enterPriseDetails,
         };
      case types.IS_AUDIO_RECORDING:
         return {
            ...state,
            isAudioRecording: action.payload.isAudioRecording,
            isVideoRecording: false,
         };
      case types.IS_VIDEO_RECORDING:
         return {
            ...state,
            isAudioRecording: false,
            isVideoRecording: action.payload.isVideoRecording,
         };
      case types.NOTIFICATION_OBJECT:
         return {
            ...state,
            notificationObject: action.payload.notificationObject,
         };
      case types.SHOW_MEDIA_POPUP:
         return {
            ...state,
            showMediaPopup: action.payload.showMediaPopup,
            notificationObjectDetails: action.payload.notificationObjectDetails,
         };
      case types.IS_INVITE_PATIENT:
         return {
            ...state,
            invitePatientData: action.payload.invitePatientData,
         };
      case types.IS_INVITE_PATIENT_MODAL:
         return {
            ...state,
            displayInviteModal: action.payload.displayInviteModal,
         };
      case types.REFERRAL_DETAILS_OBJECT:
         return {
            ...state,
            referralDetailsObject: action.payload.referralDetailsObject,
         };
      case types.NOTIFICATION_COUNT:
         return {
            ...state,
            notificationCount: action.payload.notificationCount,
         };
      // case types.CREATE_FOLDER:
      //   return {
      //     ...state,
      //     folders: [...state.folders, ...action.payload.folder],
      //   };
      default:
         return state;
   }
}
