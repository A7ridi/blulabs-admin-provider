import React, { useEffect, Suspense } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NorthwellSamlLogin from "./viewpages/NorthwellSamlLogin";
import DemoLoginLog from "./viewpages/DemoLoginLog";
import { store } from "./redux/store";
import * as dasboardActions from "../src/redux/actions/dashboard.action";
import { ToastContainer } from "react-toastify";
import PasswordResetPage from "./viewpages/PasswordResetPage";
import AddDetailsPage from "./viewpages/AddDetailsPage";
import FreshChatComp from "./freshChat";
import OnBoarding from "./viewpages/newpages/onBoarding/providerOnboarding";
import Socket from "./helper/Websocket";
import { connect } from "react-redux";
import WithApolloClient from "./wrapper/apolloWrapper";
import "react-toastify/dist/ReactToastify.css";

const HomeCont = React.lazy(() => import("./viewpages/newpages/home/homeCont"));
const VideoChat = React.lazy(() => import("./components/newcomponents/VideoCallView/VideoChat"));
const onboardContainer = React.lazy(() => import("./viewpages/newpages/providerOnboard/container/onboardContainer"));
window.socket = new Socket();
/* 
route will execute from here 
redux store is bind here
*/

var Root = (props) => {
   useEffect(() => {
      store.dispatch(
         dasboardActions.setInvitePatient({
            invitePatientData: { isInvitePatient: false, dataObj: null },
         })
      );
   }, []);

   const { userCredentials } = props;

   if (window.fcWidget) {
      window.fcWidget.destroy();
      window.fcWidget.user.clear();
   }
   if (window.fcWidget && userCredentials?.user) {
      window.fcWidget.user.update({
         firstName: userCredentials?.user?.name,
         externalId: userCredentials?.user?.userId,
         restoreId: userCredentials?.user?.userId,
      });
   }

   return (
      <>
         <ToastContainer />
         {userCredentials?.user && <FreshChatComp userCredentials={userCredentials} />}
         {window.location.pathname === "/login" && !localStorage.getItem("providerEmail") && <FreshChatComp />}
         <Router>
            <Suspense fallback={() => <div />}>
               <Switch>
                  <Route exact path="/reset-password" component={PasswordResetPage} />
                  <Route exact path="/sign-up" component={onboardContainer} />
                  <Route path="/onboarding" component={OnBoarding} />
                  <Route exact path="/login" component={NorthwellSamlLogin} />
                  <Route exact path="/login-log" component={DemoLoginLog} />
                  <Route exact path="/video-call" component={VideoChat} />
                  <Route exact path="/details" component={AddDetailsPage} />
                  <Route path="/" name="Home" component={HomeCont} />
               </Switch>
            </Suspense>
         </Router>
      </>
   );
};

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
   };
};

export default WithApolloClient(connect(mapStateToProps)(Root));
