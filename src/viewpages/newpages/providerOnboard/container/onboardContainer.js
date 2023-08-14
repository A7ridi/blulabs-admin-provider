import React from "react";
import OnBoardComponent from "../components/onboardComponent";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import "./onboard.css";
import {} from "../../../../helper/CommonFuncs";
import { bindActionCreators } from "redux";
import * as actions from "../../../../redux/actions/auth.action";

const onboardContainer = (props) => {
   return <OnBoardComponent {...props} />;
};

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      email: state.patientProfile.email,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(onboardContainer));
