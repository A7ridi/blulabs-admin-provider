import React, { useEffect } from "react";
import { connect } from "react-redux";
import Home from "../home/Home";
import { refreshReduxStore } from "../../../actions/index";
import * as searchActions from "../../../redux/actions/searchPatient.action";
import { bindActionCreators } from "redux";

function HomeCont(props) {
   const { userCredentials, setCheckForRefresh } = props;
   const isLoggedOut = userCredentials === null || userCredentials === undefined;
   const isRefresh = !window.location.pathname.includes("/search");

   useEffect(() => {
      if (isLoggedOut) return;
      refreshReduxStore();
      if (isRefresh) setCheckForRefresh();
   }, [isLoggedOut]);

   return <Home {...props} />;
}
const mapStateToProps = (state) => {
   return {
      searchPatientList: state.searchpatientlist,
      userCredentials: state.auth.userCredentials,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setCheckForRefresh: searchActions.setCheckForRefresh,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeCont);
