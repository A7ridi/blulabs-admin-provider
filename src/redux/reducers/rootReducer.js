import { combineReducers } from "redux";
import auth from "./auth.reducers";
import storage from "./storage.reducer";
import dashboardStates from "./dashboard.reducers";
import launchdarkly from "./launchdarkly.reducers";
import patientlist from "./patientList.reducers";
import searchpatientlist from "./searchPatient.reducers";
import teamList from "./teamList.reducers";
import patientProfile from "./profile.reducer";
import careteamList from "./careteam.reducers";

const rootReducer = combineReducers({
   auth,
   storage,
   dashboardStates,
   launchdarkly,
   patientlist,
   searchpatientlist,
   teamList,
   careteamList,
   patientProfile,
});

export default rootReducer;
