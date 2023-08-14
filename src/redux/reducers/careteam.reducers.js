import { CARETEAM_LIST } from "../actions/careteam.action";

const INITIAL_STATE = {
   careteam: [],
};

export default function careteamList(state = INITIAL_STATE, action) {
   switch (action.type) {
      case CARETEAM_LIST:
         return {
            ...state,
            careteam: action.payload,
         };
      default:
         return state;
   }
}
