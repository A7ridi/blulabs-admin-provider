import React, { Component, useEffect, useState } from "react";
import $ from "jquery";
import axios from "axios";
import { store } from "../../redux/store";
import * as actions from "../../redux/actions/auth.action";
import "./CareTeamInvite.css";
import { v4 as uuid } from "uuid";
import Apimanager from "../../Apimanager";
import swal from "sweetalert";
import LoadingIndicator from "../../common/LoadingIndicator";
import * as firebase from "firebase/app";
import "firebase/firestore";

var controller = new AbortController();
var signal = controller.signal;

let backIcon = "/assets/images/arrow-left.png";

function reverseString(str) {
  if (str) {
    let nameArr = str.split(" ");
    let firstName = nameArr[0][0]; //str[0];

    let lastName = nameArr[1][0];
    return firstName + lastName;
  } else {
    return "";
  }
}

export function addProviderToCareTeam(apiParam, providerAdded = () => {}) {
  Apimanager.inviteuser(
    apiParam,
    (success) => {
      providerAdded(success.data);
    },
    (error) => {
      if (error && error.status === 500) {
        return;
      }
    }
  );
}

export let FollowView = ({
  patientName,
  enterpriseId,
  patientId,
  provider,
  backTapped = () => {},
  providerAdded = () => {},
  addSelf = false,
  closeButtonId = "visitModelDismiss",
}) => {
  const [state, setState] = useState({
    subsOpts: [],
    isLoadSubs: true,
    isAdding: false,
  });

  useEffect(() => {
    let subscribers = firebase
      .firestore()
      .collection("AppText")
      .doc("CareTeam")
      .onSnapshot(
        function (doc) {
          if (doc.exists) {
            let subs = doc.data()?.subscription || [];
            setState({
              ...state,
              subsOpts: subs,
              isLoadSubs: false,
            });
          }
        },
        (error) => {
          console.log("firestore error" + error);
        }
      );
    return () => subscribers();
  }, []);
  return (
    <div className="FollowView modal-header mb-3">
      <div className="header-content-div">
        {addSelf ? null : (
          <img
            id="back-button"
            src={backIcon}
            alt="Back"
            onClick={() => backTapped()}
          />
        )}
        <button
          type="button"
          id={closeButtonId}
          className="close"
          data-dismiss="modal"
          style={{ zIndex: addSelf ? 0 : -1, opacity: addSelf ? 1 : 0 }}
        >
          &times;
        </button>
        <h4 className="modal-title">Follow</h4>
      </div>
      {addSelf ? (
        <p className="your-request mb-3">
          How long do you wish to receive notifications for this patient?
        </p>
      ) : (
        <p className="your-request mb-3">{`Notify ${provider.value} for ${patientName} updates for`}</p>
      )}
      {state.isLoadSubs ? <LoadingIndicator /> : null}
      {state.subsOpts.map((obj) => (
        <div
          key={uuid()}
          className="follow-button"
          onClick={(e) => {
            let apiParam = {
              isAddToCareTeam: true,
              userId: patientId,
              slug: provider.slug,
              type: "provider",
              email: provider.email,
              enterpriseId: enterpriseId,
              subscription: obj.hour,
            };
            setState({ ...state, isAdding: true });
            addProviderToCareTeam(apiParam, (data) => {
              setState({ ...state, isAdding: false });
              providerAdded(data);
            });
          }}
        >
          {obj.title}
        </div>
      ))}
      {state.isAdding ? (
        <div className="create-content-loading">
          <LoadingIndicator />
        </div>
      ) : null}
    </div>
  );
};

class CareTeamInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchProviderList: [],
      providerData: "",
      providerDetails: "",
      isloading: false,
      isListLoading: false,
      selectedProvider: null,
      noRecordFound: false,
      showFollowOptions: false,
      sProvider: "",
    };
  }

  sweetAlertbar(message) {
    swal({
      title: "Successful",
      text: message,
      icon: "success",
      dangerMode: false,
    });
  }

  addToPatientCareTeam = (provider, option) => {
    this.setState({
      isloading: true,
      showFollowOptions: false,
    });
    let user = JSON.parse(this.props.storedObject.userCredentials).user;
    let apiParam = {
      isAddToCareTeam: true,
      userId: this.props.match.params.patientid,
      slug: provider.slug,
      type: "provider",
      email: provider.email,
      enterpriseId: user.enterpriseId,
      subscription: option.hour,
    };

    addProviderToCareTeam(apiParam, (data) => {
      this.props.providerAdded(data);
      document.getElementById("visitModelDismiss").click();
      this.sweetAlertbar("Provider added care team successfully.");
      this.setState({
        providerDetails: "",
        providerAddress: "",
        providerData: "",
        searchProviderList: "",
        providerSlug: "",
        callCareAPI: true,
        isloading: false,
      });
    });
  };

  searchProvider = (e) => {
    try {
      let storedObject = JSON.parse(this.props.storedObject.northwelluser);
      let searchtext = e.target.value;

      this.setState({
        sProvider: searchtext,
        providerData: "",
        providerDetails: "",
        selectedProvider: null,
        noRecordFound: false,
      });

      if (searchtext && searchtext.length > 2) {
        var auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
        if (!storedObject) {
          return;
        }
        this.setState({
          isListLoading: true,
        });
        var queryparams = {
          searchTerm: searchtext,
        };

        controller.abort();
        controller = new AbortController();
        signal = controller.signal;

        let entId = JSON.parse(this.props.storedObject.userCredentials).user
          .enterpriseId;

        var endpoint =
          `${process.env.REACT_APP_URL}/user/v2/searchprovider/${entId}?` +
          $.param({
            key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
            searchTerm: encodeURIComponent(queryparams.searchTerm.trim()),
          });

        fetch(endpoint, {
          method: "get",
          signal: signal,
          headers: new Headers({
            Authorization: auth,
            "Content-Type": "application/text",
            //Accept: "application/json",
          }),

          // body: "A=1&B=2",
        })
          .then(function (response) {
            if (response.status === 401) {
              throw response.status;
            } else {
              return response.json();
            }
          })
          .then((success) => {
            this.setState({
              searchProviderList:
                success.data && success.data.provider
                  ? success.data.provider
                  : [],
              isListLoading: false,
              noRecordFound:
                success.data?.length === 0 ||
                success.data?.provider?.length === 0,
            });
          })
          .catch((error) => {
            if (error && error === 401) {
              var redux_store = store.getState();
              var northwelluser_store =
                redux_store &&
                redux_store.auth &&
                redux_store.auth.northwelluser &&
                JSON.parse(redux_store.auth.northwelluser);
              var refreshToken =
                northwelluser_store.user.stsTokenManager.refreshToken;
              var bodyFormData = {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
              };

              axios({
                method: "post",
                url: `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASEAPIKEY}`,
                data: bodyFormData,
                config: { headers: { "Content-Type": "multipart/form-data" } },
              })
                .then((response) => {
                  var stsTokenManager = {
                    apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
                    refreshToken: response.data.refresh_token,
                    accessToken: response.data.access_token,
                    expirationTime: response.data.expires_in,
                  };
                  northwelluser_store.user.stsTokenManager = stsTokenManager;
                  store.dispatch(
                    actions.savenorthwelluserobj(
                      JSON.stringify(northwelluser_store)
                    )
                  );
                  //var auth = `Bearer ${stsTokenManager.accessToken}`;
                  fetch(endpoint, {
                    method: "get",
                    signal: signal,
                    headers: new Headers({
                      Authorization: auth,

                      "Content-Type": "application/text",

                      //Accept: "application/json",
                    }),

                    // body: "A=1&B=2",
                  })
                    .then((new_response) => new_response.json())
                    .then((success) => {
                      this.setState({
                        searchProviderList:
                          success.data && success.data.data
                            ? success.data.data.provider
                            : "",
                        isListLoading: false,
                      });
                    });
                })
                .catch((new_error) => {
                  sessionStorage.clear();
                  localStorage.clear();
                  store.dispatch(actions.logout());
                  window.location.replace("/login");
                });
            }
            //         this.setState({ isloading: false });
          });
      } else {
        this.setState({
          searchProviderList: [],
          isloading: false,
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  render() {
    return (
      <div className="CareTeamInvite">
        <form
          action=""
          className="care-team-form"
          onSubmit={(e) => e.preventDefault()}
        >
          {this.state.showFollowOptions ? (
            <FollowView
              enterpriseId={
                JSON.parse(this.props.storedObject.userCredentials).user
                  .enterpriseId
              }
              patientId={this.props.match.params.patientid}
              patientName={this.props.patientName}
              provider={this.state.selectedProvider}
              backTapped={() => {
                this.setState({
                  showFollowOptions: false,
                });
              }}
              providerAdded={(data) => {
                this.props.providerAdded(data);
                document.getElementById("visitModelDismiss").click();
                this.sweetAlertbar("Provider added care team successfully.");
                this.setState({
                  providerDetails: "",
                  providerAddress: "",
                  providerData: "",
                  searchProviderList: "",
                  providerSlug: "",
                  callCareAPI: true,
                  isloading: false,
                  showFollowOptions: false,
                  sProvider: "",
                });
              }}
            />
          ) : (
            <>
              <div className="modal-header mb-3">
                <h4 className="modal-title">Add to Care Team</h4>
                <button
                  type="button"
                  id="visitModelDismiss"
                  className="close"
                  data-dismiss="modal"
                  onClick={() => {
                    this.setState({
                      searchProviderList: [],
                      providerData: "",
                      providerDetails: "",
                      isloading: false,
                      selectedProviders: [],
                      sProvider: "",
                    });
                  }}
                >
                  &times;
                </button>
              </div>
              <p className="your-request mb-3">
                Select a member to add to this patient's care team.
              </p>
              <div className="custom-filed">
                <input
                  type="text"
                  onChange={this.searchProvider}
                  value={this.state.sProvider}
                  className="custom-input grey-input"
                  placeholder="Search"
                />
                <div className="search-result">
                  <ul>
                    {this.state.searchProviderList
                      ? this.state.searchProviderList.map((e) => {
                          return (
                            <div key={e.userId} className="provider-container">
                              <div className="user-icon">
                                {reverseString(e.value)}
                              </div>
                              <div key={uuid()} className="provider-row">
                                <div className="provider-detail">
                                  <label className="name-label">
                                    {e.value}
                                  </label>
                                  <label className="department-label">
                                    {e.playbackDepartment}
                                  </label>
                                </div>
                                <div
                                  className="tick"
                                  style={{
                                    backgroundColor:
                                      this.state.selectedProvider?.userId ===
                                      e.userId
                                        ? "#2680bc"
                                        : "transparent",
                                  }}
                                />
                                <div
                                  className="overlap"
                                  onClick={() => {
                                    this.setState({
                                      selectedProvider: e,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })
                      : null}
                    {this.state.isListLoading ? <LoadingIndicator /> : null}
                    {this.state.noRecordFound ? (
                      <h2 className="no-result">No record found</h2>
                    ) : null}
                  </ul>
                </div>
              </div>
            </>
          )}
        </form>
        {!this.state.showFollowOptions ? (
          <div className="text-center">
            <button
              className="btn btn-blue-block"
              disabled={this.state.selectedProvider === null}
              onClick={() => {
                this.setState({
                  showFollowOptions: true,
                });
              }}
            >
              Add to Care Team
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}

export default React.memo(CareTeamInvite);
