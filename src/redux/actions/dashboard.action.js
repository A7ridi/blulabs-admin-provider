export const IS_AUDIO_RECORDING = "IS_AUDIO_RECORDING";
export const IS_VIDEO_RECORDING = "IS_VIDEO_RECORDING";
export const NOTIFICATION_OBJECT = "NOTIFICATION_OBJECT";
export const SHOW_MEDIA_POPUP = "SHOW_MEDIA_POPUP";
export const IS_INVITE_PATIENT = "IS_INVITE_PATIENT";
export const IS_INVITE_PATIENT_MODAL = "IS_INVITE_PATIENT_MODAL";
export const REFERRAL_DETAILS_OBJECT = "REFERRAL_DETAILS_OBJECT";
export const NOTIFICATION_COUNT = "NOTIFICATION_COUNT";
export const ENTERPRISE_DETAILS = "ENTERPRISE_DETAILS";
export const SHOW_POPUP = "SHOW_POPUP";
// export const CREATE_FOLDER = "CREATE_FOLDER";

export const toggleContent = (payload) => {
   return {
      type: SHOW_POPUP,
      payload,
   };
};

export const setAudioRecordingStatus = (object) => {
   return {
      type: IS_AUDIO_RECORDING,
      payload: { ...object },
   };
};
export const setEnterPriseDetails = (object) => {
   return {
      type: ENTERPRISE_DETAILS,
      payload: { ...object },
   };
};
export const setVideoRecordingStatus = (object) => {
   return {
      type: IS_VIDEO_RECORDING,
      payload: { ...object },
   };
};
export const setNotificationObject = (object) => {
   return {
      type: NOTIFICATION_OBJECT,
      payload: { ...object },
   };
};
export const setShowMediaPopup = (object) => {
   return {
      type: SHOW_MEDIA_POPUP,
      payload: { ...object },
   };
};
export const setInvitePatient = (object) => {
   return {
      type: IS_INVITE_PATIENT,
      payload: { ...object },
   };
};
export const setInvitePatientModal = (object) => {
   return {
      type: IS_INVITE_PATIENT_MODAL,
      payload: { ...object },
   };
};
export const setReferralDetailsObject = (object) => {
   return {
      type: REFERRAL_DETAILS_OBJECT,
      payload: { ...object },
   };
};
export const setNotificationCount = (object) => {
   return {
      type: NOTIFICATION_COUNT,
      payload: { ...object },
   };
};
// export const setCreateFolder = (object) => {
//   return {
//     type: CREATE_FOLDER,
//     payload: { ...object },
//   };
// };
