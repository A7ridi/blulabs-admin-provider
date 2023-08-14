import React, { Component } from "react";
import * as firebase from "firebase/app";
import Apimanager from "../Apimanager/index";
import LoadingIndicator from "../common/LoadingIndicator";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../redux/actions/auth.action";
import "firebase/auth";
import "firebase/database";
import swal from "sweetalert";
import * as i18n from "../I18n/en.json";
import OtpInput from "react-otp-input";
import { store } from "../redux/store";
import axios from "axios";
import StatusView from "../components/StatusView/StatusView";
import * as Analytics from "../helper/AWSPinPoint";
import AddDetailsView from "../components/AddDetailsView/AddDetailsView";
import "../components/AddDetailsView/AddDetailsView.css";
import { getDepartmentList } from "../components/InvitePatientView/InvitePatientViewModel";
import Socket, { socketActions, socketSubActions } from "../helper/Websocket";
import { emailKey } from "./cookieKeys";
import defaultLogo from "../images/PBH.Vector 1.png";
import "./newpages/providerOnboard/container/onboard.css";
import { withRouter } from "react-router";
import { pendoIds } from "../Constants/pendoComponentIds/pendoConstants";
import { ShowAlert } from "../common/alert";
const OnboardContainer = React.lazy(() => import("./newpages/providerOnboard/container/onboardContainer"));

/**
 * firebase configuration
 * initalize firebase sdk
 */

var configure = {
   apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
   authDomain: process.env.REACT_APP_FIREBASEAUTHDOMAIN,
   storageBucket: process.env.REACT_APP_STORAGEBUCKET,
   projectId: process.env.REACT_APP_FIREBASEPROJECTID,
};

firebase.initializeApp(configure);

var isLoading = "";
if (localStorage.getItem("redirect") === "yes") {
   isLoading = true;
}

//const citiesRef = firebase.firestore().collection('activities').get();

//console.log("citiesRef", citiesRef)

localStorage.setItem("firstTime", "yes");

//eslint-disable-next-line
var email_regex = new RegExp(
   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

var htreferrer = null;

class NorthwellSamlLogin extends Component {
   constructor(props) {
      super(props);

      let setemail = emailKey;
      try {
         if (!email_regex.test(setemail)) {
            setemail = null;
         }
      } catch (error) {}

      this.state = {
         loading: true,
         redirectBy: false,
         email: setemail,
         emailMessage: "",
         enablePassword: false,
         password: "",
         resolverData: [],
         mutiPhoneData: [],

         displayName: "",

         otp: "",
         otpSend: false,
         user: "",
         message: "",
         successMessage: true,
         otpVerification: false,
         wrongPassword: false,
         loginThirtyDays: false,
         enableForgotPassword: false,
         showDetails: false,

         statusMessage: null,
         statusType: null,

         emailError: null,
         showPassword: false,

         customObject: null,

         northwellUserDetails: null,

         userId: null,
         newLoading: false,
         enterKey: false,
      };

      window.addEventListener(
         "message",
         (event) => {
            htreferrer = document.referrer;

            // var httpReferrer = null;
            // if (
            //   localStorage.getItem("referrer") === undefined ||
            //   localStorage.getItem("referrer") === null
            // ) {
            //   localStorage.setItem("referrer", htreferrer);

            //   httpReferrer = localStorage.getItem("referrer");
            // } else {
            //   httpReferrer = localStorage.getItem("referrer");
            // }
            let eventData = null;
            if (
               event.data.key === "dataKey" &&
               // httpReferrer === process.env.REACT_APP_SUPERADMINURL //old
               htreferrer === process.env.REACT_APP_SUPERADMINURL
            ) {
               eventData = event.data;
               let queryData = JSON.parse(eventData.data);
               // queryData = { ...queryData, httpReferrer }; // old
               queryData = { ...queryData, htreferrer };
               queryData = JSON.stringify(queryData);

               var bodyFormData = {
                  grant_type: "refresh_token",
                  refresh_token: event.data.refreshToken,
               };

               axios({
                  method: "post",
                  url: `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASEAPIKEY}`,
                  data: bodyFormData,
                  config: { headers: { "Content-Type": "multipart/form-data" } },
               }).then((response) => {
                  var stsTokenManager = {
                     apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
                     refreshToken: response.data.refresh_token,
                     accessToken: response.data.access_token,
                     expirationTime: response.data.expires_in,
                  };
                  let edata = JSON.parse(eventData.data);
                  edata.user["stsTokenManager"] = stsTokenManager;
                  localStorage.setItem("enterpriseId", event.data.enterpriseId);
                  // localStorage.setItem("referrer", htreferrer);
                  localStorage.setItem("login", "yes");
                  // sessionStorage.setItem("Login", "yes");
                  localStorage.setItem("redirected", "yes");
                  localStorage.setItem("firstTime", "yes");
                  // localStorage.setItem("continueWithCurrent", "yes");
                  // localStorage.setItem("userCheckKeepLogin", "no");
                  eventData.data = JSON.stringify(edata);
                  store.dispatch(actions.savenorthwelluserobj(eventData.northwelluser));
                  store.dispatch(actions.saveusercredentials(queryData));
                  window.location = `/patient/${eventData.patientId}`;
                  // store.dispatch(
                  //   actions.savenorthwelluserobj(JSON.stringify(eventData.data))
                  // );
               });
               // .catch((new_error) => {
               //   sessionStorage.clear();
               //   localStorage.clear();
               //   store.dispatch(actions.logout());
               //   window.location.replace("/login");
               // });
            }
         },
         false
      );

      // this.socket = new Socket();
   }

   componentWillMount() {
      if (localStorage.getItem("redirected") === "yes") {
         this.props.history.push("/");
         return;
      }

      if (localStorage.getItem("loginSystem") === "northwell") {
         this.handleLoad();
      }

      if (localStorage.getItem("login") === "yes") {
         this.props.history.push("/");
      }

      // if (localStorage.getItem("firstTime") !== "yes") {
      //    window.location.reload(true);
      // }
   }

   componentDidMount() {
      if (localStorage.getItem("switchUser") === "yes") {
         this.getNorthwelluser();
      } else {
         // sessionStorage.clear();
         // // this.firebase.auth().signOut();
         // firebase.auth().signOut();
         // localStorage.clear();
         // indexedDB.deleteDatabase("firebaseLocalStorageDb");
      }
      // {
      //    this.state.newLoading &&
      window.addEventListener(
         "keypress",
         function (event) {
            if (event.keyCode === 13 && event.key === "Enter" && this.state.enterKey) {
               if (email_regex.test(String(this.state.email).toLowerCase())) {
                  if (this.state.otpSend) {
                     this.nextToLogin();
                  } else if (this.state.enablePassword) {
                     this.continueToNextLogin();
                  } else {
                     this.continueToLogin();
                  }
               }
            }
         }.bind(this)
      );
      // }
   }

   componentWillUnmount() {
      this.removeSocketConnection();
   }

   removeSocketConnection() {
      if (this.socket && this.socket.socket) {
         this.socket.socket.close();
      }
   }

   handleLoad = () => {
      firebase
         .auth()
         .getRedirectResult()
         .then((result) => {
            localStorage.removeItem("firstTime");

            this.setState({
               redirectBy: true,
            });
            if (result.credential) {
               this.props.pbcsamllogindone();
               this.firebasegetRedirectResult();
            } else {
               localStorage.removeItem("loginSystem");
               // swal("Something went wrong!", "This credentials", "error");
               // showSwal("Something went wrong!");
               isLoading = false;
               this.setState({
                  loading: false,
               });
            }
            // The signed-in user info0.
         })
         .catch((error) => {
            // Handle Errors here.
            var errorCode = error.code;
            isLoading = false;
            this.setState({
               loading: false,
            });
            localStorage.removeItem("redirect");
            swal("Something went wrong!", error.message, "error");
            // The email of the user's account used.
            //var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            //var credential = error.credential;
            // [START_EXCLUDE]
            if (errorCode === "auth/account-exists-with-different-credential") {
               swal(
                  "Something went wrong!",
                  "You have already signed up with a different auth provider for that email.",
                  "error"
               );
               // If you are using multiple auth providers on your app you should handle linking
               // the user's accounts here.
            } else {
               console.error(error);
            }
            // [END_EXCLUDE]
         });
      //eslint-disable-next-line
      if (typeof this.state.redirectBy === false) {
         firebase.auth().onAuthStateChanged((result) => {
            if (result && result.stsTokenManager && result.stsTokenManager !== null) {
            } else {
               this.setState({
                  loading: false,
               });
            }
         });
      }
   };

   updateTextData = (params) => {
      Apimanager.updateProviderProfile(params, (success) => {
         firebase
            .auth()
            .currentUser.updateProfile({
               displayName: params.firstname + " " + params.lastname,
            })
            .then((success) => {
               // let firebaseUsr = { user: firebase.auth().currentUser };
               let nuser = JSON.parse(this.props.northwelluser).user;
               var accesstoken = nuser?.stsTokenManager?.accessToken || "";
               Apimanager.customtoken(
                  accesstoken,
                  (success) => {
                     let token = success?.data?.data?.customToken || null;
                     firebase
                        .auth()
                        .signInWithCustomToken(token)
                        .then((storeDataRedux) => {
                           this.storeDataRedux(storeDataRedux, success.data.data);
                        })
                        .catch((error) => {
                           localStorage.removeItem("redirect");

                           swal("Something went wrong!", error.message, "error");
                           this.setState({ isLoading: false });
                           isLoading = false;
                        });
                  },
                  (error) => {
                     console.log("customtoken_error", error);
                  }
               );
               // this.storeDataRedux(firebaseUsr, this.state.customObject);
            })
            .catch((error) => {
               this.setState({ isloading: false, message: error.message });
            });
      });
   };

   /**
    * create custom token from rest api
    * using custom token
    */
   getCustomtoken(northwelluser) {
      // var northwelluser = localStorage.getItem('northwelluser')
      // northwelluser = JSON.parse(northwelluser)

      //var navigatorObject = window.navigator

      window.this = this;
      if (northwelluser) {
         var accesstoken =
            northwelluser.stsTokenManager && northwelluser.stsTokenManager.accessToken
               ? northwelluser.stsTokenManager.accessToken
               : "";
         Apimanager.customtoken(
            accesstoken,
            (success) => {
               if (success.data) {
                  if (success && success.data && success.data.data && success.data.data.customToken) {
                     var token = success.data.data.customToken;

                     firebase
                        .auth()
                        .signInWithCustomToken(token)
                        .then((storeDataRedux) => {
                           let usr = success.data.data.user.providerData;
                           if (usr.title && usr.title !== "" && usr.degree && usr.degree !== "") {
                              this.storeDataRedux(storeDataRedux, success.data.data);
                           } else {
                              this.storeDataRedux(storeDataRedux, success.data.data);
                              this.props.history.push("/");
                              localStorage.removeItem("loginSystem");
                           }
                        })
                        .catch((error) => {
                           localStorage.removeItem("redirect");
                           localStorage.removeItem("loginSystem");
                           localStorage.removeItem("provEmail");
                           localStorage.removeItem("providerKey");
                           swal("Something went wrong!", error.message, "error");
                           this.setState({
                              isLoading: false,
                           });
                           isLoading = false;
                        });
                  }
               }
            },
            (error) => {
               localStorage.removeItem("redirect");
               localStorage.removeItem("loginSystem");
               localStorage.removeItem("provEmail");
               localStorage.removeItem("providerKey");
               this.setState({
                  loading: false,
                  isLoading: false,
                  newLoading: false,
               });
               isLoading = false;
            }
         );
      }
   }

   sendOtp(resendOtp = false) {
      this.setState({
         loading: true,
         newLoading: true,
         message: "",
         statusMessage: null,
         statusType: null,
      });
      let str = {
         action: socketActions.auth,
         subAction: socketSubActions.validateProvider,
         emailId: this.state.email,
         password: this.state.password,
      };
      window.socket.send(str, (result) => {
         const otpMessage = result?.settings?.message || "Something went wrong";
         if (result.settings?.status === 1) {
            localStorage.setItem("redirected", "yes");
            let mobile = result.data?.mobileNo;
            if (mobile === null || mobile?.length !== 12) {
               sessionStorage.setItem("enableMobAuth", true);
               let creds = JSON.stringify({
                  email: this.state.email,
                  password: this.state.password,
               });
               this.props.history.push(`/reset-password?data=${btoa(creds)}`);
               return;
            }
            let number = mobile?.replace(mobile?.substring(0, 8), "+*******");
            let message = mobile;
            this.setState({
               userId: result.data.userId,
               otpSend: true,
               loading: false,
               message: message,
               newLoading: false,
            });
            if (resendOtp) ShowAlert(otpMessage);
         } else {
            this.setState({
               wrongPassword: true,
               loading: false,
               newLoading: false,
               statusMessage: otpMessage,
               statusType: "error",
            });
         }
      });
   }

   getToken() {
      let str2 = {
         action: socketActions.auth,
         subAction: socketSubActions.verifyProviderOTP,
         enteredOtp: this.state.otp,
         userId: this.state.userId,
      };
      window.socket.send(str2, (data) => {
         if (data.settings?.status === 1) {
            firebase
               .auth()
               .signInWithCustomToken(data.data.customToken)
               .then((storeDataRedux) => {
                  let userData = { user: data.data.userData };
                  this.storeDataRedux(storeDataRedux, userData, !data.data?.providerDetails);
                  localStorage.removeItem("providerLogin");
                  localStorage.removeItem("provEmail");
                  localStorage.removeItem("providerKey");
               })
               .catch((error) => {
                  localStorage.removeItem("redirect");
                  swal("Something went wrong!", error.message, "error");
                  this.setState({ isLoading: false });
                  isLoading = false;
               });
         } else {
            isLoading = false;
            this.setState({
               loading: false,
               isLoading: false,
               newLoading: false,
               statusMessage: data?.settings?.message,
               successMessage: false,
            });
         }
      });
   }

   storeDataRedux = (firebaseUser, data, goToDetails = false) => {
      // *** New changes begin ***
      // window.customUserObj = data;
      // window.firebaseUserObj = JSON.parse(JSON.stringify(firebaseUser));
      // *** New changes end ***

      const providerLogin = localStorage.getItem("providerLogin") === "true";

      this.setState({ customObject: data });
      this.props.savenorthwelluserobj(JSON.parse(JSON.stringify(firebaseUser)));
      this.props.saveusercredentials(data);
      if (goToDetails) {
         if (providerLogin) {
            this.props.history.push("/");
            localStorage.removeItem("providerLogin");
            localStorage.removeItem("provEmail");
            localStorage.removeItem("providerKey");
         } else {
            sessionStorage.setItem("enableDetailsPage", true);
            this.props.history.push("/details");
         }
      } else {
         window.history.replaceState(null, null, "/");
         localStorage.setItem("login", "yes");
         // setTimeout(function () {
         //    window.this.myFunction();
         // }, 8000);
         this.updateUserDevice(data);
      }
   };

   updateUserDevice = (data) => {
      // get browser name

      var navigator = window.navigator;

      //var nVer = navigator.appVersion;
      var nAgt = navigator.userAgent;
      var browserName = navigator.appName;
      var fullVersion = "" + parseFloat(navigator.appVersion);
      var majorVersion = parseInt(navigator.appVersion, 10);
      var nameOffset, verOffset, ix;

      // In Opera, the true version is after "Opera" or after "Version"
      if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
         browserName = "Opera";
         fullVersion = nAgt.substring(verOffset + 6);
         if ((verOffset = nAgt.indexOf("Version")) !== -1) fullVersion = nAgt.substring(verOffset + 8);
      }
      // In MSIE, the true version is after "MSIE" in userAgent
      else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
         browserName = "Microsoft Internet Explorer";
         fullVersion = nAgt.substring(verOffset + 5);
      }
      // In Chrome, the true version is after "Chrome"
      else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
         browserName = "Chrome";
         fullVersion = nAgt.substring(verOffset + 7);
      }
      // In Safari, the true version is after "Safari" or after "Version"
      else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
         browserName = "Safari";
         fullVersion = nAgt.substring(verOffset + 7);
         if ((verOffset = nAgt.indexOf("Version")) !== -1) fullVersion = nAgt.substring(verOffset + 8);
      }
      // In Firefox, the true version is after "Firefox"
      else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
         browserName = "Firefox";
         fullVersion = nAgt.substring(verOffset + 8);
      }
      // In most other browsers, "name/version" is at the end of userAgent
      else if ((nameOffset = nAgt.lastIndexOf(" ") + 1) < (verOffset = nAgt.lastIndexOf("/"))) {
         browserName = nAgt.substring(nameOffset, verOffset);
         fullVersion = nAgt.substring(verOffset + 1);
         if (browserName.toLowerCase() === browserName.toUpperCase()) {
            browserName = navigator.appName;
         }
      }
      // trim the fullVersion string at semicolon/space if present
      if ((ix = fullVersion.indexOf(";")) !== -1) fullVersion = fullVersion.substring(0, ix);
      if ((ix = fullVersion.indexOf(" ")) !== -1) fullVersion = fullVersion.substring(0, ix);

      majorVersion = parseInt("" + fullVersion, 10);
      if (isNaN(majorVersion)) {
         fullVersion = "" + parseFloat(navigator.appVersion);
         //majorVersion = parseInt(navigator.appVersion, 10);
      }

      var platform = navigator.platform;
      var macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"];
      var windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
      var iosPlatforms = ["iPhone", "iPad", "iPod"];
      var os = null;

      if (macosPlatforms.indexOf(platform) !== -1) {
         os = "Mac OS";
      } else if (iosPlatforms.indexOf(platform) !== -1) {
         os = "iOS";
      } else if (windowsPlatforms.indexOf(platform) !== -1) {
         os = "Windows";
      } else if (/Android/.test(navigator.userAgent)) {
         os = "Android";
      } else if (!os && /Linux/.test(platform)) {
         os = "Linux";
      }

      let deviceParam = {
         userId: data.user.id,
         uuid: navigator.userAgent,
         manufacturer: os,
         device: browserName,
         userRole: data.user.role,
         os: fullVersion,
         screenSize: window.screen.width + "x" + window.screen.height,
         loginDuration: localStorage.getItem("loginThirtyDays") === "yes" ? true : false,
      };

      // if (localStorage.getItem("loginThirtyDays") !== "yes") {
      //     sessionStorage.setItem("sessionLogin", "no")
      // } else {
      //     sessionStorage.setItem("sessionLogin", "yes")
      // }

      // sessionStorage.setItem("Login", "yes");

      // let deviceParam = ''
      Apimanager.postUserDevice(
         deviceParam,
         (success) => {
            localStorage.removeItem("loginThirtyDays");
            this.props.history.push("/");
            let details = this.state.customObject.user;
            Analytics.record(
               {
                  name: details.name,
                  email: details.email,
                  mobile: details.mobileNo,
                  UserID: details.id,
                  isProvider: "true",
               },
               details.id,
               Analytics.EventType.signIn
            );
         },
         (error) => {
            //console.log("customtoken_error", error)
            //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
         }
      );
   };

   firebasegetRedirectResult = async () => {
      await firebase.auth().onAuthStateChanged((result) => {
         result = JSON.stringify(result);
         result = JSON.parse(result);
         const login = localStorage.getItem("login") === "yes" || false;

         if (result && result.stsTokenManager && result.stsTokenManager !== null && !login) {
            //document.getElementById("msg").innerHTML = 'Login successfully. Redirecting to app...';
            this.getCustomtoken(result);
            // localStorage.removeItem("loginSystem");
         } else {
            //swal("Server Error", "Something went wrong! Please try again later.", "error")
            console.log("redirect_error");
            isLoading = false;
         }
      });
   };

   getNorthwelluser = () => {
      indexedDB.deleteDatabase("firebaseLocalStorageDb");
      this.login();
   };

   login() {
      localStorage.removeItem("switchUser");
      localStorage.setItem("redirect", "yes");

      if (this.state.loginThirtyDays) {
         localStorage.setItem("loginThirtyDays", "yes");
      } else {
         localStorage.setItem("loginThirtyDays", "no");
      }

      const provider = new firebase.auth.SAMLAuthProvider(process.env.REACT_APP_FIREBASEAUTHPROVIDER);
      firebase
         .auth()
         .signInWithRedirect(provider)
         .then((res) => {
            console.log("SAMLAuthProvider success", JSON.stringify(res, null, 4));
         })
         .catch((error) => {
            console.log("SAMLAuthProvider error", JSON.stringify(error, null, 4));
         });
   }

   deleteAllCookies() {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
         var cookie = cookies[i];
         var eqPos = cookie.indexOf("=");
         var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
         document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
   }

   handleChange = (e) => {
      this.setState({
         email: e.target.value,
         emailError: null,
      });
   };

   continueToLogin = () => {
      let queryparams = {
         email: this.state.email,
      };

      isLoading = true;
      this.setState({
         loading: true,
         newLoading: true,
         statusMessage: null,
         statusType: null,
      });
      Apimanager.customLogin(
         queryparams,
         (success) => {
            if (
               success &&
               success.data &&
               success.data.data &&
               success.data.data.loginSystem &&
               success.data.data.loginSystem === "Northwell"
            ) {
               this.getNorthwelluser();
            } else {
               this.setState({
                  displayName: success?.data?.data?.displayName || "",
                  enablePassword: true,
                  loading: false,
                  newLoading: false,
                  statusMessage: null,
                  statusType: null,
               });

               if (this.state.loginThirtyDays) {
                  localStorage.setItem("loginThirtyDays", "yes");
               } else {
                  localStorage.setItem("loginThirtyDays", "no");
               }
            }
            //this.sweetAlertbar(mrnsearchResult.firstName)
         },
         (error) => {
            if (error.status === 404) {
               this.setState({
                  enablePassword: false,
                  loading: false,
                  newLoading: false,
                  statusMessage: error.data.settings.message,
                  statusType: "error",
               });
               // swal("Something went wrong!", error.data.settings.message, "error");
            } else {
               swal("Something went wrong!", error.data.settings.message, "error");
               isLoading = false;
               this.setState({
                  loading: false,
                  newLoading: false,
               });
            }
         }
      );
   };

   handleChangePassword = (e) => {
      this.setState({
         password: e.target.value,
      });
   };

   continueToNextLogin = () => {
      if (this.state.password.length === 0) {
         this.setState({
            loading: false,
            newLoading: false,
            statusMessage: "Please enter password",
            statusType: "error",
         });
      } else {
         this.setState({
            loading: true,
            newLoading: true,
            message: "",
         });
         this.sendOtp();
      }

      // window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      //   "recaptcha-container",
      //   {
      //     size: "invisible",
      //   }
      // );

      // firebase
      //   .auth()
      //   .signInWithEmailAndPassword(this.state.email, this.state.password)
      //   .then((userCredential) => {
      //     sessionStorage.setItem("enableMobAuth", true);
      //     let creds = JSON.stringify({
      //       email: this.state.email,
      //       password: this.state.password,
      //     });
      //     this.props.history.push(`/reset-password?data=${btoa(creds)}`);
      //   })
      //   .catch((error) => {
      //     if (error.code === "auth/multi-factor-auth-required") {
      //       window.resolver = error.resolver;
      //       //window.localStorage.setItem('resolver', JSON.stringify(error.resolver));
      //       this.setState({
      //         resolverData: window.resolver,
      //         loading: false,
      //         wrongPassword: false,
      //       });

      //       if (window.resolver.hints.length === 1) {
      //         this.selectPhoneNumber(0);
      //       }
      //     } else {
      //       this.setState({
      //         wrongPassword: true,
      //         loading: false,
      //         statusMessage: error.message,
      //         statusType: "error",
      //         message: error.message,
      //       });
      //     }
      //   });
   };

   selectPhoneNumber = (selectedIndex) => {
      this.setState({
         loading: true,
         newLoading: true,
         wrongPassword: false,
         statusMessage: null,
         successType: null,
      });

      if (this.state.resolverData.hints[selectedIndex].factorId === firebase.auth.PhoneMultiFactorGenerator.FACTOR_ID) {
         window.selectedIndex = selectedIndex;
         //window.localStorage.setItem('selectedIndex', selectedIndex);

         var phoneInfoOptions = {
            multiFactorHint: this.state.resolverData.hints[selectedIndex],
            session: this.state.resolverData.session,
         };

         var phoneAuthProvider = new firebase.auth.PhoneAuthProvider();

         phoneAuthProvider
            .verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier)
            .then((verificationId) => {
               // Ask user for the SMS verification code.
               //window.localStorage.setItem('verificationId', verificationId);

               window.verificationId = verificationId;

               //window.location.href = "/otp_verification"
               let msg = "Sent to your mobile no ending in " + window.resolver.hints[selectedIndex].phoneNumber;
               // let msg = "We send you a text on phone ending in " +
               // window.resolver.hints[selectedIndex].phoneNumber +
               // ". Please enter the code below",
               this.setState({
                  loading: false,
                  otpSend: true,
                  message: msg,
                  successMessage: true,
                  newLoading: false,
               });
            })
            .catch((error) => {
               this.setState({
                  loading: false,
                  statusMessage: error.message,
                  statusType: "error",
                  newLoading: false,
               });
               //swal("Something went wrong!", error.message, "error");
            });
      }
   };

   handleOTP = (otp) => {
      this.setState({ otp: otp });
   };

   nextToLogin = () => {
      // Turn off phone auth app verification.
      let { otp } = this.state;
      this.getToken();

      this.setState({
         otp: "",
         loading: true,
         newLoading: true,
         message: null,
      });
      // var cred = firebase.auth.PhoneAuthProvider.credential(
      //   window.verificationId,
      //   otp
      // );
      // var multiFactorAssertion =
      //   firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
      // window.resolver
      //   .resolveSignIn(multiFactorAssertion)
      //   .then((user) => {
      //     this.setState({
      //       user: user,
      //       statusMessage:
      //         i18n && i18n.successMessage && i18n.successMessage.otpVerification,
      //       message:
      //         i18n && i18n.successMessage && i18n.successMessage.otpVerification,
      //       successMessage: true,
      //       otpVerification: true,
      //       loading: false,
      //     });

      //     let queryparams = {
      //       email: this.state.email,
      //       firebaseId: user.user.uid,
      //     };

      //     Apimanager.postValidateProvider(
      //       queryparams,
      //       (success) => {
      //         let customObject = {
      //           settings: success.data.settings,
      //           customToken: "",
      //           user: success.data.data,
      //         };

      //         this.storeDataRedux(this.state.user, customObject);
      //       },
      //       (error) => {
      //         if (error.status === 404) {
      //           this.setState({
      //             enablePassword: false,
      //             loading: false,
      //           });
      //           swal("Something went wrong!", error.message, "error");
      //         } else {
      //           swal("Something went wrong!", error.message, "error");
      //           isLoading = false;
      //           this.setState({
      //             loading: false,
      //           });
      //         }
      //       }
      //     );
      //   })
      //   .catch((error) => {
      //     this.setState({
      //       successMessage: false,
      //       statusMessage: error.message,
      //       statusType: "error",
      //       loading: false,
      //     });
      //     //swal("Something went wrong!", error.message, "error");
      //     console.log("selectphone", error);
      //   });
   };

   // reSendOTP = () => {
   //   this.setState({
   //     loading: true,
   //     message: false,
   //     successMessage: false,
   //   });
   //   window.recaptchaVerifier.render().then(function (widgetId) {
   //     window.recaptchaVerifier.reset(widgetId);
   //   });
   //   this.selectPhoneNumber(window.selectedIndex);
   // };

   backToEmail = () => {
      window.location.reload();
   };

   keepLogin = (flag) => {
      this.setState((prevState) => ({
         loginThirtyDays: flag,
      }));
   };

   resetPassword = () => {
      this.setState({ loading: true, statusMessage: null, statusType: null });
      var auth = firebase.auth();
      var emailAddress = this.state.email;
      let $this = this;
      auth
         .sendPasswordResetEmail(emailAddress)
         .then(function () {
            // Email sent.
            // swal({
            //   title: "Recovery link sent.",
            //   text:
            //     "Please follow instructions in your email to reset your password.",
            //   icon: "success",
            //   dangerMode: false,
            // });
            $this.setState({
               loading: false,
               statusMessage: "Recovery link sent. Please follow instructions in your email to reset your password.",
               statusType: "success",
               enablePassword: true,
               enableForgotPassword: false,
               newLoading: false,
            });
         })
         .catch(function (error) {
            // An error happened.
            // swal({
            //   title: "OOPS!",
            //   text: "Something went wrong. Try again.",
            //   icon: "error",
            //   dangerMode: true,
            // });

            $this.setState({
               loading: false,
               statusMessage: error.message,
               statusType: "error",
               newLoading: false,
            });
         });
   };

   render() {
      let { otp } = this.state;
      let otpLength = otp.toString().length;

      let loginContent = (
         <>
            {/* <div className="login-content">
               <img src={defaultLogo} alt="" />
               <div className="login-box">
                  <h3>
                     {i18n && i18n.login && i18n.login.samltext}
                     <br />
                     <p>Continue to Playback for Providers</p>
                  </h3>
                  {this.state.statusMessage ? (
                     <StatusView
                        message={this.state.statusMessage}
                        type={this.state.statusType}
                        closeTapped={() => this.setState({ statusMessage: null, statusType: null })}
                     />
                  ) : null}
                  <div className="form-group">
                     <input
                        value={this.state.email}
                        autoComplete="off"
                        autoFocus
                        className="login-input"
                        placeholder="Enter your e-mail"
                        onChange={this.handleChange}
                        type="email"
                        name="searchmrn"
                     />
                  </div>
                  <div className="custom-checkbox form-group">
                     <input
                        type="checkbox"
                        id="remember"
                        onChange={() => this.keepLogin(!this.state.loginThirtyDays)}
                     />
                     <label htmlFor="remember">Remember me</label>
                  </div>
                  <button
                     className="btn btn-blue-block"
                     disabled={email_regex.test(String(this.state.email).toLowerCase()) ? false : true}
                     onClick={() => this.continueToLogin()}
                  >
                     Next
                  </button>
               </div>
            </div> */}
            <OnboardContainer
               setEnablePassword={(email) => this.setState({ enablePassword: true, email: email })}
               setNewLoading={() => this.setState({ newLoading: false, enterKey: true })}
               northwellLogin={() => this.getNorthwelluser()}
            />
         </>
      );

      if (this.state.enablePassword) {
         loginContent = (
            <div className="login-provider-wrapper">
               <div className="login-content">
                  <img src={defaultLogo} alt="" />
                  <div className="login-box-container">
                     <h3 style={{ fontSize: "26px", fontWeight: "bold" }}>
                        {/* Hi {this.state.displayName} */}
                        Welcome back
                        <br />
                        <label id="email-label">{this.state.email}</label>
                     </h3>
                     {this.state.statusMessage ? (
                        <div style={{ marginBottom: "-2.5rem", marginTop: "-2rem" }}>
                           <StatusView
                              message={this.state.statusMessage}
                              type={this.state.statusType}
                              showCloseButton={false}
                              actionText="OK"
                              actionTapped={() => this.setState({ statusMessage: null })}
                           />
                        </div>
                     ) : null}
                     {/* <div className="form-group"><input autoComplete="off" value={this.state.email} className="login-input" placeholder="Please enter email" onChange={this.handleChange} type="email" name='searchmrn' /></div> */}
                     <div id="password-form-group" className="form-group" style={{ width: "423px" }}>
                        <input
                           id={pendoIds.inputFieldProviderPassword}
                           autoComplete="off"
                           autoFocus
                           className="login-input"
                           placeholder="Please enter password"
                           onChange={this.handleChangePassword}
                           type={this.state.showPassword ? "text" : "password"}
                           value={this.state.password}
                           name="searchmrn"
                        />
                        <img
                           id="password-visibility-image"
                           src={`/assets/images/${this.state.showPassword ? "password-show.png" : "password-hide.png"}`}
                           alt=""
                           onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                        />
                     </div>
                     <div className="row justify-content-center">
                        <div className="col">
                           <button
                              id={pendoIds.btnSignInProviderPassword}
                              className="btn btn-blue-block"
                              onClick={() => this.continueToNextLogin()}
                           >
                              {i18n && i18n.login && i18n.login.samltext}
                           </button>
                           <div className="row justify-content-center">
                              {/* <button
                 className="forgot-btn col-4"
                 onClick={() => this.backToEmail()}
               >
                 Back to Email
               </button> */}
                              <button
                                 id={pendoIds.btnForgotProviderPassword}
                                 className="forgot-btn col-6"
                                 style={{ color: "#FF567A" }}
                                 onClick={() =>
                                    this.setState({
                                       enableForgotPassword: true,
                                       statusMessage: null,
                                       statusType: null,
                                    })
                                 }
                              >
                                 Forgot Password?
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         );
      }

      if (this.state.enableForgotPassword) {
         loginContent = (
            <div className="login-provider-wrapper">
               <div className="login-content">
                  <img src={defaultLogo} alt="" />
                  <div className="login-box-container">
                     <h3>{i18n && i18n.header && i18n.header.forgotPasswordTitle}</h3>
                     {this.state.statusMessage ? (
                        <StatusView
                           message={this.state.message}
                           type={this.state.statusType}
                           closeTapped={() => this.setState({ statusMessage: null })}
                        />
                     ) : (
                        <label className="password-reset-label message-label">
                           Enter the email address, we’ll send you instructions to reset your password.
                        </label>
                     )}
                     <div className="form-group">
                        <input
                           value={this.state.email}
                           disabled
                           className="login-input"
                           placeholder="Enter your e-mail"
                           onChange={this.handleChange}
                           type="email"
                           name="searchmrn"
                        />
                     </div>
                     <div className="row d-flex justify-content-center">
                        <button
                           id="password-reset-button"
                           className="btn btn-blue-block"
                           disabled={!email_regex.test(String(this.state.email).toLowerCase())}
                           onClick={this.resetPassword}
                        >
                           {i18n && i18n.buttontext && i18n.buttontext.passwordRequest}
                        </button>
                        <button id={pendoIds.btnProviderBacktoSignIn} className="forgot-btn" onClick={this.backToEmail}>
                           Back to Sign in
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         );
      }

      if (this.state.resolverData && this.state.resolverData.hints && this.state.resolverData.hints.length > 1) {
         let number = this.state.resolverData.hints.map((list, index) => {
            return (
               <div className="login-provider-wrapper">
                  <img src={defaultLogo} alt="" />
                  <div key={index} className="form-group">
                     <input
                        style={{ cursor: "pointer" }}
                        disbaled="true"
                        className="login-input"
                        type="input"
                        value={list.phoneNumber}
                        onClick={() => this.selectPhoneNumber(index)}
                     />
                  </div>
               </div>
            );
         });

         loginContent = (
            <div className="login-provider-wrapper">
               <div className="login-box">
                  <h3>Playback Health</h3>
                  <h5 className="opt-success-message">Please select at least one phone number</h5>
                  {number}
               </div>
            </div>
         );
      }

      if (this.state.otpSend) {
         loginContent = (
            <>
               <div className="login-provider-wrapper">
                  <div className="login-content">
                     <img src={defaultLogo} alt="" />
                     <div className="login-box-container">
                        {!this.state.otpVerification ? (
                           <h3 style={{ fontSize: "26px", fontWeight: "bold", lineHeight: "41px" }}>
                              Please enter the code sent to <br />
                              {this.state?.message?.substring(2).replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                           </h3>
                        ) : null}
                        {/* <h5 className={
                              this.state.successMessage
                                 ? "opt-success-message"
                                 : "opt-error-message"
                           }
                           >
                           {this.state.message}
                           </h5> */}
                        {this.state.statusMessage ? (
                           <StatusView
                              message={this.state.statusMessage}
                              type={this.state.successMessage ? "success" : "error"}
                              showCloseButton={false}
                           />
                        ) : null}
                        {this.state.otpVerification ? (
                           ""
                        ) : (
                           <>
                              <div className="form-group otp-center" id={pendoIds.inputProviderLoginOtp}>
                                 <OtpInput
                                    inputStyle="form-control otp-input"
                                    numInputs={6}
                                    separator={<span className="otp-span">-</span>}
                                    onChange={(otp) => this.handleOTP(otp)}
                                    otpType="number"
                                    value={otp}
                                    autoFocus
                                 />
                              </div>
                              <div style={{ marginLeft: "26.5%" }}>
                                 <div className="did-not-get flex-center" style={{ justifyContent: "flex-end" }}>
                                    {" "}
                                    Didn’t get code yet?{" "}
                                    <div className="resend-box flex-center">
                                       <button
                                          className="resend-link"
                                          id="resend-otp-email"
                                          onClick={() => this.sendOtp(true)}
                                       >
                                          {i18n && i18n.login && i18n.buttontext.resendOTP}
                                       </button>
                                    </div>
                                 </div>
                              </div>
                              <div className="row justify-content-center">
                                 <div>
                                    <button
                                       id={pendoIds.btnContinueProviderLogin}
                                       disabled={otpLength === 6 ? false : true}
                                       className="btn btn-blue-block"
                                       onClick={() => this.nextToLogin()}
                                    >
                                       {i18n && i18n.login && i18n.buttontext.continue}
                                    </button>
                                 </div>

                                 {/* <div className="col-6">
                                 <button
                                    className="btn login-btn back-to-email"
                                    onClick={() => this.backToEmail()}
                                 >
                                    Back To Email
                                 </button>
                                 </div> */}
                              </div>
                           </>
                        )}
                     </div>
                  </div>
               </div>
            </>
         );
      }

      const isNorthwellLogin = localStorage.getItem("loginSystem") === "northwell" || false;

      return (
         <div className="App" style={{ flex: 1 }}>
            {/* login-btn-wrapper */}
            <div>
               <div id="recaptcha-container"></div>
               {this.state.newLoading || isNorthwellLogin ? (
                  <div className="login-provider-wrapper">
                     <LoadingIndicator />
                  </div>
               ) : (
                  loginContent
               )}
            </div>
         </div>
      );
   }
}
const mapStateToProps = (state) => {
   return {
      IsPBCSamlLoginDone: state.auth.isPBCSamlLoginDone,
      northwelluser: state.auth.northwelluser,
      featureFlags: state.launchdarkly.ldFeatureFlags,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         pbcsamllogindone: actions.pbcsamllogindone,
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NorthwellSamlLogin));
