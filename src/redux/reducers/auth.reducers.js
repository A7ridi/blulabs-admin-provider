import * as types from "../actions/auth.action";
import { emailKey } from "../../viewpages/cookieKeys";
const INITIAL_STATE = {
   token: null,
   usercredentials: null,
   northwelluser: null,
   isPBCSamlLoginDone: false,
   recentSearchPLB: [],
   recentSearchNorth: [],
   loggedInProviderDetails: null,
};

export default function auth(state = INITIAL_STATE, action) {
   switch (action.type) {
      case types.NORTHWELLUSER:
         return {
            ...state,
            northwelluser: action.payload.northwelluserobj,
         };
      case types.USER_CREDENTIALS:
         return {
            ...state,
            userCredentials: action.payload.userObj,
         };
      case types.SAVE_ACCESSTOKEN:
         return {
            ...state,
            token: action.payload.tokenObj,
         };
      case types.RECENT_SEARCH_PLB:
         return {
            ...state,
            recentSearchPLB: action.payload.obj,
         };
      case types.RECENT_SEARCH_NORTH:
         return {
            ...state,
            recentSearchNorth: action.payload.objNorth,
         };

      case types.IS_PBCSAMLOGINDONE:
         return {
            ...state,
            isPBCSamlLoginDone: true,
         };
      case types.SET_PROVIDER_DETAILS:
         return {
            ...state,
            loggedInProviderDetails: action.payload,
         };
      case types.AUTH_LOGOUT:
         if (state.userCredentials) {
            document.cookie = `${emailKey}=${btoa(JSON.parse(state.userCredentials).user.email)}; expires=Session`;
         }
         return {
            ...INITIAL_STATE,
         };
      default:
         return state;
   }
}

Date.prototype.addHours = function (h) {
   this.setHours(this.getHours() + h);
   return this;
};
