import { store } from "../store";

export const VIEWED_PATIENT_LIST = "VIEWED_PATIENT_LIST";
export const MY_PATIENT_LIST = "MY_PATIENT_LIST";

export const setViewedPatientList = (object) => {
   return {
      type: VIEWED_PATIENT_LIST,
      payload: object,
   };
};

export const setMyPatientList = (object) => {
   return {
      type: MY_PATIENT_LIST,
      payload: object,
   };
};
export const fetchViewedPatient = (object, isMyPatients = false) => {
   return (dispatch) => {
      if (isMyPatients) {
         dispatch(setMyPatientList(object));
      } else {
         dispatch(setViewedPatientList(object));
      }
   };
};

export const updatePatientFollowStatus = (object, isMyPatients = false) => {
   let reduxState = store.getState();
   if (isMyPatients) {
      let list = reduxState.patientlist.myPatients.list;
      let index = list.findIndex((o) => o?.id === object.id);
      if (index > -1) {
         list[index].isFollow = !list[index].isFollow;
      }
      store.dispatch(
         fetchViewedPatient(
            {
               ...reduxState.patientlist.myPatients,
               list: list,
            },
            true
         )
      );
   } else {
      let list = reduxState.patientlist.viewed.list;
      let index = list.findIndex((o) => {
         return o?.id === object.id;
      });
      if (index > -1) {
         list[index].isFollow = !list[index].isFollow;
      }
      store.dispatch(
         fetchViewedPatient(
            {
               ...reduxState.patientlist.viewed,
               list: list,
            },
            false
         )
      );
   }
};

export const updatePatientInfo = (object, isMyPatient) => {
   let reduxState = store.getState();
   if (isMyPatient) {
      let list = reduxState.patientlist.myPatients.list;
      list[object.index].name.fullName = object.patientName;
      list[object.index].pObj.dob = object.patientDOB;
      list[object.index].dob = object.patientDOB;
      list[object.index].contactInformation.mobileNumber = object.patientMobile;
      list[object.index].contactInformation.email = object.patientEmail;
      store.dispatch(
         fetchViewedPatient(
            {
               ...reduxState.patientlist.myPatients,
               list: list,
            },
            true
         )
      );
   } else {
      let list = reduxState.patientlist.viewed.list;
      list[object.index].name.fullName = object.patientName;
      list[object.index].pObj.dob = object.patientDOB;
      list[object.index].dob = object.patientDOB;
      list[object.index].contactInformation.mobileNumber = object.patientMobile;
      list[object.index].contactInformation.email = object.patientEmail;
      store.dispatch(
         fetchViewedPatient(
            {
               ...reduxState.patientlist.viewed,
               list: list,
            },
            false
         )
      );
   }
};
