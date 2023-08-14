import { store } from "../redux/store";
import axios from "axios";
import * as actions from "../redux/actions/auth.action";
// import {renewToken} from "../Apimanager/Networking"

export const socketActions = {
   auth: "auth",
   referral: "referral",
   northwell: "northwell",
   onboarding: "onboarding",
};
export const socketSubActions = {
   referralDocument: "referralDocument",
   patientReferral: "patientReferral",
   validateProvider: "validateProvider",
   verifyProviderOTP: "verifyProviderOTP",
   shareContent: "shareContent",
   addPatient: "addPatient",
   updateUserInfo: "updateUserInfo",
   onBoardingStatus: "onBoardingStatus",
   getPatientLocationNorthwell: "getPatientLocationNorthwell",
   connectEMR: "connectEMR",
   exchangeToken: "exchangeToken",
   checkProvider: "checkProvider",
   verifyProviderEmail: "verifyProviderEmail",
   createPassword: "createPassword",
   sendOTPToProviderMobile: "sendOTPToProviderMobile",
   verifyProviderMobile: "verifyProviderMobile",
   submitProviderDetails: "submitProviderDetails",
   getProviderQrCode: "getProviderQrCode",
   resendProviderEmailOTP: "resendProviderEmailOTP",
   resendProviderMobileOTP: "resendProviderMobileOTP",
   getVideoURLs: "getVideoURLs",
   openQRCode: "openQRCode",
   getTitle: "getTitle",
   getShortTitle: "getShortTitle",
   updateProvider: "updateProvider",
   getHospitals: "getHospitals",
   getDepartments: "getDepartments",
   getDepartmentsV2: "getDepartmentsV2",
   isProviderActivated: "isProviderActivated",
};

export default class Socket {
   constructor(url = process.env.REACT_APP_SOCKET_URL) {
      // Create WebSocket connection.
      this.url = url;
      // this.socket = null;
      this.socket = new WebSocket(this.url);
   }

   send(obj, callback = () => {}) {
      let string = JSON.stringify(obj);
      let $this = this;
      if (
         this.socket === null ||
         this.socket?.readyState === this.socket?.CLOSING ||
         this.socket?.readyState === this.socket?.CLOSED
      ) {
         this.socket = new WebSocket(this.url);
      }
      if (this.socket.readyState === this.socket.CONNECTING) {
         this.socket.addEventListener("open", function (event) {
            $this.socket.send(string);
         });
      } else {
         $this.socket.send(string);
      }

      // Listen for messages
      this.socket.onmessage = (data) => {
         let resp = data.data;
         if (typeof data.data === "string") {
            resp = JSON.parse(data.data);
         }
         if (resp.settings?.statusCode === 403) {
            renewToken((stsToken) => {
               if (string.includes("Authorization")) {
                  let query = JSON.parse(string);
                  if (query.Authorization) {
                     query.Authorization = `Bearer ${stsToken.accessToken}`;
                  }
                  string = JSON.stringify(query);
               }
               this.send(string, callback);
            });
            return;
         }
         callback(resp);
      };
   }

   close() {
      // window.onbeforeunload = function () {
      //   this.socket.onclose = function () {}; // disable onclose handler first
      //   this.socket.close();
      // };
      this.socket.onclose = function () {}; // disable onclose handler first
      this.socket.close();
   }
}

function renewToken(callback) {
   var redux_store = store.getState();
   var northwelluser_store = JSON.parse(redux_store?.auth?.northwelluser);

   var stsToken = northwelluser_store?.user?.stsTokenManager;
   var refreshToken = stsToken.refreshToken;
   var bodyFormData = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
   };
   return axios({
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
         store.dispatch(actions.savenorthwelluserobj(JSON.stringify(northwelluser_store)));
         callback && callback(stsTokenManager);
      })
      .catch((errorNew) => {
         console.log("refresh token error " + errorNew);
         sessionStorage.clear();
         localStorage.clear();
         // indexedDB.deleteDatabase("firebaseLocalStorageDb");
         store.dispatch(actions.logout());
         window.location.replace("/login");
      });
}
