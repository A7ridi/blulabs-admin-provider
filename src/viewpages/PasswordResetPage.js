import React, { useState, useEffect } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import * as actions from "../redux/actions/auth.action";
import { setOnboardProviderEmail } from "../redux/actions/profile.action";
import { bindActionCreators } from "redux";
import LoadingIndicator from "../common/LoadingIndicator";
import "./passwordReset.css";
import * as resetmodel from "./viewModels/reset-password-vm";
import "firebase/firestore";

function PasswordResetPage(props) {
   const { setOnboardProviderEmail, history } = props;
   const [state, setstate] = useState({
      socket: null,
   });
   useEffect(() => {
      const searchParams = new URLSearchParams(props.location.search);
      let base64 = searchParams.get("data");
      if (base64.length <= 1 || base64 === "") {
         history.push("/");
      } else {
         let usrCreds = resetmodel.decodeCredentials(base64);
         setOnboardProviderEmail(usrCreds);
         history.push("/sign-up");
      }
      return () => {
         if (state.socket?.socket) {
            state.socket.socket.close();
         }
      };
   }, []);

   return (
      <>
         <div className="PasswordResetPage login-btn-wrapper">
            <div id="recaptcha-container"></div>
            <LoadingIndicator />
         </div>
      </>
   );
}

const mapStateToProps = (state) => {
   return {
      profile: state.profile,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
         setOnboardProviderEmail: setOnboardProviderEmail,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(React.memo(PasswordResetPage)));
