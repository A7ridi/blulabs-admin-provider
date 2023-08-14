import * as types from "../actions/launchdarkly.action";

const INITIAL_STATE = {
   ldFeatureFlags: {},
};

export default function launchdarkly(state = INITIAL_STATE, action) {
   switch (action.type) {
      case types.LD_FEATURE_FLAGS:
         return {
            ...state,
            ldFeatureFlags: action.payload,
         };
      default:
         return state;
   }
}
