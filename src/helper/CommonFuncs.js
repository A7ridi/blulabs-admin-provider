import React from "react";
import * as firebase from "firebase/app";
import moment from "moment";
import "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../components/newcomponents/ToastView";
import texts from "./texts";
import hospital from "../images/iconsNotif/hospital.svg";
import textIcon from "../images/media-icons/media-icon-text.svg";
import audio from "../images/media-icons/media-icon-audio.svg";
import document from "../images/media-icons/media-icon-document.svg";
import pdf from "../images/media-icons/media-icon-document.svg";
import image from "../images/media-icons/media-icon-image.svg";
import video from "../images/media-icons/media-icon-video.svg";

import five from "../images/library/new (5).svg";
import { allowedFormats } from "../Constants/pendoComponentIds/formats";
import { ShowAlert } from "../common/alert";
import data from "../I18n/en.json";

window.firestore = firebase.firestore();

export let greyBtnCls = "bg-light-grey-100 text-black text-small w-xsmall h-xsmall round-border-s font-weight-bold";
export let redBtnCls = "bg-white text-danger text-small w-xsmall h-xsmall round-border-s font-weight-bold";
export let blueBtnCls = "btn-default bg-prime text-white text-small w-xsmall h-xsmall round-border-s font-weight-bold";
var urlRegex =
   /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\00a1\ffff0-9]-*)*[a-z\00a1\ffff0-9]+)(?:\.(?:[a-z\00a1\ffff0-9]-*)*[a-z\00a1\ffff0-9]+)*(?:\.(?:[a-z\00a1\ffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/gm;

export const getMediaIconNew = (fileType, getHospital, hospitalId) => {
   if (getHospital) {
      if (hospitalId) {
         return `${process.env.REACT_APP_PROFILE_URL}/${hospitalId}`;
      } else {
         return hospital;
      }
   }
   if (fileType?.includes("image")) {
      return image;
   } else if (fileType?.includes("audio")) {
      return audio;
   } else if (fileType?.includes("pdf")) {
      return pdf;
   } else if (fileType?.includes("application")) {
      return document;
   } else if (fileType?.includes("video")) {
      return video;
   } else if (
      fileType?.includes("txt") ||
      fileType?.includes("text") ||
      fileType === null ||
      fileType === undefined ||
      fileType?.includes("content")
   ) {
      return textIcon;
   } else if (fileType?.includes("folder") || fileType?.includes("directory")) {
      return five;
   } else return document;
};
export function findNodeById(nodes, id) {
   let res;

   function findNode(nodes, id) {
      for (let i = 0; i < nodes.length; i++) {
         if (nodes[i].id === id) {
            res = nodes[i];
            break;
         }
         if (nodes[i].children) {
            findNode(nodes[i].children, id);
         }
      }
   }
   findNode(nodes, id);

   return res;
}
export const fileTypes =
   "image/jpeg,image/jpg,image/png,video/mp4,video/quicktime,video/webm,audio/m4a,audio/x-m4a,audio/mp3,audio/mpeg,application/pdf";

// export const sepNameReg = /^[a-zA-Z ]{2,30}$/;
// export const nameRegex = /^[a-zA-Z]{2,}([\s]{1,}[a-zA-Z]{2,})?([\s]{1,}[a-zA-Z]{2,})$/;
export const sepNameReg = /^$/;
export const nameRegex = /(\w\s\w)/;
export const firstLastNameRegex = /(\w{2,}\s\w{2,})/;
export const nameRegexProfile = /(\w.+\s\w)/;
export const emailReg =
   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const getFormattedDate = (unix) => {
   if (!unix) return "";
   if (window.dates && window.dates[unix]) {
      return window.dates[unix];
   }
   let unixDate = parseInt(unix);
   // var pattern = /(\d{4})(\d{2})(\d{2})/;
   let date = unix.replace(/(\d{4})(\d{2})(\d{2})/, "$2/$3/$1");
   // let date = new Date(unixDate).toLocaleDateString();
   if (!window.dates) {
      window["dates"] = {};
   }
   let str = unixDate.toString();
   window.dates[str] = date;
   return date;
};

export const getFormattedStampDate = (stampDate) => {
   if (!stampDate) return "";
   if (window.dates && window.dates[stampDate]) {
      return window.dates[stampDate];
   }
   let formatDate = new Date(stampDate);
   let date =
      formatDate.getMonth() +
      1 +
      "/" +
      formatDate.getDate() +
      "/" +
      formatDate.getFullYear() +
      " @ " +
      formatDate.toLocaleString("en-US", {
         hour: "numeric",
         hour12: true,
         minute: "numeric",
      });
   if (!window.dates) {
      window["dates"] = {};
   }
   window.dates[stampDate] = date;
   return date;
};

export const isValidEmail = (email) => {
   return emailReg.test(email);
};
export const isValidMob = (mobile) => {
   let mobReg = /^(\+1|)?(\d{3})(\d{3})(\d{4})$/;
   return mobReg.test(mobile);
};

export function formatPhoneNumber(phoneNumberString) {
   if (!phoneNumberString) return "";
   if (window.phoneNumbers && window.phoneNumbers[phoneNumberString]) {
      return window.phoneNumbers[phoneNumberString];
   }
   if (!window.phoneNumbers) {
      window["phoneNumbers"] = {};
   }
   let number = phoneNumberString.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
   window.phoneNumbers[phoneNumberString] = number;
   return number || "-";
}

window["initialColors"] = [
   "#FA9490",
   "#F9B198",
   "#BED6E0",
   "#AED6B3",
   "#C0C0C0",
   "#A36361",
   "#D3A29D",
   "#EECC8C",
   "#9EABA2",
   "#7277F4",
];

String.prototype.mobileInputMaskValue = function () {
   let rawVal = this.replace(/(\+\d{1})\s\((\d{3})\)\s(\d{3})\-(\d{4})/, "$1$2$3$4");
   return rawVal;
};

export const checkIconType = (iconObject) => {
   if (iconObject?.type === "media" || iconObject?.type === "content") {
      let type = iconObject.fileType?.split("/")[1];
      if (iconObject?.fileType.includes("image")) {
         return `/assets/images/newimages/content-icons/${type}-icon.svg`;
      } else if (iconObject?.fileType.includes("audio")) {
         return `/assets/images/newimages/content-icons/mp3-icon.svg`;
      } else if (iconObject?.fileType.includes("video")) {
         return `/assets/images/newimages/content-icons/${type}-icon.svg`;
      } else if (iconObject?.fileType.includes("pdf")) {
         return `/assets/images/newimages/content-icons/${type}-icon.svg`;
      } else if (iconObject?.fileType.includes("webhook")) {
         return "/assets/images/webhook-icon.svg";
      }
   } else if (iconObject?.type === "item") {
      return "/assets/images/newimages/content-icons/text-icon.svg";
   } else if (iconObject?.type === "careTeam" || iconObject?.type === "care") {
      return "/assets/images/newimages/content-icons/careteam-icon.svg";
   } else if (iconObject?.type === "bundle") {
      return "/assets/images/bundle-icon.svg";
   } else if (iconObject?.type === "referral") {
      return "/assets/images/referral-icon.svg";
   }
   return "/assets/images/newimages/content-icons/careteam-icon.svg";
};

// export const getMediaIcon = (fileType) => {
//   let type = fileType?.split("/")[1];
//   if (fileType?.includes("audio")) {
//     return "/assets/images/newimages/content-icons/mp3-icon.svg";
//   } else if (fileType?.includes("item")) {
//     return "/assets/images/newimages/content-icons/text-icon.svg";
//   } else if (fileType?.includes("svg")) {
//     return "/assets/images/newimages/content-icons/svg-icon.svg";
//   } else if (type === "pptx") {
//     return "/assets/images/newimages/content-icons/ppt-icon.svg";
//   } else if (type === "docx") {
//     return "/assets/images/newimages/content-icons/doc-icon.svg";
//   } else if (type === "jpeg") {
//     return "/assets/images/newimages/content-icons/jpg-icon.svg";
//   } else if (fileType === "referral") {
//     return "/assets/images/newimages/content-icons/referral-icon.svg";
//   } else if (fileType.includes("video")) {
//     return "/assets/images/newimages/content-icons/mp4-icon.svg";
//   } else {
//     return `/assets/images/newimages/content-icons/${type}-icon.svg`;
//   }
// };

export const getMediaIcon = (fileType) => {
   let type = fileType?.split("/")[1];
   if (fileType?.includes("image")) {
      return "/assets/images/newimages/lib-image.svg";
   } else if (fileType?.includes("audio")) {
      return "/assets/images/newimages/lib-audio.svg";
   } else if (fileType?.includes("video")) {
      return "/assets/images/newimages/lib-video.svg";
   } else if (fileType?.includes("txt")) {
      return "/assets/images/newimages/lib-text.svg";
   } else if (fileType?.includes("pdf")) {
      return "/assets/images/newimages/lib-pdf.svg";
   } else {
      return "/assets/images/newimages/lib-doc.svg";
   }
};

window.getDateDiff = function (date1, date2, time) {
   let a = moment(date1);
   let b = moment(date2);
   return a.diff(b, time ? time : "seconds"); // 1
};

export const compareObjects = function (obj1, obj2) {
   let str1 = JSON.stringify(obj1);
   let str2 = JSON.stringify(obj2);
   return str1.localeCompare(str2);
};

export const getAgeFromDate = (date) => {
   if (date === "" || date === null || date === undefined) return "-";
   const date1 = date.includes("/") ? new Date(date) : new Date(moment(date, "YYYYMMDD").format("MM/DD/YYYY"));
   const date2 = new Date();
   const diffTime = Math.abs(date2 - date1);
   const diffDays = parseInt(Math.ceil(diffTime / (1000 * 60 * 60 * 24)) / 365) + " yrs";
   return diffDays === "0 yrs" ? "1 yrs" : diffDays;
};

var fulldays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const formatDate = (someDateTimeStamp) => {
   if (someDateTimeStamp === "" || someDateTimeStamp === null || someDateTimeStamp === undefined) return "-";
   var dt = new Date(someDateTimeStamp),
      date = dt.getDate(),
      diffDays = new Date().getDate() - date,
      diffMonths = new Date().getMonth() - dt.getMonth(),
      diffYears = new Date().getFullYear() - dt.getFullYear();

   if (diffYears === 0 && diffDays === 0 && diffMonths === 0) {
      return "Today";
   } else if (diffYears === 0 && diffDays === 1) {
      return "Yesterday";
   } else if (diffYears === 0 && diffDays < -1 && diffDays > -7) {
      return fulldays[dt.getDay()];
   } else {
      return getDateStringFormat(someDateTimeStamp);
   }
};

export const getDateStringFormat = (stampDate) => {
   if (!stampDate) return "";
   if (window.dates && window.dates[stampDate]) {
      return window.dates[stampDate];
   }
   let formatDate = new Date(stampDate);
   let date = formatDate.getMonth() + 1 + "/" + formatDate.getDate() + "/" + formatDate.getFullYear();
   if (!window.dates) {
      window["dates"] = {};
   }
   window.dates[stampDate] = date;
   return date;
};

export const calculateDateLabel = (dateValue) => {
   const date = new Date(dateValue);
   let oneDate = moment(date);
   let dayName = oneDate.format("dddd");
   let diffInDays = Math.round(moment().diff(dateValue, "days", true));
   if (diffInDays > 1 && diffInDays < 7) {
      return dayName + " @ " + moment(date).format("hh:mm a");
   } else if (diffInDays === 0) {
      return (dayName = "Today" + " @ " + moment(date).format("hh:mm a"));
   } else if (diffInDays === 1) {
      return (dayName = "Yesterday" + " @ " + moment(date).format("hh:mm a"));
   } else {
      return moment(date).format("MM/DD/YYYY") + " @ " + moment(date).format("hh:mm a");
   }
};
export const calculateDateDay = (dateValue) => {
   const date = new Date(dateValue);
   let oneDate = moment(date);
   let dayName = oneDate.format("dddd");
   let diffInDays = Math.round(moment().diff(dateValue, "days", true));
   if (diffInDays > 1 && diffInDays < 8) {
      return dayName;
   } else if (diffInDays === 0) {
      return "Today";
   } else if (diffInDays === 1) {
      return "Yesterday";
   } else {
      return moment(date).format("MM/DD/YYYY");
   }
};
export const calculateDateLabelUTC = (dateValue) => {
   const date = new Date(dateValue + "Z").toString();
   let oneDate = moment(date);
   let dayName = oneDate.format("dddd");
   let diffInDays = Math.round(moment().diff(dateValue, "days", true));
   if (diffInDays > 1 && diffInDays < 8) {
      return dayName + " @ " + moment(date).format("hh:mm a");
   } else if (diffInDays === 0) {
      return (dayName = "Today" + " @ " + moment(date).format("hh:mm a"));
   } else if (diffInDays === 1) {
      return (dayName = "Yesterday" + " @ " + moment(date).format("hh:mm a"));
   } else {
      return moment(date).format("MM/DD/YYYY") + " @ " + moment(date).format("hh:mm a");
   }
};

export const ageForDob = (dateValue) => {
   if (!dateValue || dateValue === "-") return "-";
   let dobForAge = moment(dateValue);
   dobForAge = new Date(dobForAge);
   // dobForAge = moment().diff(dobForAge, "years");
   let ageLabel = "";
   let ageInDays = moment().diff(dobForAge, "days");
   let ageInWeeks = moment().diff(dobForAge, "weeks");
   let ageInMonths = moment().diff(dobForAge, "months");
   let ageInYears = moment().diff(dobForAge, "years");
   if (ageInDays > 6 && ageInWeeks > 4 && ageInMonths >= 12) {
      return (ageLabel = ageInYears + "y");
   } else if (ageInDays > 6 && ageInWeeks > 4 && ageInMonths < 12) {
      return (ageLabel = ageInMonths + "m");
   } else if (ageInDays > 6 && ageInWeeks < 5) {
      return (ageLabel = ageInWeeks + "w");
   } else {
      return (ageLabel = ageInDays + "d");
   }
};
export const checkEmpty = (data) => {
   if (data === "" || data === null) return "-";

   return data;
};

export const checkEmptyParams = (data) => {
   if (data === "" || data === null) return "";

   return data;
};

export const RefetchApi = (callback) => {
   localStorage.setItem("libraryUploading", true);
   let count = 0;

   const myInterval = setInterval(myTimer, 5000);

   function myTimer() {
      let stopUpload = localStorage.getItem("stopUploading");

      if (stopUpload && stopUpload === "true") {
         myStopFunction();
         localStorage.removeItem("stopUploading");
         return;
      } else {
         callback();
         count = count + 10;
         // localStorage.setItem("libraryUploading", count + 10);
         if (count === 70) {
            myStopFunction();
         }
      }
   }

   function myStopFunction() {
      clearInterval(myInterval);
   }
};

export const formatUrl = (url) => {
   if (url.includes("@")) {
      return url.replaceAll(" ", "+");
   } else return url;
};

export function isSafari() {
   let userAgent = window.navigator.userAgent;
   let browserName;
   if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
   } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
   } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
   } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
   } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
   } else {
      browserName = "No browser detection";
   }
   return browserName === "safari";
}

export const callMobileNumber = (number) => {
   window.location.href = `tel:${number}`;
};
export const sendMail = (mail) => {
   window.location.href = `mailto:${mail}`;
};
export const openLink = (url) => {
   window.open(url, "_blank");
};

export const checkLoved = (love, provId) => {
   if (love === null || love === undefined) return false;
   else
      return love.some((find) => {
         return find === provId;
      });
};

export const checkMediaType = (contentType, textVal = false) => {
   let validMedia = false;
   if (contentType?.includes("audio")) validMedia = true;
   if (contentType?.includes("video")) validMedia = true;
   if (contentType?.includes("image")) validMedia = true;
   if (contentType?.includes("pdf")) validMedia = true;
   if (!contentType?.includes("referral")) validMedia = true;
   if (textVal && (contentType?.includes("text") || contentType?.includes("item"))) validMedia = false;
   return validMedia;
};
export const successMessage = (message) => {
   toast(<ToastView text={message} />, defaultToastProps);
};

export const sendMessageSuccess = () => {
   toast(<ToastView text={texts.textSentSuccessful} />, defaultToastProps);
};

export const sendReferralSuccess = () => {
   toast(<ToastView text={texts.referralSentSuccessful} />, defaultToastProps);
};

export const ErrorMessage = (message) => {
   toast(
      <ToastView text={message.settings?.message || message.data?.settings?.message} type="error" />,
      defaultToastProps
   );
};

export const getDateFormatFromTimeStamp = (date) => {
   if (date === null || date === undefined || date === "") return "--/--/----";
   else return moment(date).format("MM/DD/YYYY");
};
export const getHospitalName = (hospitals) => {
   return hospitals !== null && hospitals !== undefined && hospitals?.length > 0 ? hospitals[0]?.name : "";
};

export const removeExtraSpace = (str) => {
   return str.replace(/\s+/g, " ").trim();
};

export const getAboutYouInfo = (obj) => {
   if (obj !== null && obj !== undefined && obj?.length > 0) {
      return { id: obj[0]?.id, name: obj[0]?.name };
   } else {
      return false;
   }
};

export const errorToDisplay = (err) => {
   if (Array.isArray(err?.networkError?.result?.errors) && err?.networkError?.result?.errors?.length > 0) {
      let errMessage = err?.networkError?.result?.errors[0]?.message;
      return errMessage;
   } else {
      return "Something went wrong!";
   }
};

export const isValidUrl = (url) => {
   return urlRegex.test(url);
};

export const isNumber = (num) => {
   if (!isNaN(num) && num.length >= 10) {
      return true;
   }
   return false;
};

export const getFilteredFiles = (files) => {
   var arr = [];
   var message = "";
   for (let i = 0; i < files.length; i++) {
      if (
         allowedFormats.some((some) => {
            return files[i]?.type?.includes(some?.toLowerCase());
         })
      ) {
         arr.push(files[i]);
      } else {
         message = `${files[i].name}  ${message.length > 0 ? " , " + message : message}`;
      }
   }
   message = message.length > 40 ? message.substring(0, 40) + "..." : message;
   if (files.length > arr.length) {
      ShowAlert(message + " " + data.onboarding.filesError, "error");
   }
   return arr || [];
};

export const clearConsole = () => {
   if (process.env.NODE_ENV === "production") {
      console.clear();
   }
};

export const checkForUrlParams = (param, value) => {
   let urlParams = new URLSearchParams(window.location.search);
   if (urlParams.get(param) === value.toString()) return true;
   return false;
};
