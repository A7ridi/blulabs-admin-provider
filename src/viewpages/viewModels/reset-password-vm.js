import Apimanager from "../../Apimanager/index";
import * as firebase from "firebase/app";
import "firebase/firestore";

export function decodeCredentials(string) {
   var base64Url = string;
   var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
   var jsonPayload = decodeURIComponent(
      window
         .atob(base64)
         .split("")
         .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
         })
         .join("")
   );
   const payload = JSON.parse(jsonPayload);
   return payload?.email || "";
}

export function signIn(credentials, onsuccess, onerror = () => {}) {
   firebase
      .auth()
      .signInWithEmailAndPassword(credentials.email, credentials.password)
      .then((success) => {
         let str = JSON.stringify(success);
         let obj = JSON.parse(str);
         validateProvider(
            {
               email: credentials.email,
               firebaseId: obj.user.uid,
            },
            (customObject) => {
               onsuccess(obj, customObject);
            }
         );
      })
      .catch((error) => {
         onerror(error);
      });
}

export function updatePassword(password, onsuccess, onerror = () => {}) {
   firebase
      .auth()
      .currentUser.updatePassword(password)
      .then((success) => {
         onsuccess();
      })
      .catch((err) => {
         onerror(err);
      });
}

export function validateProvider(queryparams, onsuccess) {
   Apimanager.postValidateProvider(
      queryparams,
      (success) => {
         let customObject = {
            settings: success.data.settings,
            customToken: "",
            user: success.data.data,
         };
         onsuccess(customObject);
      },
      (error) => {
         console.log("Validate auth " + JSON.stringify(error, null, 4));
      }
   );
}

export function updateUserDevice(data, onsuccess) {
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

   if ((ix = fullVersion.indexOf(";")) !== -1) fullVersion = fullVersion.substring(0, ix);
   if ((ix = fullVersion.indexOf(" ")) !== -1) fullVersion = fullVersion.substring(0, ix);

   majorVersion = parseInt("" + fullVersion, 10);
   if (isNaN(majorVersion)) {
      fullVersion = "" + parseFloat(navigator.appVersion);
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
   } else if (/Android/.test(navigator.userAgen)) {
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

   sessionStorage.setItem("Login", "yes");

   Apimanager.postUserDevice(
      deviceParam,
      (success) => {
         localStorage.removeItem("loginThirtyDays");
         onsuccess();
      },
      (error) => {}
   );
}

export function updateProfilePhoneNumber(mobile, otpSent, error) {
   var phoneNumber = "+" + mobile;
   if (window.recaptchaVerifier === null || window.recaptchaVerifier === undefined) {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
         size: "invisible",
      });
   }

   firebase
      .auth()
      .currentUser.multiFactor.getSession()
      .then(function (multiFactorSession) {
         // Send verification code
         var phoneAuthProvider = new firebase.auth.PhoneAuthProvider();
         var phoneInfoOptions = {
            phoneNumber: phoneNumber,
            session: multiFactorSession,
         };
         return phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
      })
      .then(function (verificationId) {
         // Store verificationID and show UI to let user enter verification code.
         otpSent(verificationId);
      })
      .catch((err) => {
         error(err);
      });
   window.recaptchaVerifier.render();
}
