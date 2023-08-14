import React from "react";
import BaseComponent from "../components/BaseComponent";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import "firebase/firestore";
import $ from "jquery";
import LoadingContent from "../common/LoadingContent";
import { compose } from "redux";
import ShortcutList from "./ShortcutList";
import "./phrases.css";
import { v4 as uuid } from "uuid";
import { JobInstance } from "twilio/lib/rest/bulkexports/v1/export/job";
import LoaderIndicate from "../common/LoadingIndicator";
import { json } from "body-parser";

class Phrases extends BaseComponent {
  constructor(props) {
    super(props);
    this.getShortcutList = this.getShortcutList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.handleShortcutChange = this.handleShortcutChange.bind(this);
    // this.handlePhraseChange = this.handlePhraseChange.bind(this);
    this.state = {
      phrasesList: [],
      isModalOpen: true,
      shortcut: "",
      isLoading: true,
      active: "",
      phrase: "",
      editobject: null,
      isEdit: false,
      PhraseID: "",
    };
  }
  getShortcutList() {}

  componentDidMount() {
    this.showUpdatedList();
  }

  showUpdatedList = () => {
    let $this = this;
    let currentUser = JSON.parse(this.props.data.userCredentials);
    const currentDepartmentID = currentUser.user.departmentId;
    // let currentEnterpriseID = "632a997e-f437-4e7c-8ce9-eff26c38a638"
    firebase
      .firestore()
      .collection("AppText")
      .doc("TextShortcuts")
      .onSnapshot(function (doc) {
        if (doc.exists) {
          $this.setState({ phrasesList: doc.data()[currentDepartmentID] });
          // setList(doc.data().randomeString);
          console.log("Component Rerendering");
        } else {
          console.log("No such document!");
        }
      });
    this.setState({
      isLoading: false,
    });
  };
  handleDelete = (index) => {
    let currentUser = JSON.parse(this.props.data.userCredentials);
    const currentDepartmentID = currentUser.user.departmentId;
    let newArr = this.state.phrasesList.filter((item, i) => i !== index);
    this.setState({
      phrasesList: newArr,
    });

    firebase
      .firestore()
      .collection("AppText")
      .doc("TextShortcuts")
      .update({
        [currentDepartmentID]: newArr,
      });
    this.setState({
      isEdit: false,
      phrase: "",
      shortcut: "",
      editobject: null,
    });
  };
  handleSubmit = (e) => {
    let currentUser = JSON.parse(this.props.data.userCredentials);
    const currentDepartmentID = currentUser.user.departmentId;
    if (this.state.editobject === null) {
      // e.preventdefault();
      firebase
        .firestore()
        .collection("AppText")
        .doc("TextShortcuts")
        .update({
          [currentDepartmentID]: firebase.firestore.FieldValue.arrayUnion({
            id: uuid(),
            phrase: this.state.phrase.trim(),
            shortcut: this.state.shortcut.trim(),
          }),
        });
      this.setState({ ...this.state, phrase: "", shortcut: "" });
      this.getShortcutList();
    } else {
      let currentUser = JSON.parse(this.props.data.userCredentials);
      const currentDepartmentID = currentUser.user.departmentId;
      let arr = [];
      this.state.phrasesList.forEach((item) => {
        if (item.id === this.state.editobject.id) {
          item.phrase = this.state.phrase;
          item.shortcut = this.state.shortcut;
        }
        arr.push(item);
      });
      let updateShortcut = firebase
        .firestore()
        .collection("AppText")
        .doc("TextShortcuts")
        .update({
          [currentDepartmentID]: arr,
        })
        .then((response) => {
          console.log(JSON.stringify(response));
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
      this.setState({
        ...this.state,
        phrase: "",
        editobject: null,
        shortcut: "",
        isEdit: false,
      });
    }
  };

  phrases = () => {
    this.setState({
      activeType: "phrases",
    });
    this.naviagtephrases({ actionUrl: "/phrases" });
  };

  //}
  handleShortcutChange = (event) => {
    this.setState({
      shortcut: event.target.value,
    });
  };

  handlePhraseChange = (event) => {
    this.setState({
      phrase: event.target.value,
    });
  };

  handleEdit = (phraseObj) => {
    this.setState({
      ...this.state,
      phrase: phraseObj.phrase,
      shortcut: phraseObj.shortcut,
      isEdit: true,
      editobject: phraseObj,
      PhraseID: phraseObj.id,
    });
  };

  render() {
    return (
      <div className="Phrases">
        <div className="col-md-4 col-lg-6 col-xl-2 col-sm-2 ">
          <div className="sidebar left-sidebar-background">
            <div className="navigation-list">
              <div className="max-500-phrases">
                <div className="custom-filed1-phrases">
                  <label>Settings</label>
                </div>

                <div className="sidebar-inner-phrases">
                  <label
                    style={{ cursor: "pointer" }}
                    className="leftbar-button-controls"
                  >
                    <b>Text Replacement </b>{" "}
                  </label>
                  {/* <label
                    style={{ cursor: "pointer" }}
                    className="leftbar-button-controls"
                  >
                    <b>Keyboard Shortcuts </b>{" "}
                  </label> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        {this.state.isLoading ? (
          <LoaderIndicate />
        ) : (
          <div className="col-md-4 col-lg-6 col-xl-8 col-sm-2">
            <div className="max-5001-phrases">
              {/* {this.state.isloading ? <LoadingContent /> : ""} */}

              <div className="custom-filed-phrases create-label">
                <label className="shortcuts-label">
                  {" "}
                  <b>
                    {this.state.isEdit
                      ? "Update Shortcuts"
                      : "Create Shortcuts"}
                  </b>
                </label>

                <div className="form-group">
                  <div className="custom-filed44-phrases">
                    <label className="shortcut-label-margin">Shortcut</label>
                    <input
                      className="custom-input-phrases"
                      type="text"
                      value={this.state.shortcut}
                      name="shortcut"
                      placeholder="OMW"
                      onChange={(e) => this.handleShortcutChange(e)}
                    />

                    <label className="phrase-label-margin">Phrase</label>
                    <textarea
                      className="textarea custom-input-phrases"
                      type="text"
                      value={this.state.phrase}
                      name="phrase"
                      placeholder="On my way"
                      onChange={(e) => this.handlePhraseChange(e)}
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-blue-block-phrases"
                data-dismiss="modal"
                value="create"
                onClick={(e) => this.handleSubmit(e)}
                disabled={
                  this.state.phrase === "" ||
                  this.state.shortcut === "" ||
                  !this.state.shortcut.trim() ||
                  !this.state.shortcut.trim()
                }
              >
                {this.state.isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        )}
        {this.state.isLoading ? (
          <LoaderIndicate />
        ) : (
          <ShortcutList
            phrasesList={this.state.phrasesList}
            handleDelete={(index) => this.handleDelete(index)}
            handleEdit={(phrase) => this.handleEdit(phrase)}
            isLoading={this.state.isLoading}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    data: state.auth,
    storage: state.storage,
  };
};
export default connect(mapStateToProps, "")(Phrases);
