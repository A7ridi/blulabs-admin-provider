import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import * as actions from "../../../../redux/actions/auth.action";
import { bindActionCreators } from "redux";
import "../passwordReset.css";
import ResetPassword from "../component/resetPassword";
import { useMutation } from "@apollo/client";
import { UPDATE_USER_PASSWORD } from "../actions/resetPasswordActions";
import { ShowAlert, showSwal } from "../../../../common/alert";
import * as firebase from "firebase/app";
import "firebase/firestore";
import { errorToDisplay } from "../../../../helper/CommonFuncs";

function ResetPasswordContainer(props) {
   const { userCredentials } = props;
   const [isLoading, setIsLoading] = React.useState(false);
   const [updatePassword] = useMutation(UPDATE_USER_PASSWORD, {
      onCompleted(res) {
         setIsLoading(false);
         ShowAlert("Password changed Successfully. Please login again to continue.", "success");
         setTimeout(() => {
            firebase.auth().signOut();
            localStorage.clear();
            indexedDB.deleteDatabase("firebaseLocalStorageDb");
            window.location.replace("/login");
         }, 1000);
      },
      onError(err) {
         setIsLoading(false);
         const errMsg = errorToDisplay(err);
         ShowAlert(errMsg, "error");
      },
   });
   return (
      <ResetPassword updatePassword={updatePassword} isLoading={isLoading} setIsLoading={setIsLoading} {...props} />
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResetPasswordContainer));
