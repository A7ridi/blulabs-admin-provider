import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router";
import * as actions from "../redux/actions/auth.action";
import * as dasboardActions from "../redux/actions/dashboard.action";
import swal from "sweetalert";
import * as firebase from "firebase/app";
import * as i18n from "../I18n/en.json";
// import { Cookies } from 'js-cookie'
import { Link } from "react-router-dom";
import Apimanager from "../Apimanager";
import "firebase/firestore";
import InvitePatientView from "../components/InvitePatientView/InvitePatientView";
import NotificationView from "../components/NotificationView/NotificationView";

// firebase.firestore().settings({
//   timestampsInSnapshots: true,
// });

function reverseString(str) {
   let firstName = str[0];

   let lastName = "";

   if (str.length - 1 >= 1) {
      lastName = str[str.length - 1];
   }

   return firstName + lastName;

   //return str.split("").reverse().join("");
}

function calldummyFunction(callback) {
   var mediaelement = document.getElementById("media");
   var textelement = document.getElementById("text");
   if (callback === "media") {
      mediaelement && mediaelement.classList && mediaelement.classList.remove("active");
      textelement && textelement.classList && textelement.classList.add("active");
   } else if (callback === "text") {
      mediaelement && mediaelement.classList && mediaelement.classList.add("active");
      textelement && textelement.classList && textelement.classList.remove("active");
   }
}

var promptVal = 0;

document.onkeypress = function (e) {
   promptVal = 1;
};

class Header extends Component {
   constructor(props) {
      super(props);
      this.state = {
         user: null,
         userObj: null,
         userCredentials: null,
         media: "",
         text: "active",
         activeType: "",
         recordingType: false,
         patientCallMessage: null,
         showInvitePopup: false,
         currentUserRole: [],
         showNotificationPopup: false,
         userInitials: "",
         userFullName: "",
         // notificationActivityCount: sessionStorage.getItem("notifCount") || 0,
      };

      // if (localStorage.getItem("login") !== "yes") {
      //   localStorage.clear();
      //   sessionStorage.clear();
      //   this.props.history.push("/login");
      // } else {
      //   if (
      //     sessionStorage.getItem("Login") !== "yes" &&
      //     localStorage.getItem("userCheckKeepLogin") !== "yes"
      //   ) {
      //     localStorage.clear();
      //     sessionStorage.clear();
      //     this.props.history.push("/login");
      //   }
      // }
      // open prompt code
      // if (localStorage.getItem("continueWithCurrent") !== "yes") {
      //   setTimeout(() => this.openPrompt(), 60000);
      // }

      //document.addEventListener('mousemove', this.mousemoveHandler)
      document.addEventListener("click", this.clickHandler);

      //calling the method to get user role.
      setTimeout(() => {
         this.getUserRole();
      }, 100);
   }

   // componentDidMount() {
   //   setInterval(() => {
   //     this.getEnterpriseDetails();
   //   }, 15000);
   // }

   // getEnterpriseDetails = () => {
   //   Apimanager.getEntpDetails(
   //     {},
   //     (success) => {
   //       if (success && success.status === 200 && success.data) {
   //         this.setState({
   //           notificationActivityCount: success.data.data.activityNotViewed,
   //         });
   //         sessionStorage.setItem(
   //           "notifCount",
   //           success.data.data.activityNotViewed
   //         );
   //       }
   //     },
   //     (error) => {
   //       console.log(JSON.stringify(error, null, 4));
   //     }
   //   );
   // };

   closeNotificationPopup = (popupState) => {
      this.setState({
         showNotificationPopup: popupState,
      });
   };

   getUserRole = () => {
      let currentUser = JSON.parse(this.props.data.userCredentials || "{}");
      // console.log("Current User Variable---> " + JSON.stringify(currentUser));

      this.setState({
         currentUserRole: currentUser.user?.role,
         userInitials: currentUser.user?.initials,
         userFullName: currentUser.user?.name,
      });
      let $this = this;
      firebase.auth().onAuthStateChanged(function (user) {
         if (user) {
            // User is signed in.
            $this.setState({
               userObj: { user: user },
            });
         } else {
            // No user is signed in.
            $this.logout();
         }
      });
      // console.log("Role of the logged in user---> " + this.state.currentUserRole);
   };

   openPrompt = () => {
      if (promptVal === 0) {
         this.inputElement.click();
      } else {
         promptVal = 1;
      }
   };

   mousemoveHandler = (evt) => {
      promptVal = 1;
      // if (localStorage.getItem("continueWithCurrent") !== "yes") {
      //   localStorage.setItem("continueWithCurrent", "yes");
      // }
   };

   clickHandler = () => {
      promptVal = 1;
      // if (localStorage.getItem("continueWithCurrent") !== "yes") {
      //   localStorage.setItem("continueWithCurrent", "yes");
      // }
   };

   static getDerivedStateFromProps(props, state) {
      _.map(state.navigationLink, (object) => {
         object.isSelected = false;
      });
      _.map(state.navigationLink, (object) =>
         object.actionUrl === window.location.pathname ? (object.isSelected = true) : false
      );

      if (props.storage && props.storage.storageLoaded) {
         if (props.storedObject && props.storedObject.northwelluser) {
            if (state.text !== "active") {
               props &&
                  props.getnavigationmore &&
                  props.getnavigationmore.match.params.mediatype &&
                  calldummyFunction(props.getnavigationmore.match.params.mediatype);
            }
            let uobj = JSON.parse(props.storedObject.northwelluser);

            firebase.firestore().collection("videocall").doc(uobj.user.uid).update({
               caller_name: firebase.firestore.FieldValue.delete(),
               callerId: firebase.firestore.FieldValue.delete(),
               jwt: firebase.firestore.FieldValue.delete(),
               telehealthId: firebase.firestore.FieldValue.delete(),
               messageFrom: firebase.firestore.FieldValue.delete(),
               startTimestamp: firebase.firestore.FieldValue.delete(),
               messageAlert: firebase.firestore.FieldValue.delete(),
               callReject: firebase.firestore.FieldValue.delete(),
            });

            // window.intercomSettings = {
            //   app_id: "mar8tlcj",
            //   name: uobj.user.displayName, // Full name
            //   email: uobj.user.email, // Email address
            //   created_at: "1312182000", // Signup date as a Unix timestamp
            // };

            // We pre-filled your app ID in the widget URL: 'https://widget.intercom.io/widget/mar8tlcj'
            // (function () {
            //   var w = window;
            //   var ic = w.Intercom;
            //   if (typeof ic === "function") {
            //     ic("reattach_activator");
            //     ic("update", w.intercomSettings);
            //   } else {
            //     var d = document;
            //     var i = function () {
            //       i.c(arguments);
            //     };
            //     i.q = [];
            //     i.c = function (args) {
            //       i.q.push(args);
            //     };
            //     w.Intercom = i;
            //     var l = function () {
            //       var s = d.createElement("script");
            //       s.type = "text/javascript";
            //       s.async = true;
            //       s.src = "https://widget.intercom.io/widget/mar8tlcj";
            //       var x = d.getElementsByTagName("script")[0];
            //       x.parentNode.insertBefore(s, x);
            //     };
            //     if (w.attachEvent) {
            //       w.attachEvent("onload", l);
            //     } else {
            //       w.addEventListener("load", l, false);
            //     }
            //   }
            // })();

            let activeType = "";
            if (props.location.pathname === "/") {
               activeType = "all";
            } else if (props.location.pathname === "/document-library") {
               activeType = "document";
            } else if (props.location.pathname === "/phrases") {
               activeType = "phrases";
            }

            // else if (props.location.pathname === "/invitepatient") {
            //   activeType = "patient";
            // }

            // Realtime patient video call update
            let pMessage = "";
            firebase
               .firestore()
               .collection("videocall")
               .doc(uobj.user.uid)
               .onSnapshot(function (doc) {
                  let fireData = doc.data();

                  if (fireData && fireData.jwt) {
                     localStorage.setItem("patientNameVideo", fireData.caller_name);
                     localStorage.setItem("videoPatientID", fireData.callerId);
                     localStorage.setItem("teleHealthID", fireData.telehealthId);

                     pMessage = fireData.messageAlert;

                     firebase.firestore().collection("videocall").doc(uobj.user.uid).update({
                        caller_name: firebase.firestore.FieldValue.delete(),
                        callerId: firebase.firestore.FieldValue.delete(),
                        jwt: firebase.firestore.FieldValue.delete(),
                        telehealthId: firebase.firestore.FieldValue.delete(),
                        messageFrom: firebase.firestore.FieldValue.delete(),
                        startTimestamp: firebase.firestore.FieldValue.delete(),
                        messageAlert: firebase.firestore.FieldValue.delete(),
                        callReject: firebase.firestore.FieldValue.delete(),
                     });

                     document.getElementById("videoNotificationMessage").innerHTML = pMessage;

                     document.getElementById("showVideoModel").click();
                     document.getElementById("showVideoModel").classList.add("popupOpen");
                  } else if (fireData && fireData.callReject) {
                     if (document.getElementById("showVideoModel").className === "popupOpen") {
                        document.getElementById("showVideoModel").click();
                        document.getElementById("showVideoModel").classList.remove("popupOpen");
                        setTimeout(() => (document.getElementById("videoNotificationMessage").innerHTML = ""), 5000);
                     }

                     firebase.firestore().collection("videocall").doc(uobj.user.uid).update({
                        callReject: firebase.firestore.FieldValue.delete(),
                     });
                  }
               });

            return {
               navigationLink: state.navigationLink,
               // userObj: JSON.parse(props.storedObject.northwelluser),
               userCredentials: JSON.parse(props.storedObject.userCredentials),
               getnavigationmore: props && props.getnavigationmore,
               activeType: activeType,
               user: props.user,
            };
         } else {
            localStorage.clear();
            sessionStorage.clear();
            window.location.replace("/login");
         }
      }
      return null;
   }

   naviagteInviteUser(objectArgs) {
      const { navigationLink } = this.state;
      _.map(navigationLink, (object) => (object.isSelected = false));
      this.setState({ navigationLink: navigationLink }, () => this.props.history.push(objectArgs.actionUrl));
   }

   naviagtePhrases(objectArgs) {
      const { navigationLink } = this.state;
      _.map(navigationLink, (object) => (object.isSelected = false));
      this.setState({ navigationLink: navigationLink }, () => this.props.history.push(objectArgs.actionUrl));
   }

   inviteUser() {
      this.setState({
         activeType: "patient",
      });
      this.naviagteInviteUser({ actionUrl: "/invitepatient" });
   }

   docLib = () => {
      this.setState({
         activeType: "document",
      });
      this.naviagteInviteUser({ actionUrl: "/document-library" });
   };

   clickSettings = () => {
      this.setState({
         activeType: "phrases",
      });
      this.naviagtePhrases({ actionUrl: "/phrases" });
   };

   patientList = () => {
      this.setState({
         activeType: "all",
      });
      this.naviagteInviteUser({ actionUrl: "/" });
   };

   manageTemplate = () => {
      window.location.href = "/templates";
      //this.naviagteInviteUser({ actionUrl: "/templates" })
   };

   logout = async (switchUser = null) => {
      try {
         Apimanager.logout(
            (success) => {},
            (error) => {
               //console.log("customtoken_error", error)
               //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
            }
         );

         // sessionStorage.clear();
         // localStorage.clear();
         // this.deleteAllCookies(switchUser);
         firebase.auth().signOut();
         localStorage.clear();
         sessionStorage.clear();
         this.deleteAllCookies();
         indexedDB.deleteDatabase("firebaseLocalStorageDb");
      } catch (error) {
         console.log("logout", error);
      }
   };

   deleteAllCookies(switchUser) {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
         var cookie = cookies[i];
         var eqPos = cookie.indexOf("=");
         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      if (switchUser === "yes") {
         localStorage.setItem("switchUser", "yes");
      }
      firebase.auth().signOut();
      this.props.logout();
   }

   continueWithCurentUser = () => {
      promptVal = 1;
      // localStorage.setItem("continueWithCurrent", "yes");
   };

   screenR = () => {
      this.setState({
         recordingType: true,
      });
   };

   joinVideoCall = () => {
      document.getElementById("showVideoModel").click();
      document.getElementById("videoNotificationMessage").innerHTML = "";
      document.getElementById("showVideoModel").classList.remove("popupOpen");
      window.open("/video-call");
   };

   closeVideoCallNotification = () => {
      document.getElementById("showVideoModel").click();
      setTimeout(() => (document.getElementById("videoNotificationMessage").innerHTML = ""), 5000);
      document.getElementById("showVideoModel").classList.remove("popupOpen");
   };

   render() {
      let enterpriseImage = `${process.env.REACT_APP_PROFILE_URL}/${
         this.state.user?.enterpriseId
      }_logo?id=${Date.now()}`;
      var { userObj } = this.state;

      let adminAction = "";

      adminAction = (
         <>
            {/* <li className={"navigation-list mr-4"} title="Manage Template" onClick={() => this.manageTemplate()} >
                    <i className="material-icons">list_alt</i>
                </li> */}
            <li
               className={
                  this.state.activeType === "all"
                     ? "navigation-list mr-4 effect-6 active btn-success"
                     : "navigation-list mr-4"
               }
               title="All Patients"
               onClick={() => this.patientList()}
            >
               {/* <a href="javascript:void(0)">All Patients</a> */}
               <a href="/">All Patients</a>
            </li>
            <li
               className={
                  this.state.activeType === "patient"
                     ? "navigation-list mr-4 effect-6 active btn-success"
                     : "navigation-list mr-4 effect-6"
               }
               title="Invite Patient"
               // onClick={() => this.inviteUser()}
               onClick={() =>
                  JSON.parse(this.props.data.userCredentials).user?.enterpriseName === "Northwell"
                     ? this.props.setInvitePatient({
                          invitePatientData: {
                             isInvitePatient: false,
                             dataObj: null,
                             isEmr: false,
                             patientData: null,
                             redirectEmr: true,
                          },
                       })
                     : // this.setState({ ...this.state, showInvitePopup: true })
                       this.props.setInvitePatient({
                          invitePatientData: {
                             isInvitePatient: true,
                             dataObj: null,
                             isEmr: false,
                             patientData: null,
                          },
                       })
               }
            >
               <a href="javascript:void(0)">Invite Patient</a>
            </li>
            {/* 
        this.state.activeType === "document"
              ? "navigation-list mr-4 effect-6 active btn-success"
              : "navigation-list mr-4 effect-6" */}
            {this.state.currentUserRole.includes("admin") ? (
               <li
                  className={
                     this.state.activeType === "document"
                        ? "navigation-list mr-4 effect-6 active btn-success"
                        : "navigation-list mr-4"
                  }
                  title="Library"
                  onClick={() => this.docLib()}
               >
                  <a href="javascript:void(0)">Library Manager</a>
               </li>
            ) : null}
            <li
               onClick={() => {
                  this.setState({
                     ...this.state,
                     showNotificationPopup: !this.state.showNotificationPopup,
                     // notificationActivityCount: 0,
                  });
                  this.props.setNotificationCount({
                     notificationCount: 0,
                  });
                  // sessionStorage.setItem("notifCount", 0);
               }}
               style={{
                  cursor: "pointer",
                  marginRight: "18px",
                  position: "relative",
               }}
            >
               <img src="/assets/images/notificationicon.svg" alt="" />
               {this.props.notificationCount > 0 ? (
                  <div className="notif-dot flex-center">
                     {this.props.notificationCount < 100 ? this.props.notificationCount : "99+"}
                  </div>
               ) : null}
               {/* {this.state.notificationActivityCount > 0 ? (
            <div className="notif-dot flex-center">
              {this.state.notificationActivityCount < 100
                ? this.state.notificationActivityCount
                : "99+"}
            </div>
          ) : null} */}
            </li>
            <li onClick={() => this.clickSettings()} style={{ cursor: "pointer", marginRight: "15px" }}>
               <img src="/assets/images/Vector.svg" alt="" />
            </li>
         </>
      );

      let hospitalName = "";
      if (this.state.userCredentials && this.state.userCredentials.user) {
         const hospitalAffiliations = this.state.userCredentials.user.hospitalAffiliations;
         // hospitalName = this.state.userCredentials.user.hospitalName;
         hospitalName =
            hospitalAffiliations.all && hospitalAffiliations.all.length > 0 ? hospitalAffiliations.all[0] : "";
      }

      let profileImageUrl = `${process.env.REACT_APP_PROFILE_URL}/${userObj?.user?.uid}`;

      return (
         <>
            <header className="header-inner">
               <div className="ham-logo-wrapper">
                  {/* <Link className="main-logo" to="/"> */}
                  <a href="/">
                     <h1
                        className=""
                        // onClick={() => this.props.history.push("/", { searchText: "" })}
                     >
                        <img
                           onError={(e) => {
                              // e.target.src = "/assets/images/logo-new.svg";
                              e.target.src =
                                 "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                              e.target.alt = "";
                              let entpName = document.getElementById("entp-name");
                              entpName.style.opacity = "1";
                           }}
                           onLoad={(e) => {
                              let entpName = document.getElementById("entp-name");
                              entpName.style.display = "none";
                           }}
                           src={enterpriseImage}
                           alt={hospitalName}
                        />
                        <span id="entp-name" style={{ color: "black", opacity: "0" }} className="logo-text">
                           {hospitalName}
                        </span>
                     </h1>
                  </a>
                  {/* </Link> */}
                  {/* <div className="enterprice-name">{hospitalName}</div> */}
               </div>

               <div className="nav-wrapper">
                  {/*  && (visitEID === loginUserEID.user.enterpriseId)  */}
                  {/* {
                            getnavigationmore && getnavigationmore.match && getnavigationmore.match.params && getnavigationmore.match.params.mediatype &&
                                this.props.showMedia ?
                                <div className="share-btns share-centered">
                                    <div className={"share-btn " + this.state.media} onClick={() => this.changeScreen({ type: 'media' })} id="media">
                                        <button className="media-btn">Media</button>
                                    </div>
                                    <div className={"share-btn text " + this.state.text} onClick={() => this.changeScreen({ type: 'text' })} id="text">
                                        <button className="text-btn">Text</button>
                                    </div>
                                </div> : ''
                        } */}

                  <div className="navigation-menu profile-wrapper">
                     <ul>
                        {adminAction}
                        {/* {userObj && userObj.user && userObj.user && <li className="nav-item dropdown profile-dropdown">
                                <Link className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    {reverseString(userObj.user.displayName.match(/\b(\w)/g).join(''))}
                                </Link>
                                <div className="dropdown-menu bottom-bar" aria-labelledby="navbarDropdownMenuLink">
                                    <button className="dropdown-item">{userObj && userObj.user && userObj.user.displayName}</button>
                                    <button className="dropdown-item" onClick={() => swal({ title: i18n && i18n.header && i18n.header.confirmlogoutmsg, buttons: true, dangerMode: true }).then((willDelete) => { if (willDelete) { this.logout() } })}>{i18n && i18n.header && i18n.header.logoutlabel}</button>
                                </div>
                            </li>
                            } */}
                        <li
                           className="user-profile-menu"
                           role="button"
                           id="dropdownMenuLink"
                           data-toggle="dropdown"
                           aria-haspopup="true"
                           aria-expanded="false"
                        >
                           <span className="user-dp">
                              {/* <img src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260" alt="" width="35" height="35"></img> */}
                              <span
                                 className="go-text"
                                 href="#"
                                 aria-haspopup="true"
                                 aria-expanded="false"
                                 style={{ display: "none" }}
                              >
                                 {/* {this.state.userInitials} */}
                                 {userObj && userObj.user
                                    ? reverseString(
                                         userObj.user.displayName
                                            ?.match(/\b(\w)/g)
                                            .join("")
                                            .toUpperCase() || ""
                                      )
                                    : ""}{" "}
                              </span>
                              <span>
                                 <img
                                    src={profileImageUrl}
                                    alt=""
                                    onError={(e) => {
                                       e.target.parentElement.style.display = "none";
                                       document.querySelector(".go-text").style.display = "block";
                                    }}
                                    onLoad={(e) => {
                                       document.querySelector(".go-text").style.display = "none";
                                       e.target.parentElement.style.display = "block";
                                    }}
                                 />
                              </span>
                           </span>
                           <span className="user-name">
                              {/* {this.state.userFullName} */}
                              {userObj && userObj.user ? userObj.user.displayName : ""}
                           </span>
                        </li>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                           <Link
                              className="dropdown-item"
                              title="Logout"
                              onClick={() =>
                                 swal({
                                    title: i18n && i18n.header && i18n.header.confirmlogoutmsg,
                                    buttons: true,
                                    dangerMode: true,
                                 }).then((willDelete) => {
                                    if (willDelete) {
                                       this.logout();
                                    }
                                 })
                              }
                           >
                              Logout
                           </Link>
                        </div>
                     </ul>
                  </div>
               </div>
            </header>
            <em
               ref={(input) => (this.inputElement = input)}
               id="showConfirmModel"
               style={{ display: "none" }}
               data-toggle="modal"
               data-target="#confirmModal"
               aria-hidden="true"
            ></em>

            <div
               id="confirmModal"
               className="modal fade patient-edit-popup"
               data-keyboard="false"
               data-backdrop="static"
               role="dialog"
            >
               <div className="modal-dialog">
                  <div className="modal-content invite-patient-sec">
                     <div className="invite-patient-block">
                        <h3>You are logged in as {userObj && userObj.user ? userObj.user.displayName : ""}</h3>
                        <div className="general-btns-group invite-patient-btns">
                           <button
                              type="button"
                              style={{
                                 width: "100%",
                                 marginRight: "10px",
                                 fontSize: "1.5rem",
                              }}
                              className="btn btn-blue-block confirm-block"
                              data-dismiss="modal"
                              onClick={() => this.logout("yes")}
                           >
                              {i18n && i18n.buttontext && i18n.buttontext.switchUser}
                           </button>
                           <button
                              type="button"
                              style={{ width: "106%", fontSize: "1.5rem" }}
                              className="btn btn-blue-block confirm-block"
                              data-dismiss="modal"
                              onClick={() => this.continueWithCurentUser()}
                           >
                              {i18n && i18n.buttontext && i18n.buttontext.continueAs}{" "}
                              {userObj && userObj.user ? userObj.user.displayName : ""}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <em
               ref={(input) => (this.videoInput = input)}
               id="showVideoModel"
               style={{ display: "none" }}
               data-toggle="modal"
               data-target="#videoCallModal"
               aria-hidden="true"
            ></em>

            <div
               id="videoCallModal"
               className="modal fade patient-edit-popup"
               data-keyboard="false"
               data-backdrop="static"
               role="dialog"
            >
               <div className="modal-dialog">
                  <div className="modal-content invite-patient-sec" style={{ width: "auto" }}>
                     <div className="invite-patient-block">
                        <h3 id="videoNotificationMessage"></h3>
                        <div className="general-btns-group invite-patient-btns">
                           <button
                              type="button"
                              style={{
                                 width: "100%",
                                 marginRight: "10px",
                                 fontSize: "1.5rem",
                              }}
                              className="btn btn-blue-block confirm-block"
                              data-dismiss="modal"
                              onClick={() => this.joinVideoCall()}
                           >
                              Yes
                           </button>
                           <button
                              type="button"
                              style={{ width: "106%", fontSize: "1.5rem" }}
                              className="btn btn-blue-border confirm-block"
                              data-dismiss="modal"
                              onClick={() => this.closeVideoCallNotification()}
                           >
                              No
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            {this.props.invitePatientData.isInvitePatient ? (
               <InvitePatientView
                  obj={this.props.invitePatientData.dataObj}
                  profileTapped={(id) => {
                     if (this.props.location.pathname.includes("/patient/")) {
                        window.location.href = `/patient/${id}`;
                     } else {
                        this.props.history.push(`/patient/${id}`);
                     }
                     this.props.setInvitePatient({
                        invitePatientData: { isInvitePatient: false, dataObj: null },
                     });
                  }}
               />
            ) : null}
            {this.state.showNotificationPopup ? (
               <NotificationView
                  closeTapped={(e) => {
                     if (e.target.className === "notification-portal") {
                        this.setState({ showNotificationPopup: false });
                     }
                  }}
                  closeNotification={this.closeNotificationPopup}
               />
            ) : null}
         </>
      );
   }
}
const mapStateToProps = (state) => {
   return {
      data: state.auth,
      user: JSON.parse(state.auth.userCredentials || "{}")?.user,
      notificationCount: state.dashboardStates.notificationCount,
      invitePatientData: state.dashboardStates.invitePatientData,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         logout: actions.logout,
         setInvitePatient: dasboardActions.setInvitePatient,
         setNotificationCount: dasboardActions.setNotificationCount,
      },
      dispatch
   );
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
