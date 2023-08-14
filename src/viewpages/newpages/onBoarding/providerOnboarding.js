import React, { useEffect } from "react";

import { bindActionCreators } from "redux";
import * as actions from "../../../redux/actions/auth.action";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import LoadingIndicator from "../../../common/LoadingIndicator";

import { socketActions, socketSubActions } from "../../../helper/Websocket";
function OnBoarding(props) {
  useEffect(() => {
    getTokenOnBoard();
  }, []);
  const getTokenOnBoard = async () => {
    const searchParams = new URLSearchParams(props.location.search);
    const token = searchParams.get("key") || null;
    if (token) {
      let str2 = {
        action: socketActions.auth,
        subAction: socketSubActions.exchangeToken,
        firebaseToken: token,
      };
      window.socket.send(str2, (data) => {
        if (data.settings?.status === 1) {
          firebase
            .auth()
            .signInWithCustomToken(data.customToken)
            .then((storeDataRedux) => {
              let userData = { user: data.userData };
              props.savenorthwelluserobj(JSON.parse(JSON.stringify(storeDataRedux)));
              props.saveusercredentials(userData);
              props.history.push("/");
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          props.history.push("/login");
        }
      });
    }
  };

  return (
    <div className="onBoardingProvider">
      <LoadingIndicator />
      Please wait while we get things ready for you
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      savenorthwelluserobj: actions.savenorthwelluserobj,
      saveusercredentials: actions.saveusercredentials,
    },
    dispatch
  );
};

export default withRouter(connect(null, mapDispatchToProps)(OnBoarding));
