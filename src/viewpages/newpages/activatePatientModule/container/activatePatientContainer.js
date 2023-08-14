import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import ActivatePatient from "../../activatePatientModule/component/activatePatientComponent";

class ActivatePatientCont extends React.Component {
   render() {
      return <ActivatePatient {...this.props} />;
   }
}
const mapStateToProps = (state) => {
   return {
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      userObject: state.auth?.userCredentials?.user,
      featureFlags: state.launchdarkly.ldFeatureFlags,
   };
};

export default withRouter(connect(mapStateToProps, null)(ActivatePatientCont));
