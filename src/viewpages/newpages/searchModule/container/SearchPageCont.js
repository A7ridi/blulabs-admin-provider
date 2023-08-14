import React from "react";
import SearchPage from "../components/SearchPage";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

function SearchPageCont(props) {
   return (
      <div>
         <SearchPage {...props} />
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
   };
};

export default withRouter(connect(mapStateToProps, null)(SearchPageCont));
