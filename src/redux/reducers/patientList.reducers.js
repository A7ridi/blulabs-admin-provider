import { VIEWED_PATIENT_LIST, MY_PATIENT_LIST } from "../actions/patientList.action";

const INITIAL_STATE = {
   viewed: {
      list: [],
      loading: true,
      limit: 10,
      offset: 0,
      totalCount: 0,
   },
   myPatients: {
      list: [],
      loading: true,
      limit: 10,
      offset: 0,
      totalCount: 0,
   },
};

export default function patientlist(state = INITIAL_STATE, action) {
   switch (action.type) {
      case VIEWED_PATIENT_LIST:
         return {
            ...state,
            viewed: action.payload,
         };
      case MY_PATIENT_LIST:
         return {
            ...state,
            myPatients: action.payload,
         };
      default:
         return state;
   }
}
