import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import "./patientLogin.css";
import {} from "../../../../helper/CommonFuncs";
import { bindActionCreators } from "redux";
import * as actions from "../../../../redux/actions/auth.action";
import PatientComponent from "../components/patientComponent";

const patientContainer = (props) => {
   return <PatientComponent {...props} />;
};

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(patientContainer));
