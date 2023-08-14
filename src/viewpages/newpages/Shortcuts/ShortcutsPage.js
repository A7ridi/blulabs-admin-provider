import React, { memo, useState, useEffect } from "react";
import "./Shortcuts.css";
import ShortcutsList from "./ShortcutsList";
import AddShortcuts from "./AddShortcuts";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import { v4 as uuid } from "uuid";

function ShortcutsPage(props) {
  const [state, setState] = useState({
    phrasesList: [],
    shortcut: "",
    isLoading: true,
    phrase: "",
    editobject: null,
    isEdit: false,
    PhraseID: "",
  });

  useEffect(() => {
    getShortcutList();
  }, []);

  const getShortcutList = () => {
    let currentUser = props.data.userCredentials;
    const currentDepartmentID = currentUser.user.departmentId;
    firebase
      .firestore()
      .collection("AppText")
      .doc("TextShortcuts")
      .onSnapshot(function (doc) {
        if (doc.exists) {
          setState({ ...state, phrasesList: doc.data()[currentDepartmentID] });
        } else {
          console.log("No such document!");
        }
      });
    setState({
      ...state,
      isLoading: false,
    });
  };
  return (
    <div id="shortcuts" className="d-flex w-100 h-100">
      {/* <section className="library-list-section h-100 overflow-hidden"> */}
      <section className="shortcuts-list-section flex-shrink-0 h-100 overflow-hidden">
        {/* list-section flex-shrink-0 h-100 overflow-hidden */}
        <ShortcutsList shotcuts={state.phrasesList} />
      </section>
      <section className="position-relative w-100 h-100 flex-column flex-center">
        <AddShortcuts />
      </section>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
  };
};
export default connect(mapStateToProps, "")(memo(ShortcutsPage));
