import React from "react";
import BaseComponent from "../components/BaseComponent";
import Apimanager from "../Apimanager/index";
import { connect } from "react-redux";
import LoadingIndicator from "../common/LoadingIndicator";
import * as actions from "../redux/actions/auth.action";
import * as dasboardActions from "../redux/actions/dashboard.action";
import i18n from "../I18n/en.json";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import Pagination from "react-js-pagination";
import swal from "sweetalert";
import InputMask from "react-input-mask";
import ReactAudioPlayer from "react-audio-player";
import * as chapterIcons from "../common/chapterIcons";
import LoadingContent from "../common/LoadingContent";
import LoadingSmallContent from "../common/LoadingSmallContent";
import { bindActionCreators } from "redux";
import _ from "lodash";
import { Line } from "rc-progress";
import LoaderIndicate from "../common/LoadingIndicator";
import NumberFormat from "react-number-format";
import ScreenRecording from "../layout/ScreenRecording";
import swal1 from "@sweetalert/with-react";
import { store } from "../redux/store";
import * as firebase from "firebase/app";
import "firebase/firestore";
import {
   visittype,
   previewfileformat,
   backgroundImage,
   allowdVideotypes,
   iconVideotypes,
   attachmentTypes,
   accepttypes,
} from "../helper";
import { MentionsInput, Mention } from "react-mentions";
import $ from "jquery";
import axios from "axios";
import ReactHtmlParser from "react-html-parser";
import classNames from "../test.module.css";
import TagMentionDetails from "./TagMention/index";
import ReactionBar from "../components/ReactionBar";
import "../Dashboard.css";
import Loader from "react-loader-spinner";
import { v4 as uuid } from "uuid";
import { shareIcon, upArrow, downArrow, RecordAudio, RecordVideo } from "../common/svg";
import AudioRecorder from "../components/AudioRecorder/AudioRecorder";
import VideoRecorder from "../components/VideoRecorder/VideoRecorder";
import CareTeamInvite from "../components/CareTeamInvite/CareTeamInvite";
import CareTeamProviderView from "../components/CareTeamInvite/CareTeamProviderView";
import { FollowView } from "../components/CareTeamInvite/CareTeamInvite";

import { Menu, Item, useContextMenu } from "react-contexify";

import "react-contexify/dist/ReactContexify.css";
import Timer from "../helper/Timer";
import HelpView from "../components/HelpView/HelpView";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Analytics from "../helper/AWSPinPoint";
import ToggleSwitch from "../components/ToggleSwitch/ToggleSwitch";
import InvitePatientView from "../components/InvitePatientView/InvitePatientView";
import ReferralPatientView from "../components/ReferralPatientView/ReferralPatientView";
import ContentShareView from "../components/newcomponents/ContentShareView/ContentShareView";
import ReferralDetailsView from "../components/ReferralPatientView/ReferralDetailsView";
import Socket, { socketActions, socketSubActions } from "../helper/Websocket";

const MENU_ID_RECENT = "menu-id-recent";
const MENU_ID_PROVIDER = "menu-id-provider";
const CARETEAM_MENU_ID = "careteam-menu-id";

const { show } = useContextMenu((e, object) => {
   return {
      id: object.id,
      data: {
         value: 123,
      },
   };
});

let copyDetails = (obj) => {
   let text = "";
   if (obj.patientName) {
      text = text.concat(`Name: ${obj.patientName}\n`);
   }
   if (obj.patientDOB) {
      text = text.concat(`DOB: ${moment(obj.patientDOB).format("MM/DD/YYYY")}\n`);
   }
   if (obj.patientMRN) {
      text = text.concat(`MRN: ${obj.patientMRN}\n`);
   }
   if (obj.patientEmail) {
      text = text.concat(`Email: ${obj.patientEmail}\n`);
   }
   if (obj.patientMobile) {
      text = text.concat(`Mobile: ${obj.patientMobile}`);
   }
   return text;
};

// function showDeleteButton(e, object) {
//   let currentTime = moment().unix();
//   let uplDate = moment(Number(object.value.lastUpdate) * 1000).unix();
//   let timer = new Timer();
//   let addedBy = object.value.addedBy;
//   let userId = object.userId;
//   let diff =
//     timer.secondsToHms(currentTime).hours - timer.secondsToHms(uplDate).hours;

//   // if (addedBy === userId && diff < 24) {
//   //   show(e, object);
//   // }
//   return addedBy === userId && diff < 24;
// }

// function displayMenu(e, object) {
//   let currentTime = moment().unix();
//   let uplDate = moment(Number(object.lastUpdate) * 1000).unix();
//   let timer = new Timer();
//   let addedBy = object.addedBy;
//   let userId = object.userId;
//   let diff =
//     timer.secondsToHms(currentTime).hours - timer.secondsToHms(uplDate).hours;

//   // if (addedBy === userId && diff < 24) {
//   // }
//   show(e, object);
// }

function displayCareTeamMenu(e, object) {
   if (object.listType === false) {
      show(e, object);
   }
}

//eslint-disable-next-line
var email_regex = new RegExp(
   /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);

var nameRegex = new RegExp(/^[a-zA-Z]{2,}([\s]{1,}[a-zA-Z]{2,})?([\s]{1,}[a-zA-Z]{2,})$/);

const isValidMobileNumber = (number = "") => {
   let match = number.match("^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$");
   return match !== null;
};

const isValidEmail = (email = "") => {
   let email_regex = /^[ ]*([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})[ ]*$/i;
   return email_regex.test(email.toLowerCase());
};

// const socket = new Socket();

var controller = new AbortController();
var signal = controller.signal;

const Input = (props) => {
   let { onfocus, onblur, fieldType = "text", classname = "custom-input" } = props;
   return (
      <>
         {/* <span className="input-span">+1</span> */}
         <InputMask
            mask="+1 (999) 999-9999"
            value={props.value}
            onChange={props.onChange}
            onBlur={onblur}
            onFocus={onfocus}
         >
            {(inputProps) => (
               <input
                  className={classname}
                  placeholder="e.g. +1 (212) 212-1212"
                  {...inputProps}
                  type={fieldType}
                  beforeMaskedValueChange={props.beforeMaskedValueChange}
               />
            )}
         </InputMask>
      </>
   );
};

function reverseString(str) {
   if (str) {
      let firstName = str[0];

      let lastName = "";

      if (str.length - 1 >= 1) {
         lastName = str[str.length - 1];
      }

      return firstName + lastName;
   } else {
      return "";
   }
}

var pagination = { pagenumber: 1, itemperpage: 50 };
var recentListPagination = { pagenumber: 1, itemperpage: 50 };
var providerListPagination = { pagenumber: 1, itemperpage: 50 };

//var shearedparams = "";
var sVisit = "";

let createContentDefaultStates = {
   title: "",
   description: "",
   originalDescriptions: "",
   mentionTagsId: [],
   image: "",
   percentageUploaded: 0,
   isUploading: false,
   postMediaType: "",
   isLoading: false,
   mediatype: "media",
   hashTagsId: [],
   shortcutTagsId: [],
   isRecAudioActive: false,
   isRecVideoActive: false,
};

class DashboardPage extends BaseComponent {
   constructor(props) {
      super(props);
      this.textInput = React.createRef();
      this.focusSearch = this.focusSearch.bind(this);
      this.state = {
         searchmrn: "",
         isLoading: false,
         selectedDepartment: "",
         selectedDoctor: "",
         departmentDataList: [],
         doctorDataList: [],
         searchPatientName: "",
         startDate: "",
         patientList: [],
         activePage: 1,
         itemperpage: 15,
         pageRangeDisplayed: 5,
         totalIteamCount: "",
         recordMessage: "",
         isAdmin: false,
         searchPatientCell: "",

         patientName: "",
         patientDOB: "",
         selectedPatientDepartment: "",
         selectedPatientDoctor: "",
         patientMRN: "",
         patientMobile: "",
         patientEmail: "",
         patientDoctorList: [],
         patientID: "",
         blockerImagePath: "",
         isCallEnable: false,
         careTeamList: "",
         selectSharing: "",
         recentList: [],
         recentListProvider: [],
         careTeamMessage: "",
         recentActivityMessage: "",
         recentActivityMessageProvider: "",
         phoneNumber: "",
         patientCareEmail: "",
         patientCareName: "",
         mediaData: "",

         medaiPath: "",
         visitsData: [],
         visitChapters: [],

         image: "",
         percentageUploaded: 0,
         title: "",
         description: "",
         isForDoctor: false,
         mediatype: "media",
         selectedVisit: "",
         selectedChapters: "",
         contentLoading: false,
         listLoading: false,
         viewedListData: "",
         mutedAudio: false,
         isUploading: false,

         recordStart: false,

         libraryList: "",
         libraryListCopy: [],
         comingFromLib: false,
         activeFilter: false,
         enterPriseDetails: "",
         searchStatus: true,
         splitSearch: [],
         searchFirstName: "",
         searchLastName: "",
         searchMiddleName: "",
         searchDob: "", //new Date(now.subtract(13, "years")),
         searchMrn: "",
         hospitalListData: "",
         hospitalSelected: "",
         dragDropDiv: "drag-drop-overlay file-input hide-div",
         searchCheck: false,
         northTypeObj: "",
         northEmail: "",
         northMobile: "",
         sendLoader: false,
         northArr: [],
         recentSearchPLBList: [],
         recentSearchNorthList: [],
         userDetailsVal: "",
         mentionTags: [],
         mentionTagsId: [],
         originalDescriptions: "",
         postMediaType: null,
         dragPatientListDiv: "hide-div",
         hashTagsId: [],
         emrLoading: false,
         modalState: true,
         focusVal: false,
         countTotal: "",
         searchProviderOnly: "",
         searchActitivyOnly: "",
         oldCareTeamList: [],
         showTagMentionDetails: false,
         tagType: "",
         tagId: "",
         showBlockType: false,
         contentNameDetails: "",
         contentType: "",
         dragDropProviderDiv: "drag-drop-overlay file-input hide-div",
         careTeamListType: false,
         shortcutsList: [],
         shortcutTagsId: [],
         contextMenuObject: {},
         careTeamMenuObject: {},

         isLibraryDocument: true,
         libTagList: [],
         libTagListCopy: [],
         tagSelected: null,
         loadingDocumentsForTag: null,

         isRecAudioActive: false,
         isRecVideoActive: false,

         isInvitePatient: false,
         northwelluser: null,

         isPatientSearchActive: false,

         careTeamSelected: false,
         careTeamProviderSelected: null,
         careTeamListLoading: false,
         addselfStatus: "+ Add yourself",

         showFollowButton: false,

         isValidMobile: null,
         isValidEmail: null,
         isValidName: null,
         isValidDOB: null,

         showHelp: false,
         notificationObject: this.props.notificationObject,

         contentSelected: null,
         isContentUploading: false,
         clearUploadingContent: true,

         recentActivityFetching: false,
         providerOnlyFetching: false,
         recentListPagination: {
            pagenumber: 1,
            itemperpage: 15,
            listEnded: false,
         },
         providerListPagination: {
            pagenumber: 1,
            itemperpage: 15,
            listEnded: false,
         },
         isReferralPatientView: false,
         isContentShareView: false,
         contentShareObject: {},
         referralPatientDetails: {},
         showContentDescriptionObject: {},
         showReferralDetails: false,
         patientDetailsObject: {},
         patientEditMode: false,
         editPatientName: "",
         editPatientDOB: "",
         editPatientMRN: "",
         editPatientEmail: "",
         editPatientMobile: "",
         editPatientErrorObj: {
            editPatientNameError: "",
            editPatientDOBError: "",
            editPatientMRNError: "",
            editPatientEmailError: "",
            editPatientMobileError: "",
         },
         patientRemarks: "",
         editPatientNameInList: "",
         editPatientDOBInList: "",
         editPatientEmailInList: "",
         editPatientMobileInList: "",
         patientOnboardStatus: "",
         sharingListSortOrder: "",
         documentSortOrder: "",
         showReferralFlag: false,
      };

      this.myRef = React.createRef();

      this.userdetails = JSON.parse(this.props.storedObject.userCredentials).user;

      this.shearedparams = props && props.location && props.location.state && props.location.state.shearedparams;

      //console.log('ReactDOM.findDOMNode(this.refs.visit_scroll)', document.getElementById("activityListdiv"))
      this.audioPlayerRef = React.createRef(null);
      this.videoPlayerRef = React.createRef(null);
      this.streamRef = React.createRef(null);

      this.props.setAudioRecordingStatus({
         isAudioRecording: false,
      });
      this.props.setVideoRecordingStatus({
         isVideoRecording: false,
      });

      this.toastId = React.createRef(null);

      this.contentUploadref = React.createRef(null);

      this.searchRefToken = React.createRef(null);

      this.getPatientsRefToken = React.createRef(null);
   }

   handleScrollToElement = (event) => {
      let element = event.target;
      if (element.scrollTop + element.offsetHeight >= element.scrollHeight) {
         console.log("dffsdf");
         //this.loadmore();
      }
   };

   focusSearch() {
      this.textInput.current && this.textInput.current.focus(); // search input box null check
   }

   loadmore = () => {
      let p = recentListPagination.pagenumber++;
      // pagination.itemperpage = 10;
      //this.setState({}, () => this.getVisits(this.props.match.params.patientid));
      console.log("pagination", p);
   };

   scrollToMyRef = () => window.scrollTo(0, this.myRef.current.offsetTop);

   componentDidMount() {
      if (document.getElementsByClassName("modal-backdrop fade show")[0]) {
         document.getElementsByClassName("modal-backdrop fade show")[0].remove();
      }
      if (!window.location.href.includes("/patient/") && !process.env.REACT_APP_BASEURL) {
         window.addEventListener(
            "message",
            (event) => {
               if (event.data.patientId) {
                  window.location = `/patient/${event.data.patientId}`;
               }
            },
            false
         );
      }
      //ReactDOM.findDOMNode(this.myRef.current).addEventListener('scroll', this.handleScrollToElement);
      let arr = [];
      if (this.props.recentSearchPLBArr && this.props.recentSearchPLBArr.length > 0) {
         arr = this.props.recentSearchPLBArr.filter(
            (thing, index, self) => index === self.findIndex((t) => t.id === thing.id)
         );
      }

      let northArr = [];

      if (this.props.recentSearrchNorthArr && this.props.recentSearrchNorthArr.length > 0) {
         northArr = this.props.recentSearrchNorthArr.filter(
            (thing, index, self) => index === self.findIndex((t) => t.id === thing.id)
         );
      }

      this.props.headerupdate(null);
      this.getEnterpriseDetails();

      this.setState({
         recentSearchPLBList: arr.length > 20 ? arr.slice(0, 20) : arr,
         recentSearchNorthList: northArr.length > 20 ? arr.slice(0, 20) : northArr,
      });

      if (this.props.match && this.props.match.params && this.props.match.params.patientid) {
         window.onbeforeunload = function () {
            // By reloading this page content upload will stop. Are you sure?
            return this.state.isContentUploading ? true : null;
         }.bind(this);

         this.getPatientDetails(this.props.match.params.patientid);
         this.recentActivity(this.props.match.params.patientid);
         this.recentActivityProviderOnly(this.props.match.params.patientid);
         let params = {
            userId: this.props.match.params.patientid,
         };
         if (params.userId) {
            Apimanager.careteamProviders(params, (success) => {
               let status = this.getPatientFollowStatus(success.data);
               this.setState({
                  addselfStatus: status,
                  showFollowButton: true,
               });
            });
         }
         this.careTeam(this.props.match.params.patientid);
         // this.getLibraryList();
      } else {
         let queryparams = {
            page: this.state.activePage,
            pageSize: this.state.itemperpage,
         };
         this.getPatientList(queryparams);

         window.addEventListener(
            "keypress",
            function (event) {
               if (event.keyCode === 13 && event.key === "Enter") {
                  if (window.location.href.includes("/patient/")) return;
                  if (
                     (this.state.searchStatus && this.state.searchPatientName) ||
                     (!this.state.searchStatus && this.state.searchFirstName && this.state.searchLastName)
                  ) {
                     if (this.state.modalState) {
                        this.filterData();
                     }
                  }
               }
            }.bind(this)
         );
      }

      let uResult = JSON.parse(this.props.storedObject.userCredentials);

      let params = {
         userId: uResult.user.id,
      };
      if (localStorage.getItem("login") === "yes") {
         Apimanager.checkKeepLogin(
            params,
            (success) => {
               if (success && success.data && success.data.data && success.data.data.keepLogin) {
                  if (success.data.data.userCheckKeepLogin) {
                     // localStorage.setItem("userCheckKeepLogin", "yes");
                  } else {
                     // localStorage.setItem("userCheckKeepLogin", "no");
                  }
               } else {
                  sessionStorage.clear();
                  localStorage.clear();
                  sessionStorage.clear();
                  this.props.history.push("/login");
               }
            },
            (error) => {
               //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
            }
         );
      }

      // this.getLibraryTags();
      // this.getTags();
      // this.getProviderList();
      // this.getShortcutsList();

      document.getElementById("north-email").addEventListener(
         "keypress",
         function (e) {
            if (e.key === "Enter") {
               e.preventDefault();
            }
         },
         false
      );
      window.addEventListener(
         "click",
         function (e) {
            if (e.target.id === "exampleInputEmail2Search") {
               this.setState({
                  focusVal: !this.state.focusVal,
               });
            } else {
               this.setState({
                  focusVal: false,
               });
            }
         }.bind(this)
      );

      window.addEventListener(
         "click",
         function (e) {
            if (e.target.id === "tag-mention-@") {
               this.setState({
                  tagId: e.target.attributes[1].value,
                  tagType: "mention",
                  showTagMentionDetails: true,
                  showBlockType:
                     e.target.attributes[2].value === "recent"
                        ? "recent"
                        : e.target.attributes[2].value === "pOnly"
                        ? "pOnly"
                        : "",
                  contentNameDetails: e.target.textContent,
               });
            } else if (e.target.id === "tag-mention-#") {
               this.setState({
                  tagId: e.target.attributes[1].value,
                  tagType: "hash",
                  showTagMentionDetails: true,
                  showBlockType:
                     e.target.attributes[2].value === "recent"
                        ? "recent"
                        : e.target.attributes[2].value === "pOnly"
                        ? "pOnly"
                        : "",
                  contentNameDetails: e.target.textContent,
               });
            }
         }.bind(this)
      );

      if (this.state.notificationObject !== null) {
         this.getNotification();
      }
      if (
         (window.location.pathname.includes("/patient/") && localStorage.getItem("notifCareTeam")) ||
         localStorage.getItem("pushCareTeam")
      ) {
         this.getCareTeamList(true);
         localStorage.removeItem("pushCareTeam");
      } else {
         localStorage.removeItem("notifCareTeam");
         localStorage.removeItem("pushCareTeam");
         // this.getCareTeamList(false);
      }
      this.setState({
         editPatientName: this.state.patientName,
         editPatientDOB: this.state.patientDOB,
         editPatientMRN: this.state.patientMRN,
         editPatientEmail: this.state.patientEmail,
         editPatientMobile: this.state.patientMobile,
         editPatientNameInList: this.state.patientName,
         editPatientDOBInList: this.state.patientDOB,
         editPatientEmailInList: this.state.patientEmail,
         editPatientMobileInList: this.state.patientMobile,
      });
   }

   getNotification() {
      store.subscribe((action) => {
         if (
            store.getState().dashboardStates?.notificationObject &&
            window.location.pathname.includes("/patient/") &&
            this.state.notificationObject !== null
         ) {
            this.getPatientDetails(this.props.match.params.patientid);
            this.recentActivity(this.props.match.params.patientid);
            this.recentActivityProviderOnly(this.props.match.params.patientid);
            let params = {
               userId: this.props.match.params.patientid,
            };
            if (params.userId) {
               Apimanager.careteamProviders(params, (success) => {
                  let status = this.getPatientFollowStatus(success.data);
                  this.setState({
                     addselfStatus: status,
                     showFollowButton: true,
                  });
               });
            }
            // this.getLibraryList();
            if (this.props.notificationObject?.record?.type === "careTeam") {
               this.careTeam(this.props.match.params.patientid);
               this.getCareTeamList(true);

               this.props.setNotificationObject({ notificationObject: null });
            } else {
               this.getCareTeamList(false);
            }
         }
      });
   }

   getPatientFollowStatus(list) {
      let status = "+ Add yourself";
      list.forEach((object) => {
         if (object.id === this.userdetails.id) {
            status = object.isSubscribed ? "Unfollow" : "+ Follow";
            return;
         }
      });
      return status;
   }

   static getDerivedStateFromProps(props) {
      if (props.storedObject && props.storedObject.userCredentials) {
         let userRole = JSON.parse(props.storedObject.userCredentials);

         if (userRole.user.role.includes("admin")) {
            return {
               isAdmin: true,
               userDetailsVal: userRole,
               storedObject: JSON.parse(props.storedObject.northwelluser),
            };
         }
      } else {
         window.location.replace("/");
      }

      return { storedObject: JSON.parse(props.storedObject.northwelluser) };
   }

   componentDidUpdate(prevProps) {
      if (this.props.invitePatientData.redirectEmr !== prevProps.invitePatientData.redirectEmr) {
         this.setSearchVal(false);
         this.focusSearch();
      }
   }

   getEnterpriseDetails = () => {
      Apimanager.getEntpDetails(
         {},
         (success) => {
            if (success && success.status === 200 && success.data) {
               this.setState({
                  enterPriseDetails: success.data.data,
                  isLoading: false,
                  showReferralFlag: success.data.data.showReferral,
               });
               this.props.setNotificationCount({
                  notificationCount: success.data.data.activityNotViewed,
               });
            } else {
               this.setState({
                  isLoading: false,
               });
            }
         },
         (error) => {
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  //this.ErrorAlertbar(error.data.settings.message)
                  this.setState({
                     isLoading: false,
                  });
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               this.setState({
                  isLoading: false,
               });
               return;
            }

            return;
         }
      );
   };

   getHospitalListing = () => {
      let enterpriseId = "";
      if (this.props.storedObject && this.props.storedObject.userCredentials) {
         let userData = JSON.parse(this.props.storedObject.userCredentials);
         enterpriseId = userData.user.enterpriseId;
      }
      let queryparams = {
         enterpriseId: enterpriseId,
         page: "",
         pageSize: "",
      };
      Apimanager.getHospitalListing(
         queryparams,
         (success) => {
            if (success && success.status === 200 && success.data) {
               this.setState({
                  hospitalListData: success.data.data,
                  isLoading: false,
               });
            } else {
               this.setState({
                  isLoading: false,
               });
            }
         },
         (error) => {
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  //this.ErrorAlertbar(error.data.settings.message)
                  this.setState({
                     isLoading: false,
                  });
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               this.setState({
                  isLoading: false,
               });
               return;
            }

            return;
         }
      );
   };

   getSearchPatient = (obj, callTime, status) => {
      let qm = {
         disabled: false,
         playbackSearch: callTime ? false : this.state.searchStatus,
         data: {
            query: this.state.searchStatus ? (obj.searchQuery ? obj.searchQuery.trim() : "") : "",
            dob:
               status || callTime ? (this.state.searchDob ? moment(this.state.searchDob).format("YYYYMMDD") : "") : "",
            firstName: this.state.activeFilter || callTime ? this.state.searchFirstName.trim() : "",
            lastName: this.state.activeFilter || callTime ? this.state.searchLastName.trim() : "",
            middleName: this.state.activeFilter || callTime ? this.state.searchMiddleName.trim() : "",
            mrn: status ? (this.state.searchMrn ? this.state.searchMrn.trim() : "") : "",
            hospitalId: status ? (this.state.hospitalSelected ? this.state.hospitalSelected.value : "") : "",
         },
         quaryParam: {
            page: obj.page,
            pageSize: obj.pageSize,
         },
      };

      this.setState({
         searchCheck: true,
         emrLoading: callTime === "north" ? true : false,
      });

      this.searchRefToken.current = Apimanager.getPatientSearchNorth(
         qm,
         (success) => {
            if (success && success.status === 200 && success.data) {
               let patientDataList = success.data ? success.data.patients : [];
               this.setState({
                  patientList: callTime ? this.state.patientList : patientDataList,

                  totalIteamCount: success.data.totalRecords
                     ? success.data.totalRecords
                     : patientDataList.length > 0
                     ? patientDataList.length
                     : 1,
                  recordMessage: "yes",
                  isLoading: false,
               });
               if (!callTime) {
                  this.setState({
                     countTotal: success.data.totalRecords,
                  });
               }
               if (callTime) {
                  this.setState({
                     emrLoading: callTime ? false : "",
                     northArr: callTime ? patientDataList : "",
                  });
               }
            } else {
               this.setState({
                  recordMessage: "yes",
                  isLoading: false,
               });
            }
         },
         (error) => {
            this.setState({
               searchCheck: true,
            });
            if (callTime) {
               this.setState({
                  northArr: "",
               });
            }
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  //this.ErrorAlertbar(error.data.settings.message)
                  this.setState({
                     recordMessage: "yes",
                     isLoading: false,
                     emrLoading: callTime ? false : "",
                     // totalIteamCount: "",
                  });
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               this.setState({
                  recordMessage: "yes",
                  isLoading: false,
                  totalIteamCount: "",
                  emrLoading: callTime ? false : "",
               });
               return;
            }

            return;
         }
      );
   };

   Tempsearch = (obj, callTime, status) => {
      if (callTime === "north") {
         this.setState({ northArr: [] });
      }
      if (this.searchRefToken.current) {
         this.searchRefToken.current.cancel();
      }
      if (this.getPatientsRefToken.current) {
         this.getPatientsRefToken.current.cancel();
      }
      this.getSearchPatient(obj, callTime, status);
   };

   getPatientList = (queryparams) => {
      if (this.searchRefToken.current) {
         this.searchRefToken.current.cancel();
      }
      if (this.getPatientsRefToken.current) {
         this.getPatientsRefToken.current.cancel();
      }
      queryparams["disabled"] = false;
      this.getPatientsRefToken.current = Apimanager.getPatientList(
         queryparams,
         (success) => {
            if (success && success.status === 200 && success.data && success.data.data) {
               let patientDataList = success.data && success.data.data ? success.data.data : [];

               this.setState({
                  patientList: [...new Set(patientDataList)],
                  totalIteamCount: success.data.totalRecords,
                  countTotal: success.data.totalRecords,
                  recordMessage: "yes",
                  isLoading: false,
                  searchCheck: false,
               });
            } else {
               this.setState({
                  recordMessage: "yes",
                  isLoading: false,
                  searchCheck: false,
               });
            }
         },
         (error) => {
            this.setState({
               searchCheck: false,
            });
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  //this.ErrorAlertbar(error.data.settings.message)
                  this.setState({
                     recordMessage: "yes",
                     isLoading: false,
                  });
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               this.setState({
                  recordMessage: "yes",
                  isLoading: false,
               });
               return;
            }
            return;
         }
      );
   };

   handleDateChange = (date) => {
      this.setState({
         startDate: date,
      });
   };

   handleChangeMRN = (e) => {
      this.setState({
         searchmrn: e.target.value,
      });
   };

   handleChangePatientName = (e) => {
      let newStr = e.target.value.replace(/^\s+/, "");
      let splitVal = newStr.split(" ");
      let spaceCount = newStr.split(" ").length - 1;
      let ltName = splitVal[1];
      if (spaceCount === 2 && splitVal[2].length <= 0) {
         ltName = splitVal[1];
      } else if (spaceCount === 2 && splitVal[2].length > 0) {
         ltName = splitVal[2];
      }
      this.setState({
         searchPatientName: newStr,
         splitSearch: splitVal,
         searchFirstName: splitVal[0],
         searchMiddleName: spaceCount === 2 && splitVal[2].length > 0 ? splitVal[1] : "",
         searchLastName: ltName ? ltName : "",
      });

      if (newStr.length > 0) {
         this.setState({
            focusVal: false,
         });
      }

      if (e.target.value === "") {
         this.setState({
            isLoading: true,
         });
         let sObj = {
            searchQuery: "",
            page: 1,
            pageSize: this.state.itemperpage,
         };

         this.getPatientList(sObj);
      }
   };

   handleChangePatientCell = (e) => {
      this.setState({
         searchPatientCell: e.target.value,
      });
   };

   resetData = () => {
      this.setState({
         selectedDepartment: "",
         selectedDoctor: "",
         searchmrn: "",
         startDate: "",
         searchPatientName: "",
         activePage: 1,
         isLoading: true,
         patientList: [],
         searchPatientCell: "",
         libraryList: "",
         comingFromLib: false,
         searchFirstName: "",
         searchLastName: "",
         searchMiddleName: "",
         searchMrn: "",
         searchDob: "",
      });

      let queryparams = {
         searchQuery: "",
         page: 1,
         pageSize: this.state.itemperpage,
      };
      this.getPatientList(queryparams);
   };

   pageChange = async (pageNumber = null) => {
      this.setState({
         activePage: pageNumber,
         isLoading: true,
      });
      let queryparams = {
         searchQuery: this.state.searchPatientName,
         page: pageNumber,
         pageSize: this.state.itemperpage,
      };

      if (
         this.state.searchPatientName ||
         this.state.searchFirstName ||
         this.state.searchLastName ||
         this.state.searchMiddleName ||
         this.state.searchMrn ||
         this.state.searchDob
      ) {
         this.Tempsearch(queryparams, "", "with");
      } else {
         this.getPatientList(queryparams);
      }
   };

   filterData = (status) => {
      let sData = this.state.searchPatientName;
      let firstChar = this.state.searchPatientName.charAt(0);
      if (!firstChar.match(/[a-z]/i)) {
         let txt = this.state.searchPatientName;
         let numb = txt.match(/\d/g);
         if (numb) {
            numb = numb.join("");
            sData = numb;
         }
      }

      let queryparams = {
         searchQuery: sData,
         page: 1,
         pageSize: this.state.itemperpage,
      };

      this.setState({
         activePage: 1,
         isLoading: true,
         patientList: [],
      });

      if (this.state.enterPriseDetails && this.state.enterPriseDetails.appIntegration.advanceSearch) {
         if (this.state.searchStatus && this.state.searchLastName.length <= 0) {
            this.Tempsearch(queryparams, "", status);
         } else if (this.state.searchStatus && this.state.searchLastName.length > 0) {
            this.setState(
               {
                  northArr: [],
               },
               function () {
                  this.Tempsearch(queryparams, "", status);
                  // this.Tempsearch(queryparams, "north", status);
               }
            );
         } else {
            this.Tempsearch(queryparams, "north", status);
         }
      } else {
         // this.getPatientList(queryparams);
         this.Tempsearch(queryparams, "", status);
      }
   };

   //  Edit Patient
   handleDOBDateChange = (date) => {
      this.setState({
         editPatientDOBInList: date,
      });
   };
   handleNameTextChange = (e) => {
      this.setState({
         editPatientNameInList: e.target.value,
      });
   };

   handleMRNTextChange = (e) => {
      this.setState({
         patientMRN: e.target.value,
      });
   };

   careTeam = (id) => {
      this.setState({
         careTeamSelected: false,
         careTeamProviderSelected: null,
         listLoading: true,
      });
      let queryparams = { userId: id, v: 1.2 };
      Apimanager.careTeam(
         queryparams,
         (success) => {
            if (success && success.data) {
               Analytics.record(this.getPatientData(), this.userdetails.id, Analytics.EventType.providerSharingViewed);
               this.setState({
                  careTeamList: success.data,
                  oldCareTeamList: success.data,
                  listLoading: false,
                  careTeamMessage: "message",
               });
            }
         },
         (error) => {
            this.setState({
               listLoading: false,
               careTeamMessage: "message",
            });
         }
      );
   };

   recentActivity = (id, loadmore = false) => {
      if (id) {
         this.setState({
            listLoading: true,
         });
         let page = this.state.recentListPagination.pagenumber;
         let listRecord = this.state.recentListPagination.itemperpage;
         let queryparams = {
            userId: id,
            v: 1.2,
            page: page,
            pageSize: listRecord,
            listtype: "patientOnly",
            showReferral: true,
            sendThumbnail: false,
         };
         Apimanager.resentActivity(
            queryparams,
            (success) => {
               let data = success.data || [];
               Analytics.record(this.getPatientData(), this.userdetails.id, Analytics.EventType.providerHomeViewed);
               this.setState({
                  recentActivityFetching: false,
                  recentList: loadmore ? this.state.recentList?.concat(data) : data,
                  listLoading: false,
                  recentActivityMessage: "message",
                  recentListPagination: {
                     pagenumber: page,
                     itemperpage: listRecord,
                     listEnded: success.data?.length === 0 || false,
                  },
               });
            },
            (error) => {
               this.setState({
                  recentActivityFetching: false,
                  listLoading: false,
                  recentActivityMessage: "message",
               });
            }
         );
      }
   };

   recentActivityProviderOnly = (id, searchTerm, loadmore = false) => {
      if (id) {
         this.setState({
            listLoading: true,
            recentActivityMessageProvider: "",
         });
         let page = this.state.providerListPagination.pagenumber;
         let recordNum = this.state.providerListPagination.itemperpage;

         let queryparams = {
            userId: id,
            listType: "providerOnly",
            search: searchTerm ? searchTerm : "",
            page: page,
            pageSize: recordNum,
            sendThumbnail: false,
         };
         Apimanager.resentActivityProvider(
            queryparams,
            (success) => {
               let data = success.data || [];
               this.setState({
                  providerOnlyFetching: false,
                  recentListProvider: loadmore ? this.state.recentListProvider.concat(data) : data,
                  listLoading: false,
                  recentActivityMessageProvider: "message",
                  providerListPagination: {
                     pagenumber: page,
                     itemperpage: recordNum,
                     listEnded: success.data?.length === 0 || false,
                  },
               });
            },
            (error) => {
               this.setState({
                  providerOnlyFetching: false,
                  listLoading: false,
                  recentActivityMessageProvider: "message",
               });
            }
         );
      }
   };

   handleChangeProviderOnly = (e, type) => {
      this.setState({
         searchProviderOnly: type === "provider" ? e.target.value : "",
         listLoading: true,
         searchActitivyOnly: type === "activity" ? e.target.value : "",
      });

      if (this.props.match && this.props.match.params && this.props.match.params.patientid) {
         if (e.target.value.length >= 3) {
            let { storedObject } = this.state;
            let searchtext = e.target.value;

            if (type === "provider") {
               this.setState({
                  recentListProvider: [],
                  recentActivityMessageProvider: "",
                  isloading: true,
               });
            } else {
               this.setState({
                  recentList: [],
                  recentActivityMessage: "",
               });
            }

            var auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
            if (!storedObject) {
               return;
            }

            controller.abort();
            controller = new AbortController();
            signal = controller.signal;

            var endpoint =
               `${process.env.REACT_APP_URL}/user/${this.props.match.params.patientid}/activity?` +
               $.param({
                  key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
                  listtype:
                     type === "provider" ? encodeURIComponent("providerOnly") : encodeURIComponent("patientOnly"),
                  search: encodeURIComponent(e.target.value.trim()),
                  v: "1.2",
                  sendThumbnail: false,
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
                  if (type === "provider") {
                     this.setState({
                        recentListProvider: success,
                        isloading: false,
                        recentActivityMessageProvider: "message",
                     });
                  } else {
                     this.setState({
                        recentList: success,
                        isloading: false,
                        recentActivityMessage: "message",
                     });
                  }
               })
               .catch((error) => {
                  if (error && (error.status === 403 || error.data?.message === "Forbidden")) {
                     var redux_store = store.getState();
                     var northwelluser_store =
                        redux_store &&
                        redux_store.auth &&
                        redux_store.auth.northwelluser &&
                        JSON.parse(redux_store.auth.northwelluser);
                     var refreshToken = northwelluser_store.user.stsTokenManager.refreshToken;
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
                           store.dispatch(actions.savenorthwelluserobj(JSON.stringify(northwelluser_store)));
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
                                 if (type === "provider") {
                                    this.setState({
                                       recentListProvider: success,
                                       isloading: false,
                                       recentActivityMessageProvider: "message",
                                    });
                                 } else {
                                    this.setState({
                                       recentList: success,
                                       isloading: false,
                                       recentActivityMessage: "message",
                                    });
                                 }
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

            //this.recentActivityProviderOnly(this.props.match.params.patientid,e.target.value);
         } else if (e.target.value.length === 0) {
            if (type === "provider") {
               this.setState({
                  recentListProvider: [],
               });
               this.recentActivityProviderOnly(this.props.match.params.patientid, "");
            } else {
               this.setState({
                  recentList: [],
                  //listLoading: true
                  recentActivityMessage: "",
               });
               this.recentActivity(this.props.match.params.patientid);
            }
         }
      }
   };

   getPatientDetails = (id) => {
      if (id) {
         this.setState({
            contentLoading: true,
            isValidMobile: null,
            isValidEmail: null,
            isValidName: null,
            isValidDOB: null,
         });
         let queryparams = { userId: id };

         Apimanager.getPatientDetails(
            queryparams,
            (success) => {
               if (success && success.status === 200 && success.data && success.data.data) {
                  let patientDatails = success.data && success.data.data ? success.data.data : "";

                  let dob = "";
                  if (patientDatails && patientDatails.dob) {
                     dob = moment(patientDatails.dob, "YYYYMMDD").format("MM/DD/YYYY");
                     dob = new Date(dob);
                  }

                  this.setState({
                     patientDOB: dob,
                     patientName: patientDatails && patientDatails.name ? patientDatails.name : "",
                     patientMRN: patientDatails && patientDatails.mrn ? patientDatails.mrn : "",
                     patientMobile: patientDatails && patientDatails.mobileNo ? patientDatails.mobileNo : "",
                     patientEmail: patientDatails && patientDatails.email ? patientDatails.email : "",
                     selectedPatientDepartment:
                        patientDatails && patientDatails.department
                           ? {
                                label: patientDatails.department,
                                value: patientDatails.department,
                             }
                           : "",
                     selectedPatientDoctor:
                        patientDatails && patientDatails.doctorName
                           ? {
                                label: patientDatails.doctorName,
                                value: patientDatails.doctorName,
                             }
                           : "",
                     contentLoading: false,
                     patientID: patientDatails.id,
                     isCallEnable: patientDatails.isCallEnable,
                     patientRemarks: patientDatails.remarks,
                     editPatientDOBInList: dob,
                     editPatientNameInList: patientDatails && patientDatails.name ? patientDatails.name : "",
                     editPatientEmailInList: patientDatails && patientDatails.email ? patientDatails.email : "",
                     editPatientMobileInList: patientDatails && patientDatails.mobileNo ? patientDatails.mobileNo : "",
                  });

                  this.getPatientOnboardStatus(id);

                  // if (patientDatails && patientDatails.department) {
                  //   this.getDoctorList(patientDatails.department);
                  // }
               } else {
                  this.setState({
                     contentLoading: false,
                  });
               }
            },
            (error) => {
               if (error && error.status === 500) {
                  if (error.data && error.data.settings && error.data.settings.message) {
                     //this.ErrorAlertbar(error.data.settings.message);
                     this.setState({
                        contentLoading: false,
                     });
                     return;
                  }
               }

               if (error && error.status === 401) {
                  //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                  this.setState({
                     contentLoading: false,
                  });
                  return;
               }

               return;
            }
         );
      }
   };

   resetPatientData = () => {
      setTimeout(() => {
         this.setState({
            patientName: "",
            patientDOB: "",
            selectedPatientDepartment: "",
            selectedPatientDoctor: "",
            patientMRN: "",
            patientMobile: "",
            patientEmail: "",
            patientDoctorList: [],
            isValidMobile: null,
            isValidEmail: null,
            isValidName: null,
            isValidDOB: null,
         });
      }, 2000);
   };

   updatePatient = (patientId) => {
      if (
         this.state.isValidEmail === false ||
         this.state.isValidMobile === false ||
         this.state.isValidName === false ||
         this.state.isValidDOB === false ||
         (this.state.patientEmail.length > 0 && this.state.editPatientEmailInList.trim().length === 0) ||
         (this.state.patientMobile.length > 0 && this.state.editPatientMobileInList.trim().length === 0)
      ) {
         return;
      }
      this.setState({
         isValidMobile: null,
         isValidEmail: null,
         isValidName: null,
         isValidDOB: null,
         isLoading: true,
      });

      let mobileWithoutFormat = this.state.editPatientMobileInList?.replace(/\D/g, "");

      let queryParams = JSON.stringify({
         Authorization: `Bearer ${JSON.parse(this.props.storedObject.northwelluser).user.stsTokenManager.accessToken}`,
         action: socketActions.referral,
         subAction: socketSubActions.updateUserInfo,
         userId: patientId,
         loggedInUserId: this.userdetails.id,
         mrn: this.state.patientMRN,
         ...(this.state.patientName !== this.state.editPatientNameInList && {
            name: this.state.editPatientNameInList.trim().replace(/\s+/g, " "),
         }),
         ...(this.state.patientDOB !== this.state.editPatientDOBInList && {
            dob:
               this.state.editPatientDOBInList !== null
                  ? moment(this.state.editPatientDOBInList).format("YYYYMMDD")
                  : "",
         }),
         ...(this.state.patientEmail !== this.state.editPatientEmailInList && {
            email: this.state.editPatientEmailInList,
         }),
         ...(this.state.patientMobile !== this.state.editPatientMobileInList && {
            mobileNo: mobileWithoutFormat.length === 11 ? "+" + mobileWithoutFormat : "",
         }),
      });

      window.socket.send(queryParams, (result) => {
         if (result.settings?.status === 1) {
            this.setState({
               isLoading: false,
            });
            this.sweetAlertbar("Patient information updated successfully.");
            let query_params = {
               searchQuery: this.state.searchPatientName,
               page: this.state.activePage,
               pageSize: this.state.itemperpage,
            };
            this.getPatientList(query_params);
         } else {
            this.setState({
               isLoading: false,
            });
            this.ErrorAlertbar(result.settings?.message);
         }
      });
   };

   blockPatient = (id, bool) => {
      this.setState({
         isLoading: true,
      });

      let queryparams = {
         patientId: id,
         disabled: bool,
      };

      Apimanager.putPatientDetails(
         queryparams,
         (success) => {
            if (success && success.status === 200 && success.data && success.data.data) {
               this.sweetAlertbar(success.data.settings.message);
               let query_params = {
                  page: this.state.activePage,
                  pageSize: this.state.itemperpage,
               };
               this.getPatientList(query_params);
            } else {
               this.ErrorAlertbar(success.data.settings.message);
               this.setState({
                  isLoading: false,
               });
               return;
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });

            if (error && (error.status === 500 || error.status === 400)) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  this.ErrorAlertbar(error.data.settings.message);
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               return;
            }

            return;
         }
      );
   };

   patientVideoCall = (patientID, patientName) => {
      localStorage.setItem("videoPatientID", patientID);
      localStorage.setItem("patientNameVideo", patientName);

      var popUp = window.open("/video-call");

      let imagePath = "/assets/images/chrome.png";
      if (popUp == null || typeof popUp == "undefined") {
         var navigator = window.navigator;
         var nAgt = navigator.userAgent;

         if (nAgt.indexOf("Chrome") !== -1) {
            imagePath = "/assets/images/Chrome.png";
         }
         // In Safari, the true version is after "Safari" or after "Version"
         else if (nAgt.indexOf("Safari") !== -1) {
            imagePath = "/assets/images/Safari.png";
         }
         // In Firefox, the true version is after "Firefox"
         else if (nAgt.indexOf("Firefox") !== -1) {
            imagePath = "/assets/images/Firefox.png";
         }

         document.getElementById("modal-btn-open").click();
         this.setState({
            blockerImagePath: imagePath,
         });
      } else {
         popUp.focus();
      }
   };

   deletePatientRecord = (id) => {
      this.setState({
         isLoading: true,
      });
      Apimanager.deletePatientData(
         id,
         (success) => {
            if (success && success.data.settings.status === 1) {
               this.sweetAlertbar(success.data.settings.message);
               let queryparams = {
                  page: this.state.activePage,
                  pageSize: this.state.itemperpage,
               };
               this.getPatientList(queryparams);
            } else {
               this.ErrorAlertbar(success.data.settings.message);
               this.setState({
                  isLoading: false,
               });
               return;
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if ((error && error.status === 500) || error.status === 400) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  this.ErrorAlertbar(error.data.settings.message);
                  return;
               }
            }
            if (error && error.status === 401) {
               return;
            }
            return;
         }
      );
   };

   getRedirectOnName = (id, name, patientObj, status) => {
      let rctObj = this.props.recentSearchPLBArr;
      if (status !== "emr") {
         if (this.props.recentSearchPLBArr && this.props.recentSearchPLBArr.length > 0) {
            rctObj.unshift(patientObj);
         } else {
            rctObj = [patientObj];
         }
      }

      this.props.recentsearchdataPLB(rctObj);
      this.props.history.push("/patient/" + id, {
         patientObj: patientObj,
         searchtext: name,
      });
   };

   selectSharingTeam = (data) => {
      this.setState({
         selectSharing: data,
      });
   };

   addShareingTeam = () => {
      document.getElementById("close-add-tocare-team").click();

      this.setState({
         isLoading: true,
      });
      let queryparams = {
         name: this.state.patientCareName,
         email: this.state.patientCareEmail,
         userId: this.props.match.params.patientid,
         mobileNo: this.state.phoneNumber ? "+" + this.state.phoneNumber.replace(/[^0-9]/g, "") : "",
         fromAddressBook: false,
      };

      Apimanager.postShareing(
         queryparams,
         (success) => {
            Analytics.record(
               {
                  invitedUserEmail: success?.data?.email,
                  invitedUserId: success?.data?.id,
                  invitedUserName: success?.data?.name,
                  ...this.getPatientData(),
               },
               this.userdetails.id,
               Analytics.EventType.inviteFamilyFriends
            );
            this.sweetAlertbar("Successfully added to personal care team. ");
            this.careTeam(this.props.match.params.patientid);
            this.setState({
               phoneNumber: "",
               patientCareEmail: "",
               patientCareName: "",
               isLoading: false,
            });
         },
         (error) => {
            if (error && error.status !== 401) {
               this.setState({
                  isLoading: false,
                  selectSharing: "",
               });

               this.ErrorAlertbar(error.data.settings.message);
            }
         }
      );
   };

   changeObjectvalue(object, event) {
      this.phone_number = event.target ? event.target.value : "";

      object && object.phone
         ? (object.phone = event.target.value)
         : this.setState({
              phoneNumber: event.target.value,
           });
   }

   handleChange(object, event) {
      typeof object === "object"
         ? (object.emailAddress = event.target.value)
         : this.setState({
              patientCareEmail: event.target.value,
           });
   }

   changeSharingName = (e) => {
      this.setState({
         patientCareName: e.target.value,
      });
   };

   closeNewModel = (id) => {
      document.getElementById(id).click();
      this.setState({
         phoneNumber: "",
         patientCareEmail: "",
         patientCareName: "",
         mediaData: "",
      });
   };

   getPatientData = () => ({
      patientId: this.state.patientID || null,
      patientName: this.state.patientName || null,
      patientNumber: this.state.patientMobile || null,
      patientEmail: this.state.patientEmail || null,
   });

   analyticsContentParams = (object) => ({
      addedByName: object.addedByName || null,
      addedBy: object.addedBy || null,
      title: object.title || null,
      type: object.fileType || null,
      location: object.location || null,
      ...this.getPatientData(),
   });

   recordMediaAnalytics = (object, watchDuration, totalDuration, eventType) => {
      let params = {
         watchDuration: watchDuration,
         totalDuration: totalDuration,
         mediaId: object.id,
      };
      Analytics.record(params, this.userdetails.id, eventType);
   };

   showContentDescriptions = (object, firstline) => {
      this.setState({
         mediaData: "",
         medaiPath: "",
         isLoading: true,
         mutedAudio: false,
         image: "",
         title: firstline,
         description: "",
         contentSelected: object,
      });

      let params = this.analyticsContentParams(object);

      params[object.type === "media" ? "mediaId" : "itemId"] = object.id;
      Analytics.record(
         params,
         this.userdetails.id,
         object.type === "media" ? Analytics.EventType.mediaViewed : Analytics.EventType.itemViewed
      );

      if (object.type === "referral") {
         let queryParams = {
            referralId: object.id,
         };
         Apimanager.getReferralDetails(
            queryParams,
            (success) => {
               if (success && success.data && success.data.data) {
                  this.setState({
                     referralPatientDetails: success.data.data,
                     showContentDescriptionObject: object,
                  });
                  this.openReferralDetailsStatus();
               }
            },
            (error) => {
               console.log("error");
            }
         );
         return;
      }
      if (
         object.fileType === "text" ||
         object.fileType === undefined ||
         object.type === "text" ||
         object.type === "item"
      ) {
         let ApiParam = {
            visitId: object.visitId,
            eventName: "itemViewed",
            chapterId: object.chapterId,
            itemId: object.id,
         };
         Apimanager.activityLogs(
            ApiParam,
            (success) => {
               this.recentActivity(this.props.match.params.patientid);
            },
            (error) => {
               if (error && error.status === 500) {
                  //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                  return;
               }
            }
         );
      }

      if (object.location) {
         let location = object.location.replace(".", "/");
         let split = object.location.split(".");

         let requestparams = {
            location: object.id, //location,
         };
         let params = {
            operationType: "read",
         };
         Apimanager.getMediaURL(
            requestparams,
            params,
            (success) => {
               if (success && success.data && success.data.data && success.data.data.signedUrl) {
                  if (split[1] === "pdf" || object.type === "application/pdf" || object.type.includes("application")) {
                     this.setState({
                        medaiPath: success.data.data.signedUrl,
                        mediaData: object,
                        isLoading: false,
                     });
                     document.getElementById("open-create-recent-content").click();
                  } else {
                     this.setState({
                        medaiPath: success.data.data.signedUrl,
                        mediaData: object,
                        isLoading: false,
                     });
                     document.getElementById("open-create-recent-content").click();
                     if (object.fileType === "text/plain") {
                        var req = new XMLHttpRequest();
                        req.overrideMimeType("application/json");
                        req.open("GET", success.data.data.signedUrl, true);
                        req.onload = function () {
                           const element = document.createElement("a");
                           const file = new Blob([req.responseText], {
                              type: "text/plain",
                           });
                           element.href = URL.createObjectURL(file);
                           element.download = object.fileName;
                           document.body.appendChild(element); // Required for this to work in FireFox
                           element.click();
                        };
                        req.send(null);
                     }
                  }
               }
               this.recentActivity(this.props.match.params.patientid);
            },
            (error) => {
               if (error && error.status === 500) {
                  //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
                  return;
               }
            }
         );
      } else {
         // let mdata = { ...object };
         // if (mdata.title?.length > 50) {
         //   let text = mdata.title;
         //   if (mdata.subTitle) {
         //     mdata.subTitle = text + mdata.subTitle;
         //   } else if (mdata.description) {
         //     mdata.description = text + mdata.description;
         //   }
         //   // mdata.subTitle = text + mdata.subTitle;
         //   let gapIndx = mdata.mentions.findIndex((o) => o.isForTitle);
         //   let gapObj = mdata.mentions[gapIndx];
         //   if (gapObj?.id) {
         //     mdata.mentions.forEach((o) => {
         //       if (o.id !== gapObj.id) {
         //         o.start += mdata.title.length;
         //       }
         //       o.isForTitle = false;
         //     });
         //   }
         // }
         this.setState({
            mediaData: object,
            isLoading: false,
         });
         document.getElementById("open-create-recent-content").click();
      }
   };

   getVisits() {
      this.setState({
         isLoading: true,
         image: null,
         isUploading: null,
         percentageUploaded: 0,
      });

      Apimanager.getVisits(
         this.props.match.params.patientid,
         pagination,
         (success) => {
            let update = 1;
            if (success && success.data && success.data.data) {
               let vData = success.data.data;
               if (vData.length === 1 && vData[0].visitType === "WCV") {
                  update = 2;
               }
            }

            this.setState(
               {
                  visitsData: success && success.data && success.data.data && update === 1 ? success.data.data : [],
                  visitChapters: [],
                  isLoading: false,
                  mediatype: "media",
                  dragDropDiv: "drag-drop-overlay file-input hide-div",
               },
               () => {
                  if (success && success.data && success.data.data && update === 1) {
                     this.visitSearch(success.data.data[0].id);
                  } else {
                     this.ErrorAlertbar("Please create a visit for uploading a content");
                  }
               }
            );
         },
         (error) => {
            if (error && error.status === 404) {
               this.setState({
                  visitsData: [],
                  visitChapters: [],
                  isLoading: false,
               });
               this.ErrorAlertbar(error.data.settings.message);
               this.setState({
                  dragDropDiv: "drag-drop-overlay file-input hide-div",
               });
            } else if (error && error.status === 500) {
               //this.ErrorAlertbar(error.messages, "error")
               this.setState({
                  isLoading: false,
                  visitChapters: [],
                  visitsData: [],
               });
            }
         }
      );
   }

   visitSearch = (id, open = "") => {
      this.setState({
         isLoading: true,
      });

      Apimanager.visitSearch(
         id,
         (success) => {
            if (success && success.data && success.data.data) {
               let sChapters = "";

               success.data.data[0].chapters.map((object) => {
                  if (success.data.data[0].isHospitalVisit) {
                     if (object.type === "DAU") {
                        sChapters = {
                           value: object.id,
                           label: object.title,
                           type: object.type,
                        };
                     }
                  } else {
                     if (object.type === "URV") {
                        sChapters = {
                           value: object.id,
                           label: object.title,
                           type: object.type,
                        };
                     }
                  }
                  return null;
               });

               if (sChapters) {
                  this.setState({
                     isLoading: false,
                     visitChapters: success.data.data[0].chapters,
                     selectedChapters: sChapters,
                  });
               } else {
                  sChapters = {
                     value: success.data.data[0].chapters[0].id,
                     label: success.data.data[0].chapters[0].title,
                     type: success.data.data[0].chapters[0].type,
                  };

                  this.setState({
                     isLoading: false,
                     visitChapters: success.data.data[0].chapters,
                     selectedChapters: sChapters,
                  });
               }

               if (open === "") {
                  document.getElementById("open-create-recent-media").click();
               }
            } else {
               this.setState({
                  isLoading: false,
               });
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
               visitChapters: [],
            });

            if (error && error.status === 500) {
               //this.ErrorAlertbar(error.messages, "error")
               return;
            }

            if (error && error.status === 404) {
               // this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               return;
            }
         }
      );
   };

   renderSwitch(param) {
      switch (param) {
         case "CTM":
            return visittype.CTM;
         case "WCV":
            return visittype.WCV;
         case "DIS":
            return visittype.DIS;
         case "ANR":
            return visittype.ANR;
         case "MED":
            return visittype.MED;
         case "PBU":
            return visittype.PBU;
         case "DAP":
            return visittype.DAP;
         case "SYM":
            return visittype.SYM;
         case "MRS":
            return visittype.MRS;
         // case "ANR": return visittype.ANR;
         case "WCI":
            return visittype.WCI;
         case "NIS":
            return visittype.NIS;
         case "POP":
            return visittype.POP;
         case "AIN":
            return visittype.AIN;
         case "URV":
            return visittype.URV;
         case "AAR":
            return visittype.AAR;
         case "INP":
            return visittype.INP;
         default:
            return null;
      }
   }

   renderIcon(param, colorScheme) {
      switch (param.type) {
         case "CTM":
            return <img alt="Headshot" src="/assets/images/Headshot.png" />;
         case "WCV":
            return <chapterIcons.WCV fill={colorScheme} />;
         case "DIS":
            return <chapterIcons.DIS fill={colorScheme} />;
         case "ANR":
            return <chapterIcons.ANR fill={colorScheme} />;
         case "MED":
            return <chapterIcons.MED fill={colorScheme} />;
         case "PBU":
            return <chapterIcons.PBU fill={colorScheme} />;
         case "DAP":
            return <chapterIcons.DAP fill={colorScheme} />;
         case "SYM":
            return <chapterIcons.SYM fill={colorScheme} />;
         case "SMR":
            return <chapterIcons.SYM fill={colorScheme} />;
         case "MRS":
            return <chapterIcons.MRS fill={colorScheme} />;
         case "DAU":
            return <chapterIcons.SYM fill={colorScheme} />;
         case "WCI":
            return <chapterIcons.WCI fill={colorScheme} />;
         case "NIS":
            return <chapterIcons.NIS fill={colorScheme} />;
         case "POP":
            return <chapterIcons.POP fill={colorScheme} />;
         case "POS":
            return <chapterIcons.POP fill={colorScheme} />;
         case "POI":
            return <chapterIcons.POP fill={colorScheme} />;
         case "AIN":
            return <chapterIcons.AIN fill={colorScheme} />;
         case "URV":
            return <chapterIcons.PBU fill={colorScheme} />;
         case "AAR":
            return <chapterIcons.AAR fill={colorScheme} />;
         case "DOC":
            return <chapterIcons.DOC fill={colorScheme} />;
         default:
            return null; //<chapterIcons.AAR fill={colorScheme} />;
      }
   }

   renderChappters() {
      const { visitChapters } = this.state;
      return visitChapters && Array.isArray(visitChapters) && visitChapters.length && visitChapters[0].chapters
         ? visitChapters[0] &&
              visitChapters[0].chapters.map((object, index) => {
                 return (
                    <span key={index}>
                       {object.type !== "CTM" && (
                          <li className={object.isHoveractive ? "active" : ""} onClick={() => this.shareMedia(object)}>
                             {/* care team is no need to show in admin panel 23 rd october call  */}
                             <div className="detail-icon-diagnosis">
                                <span className="list-icon">{this.renderIcon(object, "#0063e8")}</span>
                                <div className="label" style={object.isActive ? undefined : { width: 150 }}>
                                   <span className="detail-name">{object && object.title ? object.title : ""}</span>
                                   <br />
                                   <span className="date">{moment.unix(object.lastUpdate).format("MM/DD/YYYY")}</span>
                                </div>
                             </div>
                          </li>
                       )}
                    </span>
                 );
              })
         : !visitChapters.length && <h2 className="no-result">{i18n.chapter && i18n.chapter.nochaptererror}</h2>;
   }

   checkImage = (id) => {
      this.setState({
         [id]: false,
      });
   };

   changeScreen = (type) => {
      var nAgt = navigator.userAgent;

      if (type === "record") {
         if (nAgt.indexOf("Chrome") !== -1) {
            this.setState({
               mediatype: type,
               recordStart: false,
               image: null,
               title: "",
               description: "",
            });
         } else {
            swal1(
               <div>
                  <p>Your browser doesn't support screen recording.</p>
                  <p>
                     Screen recording is supported on Chrome{" "}
                     <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
                        Click here
                     </a>{" "}
                     to download Chrome
                  </p>
               </div>
            );
         }
      } else {
         this.setState({
            mediatype: type,
            recordStart: false,
            image: null,
            title: "",
            description: "",
            postMediaType: type === "library" ? "lib" : "",
         });
      }
   };

   handleChangeSelect = (visit) => {
      this.setState({
         selectedVisit: visit,
      });

      this.visitSearch(visit.value, "open");
   };

   handleChangeSelectChapters = (chapters) => {
      this.setState({
         selectedChapters: chapters,
      });
   };

   handleChangeFiles = (event) => {
      if (event.target.files && event.target.files[0]) {
         let fName = event.target.files[0].name.split(".");

         let reader = new FileReader();
         let file = event && event.target && event.target.files ? event.target.files[0] : null;
         reader.onloadend = (e) => {
            let newSelectedAttachment = {};
            newSelectedAttachment.attachmentUrl = URL.createObjectURL(file);
            newSelectedAttachment.file = file;
            newSelectedAttachment.blobData = e.target.result;
            this.setState({
               image: newSelectedAttachment,
               title: this.state.title ? this.state.title : fName[0],
            });
         };
         reader.readAsDataURL(file);
      }
   };

   handleTextChange = (e) => {
      this.setState({
         title: e.target.value,
      });
   };

   showPreview = (image) => {
      var filename = image && image.file && image.file.name && image.file.name.split(".");
      //let pUrl =URL.createObjectURL(image)
      (filename && previewfileformat.includes(_.last(filename)) && window.open(image.attachmentUrl, "_blank")) ||
         this.notify(i18n && i18n.share && i18n.share.previewnotsupport);
   };

   viewedByPatientProvider = (id) => {
      let ApiParam = {
         mediaId: id,
      };

      this.setState({
         isLoading: true,
      });

      Apimanager.mediaViews(
         ApiParam,
         (success) => {
            this.setState({
               viewedListData: success.data.data,
               isLoading: false,
            });

            document.getElementById("open-viewed-media-patient").click();
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if (error && error.status === 500) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               return;
            }
         }
      );
   };

   formatPhoneNumber = (phoneNumberString) => {
      var cleaned = ("" + phoneNumberString).replace(/\D/g, "");
      var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
      if (match) {
         var intlCode = match[1] ? "+1 " : "";
         return [intlCode, "(", match[2], ") ", match[3], "-", match[4]].join("");
      }
      return null;
   };

   closeContentModel = () => {
      this.setState({
         mutedAudio: true,
      });
      var vid = document.getElementById("content-video");
      if (vid) {
         vid.muted = true;
      }
   };

   clearall = (e) => {
      e.preventDefault();
      this.setState({
         image: null,
         title: "",
         description: "",
         mediatype: "media",
         recordStart: false,
         isRecAudioActive: false,
         isRecVideoActive: false,
      });
      document.getElementById("content-upload-view").value = null;
      document.getElementById("open-create-recent-media").click();
   };

   getmimetype = (args) => {
      switch (args.filetype) {
         case "pdf":
            return "application/pdf";
         case "jpeg":
            return "image/jpeg";
         case "jpg":
            return "image/jpg";
         case "mp4":
            return "video/mp4";
         case "mov":
            return "video/quicktime";
         case "m4a":
            return "audio/m4a";
         case "mp3":
            return "audio/mp3";
         case "mpeg":
            return "audio/mpeg";
         case "text":
            return "text/plain";
         case "png":
            return "image/png";
         case "txt":
            return "text/plain";
         case "doc":
            return "application/msword";
         case "ppt":
            return "application/vnd.ms-powerpoint";
         case "rtf":
            return "text/rtf";
         case "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
         case "pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
         case "xls":
            return "application/vnd.ms-powerpoint";
         case "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
         case "csv":
            return "text/csv";
         case "webm":
            return "video/mp4";
         default:
            return "image/jpeg";
      }
   };

   /**
    * Add chapter media create signed url
    * @argument image :object
    * @argument title: string
    * @argument binaryPath: binary string
    * @argument isForDoctor: boolean
    */
   addchapterMedia = async (e) => {
      e.preventDefault();
      const { location } = this.props;
      const { image, title, binaryPath, isForDoctor, description } = this.state;
      var existing =
         location &&
         location.state &&
         location.state.shearedparams &&
         location.state.shearedparams.media &&
         _.map(location.state.shearedparams.media, (object) => {
            return object.type;
         });
      var type = image && image.file && image.file.type && image.file.type.split("/");
      var filename = image && image.file && image.file.name && image.file.name.split(".");
      var isuploadmedia = this.state.mediatype === "media" || this.state.mediatype === "record";

      if (isuploadmedia && !image) {
         //this.notify(i18n && i18n.share && i18n.share.validchaptererrormsg);
         this.ErrorAlertbar(i18n && i18n.share && i18n.share.validchaptererrormsg);
         return;
      } else if (isuploadmedia && type[0] === "video" && !allowdVideotypes.includes(_.last(filename).toLowerCase())) {
         this.ErrorAlertbar(i18n && i18n.share && i18n.share.validmediaerrmsg);
         return;
      } else if (isuploadmedia && !accepttypes.includes(_.last(filename).toLowerCase())) {
         this.ErrorAlertbar(i18n && i18n.share && i18n.share.validdocumenterrmsg);
         return;
      } else if (!title) {
         this.ErrorAlertbar(i18n && i18n.share && i18n.share.titlenameerrmsg);
         return;
      } else if (!isuploadmedia && !description) {
         this.ErrorAlertbar(i18n && i18n.share && i18n.share.textdesc);
         return;
      }
      this.setState({
         isLoading: true,
      });
      var requestparams = {
         visitId: this.state.selectedVisit ? this.state.selectedVisit.value : sVisit.value,
         chapterId: this.state.selectedChapters.value,
      };
      var requestpayload = {
         type: filename ? this.getmimetype({ filetype: _.last(filename).toLowerCase() }) : "text", // image && image.file && image.file.type || `application/${_.last(filename).toLowerCase()}`,
         title: title,
         isDoctorsOnly: isForDoctor,
         isConvert: this.state.mediatype === "record" ? true : false,
      };
      if (image) {
         requestpayload.location = image.file.name;
      } else if (!isuploadmedia && description) {
         requestpayload.location = title;
         requestpayload.description = description;
      }

      if (
         !isuploadmedia &&
         !(
            this.state.selectedChapters.label === "Provider Only" ||
            this.state.selectedChapters.label === "Daily Updates"
         )
      ) {
         this.addUpdateItem(requestpayload);
         return;
      } else {
         //requestpayload.location = title;
      }

      Apimanager.chapterMedia(
         requestparams,
         requestpayload,
         (success) => {
            if (!isuploadmedia) {
               // this.setState(initState, () => this.props.changestep(2));
               // return;
               this.setState({
                  isLoading: false,
               });
               this.recentActivity(this.props.match.params.patientid);
               this.sweetAlertbar("Content created successfully.");
               document.getElementById("open-create-recent-media").click();
               return;
            }
            var uploadpayload = {
               binaryPath: binaryPath,
               imageObject: image.file,
               token: {},
               successResponse: success.data.data,
            };
            var argumentParams = {
               title: title,
               location:
                  success &&
                  success.data &&
                  success.data.data &&
                  success.data.data.items &&
                  success.data.data.items.location,
               type: "media",
            };

            this.state.selectedChapters.label === "Discharge Instructions" &&
               image.file.type === "application/pdf" &&
               !existing.includes("application/pdf") &&
               this.addUpdateItem(argumentParams);

            // isuploadmedia && image && this.uploadmedia(uploadpayload)

            isuploadmedia &&
               image &&
               this.setState({ isUploading: !this.state.isUploading }, () => this.uploadmedia(uploadpayload, "normal"));
         },
         (error) => {
            if (error && error.status === 422) {
               this.ErrorAlertbar(i18n && i18n.share && i18n.share.validchaptererrormsg);
               this.setState({
                  isLoading: false,
               });
            }
            //error && error.status === 500 && this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
         }
      );
   };

   /**
    * using signed url store media to google storage bucket
    * fileObjectcontains signed path with storage bucket
    * @argument fileObject
    */

   uploadmedia = async (fileObject, type) => {
      this.toastId.current = null;
      var params = fileObject.imageObject;
      var file_size = 361;
      if (fileObject.imageObject.size) {
         file_size = fileObject.imageObject.size;
      }
      fileObject.token["Content-Type"] = "application/octet-stream";
      this.contentUploadref.current = Apimanager.uploadmedia(
         fileObject.successResponse.signedUrl,
         params,
         (success) => {
            // this.setState({
            //   isLoading: false,
            //   image: null,
            //   title: "",
            //   percentageUploaded: 0,
            //   isUploading: false,
            // });

            if (type === "direct" && this.state.mediatype !== "media" && this.state.mediatype !== "record") {
               // this.sweetAlertbar("Media shared successfully.");

               this.closeSendTextModel("media");
            } else {
               if (this.state.contentType === "provider") {
                  this.recentActivityProviderOnly(this.props.match.params.patientid);
               }

               this.recentActivity(this.props.match.params.patientid);

               // this.sweetAlertbar("Content created successfully.");
               // document.getElementById("open-create-recent-media").click();
               if (document.getElementById("create-recent-media").style.display === "block") {
                  document.getElementById("create-recent-media").click();
               }
            }

            //return;
         },
         (error) => {
            if (error && error.status === 500) {
               this.setState("", () => this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg));
            }
         },

         (uploadmedia) => {
            let FileProgress = Math.floor((uploadmedia / file_size) * 100);
            if (FileProgress === 100) {
               this.closeSendTextModel("media");
               document.getElementById("open-create-recent-media").click();
               this.sweetAlertbar("Media shared successfully.");
               // document.getElementById("redirectmsg").innerHTML = i18n.share.fileprocessing;
            }
            this.setState({
               isLoading: FileProgress === 100 ? false : this.state.isLoading,
               image: FileProgress === 100 ? null : this.state.image,
               title: FileProgress === 100 ? "" : this.state.title,
               percentageUploaded: FileProgress === 100 ? 0 : FileProgress,
               isUploading: FileProgress === 100 ? false : this.state.isUploading,
               isContentUploading: FileProgress === 100 ? false : true,
               clearUploadingContent: FileProgress === 100,
            });

            if (this.toastId.current === null && FileProgress !== 100) {
               this.toastId.current = toast("Upload in Progress", {
                  progress: 0,
                  position: "top-left",
                  closeOnClick: false,
                  pauseOnHover: false,
                  draggable: false,
                  closeButton: false,
               });
            } else {
               toast.update(this.toastId.current, {
                  progress: this.state.percentageUploaded / 100,
               });
               if (FileProgress === 100) {
                  document.getElementById("content-upload-view").value = null;
                  toast.done(this.toastId.current);
               }
            }
         }
      );
   };

   /**
    * Add pdf item if file is pdf and visit type is discharge instruction
    *
    */
   addUpdateItem = (args) => {
      let params = {
         title: args && args.title,
         subTitle: args && args.description ? args.description : "No description",
         icon: "images.jpg",
      };

      if (args && args.type && args && args.location) {
         params = {
            title: args.title,
            subTitle: args.description ? args.description : "No description",
            icon: "images.jpg",
            type: args.type,
            location: args.location,
         };
      }

      var isuploadmedia = this.state.mediatype === "media";
      var requestparams = {
         visitId: this.state.selectedVisit ? this.state.selectedVisit.value : sVisit.value,
         chapterId: this.state.selectedChapters.value,
      };

      Apimanager.addUpdateItem(
         requestparams,
         params,
         (success) => {
            if (isuploadmedia) {
               this.props.location.state.shearedparams.media.push({
                  type: "application/pdf",
                  description: "",
               });

               this.setState({
                  isLoading: false,
                  title: "",
                  description: "",
               });
            } else {
               this.recentActivity(this.props.match.params.patientid);
               this.sweetAlertbar("Content created successfully.");
               document.getElementById("open-create-recent-media").click();
               this.setState({
                  isLoading: false,
                  title: "",
                  description: "",
               });
               return;
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if (error && error.status === 500) {
               this.ErrorAlertbar(error.message || (error.data && error.data.settings && error.data.settings.message));
               return;
            }
            if (error && error.status === 403) {
               this.ErrorAlertbar(error.message || (error.data && error.data.settings && error.data.settings.message));
               return;
            }
         }
      );
   };

   descriptionValue = (event) => {
      this.setState({
         description: event.target.value,
      });
   };

   startRecod = (flag) => {
      this.setState({
         recordStart: flag,
      });
   };

   getRecordedBlob = (blob) => {
      if (blob === null) {
         this.setState({
            image: null,
            title: "",
            isRecVideoEnabled: true,
            isRecAudioEnabled: true,
         });
         return;
      }
      if (blob) {
         let reader = new FileReader();
         let name = "Screen-Recording.webm";
         let blobType = blob.type.split("/")[1];

         if (blobType === "mpeg") {
            name = `Audio.${blobType}`;
         } else if (blobType === "webm" && this.state.isRecVideoActive) {
            name = `Video.${blobType}`;
         }

         let fileData = new File([blob], name, { type: blob.type });

         reader.onloadend = (e) => {
            let newSelectedAttachment = {};
            newSelectedAttachment.attachmentUrl = URL.createObjectURL(blob);
            newSelectedAttachment.file = fileData;
            //newSelectedAttachment.blobData = blob;
            // if (this.state.image === null) {
            // }
            this.setState({
               image: newSelectedAttachment,
               title: this.state.title ? this.state.title : name.split(".")[0],
            });
         };
         reader.readAsDataURL(fileData);
      }
   };

   getLibraryList = () => {
      Apimanager.getLibraryList(
         {},
         (success) => {
            this.setState({
               libraryList: success.data ? success.data : "",
               libraryListCopy: success.data ? success.data : "",
            });
         },
         (error) => {
            if (error && error.status === 500) {
               return;
            }
         }
      );
   };

   shareLibrary = (e, lib, openNewTab = false) => {
      e.preventDefault();
      this.setState({
         isLoading: true,
      });

      let requestparams = {
         location: lib.location,
      };
      let params = {
         operationType: "read",
      };

      Apimanager.getMediaURL(
         requestparams,
         params,
         (success) => {
            if (success && success.data && success.data.data && success.data.data.signedUrl) {
               if (openNewTab) {
                  this.setState({
                     isLoading: false,
                  });
                  window.open(success.data.data.signedUrl);
               } else {
                  let blob = fetch(
                     success.data.data.signedUrl,
                     { mode: "no-cors" },
                     {
                        method: "GET",
                        headers: {
                           "Content-Type": "application/json",
                           "API-Key": process.env.REACT_APP_FIREBASEAPIKEY,
                           "Access-Control-Allow-Origin": "*",
                        },
                     }
                  ).then((r) => r.blob());
                  //
                  blob.then((v) => {
                     let fileObj = new File([v], lib.location, { type: lib.type });
                     let newSelectedAttachment = {};
                     newSelectedAttachment.attachmentUrl = success.data.data.signedUrl;
                     newSelectedAttachment.file = fileObj;

                     this.setState({
                        isLoading: false,
                        mediatype: "media",
                        image: newSelectedAttachment,
                        title: this.state.title ? this.state.title : lib.title,
                        comingFromLib: true,
                     });
                  });
               }
            }
         },
         (error) => {
            if (error && (error.status === 422 || error.status === 500)) {
               this.ErrorAlertbar(error.data.data.settings.message);
               this.setState({
                  isLoading: false,
               });
            }
         }
      );
   };

   addLibraryToPatient = (e) => {
      e.preventDefault();
      this.setState({
         isLoading: true,
      });

      const { image, title, isForDoctor } = this.state;

      var requestparams = {
         visitId: this.props.match.params.visitid,
         chapterId: this.props.match.params.chapterId,
      };
      var requestpayload = {
         isDoctorsOnly: isForDoctor,
         location: image.file.location,
         chapterId: this.props.match.params.chapterId,
         isDocumentLibrary: true,
         title: title,
         type: image.file.type,
         visitId: this.props.match.params.visitid,
      };

      Apimanager.chapterMedia(
         requestparams,
         requestpayload,
         (success) => {
            this.props.changestep(2);
         },
         (error) => {
            if (error && (error.status === 422 || error.status === 500)) {
               this.ErrorAlertbar(error.data.data.settings.message);
               this.setState({
                  isLoading: false,
               });
            }
         }
      );
   };

   swalClick = (e, list) => {
      e.preventDefault();
      swal({
         title: list.title,
         text: "Are you sure you want to share this file?",
         buttons: true,
         dangerMode: true,
      }).then((willDelete) => {
         if (willDelete) {
            this.shareLibrary(e, list);
         }
      });
   };

   tagSwalClick = (e, list) => {
      e.preventDefault();
      swal({
         title: list.name,
         text: "Are you sure you want to share all documents in this bundle?",
         buttons: true,
         dangerMode: true,
      }).then((willDelete) => {
         if (willDelete) {
            this.setState({
               isLoading: true,
            });
            Apimanager.assignDocumentsToUserWithTag(
               {
                  userId: this.state.patientID,
                  tag: list.name,
                  isDoctorsOnly: this.state.isForDoctor,
               },
               (success) => {
                  this.setState({
                     isLoading: false,
                  });
                  Analytics.record(
                     {
                        bundleName: list.name,
                        tag: list.name,
                        ...this.getPatientData(),
                     },
                     this.userdetails.id,
                     Analytics.EventType.bundleShare
                  );
                  swal("Completed!", "All the documents have been shared with the patient.", "success").then(
                     (buttonTapped) => {
                        if (buttonTapped) {
                           document.getElementById("open-create-recent-media").click();
                        }
                     }
                  );
               },
               (error) => {
                  this.setState({
                     isLoading: false,
                  });
                  swal("Something went wrong!", "There is some server error, Please try after some time.", "error");
               }
            );
         }
      });
   };

   activeFilter = () => {
      if (this.state.userDetailsVal) {
         this.setState({
            hospitalSelected: {
               label: this.state.userDetailsVal ? this.state.userDetailsVal.user.hospitalName : "",
               value: this.state.userDetailsVal ? this.state.userDetailsVal.user.hospitalId : "",
            },
         });
      }
      this.setState(
         {
            activeFilter: !this.state.activeFilter,
         },
         function () {
            if (this.state.activeFilter) {
               this.getHospitalListing();
            }
         }
      );
   };

   resetFilterData = () => {
      this.setState({
         searchDob: "",
         searchFirstName: "",
         searchLastName: "",
         searchMiddleName: "",
         searchMrn: "",
         isLoading: true,
         recordMessage: "",
         hospitalSelected: "",
         searchPatientName: "",
         activePage: 1,
      });

      let queryparams = {
         searchQuery: "",
         page: 1,
         pageSize: this.state.itemperpage,
      };
      this.getPatientList(queryparams);
   };
   dragFile = (e, type) => {
      this.setState({
         dragDropDiv:
            type === "provider" ? "drag-drop-overlay file-input hide-div" : "drag-drop-overlay file-input open-div",
         dragPatientListDiv: "open-div",
         isForDoctor: type === "provider" ? true : false,
         dragDropProviderDiv:
            type === "provider" ? "drag-drop-overlay file-input open-div" : "drag-drop-overlay file-input hide-div",
         image: null,
         percentageUploaded: 0,
         isUploading: false,
      });
   };

   handleDragFiles = (event) => {
      //this.getVisits();

      this.setState({ image: null, mediatype: "media" });

      if (event.target.files && event.target.files[0]) {
         let fName = event.target.files[0].name.split(".");

         let reader = new FileReader();
         let file = event && event.target && event.target.files ? event.target.files[0] : null;
         reader.onloadend = (e) => {
            let newSelectedAttachment = {};
            newSelectedAttachment.attachmentUrl = URL.createObjectURL(file);
            newSelectedAttachment.file = file;
            newSelectedAttachment.blobData = e.target.result;

            this.setState({
               image: newSelectedAttachment,
               title: fName[0],
            });
         };
         reader.readAsDataURL(file);
         document.getElementById("open-create-recent-media").click();
      }
   };

   dragLeave = () => {
      if (document.getElementsByClassName("modal add-tocare custom-modal fade show").length > 0) {
         return;
      }
      this.setState({
         dragDropDiv: "drag-drop-overlay file-input hide-div",
         dragPatientListDiv: "hide-div",
         dragDropProviderDiv: "drag-drop-overlay file-input hide-div",
      });
   };

   getApplyFilter = (status) => {
      this.filterData(status);
   };

   getInviteNorthPatient = (obj) => {
      // document.getElementById("modal-open").click();
      // this.setState({
      // northTypeObj: obj,
      // northMobile: obj.mobileNo
      //   ? obj.mobileNo.substring(obj.mobileNo.length - 10)
      //   : "",
      // northEmail: obj.email,
      // modalState: false,
      // isInvitePatient: true,
      // northwelluser: obj,
      // });

      if (obj.assigningAuthority === "AIPB") {
         this.getRedirectOnName(obj.mrn, obj.firstName, obj);
      } else {
         // this.setState({
         //   isInvitePatient: true,
         //   northwelluser: obj,
         // });
         // socket = new Socket();
         let patientData = { ...obj };
         let socketObj = {
            mrn: patientData.mrn,
            birthDate: patientData.dob,
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            mobileNo: patientData.mobileNo,
            healthSystemData: patientData,
            email: patientData.email,
            Authorization: `Bearer ${
               JSON.parse(this.props.storedObject.northwelluser).user.stsTokenManager.accessToken
            }`,
            subAction: socketSubActions.addPatient,
            action: socketActions.referral,
         };
         this.setState({ emrLoading: true });
         window.socket.send(JSON.stringify(socketObj), (result) => {
            if (result.settings.status === 1) {
               this.setState({ patientMRN: result.data.mrn, emrLoading: false }, () => {
                  this.getRedirectOnName(result.data.id, result.data.name, result.data);
                  // this.runNorthwellInviteAnalytics(result.data);
               });
            }
            window.socket.close();
         });

         // this.props.setInvitePatient({
         //   invitePatientData: {
         //     isInvitePatient: true,
         //     dataObj: obj,
         //     isEmr: true,
         //     patientData: this.getPatientData(),
         //   },
         // });
      }
   };

   runNorthwellInviteAnalytics(data) {
      let providerDetails = JSON.parse(this.props.userCredentials).user;
      let analytics = {
         invitedUserBirthDate: data?.dob,
         invitedUserMobile: data?.mobileNo,
         invitedUserName: data?.name,
         invitedUserEmail: data?.email,
         invitedPatientId: data?.id,
      };
      delete analytics.invitedPatientId;
      analytics["invitedUserId"] = data?.id;
      Analytics.record(analytics, providerDetails.id, Analytics.EventType.inviteEMR);
   }

   getAge = (birthday) => {
      let nd = moment(birthday).format();
      var dateVal = new Date(nd); //moment(); //new Date(birthday);
      var ageDifMs = Date.now() - dateVal.getTime();
      var ageDate = new Date(ageDifMs); // miliseconds from epoch
      return Math.abs(ageDate.getUTCFullYear() - 1970);
   };

   sendInvite = (obj) => {
      this.setState({
         sendLoader: true,
      });

      let qm = {
         v: 1.2,
         healthSystemData: obj,
         firstName: obj.firstName + " " + obj.lastName,
         slug: obj.mrn,
         smsNotification: this.state.northMobile ? true : false,
         emailNotification: this.state.northMobile ? false : this.state.northEmail ? true : false,
         mobileNo: this.state.northMobile,
         isCheckDuplicate: true,
         gender: obj.gender,
         type: "personal",
         isAdmin: true,
         email: this.state.northEmail,
         birthDate: moment(obj.dob).format("YYYYMMDD"),
      };

      Apimanager.inviteuser(
         qm,
         (success) => {
            if (success && success.data) {
               //this.sweetAlertbar(success.data.settings.message);
               document.getElementById("close-north-invite-modal").click();

               this.setState({
                  sendLoader: false,
               });
               let rctObj = this.props.recentSearrchNorthArr;
               if (this.props.recentSearrchNorthArr && this.props.recentSearrchNorthArr.length > 0) {
                  rctObj.unshift(success.data);
               } else {
                  rctObj = [success.data];
               }

               this.props.recentsearchdataNorth(rctObj);
               this.props.history.push({
                  pathname: "/invitepatient",
                  pId: success.data.id,
                  patientName: success.data.name,
               });
            } else {
               this.setState({
                  // recordMessage: "yes",
                  // isLoading: false,
                  sendLoader: false,
               });
            }
         },
         (error) => {
            this.setState({
               sendLoader: false,
            });
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  this.ErrorAlertbar(error.data.settings.message);
                  return;
               }
            }

            if (error && error.status === 401) {
               //this.notify(i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg)
               return;
            }

            if (error && error.status === 400) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  this.ErrorAlertbar(error.data.settings.message);
                  return;
               }
            }

            return;
         }
      );
   };

   valueChangeInputMobile = (e) => {
      this.setState({
         northMobile: e.target.value,
      });
   };

   openSendTextModel = (info) => {
      this.setState({
         patientID: info.id,
         patientName: info.name,
         patientEmail: info.email,
         patientMobile: info.mobileNo,
      });
   };

   getTags = () => {
      Apimanager.getMentionTags(
         (success) => {
            this.setState({
               mentionTags: success.data,
            });
         },
         (error) => {
            //swal("Something went wrong!", 'There is some server error, Please try after some time.', "error")
         }
      );
   };

   getShortcutsList = () => {
      let $this = this;
      let currentUser = JSON.parse(this.props.data.userCredentials);
      const currentDepartmentID = currentUser.user.departmentId;
      // let currentEnterpriseID = "632a997e-f437-4e7c-8ce9-eff26c38a638"
      firebase
         .firestore()
         .collection("AppText")
         .doc("TextShortcuts")
         .onSnapshot(function (doc) {
            $this.setState({
               isLoading: false,
            });
            if (doc.exists) {
               $this.setState({
                  shortcutsList: doc.data()[currentDepartmentID] || [],
               });
            } else {
               console.log("No such document!");
            }
         });
   };

   selectedHashTags = (event) => {
      if (!this.state.hashTagsId.includes(event)) {
         this.setState({ hashTagsId: [...this.state.hashTagsId, event] });
      }
   };

   selectedTags = (event) => {
      //if (!this.state.mentionTagsId.includes(event)) {
      this.setState({ mentionTagsId: [...this.state.mentionTagsId, event] });
      //}
   };

   selectedShortcutTags = (event) => {
      //if (!this.state.mentionTagsId.includes(event)) {
      this.setState({ shortcutTagsId: [...this.state.shortcutTagsId, event] });
      //}
   };

   randomString = (length) => {
      var result = "";
      var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
   };

   setSearchVal = (status) => {
      if (status === false) {
         this.focusSearch();
      }
      if (status === true && this.props.invitePatientData.redirectEmr) {
         this.props.invitePatientData.redirectEmr = false;
      }
      this.setState({
         searchStatus: status,
         modalState: true,
      });
   };

   addSendTextToPatient = (e) => {
      e.preventDefault();

      this.setState({
         // isLoading: true,
         isContentUploading: true,
         clearUploadingContent: false,
      });

      let new_tag = [];
      this.state.doctorDataList.forEach((list) => {
         return (new_tag[list.id] = `${list.name}`);
      });

      let new_hash_tag = [];

      this.state.mentionTags.forEach((list) => {
         return (new_hash_tag[list.id] = `${list.name}`);
      });

      let new_shortcut_tag = [];
      this.state.shortcutsList.forEach((list) => {
         return (new_shortcut_tag[list.id] = `${list.phrase}`);
      });

      let new_description = this.state.originalDescriptions;
      let new_mention_array = [];
      let new_hash_array = [];
      let new_shortcut_array = [];

      var lines = new_description.split("\n"); // split all lines into array
      var firstline = lines.shift(); // read and remove first line
      var rest = lines.join("\n");

      // console.log('firstline', this.state.mentionTagsId)
      // return;

      if (this.state.mentionTagsId.length > 0) {
         this.state.mentionTagsId.forEach((list, index) => {
            if (firstline.includes(new_tag[list])) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = firstline.indexOf(`@${new_tag[list]}`);
               if (newIndex >= 0) {
                  firstline = firstline.replace(`@${new_tag[list]}`, this.randomString(`@${new_tag[list]}`.length));
                  new_mention_array = [
                     ...new_mention_array,
                     {
                        name: new_tag[list].replace("@", ""),
                        start: newIndex,
                        id: list,
                        isForTitle: true,
                     },
                  ];

                  return list;
               }
            }
         });
      }

      if (this.state.mentionTagsId.length > 0) {
         this.state.mentionTagsId.forEach((list, index) => {
            if (rest.includes(new_tag[list])) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = rest.indexOf(`@${new_tag[list]}`);
               if (newIndex >= 0) {
                  rest = rest.replace(`@${new_tag[list]}`, this.randomString(`@${new_tag[list]}`.length));
                  new_mention_array = [
                     ...new_mention_array,
                     {
                        name: new_tag[list].replace("@", ""),
                        start: newIndex,
                        id: list,
                        isForTitle: false,
                     },
                  ];
                  return list;
               }
            }
         });
      }

      // console.log('new_mention_array', new_mention_array)
      // return;

      if (this.state.hashTagsId.length > 0) {
         this.state.hashTagsId.forEach((list, index) => {
            if (this.state.description.includes(list)) {
               // new_description = new_description.replace(new RegExp(`${new_hash_tag[list]}`, 'g'), `<a mention=${list} href="javascript:void(0)" style="color:blue">${new_hash_tag[list]}</a>`)
               // return list

               let newIndex = new_description.indexOf(`#${new_hash_tag[list]}`);
               if (newIndex >= 0) {
                  new_description = new_description.replace(
                     `#${new_hash_tag[list]}`,
                     this.randomString(`#${new_hash_tag[list]}`.length)
                  );
                  new_hash_array[index] = {
                     name: new_hash_tag[list].replace("#", ""),
                     start: newIndex,
                     id: list,
                  };
               }
            }
            return list;
         });
      }

      // Logic for Shortcut Tags
      if (this.state.shortcutTagsId.length > 0) {
         this.state.shortcutTagsId.forEach((list, index) => {
            if (firstline.includes(new_shortcut_tag[list])) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = firstline.indexOf(`$${new_shortcut_tag[list]}`);
               if (newIndex >= 0) {
                  firstline = firstline.replace(
                     `$${new_shortcut_tag[list]}`,
                     this.randomString(`$${new_shortcut_tag[list]}`.length)
                  );
                  new_shortcut_array = [
                     ...new_shortcut_array,
                     {
                        name: new_shortcut_tag[list].replace("$", ""),
                        start: newIndex,
                        id: list,
                        isForTitle: true,
                     },
                  ];

                  return list;
               }
            }
         });
      }

      if (this.state.shortcutTagsId.length > 0) {
         this.state.shortcutTagsId.forEach((list, index) => {
            if (rest.includes(new_shortcut_tag[list])) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = rest.indexOf(`$${new_shortcut_tag[list]}`);
               if (newIndex >= 0) {
                  rest = rest.replace(
                     `$${new_shortcut_tag[list]}`,
                     this.randomString(`$${new_shortcut_tag[list]}`.length)
                  );
                  new_shortcut_array = [
                     ...new_shortcut_array,
                     {
                        name: new_shortcut_tag[list].replace("$", ""),
                        start: newIndex,
                        id: list,
                        isForTitle: false,
                     },
                  ];
                  return list;
               }
            }
         });
      }

      var newLines = this.state.originalDescriptions.split("\n"); // split all lines into array
      var newFirstline = newLines.shift(); // read and remove first line
      var newRest = newLines.join("\n");

      let api_param = {
         title: newFirstline,
         subTitle: newRest,
         userId: this.state.patientID,
         mentions: new_mention_array,
         // hash: new_hash_array,
         icon: "icon.png",
         isDoctorsOnly: this.state.isForDoctor,
         shortcut: new_shortcut_array,
      };

      this.contentUploadref.current = Apimanager.postAddItem(
         api_param,
         (success) => {
            let object = success.data.data;
            let params = this.analyticsContentParams(object);
            delete params["type"];
            delete params["location"];
            params["itemId"] = object.id;
            params["subtitle"] = object.subTitle;
            params["isDoctorsOnly"] = object.isDoctorsOnly.toString();

            Analytics.record(params, this.userdetails.id, Analytics.EventType.itemCreated);

            this.setState({
               isLoading: false,
               isContentUploading: false,
               clearUploadingContent: true,
            });
            this.sweetAlertbar("Text sent successfully");
            if (document.getElementById("sendTextModel")) {
               document.getElementById("sendTextModel").click();
            }

            this.closeSendTextModel("text");
         },
         (error) => {
            this.setState({
               isLoading: false,
               isContentUploading: false,
            });
            if (error && error.status === 500) {
               if (error.data && error.data.settings && error.data.settings.message) {
                  this.ErrorAlertbar(error.data.settings.message);

                  return;
               }
            }
         }
      );
   };

   closeSendTextModel = (type) => {
      this.setState({ ...createContentDefaultStates });

      // if (type === "media") {
      //   if (document.getElementById("close-direct-share")) {
      //     document.getElementById("close-direct-share").click();
      //   }
      // } else {
      //   if (document.getElementById("sendTextModel")) {
      //   } else {
      //     this.sweetAlertbar("Message shared successfully.");
      //     if (this.state.contentType === "provider") {
      //       this.recentActivityProviderOnly(this.props.match.params.patientid);
      //     }
      //     this.recentActivity(this.props.match.params.patientid);
      //     document.getElementById("open-create-recent-media").click();
      //   }
      // }
      if (document.getElementById("create-recent-media").style.display === "block") {
         document.getElementById("create-recent-media").click();
      }
   };

   dragPatientFile = (e, patientData) => {
      e.preventDefault();

      this.setState({
         dragDropDiv: "drag-drop-overlay file-input open-div",
         dragPatientListDiv: "open-div",
         patientID: patientData.id,
         patientName: patientData.name,
         patientEmail: patientData.email,
         patientMobile: patientData.mobileNo,
         [patientData.id]: "active",
      });

      this.state.patientList.forEach((list) => {
         if (list.id !== patientData.id) {
            this.setState({
               [list.id]: undefined,
            });
         }

         return list;
      });
   };

   dragPatientLeave = () => {
      if (document.getElementsByClassName("invite-user-page template-page")[0].style.opacity === "") {
         return;
      }
      this.setState({
         dragDropDiv: "drag-drop-overlay file-input hide-div",
         dragPatientListDiv: "hide-div",
      });

      this.state.patientList.forEach((list) => {
         this.setState({
            [list.id]: undefined,
         });
         return list;
      });
   };

   onDragLeave = (event) => {
      event.preventDefault();

      this.setState({
         [this.state.patientID]: undefined,
      });

      this.setState({ image: null });

      if (event.dataTransfer.files && event.dataTransfer.files[0]) {
         let fName = event.dataTransfer.files[0].name.split(".");

         let reader = new FileReader();
         let file = event && event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
         reader.onloadend = (e) => {
            let newSelectedAttachment = {};
            newSelectedAttachment.attachmentUrl = URL.createObjectURL(file);
            newSelectedAttachment.file = file;
            newSelectedAttachment.blobData = e.target.result;

            this.setState({
               image: newSelectedAttachment,
               title: this.state.title ? this.state.title : fName[0],
            });
            document.getElementById("open-direct-share-to-patient").click();
         };
         reader.readAsDataURL(file);
      }
   };

   addDirectShareToPatient = (e) => {
      e.preventDefault();
      if (this.state.image == "") {
         this.contentSwitchPopup("Please select a file to upload");
         return;
      }
      this.setState({
         // isLoading: true,
         isContentUploading: true,
         clearUploadingContent: false,
      });

      let new_tag = [];
      this.state.doctorDataList.forEach((list) => {
         return (new_tag[list.id] = `${list.name}`);
      });

      let new_hash_tag = [];

      this.state.mentionTags.forEach((list) => {
         return (new_hash_tag[list.id] = `${list.name}`);
      });

      let new_shortcut_tag = [];
      this.state.shortcutsList.forEach((list) => {
         return (new_shortcut_tag[list.id] = `${list.phrase}`);
      });

      let new_description = this.state.originalDescriptions;
      let new_mention_array = [];
      let new_hash_array = [];
      let new_shortcut_array = [];

      if (this.state.mentionTagsId.length > 0) {
         this.state.mentionTagsId.forEach((list, index) => {
            if (this.state.description.includes(list)) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = new_description.indexOf(`@${new_tag[list]}`);
               new_description = new_description.replace(
                  `@${new_tag[list]}`,
                  this.randomString(`@${new_tag[list]}`.length)
               );
               new_mention_array[index] = {
                  name: new_tag[list].replace("@", ""),
                  start: newIndex,
                  id: list,
                  isForTitle: true,
               };
               return list;
            }
         });
      }

      if (this.state.hashTagsId.length > 0) {
         this.state.hashTagsId.forEach((list, index) => {
            if (this.state.description.includes(list)) {
               // new_description = new_description.replace(new RegExp(`${new_hash_tag[list]}`, 'g'), `<a mention=${list} href="javascript:void(0)" style="color:blue">${new_hash_tag[list]}</a>`)
               // return list

               let newIndex = new_description.indexOf(`#${new_hash_tag[list]}`);
               new_description = new_description.replace(
                  `#${new_hash_tag[list]}`,
                  this.randomString(`#${new_hash_tag[list]}`.length)
               );
               new_hash_array[index] = {
                  name: new_hash_tag[list].replace("#", ""),
                  start: newIndex,
                  id: list,
               };
            }
         });
      }

      if (this.state.shortcutTagsId.length > 0) {
         this.state.shortcutTagsId.forEach((list, index) => {
            if (this.state.description.includes(list)) {
               //new_description = new_description.replace(new RegExp(`@${new_tag[list]}`, 'g'), `${new_tag[list]}`)
               let newIndex = new_description.indexOf(`$${new_shortcut_tag[list]}`);
               new_description = new_description.replace(
                  `$${new_shortcut_tag[list]}`,
                  this.randomString(`$${new_shortcut_tag[list]}`.length)
               );
               new_shortcut_array[index] = {
                  name: new_shortcut_tag[list].replace("$", ""),
                  start: newIndex,
                  id: list,
                  isForTitle: true,
               };
               return list;
            }
         });
      }

      const { image, binaryPath } = this.state;
      if (image === null) {
         return;
      }
      var filename = image && image.file && image.file.name && image.file.name.split(".");
      let filetype = image.file.name.split(".").slice(-1).pop().toLowerCase();
      let params = {
         isConvert: filetype.includes("mov") || filetype.includes("webm"),
         isDoctorsOnly: this.state.isForDoctor,
         isDocumentLibrary: this.state.postMediaType === "lib" ? true : false,
         title: this.state.originalDescriptions ? this.state.originalDescriptions : this.state.title,
         userId: this.state.patientID,
         mentions: new_mention_array,
         type: this.state.image.file.type, //this.getmimetype({ filetype: _.last(filename)?.toLowerCase() }),
         location: image?.file.name,
      };

      this.contentUploadref.current = Apimanager.postAddMedia(
         params,
         (success) => {
            let object = success.data.data.items;
            let aparams = this.analyticsContentParams(object);
            delete aparams["type"];
            delete aparams["location"];
            delete aparams["subtitle"];
            aparams["mediaId"] = object.id;
            aparams["subtitle"] = object.subTitle;
            aparams["isDoctorsOnly"] = object.isDoctorsOnly.toString();

            Analytics.record(aparams, this.userdetails.id, Analytics.EventType.mediaCreated);

            var uploadpayload = {
               binaryPath: binaryPath,
               imageObject: image.file,
               token: {},
               successResponse: success.data.data,
            };

            if (this.state.postMediaType === "lib") {
               this.sweetAlertbar(success.data.settings.message);
               document.getElementById("open-create-recent-media").click();
               this.setState({
                  ...createContentDefaultStates,
                  clearUploadingContent: true,
                  isContentUploading: false,
               });
               this.closeSendTextModel("media");
            } else {
               this.setState({ isUploading: !this.state.isUploading }, () => this.uploadmedia(uploadpayload, "direct"));
            }
         },
         (error) => {
            this.setState({
               // isLoading: false,
               isContentUploading: false,
            });
            if (error && error.status === 500) {
               if (error.data?.settings?.message) {
                  this.ErrorAlertbar(error.data.settings.message);
                  return;
               }
            } else if (error?.status === 422) {
               swal({
                  title: "Oops, There is an error!",
                  text: "File type not allowed. You can currently upload video, audio or pdf file only",
                  dangerMode: true,
               });
            }
         }
      );
   };

   hasRecordedMedia = () => {
      let { isRecAudioActive, isRecVideoActive } = this.state;
      let { isAudioRecording, isVideoRecording } = this.props;
      if ((isRecAudioActive || isRecVideoActive) && this.state.image !== "" && this.state.image !== null) {
         return true;
      } else if (isAudioRecording || isVideoRecording) {
         return true;
      }
      return false;
   };

   contentSwitchPopup = (text = "Discard the recorded media if you want to share other content") => {
      swal1({
         className: "content-switchp-popup-container",
         content: <div className="content-switch-popup">{text}</div>,
         buttons: false,
         timer: 1500,
      });
   };

   closeDirectShare = () => {
      this.setState({
         [this.state.patientID]: undefined,
         patientName: "",
         patientID: "",
         patientEmail: "",
      });
   };

   handleDragPatientFiles = () => {
      document.getElementById("open-direct-share-to-patient").click();
   };

   getLibraryTags = () => {
      Apimanager.getTagList({}, (success) => {
         this.setState({
            libTagList: success?.data?.map((e) => {
               return { name: e.name, id: uuid() };
            }),
            libTagListCopy: success?.data?.map((e) => {
               return { name: e.name, id: uuid() };
            }),
         });
      });
   };

   getProviderList = () => {
      var auth = "";
      let storedObject = JSON.parse(this.props.data.northwelluser);

      if (this.props.storedObject && this.props.storedObject.userCredentials) {
         //let userData = JSON.parse(this.props.storedObject.userCredentials);

         auth = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
      }

      controller.abort();
      controller = new AbortController();
      signal = controller.signal;

      var endpoint =
         `${process.env.REACT_APP_URL}/user/getProviderList?` +
         $.param({
            key: `${process.env.REACT_APP_FIREBASEAPIKEY}`,
         });

      fetch(endpoint, {
         method: "GET",
         signal: signal,
         headers: new Headers({
            Authorization: auth,
            "Content-type": "application/json",
         }),
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
               doctorDataList: success,
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
               var refreshToken = northwelluser_store.user.stsTokenManager.refreshToken;
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
                     store.dispatch(actions.savenorthwelluserobj(JSON.stringify(northwelluser_store)));
                     var auth = `Bearer ${stsTokenManager.accessToken}`;
                     fetch(endpoint, {
                        method: "get",
                        signal: signal,
                        headers: new Headers({
                           Authorization: auth,

                           "Content-Type": "application/text",
                        }),
                     })
                        .then((response) => response.json())
                        .then((success) => {
                           if (success && success.data) {
                              this.setState({
                                 doctorDataList: success,
                              });
                           }
                        });
                  })
                  .catch((error) => {
                     sessionStorage.clear();
                     localStorage.clear();
                     store.dispatch(actions.logout());
                     window.location.replace("/login");
                  });
            }
            //         this.setState({ isloading: false });
         });
   };

   selectTags = (e) => {
      this.setState({
         originalDescriptions: e.target.value,
      });
   };

   openCreateContent(type) {
      //this.closeSendTextModel('media')
      this.getLibraryList();
      this.getLibraryTags();
      this.getTags();
      this.getProviderList();
      this.getShortcutsList();
      document.getElementById("open-create-recent-media").click();
      if (!this.state.isContentUploading && this.state.clearUploadingContent) {
         this.setState({
            patientID: this.props.match.params.patientid,
            mediatype: "media",
            title: "",
            description: "",
            mentionTagsId: [],
            image: "",
            percentageUploaded: 0,
            isUploading: false,
            postMediaType: null,
            isLoading: false,
            hashTagsId: [],
            contentType: type,
            isForDoctor: type === "provider" ? true : false,
         });
      }
   }

   closeCreateMedia = (e) => {
      e.preventDefault();
      if (this.hasRecordedMedia()) {
         this.contentSwitchPopup("Discard the recorded media first");
         return;
      }
      this.setState({
         isRecAudioActive: false,
         isRecVideoActive: false,
      });
      if (this.state.image || this.state.description) {
         swal({
            title: "",
            text: "You have unsaved changes, are you sure you want to cancel?",
            buttons: ["Yes", "No"],
            dangerMode: true,
         }).then((willDelete) => {
            if (!willDelete) {
               this.setState({ ...createContentDefaultStates });

               document.getElementById("open-create-recent-media").click();
            }
         });
      } else {
         document.getElementById("open-create-recent-media").click();
      }
   };

   handleChangePatientCareTeam = (e) => {
      if (e.target.value.length >= 3) {
         let v = [];
         let newArr =
            this.state.oldCareTeamList.length > 0 &&
            this.state.oldCareTeamList.map((list, index) => {
               v.push({
                  id: list.id ? list.id : "",
                  name: list.name ? list.name.toLowerCase() : "",
                  email: list.email ? list.email.toLowerCase() : "",
                  mobileNo: list.mobileNo ? list.mobileNo : "",
               });
               return v;
            });
         let searchTerm = e.target.value;

         let resultOfTeamSearch = v.filter((obj) =>
            Object.values(obj).some((val) => val.includes(searchTerm.toLowerCase()))
         );

         let charUpdateArr = [];
         resultOfTeamSearch.forEach((list, index) => {
            charUpdateArr.push({
               id: list.id ? list.id : "",
               name: list.name ? this.getFirstCharCapital(list.name) : "",
               email: list.email ? list.email : "",
               mobileNo: list.mobileNo ? list.mobileNo : "",
            });
            return list;
         });
         this.setState({
            careTeamList: charUpdateArr,
         });
      } else if (e.target.value.length === 0) {
         this.setState({
            careTeamList: this.state.oldCareTeamList,
         });
      }
   };

   getFirstCharCapital = (str) => {
      str = str.split(" ");

      for (var i = 0, x = str.length; i < x; i++) {
         str[i] = str[i][0].toUpperCase() + str[i].substr(1);
      }

      return str.join(" ");
   };

   hideBox = () => {
      this.setState({
         showTagMentionDetails: false,
      });
   };

   getCareTeamList = (type) => {
      this.setState({
         careTeamListLoading: true,
         listLoading: true,
         careTeamList: "",
         careTeamMessage: "",
         careTeamListType: type,
         sharingListSortOrder: "",
      });
      if (type) {
         this.setState({
            careTeamSelected: true,
         });
         let params = {
            userId: this.props.match.params.patientid,
         };
         if (params.userId) {
            Apimanager.careteamProviders(
               params,
               (success) => {
                  let status = this.getPatientFollowStatus(success.data);
                  this.setState({
                     careTeamList: success.data,
                     oldCareTeamList: success.data,
                     listLoading: false,
                     careTeamListLoading: false,
                     careTeamMessage: "message",
                     addselfStatus: status,
                  });
               },
               (error) => {
                  this.setState({
                     isLoading: false,
                  });
                  if (error && error.status === 500) {
                     if (error.data && error.data.settings && error.data.settings.message) {
                        this.ErrorAlertbar(error.data.settings.message);

                        return;
                     }
                  }
               }
            );
         }
      } else if (this.props.match?.params?.patientid) {
         this.careTeam(this.props.match.params.patientid);
      }
   };

   contextMenuDeleteFile = (id, key) => {
      this.setState({
         isLoading: true,
      });
      let bodyParams = {
         [key]: id,
      };
      Apimanager.deleteMediaItem(
         bodyParams,
         (success) => {
            if (success && success.data) {
               this.sweetAlertbar(success.data.message);
               this.setState({
                  isLoading: false,
               });
               this.recentActivity(this.props.match.params.patientid);
               this.recentActivityProviderOnly(this.props.match.params.patientid);
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if (error && error.status === 500) {
               return;
            }
         }
      );
   };

   contextMenuDeleteCareTeam = (object) => {
      this.setState({
         isLoading: true,
      });
      let queryParams = {
         careTeamId: object.id,
         userId: this.props.match.params.patientid,
         visitId: "",
         key: process.env.REACT_APP_FIREBASEAPIKEY,
      };
      Apimanager.deletePersonalCareTeamMember(
         queryParams,
         (success) => {
            if (success && success.data) {
               this.sweetAlertbar(success.data.message);
               this.setState({
                  isLoading: false,
               });
               this.careTeam(this.props.match.params.patientid);
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if (error && error.status === 500) {
               return;
            }
         }
      );
   };

   contextMenuDownloadContent = (id, key, listType) => {
      this.setState({
         isLoading: true,
      });
      let requestParams = {
         mediaId: id,
      };
      let bodyParams = {
         printEnable: key,
      };

      Apimanager.downloadMediaItem(
         requestParams,
         bodyParams,
         (success) => {
            if (success && success.data) {
               this.sweetAlertbar(success.data.message);
               this.setState({
                  isLoading: false,
               });
               let arr = [];

               if (listType === "recentActivity") {
                  this.state.recentList.forEach((content) => {
                     if (content.id === id) {
                        content.printEnable = !content.printEnable;
                        arr.push(content);
                     } else {
                        arr.push(content);
                     }
                  });
                  this.setState({
                     isLoading: false,
                     recentList: arr,
                  });
               } else if (listType === "providerOnly") {
                  this.state.recentListProvider.forEach((content) => {
                     if (content.id === id) {
                        content.printEnable = !content.printEnable;
                        arr.push(content);
                     } else {
                        arr.push(content);
                     }
                  });
                  this.setState({
                     isLoading: false,
                     recentListProvider: arr,
                  });
               }
            }
         },
         (error) => {
            this.setState({
               isLoading: false,
            });
            if (error) {
               swal("Oops!", "Something went wrong!", "error");
            }
         }
      );
   };

   openReferralPatientModal = () => {
      this.setState({
         isReferralPatientView: true,
      });
   };

   closeReferralPatientModal = (modalStatus) => {
      this.setState({
         isReferralPatientView: modalStatus,
      });
   };

   openContentShareView = (obj) => {
      this.setState({
         isContentShareView: true,
         contentShareObject: obj,
         patientDetailsObject: {
            patientEmail: this.state.patientEmail,
            patientID: this.props.match.params.patientid,
            patientName: this.state.patientName,
            patientMobile: this.state.patientMobile,
         },
      });
   };

   closeContentShareView = (modalStatus) => {
      this.setState({
         isContentShareView: modalStatus,
      });
   };

   openReferralDetailsStatus = () => {
      this.setState({
         showReferralDetails: true,
         isLoading: false,
      });
   };

   closeReferralDetailsStatus = (detailStatus) => {
      this.setState({
         showReferralDetails: detailStatus,
         referralPatientDetails: null,
         showContentDescriptionObject: null,
      });
   };

   enablePatientEditMode = () => {
      this.setState({
         patientEditMode: true,
         editPatientName: this.state.patientName,
         editPatientDOB: moment(this.state.patientDOB).isValid() ? this.state.patientDOB : "",
         editPatientMRN: this.state.patientMRN,
         editPatientEmail: this.state.patientEmail,
         editPatientMobile: this.state.patientMobile,
         editPatientErrorObj: {
            editPatientNameError: "",
            editPatientDOBError: "",
            editPatientMRNError: "",
            editPatientEmailError: "",
            editPatientMobileError: "",
         },
      });
   };

   disablePatientEditMode = () => {
      this.setState({
         patientEditMode: false,
         editPatientName: "",
         editPatientDOB: "",
         editPatientMRN: "",
         editPatientEmail: "",
         editPatientMobile: "",
         editPatientErrorObj: {
            editPatientNameError: "",
            editPatientDOBError: "",
            editPatientMRNError: "",
            editPatientEmailError: "",
            editPatientMobileError: "",
         },
      });
   };

   validatePatientProfileInfo = () => {
      let validateInfo = true;
      let patientNameArray = this.state.editPatientName.trim().replace(/\s+/g, " ").split(" ");
      let patientNameError, patientDOBError, patientEmailError, patientMobileError;

      if (this.state.patientName.length > 0 && this.state.editPatientName.trim().length === 0) {
         patientNameError = "Name required.";
         validateInfo = false;
      } else if (patientNameArray.length < 2) {
         patientNameError = "Last name is required.";
         validateInfo = false;
      } else if (patientNameArray[0].length < 2) {
         patientNameError = "First name should be at least 2 characters.";
         validateInfo = false;
      } else if (patientNameArray[1].length < 2) {
         patientNameError = "Last name should be at least 2 characters.";
         validateInfo = false;
      }
      if (this.state.patientDOB !== "" && this.state.editPatientDOB === null) {
         patientDOBError = "DOB required.";
         validateInfo = false;
      }
      if (this.state.patientEmail.length > 0 && this.state.editPatientEmail.trim().length === 0) {
         patientEmailError = "Email required.";
         validateInfo = false;
      } else if (
         this.state.patientEmail.length > 0 &&
         this.state.editPatientEmail.trim().length > 0 &&
         !email_regex.test(this.state.editPatientEmail)
      ) {
         patientEmailError = "Invalid email.";
         validateInfo = false;
      } else if (
         this.state.patientEmail.length === 0 &&
         this.state.editPatientEmail.trim().length > 0 &&
         !email_regex.test(this.state.editPatientEmail)
      ) {
         patientEmailError = "Invalid email.";
         validateInfo = false;
      }
      if (this.state.patientMobile.length > 0 && this.state.editPatientMobile.trim().length === 0) {
         patientMobileError = "Mobile required.";
         validateInfo = false;
      } else if (
         (this.state.patientMobile.length > 0 && this.state.editPatientMobile.replace(/\D/g, "").length !== 11) ||
         (this.state.patientMobile.length === 0 &&
            this.state.editPatientMobile.replace(/\D/g, "").length > 0 &&
            this.state.editPatientMobile.replace(/\D/g, "").length !== 11)
      ) {
         patientMobileError = "Invalid mobile.";
         validateInfo = false;
      }
      this.setState({
         editPatientErrorObj: {
            editPatientNameError: patientNameError,
            editPatientDOBError: patientDOBError,
            editPatientEmailError: patientEmailError,
            editPatientMobileError: patientMobileError,
         },
      });
      return validateInfo;
   };

   updatePatientProfile = (patientId) => {
      if (this.validatePatientProfileInfo()) {
         let mobileWithoutFormat = this.state.editPatientMobile?.replace(/\D/g, "");
         this.setState({
            isLoading: true,
         });
         let queryParams = JSON.stringify({
            Authorization: `Bearer ${
               JSON.parse(this.props.storedObject.northwelluser).user.stsTokenManager.accessToken
            }`,
            action: socketActions.referral,
            subAction: socketSubActions.updateUserInfo,
            userId: patientId,
            loggedInUserId: this.userdetails.id,
            mrn: this.state.patientMRN,
            ...(this.state.patientName !== this.state.editPatientName && {
               name: this.state.editPatientName.trim().replace(/\s+/g, " "),
            }),
            ...(this.state.patientDOB !== this.state.editPatientDOB && {
               dob: this.state.editPatientDOB !== null ? moment(this.state.editPatientDOB).format("YYYYMMDD") : "",
            }),
            ...(this.state.patientEmail !== this.state.editPatientEmail && {
               email: this.state.editPatientEmail,
            }),
            ...(this.state.patientMobile !== this.state.editPatientMobile && {
               mobileNo: mobileWithoutFormat.length === 11 ? "+" + mobileWithoutFormat : "",
            }),
         });

         window.socket.send(queryParams, (result) => {
            if (result.settings?.status === 1) {
               this.setState({
                  isLoading: false,
               });
               this.disablePatientEditMode();
               this.getPatientDetails(this.props.match.params.patientid);
               this.sweetAlertbar("Patient information updated successfully.");
            } else {
               this.setState({
                  isLoading: false,
               });
               this.ErrorAlertbar(result.settings?.message);
            }
         });
      }
   };

   searchDocumentBundle = (e) => {
      let filteredDocList = [];
      let filteredBundleList = [];
      if (e.target.value !== "") {
         filteredDocList = this.state.libraryList.filter((document) => {
            if (document.title.toLowerCase().includes(e.target.value.toLowerCase())) {
               return document;
            }
         });
         filteredBundleList = this.state.libTagList.filter((bundle) => {
            if (bundle.name.toLowerCase().includes(e.target.value)) {
               return bundle;
            }
         });
         this.setState({
            libraryListCopy: filteredDocList,
            libTagListCopy: filteredBundleList,
         });
      } else {
         this.setState({
            libraryListCopy: this.state.libraryList,
            libTagListCopy: this.state.libTagList,
         });
      }
   };

   mediaTypeIcon = (contentType, type) => {
      let iconClass = "";
      if (type === "bundle") {
         iconClass = "library-media-icon-bundle";
      }
      if (contentType?.includes("image")) {
         return <img src="/assets/images/image-icon.svg" alt="" className={iconClass} />;
      } else if (contentType?.includes("audio")) {
         return <img src="/assets/images/audio-icon.svg" alt="" className={iconClass} />;
      } else if (contentType?.includes("video")) {
         return <img src="/assets/images/video-icon.svg" alt="" className={iconClass} />;
      } else if (contentType?.includes("pdf")) {
         return <img src="/assets/images/pdf-icon.svg" alt="" className={iconClass} />;
      } else if (
         contentType?.includes("application/docx") ||
         contentType?.includes("application/document") ||
         contentType?.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
         contentType?.includes("text/rtf") ||
         contentType?.includes("text/plain") ||
         contentType?.includes("application/msword")
      ) {
         return <img src="/assets/images/document-icon.svg" alt="" className={iconClass} />;
      } else {
         return <img src="/assets/images/attachment-icon.svg" alt="" className={iconClass} />;
      }
   };

   getPatientOnboardStatus = (id) => {
      if (id) {
         let patientOnboardingStatusStr = JSON.stringify({
            Authorization: `Bearer ${
               JSON.parse(this.props.storedObject.northwelluser).user.stsTokenManager.accessToken
            }`,
            action: socketActions.referral,
            subAction: socketSubActions.onBoardingStatus,
            patientId: id,
         });
         window.socket.send(patientOnboardingStatusStr, (resultStatus) => {
            if (resultStatus.settings?.status === 1) {
               this.setState({
                  patientOnboardStatus: resultStatus.data.status,
               });
            } else {
               console.log("On board status not defined.");
            }
         });
      }
   };

   sortToCompare = (a, b, sortingKey, isAscending) => {
      //  fa, fb;
      let fa = a[sortingKey].toLowerCase();
      let fb = b[sortingKey].toLowerCase();
      // if (isCareTeam) {
      // } else {
      //   fa = a.title.toLowerCase();
      //   fb = b.title.toLowerCase();
      // }
      // let sort = isCareTeam
      //   ? this.state.sharingListSortOrder
      //   : this.state.documentSortOrder;
      if (isAscending) {
         if (fa < fb) {
            return -1;
         }
         if (fa > fb) {
            return 1;
         }
         return 0;
      } else {
         if (fa > fb) {
            return -1;
         }
         if (fa < fb) {
            return 1;
         }
         return 0;
      }
   };

   render() {
      let recentSearch = [];
      if (this.state.searchStatus) {
         recentSearch = this.state.recentSearchPLBList;
      } else {
         recentSearch = this.state.recentSearchNorthList;
      }

      let searchTooltip = false;
      if (!this.state.searchStatus && !this.state.searchLastName && !this.state.activeFilter) {
         searchTooltip = true;
      }

      let validateField = true;
      let arrayFlow = [];
      if (this.state.searchStatus) {
         arrayFlow = this.state.patientList;
      } else {
         arrayFlow = this.state.northArr;
      }
      if (email_regex.test(String(this.state.northEmail).toLowerCase()) || this.state.northMobile.length === 10) {
         validateField = false;
      }
      const nortDataObj = this.state.northTypeObj;
      let northAddress = "";
      if (nortDataObj.address && nortDataObj.address.all) {
         northAddress = nortDataObj.address.all[0];
      }
      let disbaleSearch = true;
      let disabledAdvance = true;
      let hospitalListVal = [];
      if (this.state.hospitalListData && this.state.hospitalListData.length > 0) {
         hospitalListVal = this.state.hospitalListData.map((list) => {
            return { label: list.name, value: list.id };
         });
      }
      if (
         (this.state.searchMrn && this.state.hospitalSelected && this.state.hospitalSelected.value) ||
         (this.state.searchStatus &&
            !this.state.searchMrn &&
            (this.state.searchDob ||
               this.state.searchFirstName ||
               this.state.searchMiddleName ||
               this.state.searchLastName)) ||
         (!this.state.searchStatus && !this.state.searchMrn && this.state.searchLastName && this.state.searchFirstName)
      ) {
         disabledAdvance = false;
      }

      let patientList = "";
      if (
         (this.state.searchStatus && this.state.searchPatientName) ||
         (!this.state.searchStatus && this.state.splitSearch[1] && this.state.splitSearch[1].length > 0)
      ) {
         disbaleSearch = false;
      }

      let checkSearch = false;

      patientList =
         arrayFlow.length > 0
            ? arrayFlow.map((list, index) => {
                 // let deleteIcon = (
                 //   <span
                 //     style={{ cursor: "pointer" }}
                 //     title="Delete Patient"
                 //     onClick={() =>
                 //       swal({
                 //         title: "Are you Sure?",
                 //         text: "You want to delete this patient!",
                 //         buttons: true,
                 //         dangerMode: true,
                 //       }).then((willDelete) => {
                 //         if (willDelete) {
                 //           this.deletePatientRecord(list.id, false);
                 //         }
                 //       })
                 //     }
                 //   >
                 //     Delete
                 //   </span>
                 // );
                 let deletedPatient = list.disabled ? (
                    <span
                       title="Disable Patient"
                       onClick={() =>
                          swal({
                             title: "Are you sure?",
                             text: "You want to enable this patient!",
                             buttons: true,
                             dangerMode: true,
                          }).then((willDelete) => {
                             if (willDelete) {
                                this.blockPatient(list.id, false);
                             }
                          })
                       }
                    >
                       Unlock
                    </span>
                 ) : (
                    <span
                       title="Enable Patient "
                       onClick={() =>
                          swal({
                             title: "Are you Sure?",
                             text: "You want to disable this patient!",
                             buttons: true,
                             dangerMode: true,
                          }).then((willDelete) => {
                             if (willDelete) {
                                this.blockPatient(list.id, true);
                             }
                          })
                       }
                    >
                       Lock
                    </span>
                 );
                 let enableVideocall = list.isCallEnable ? (
                    <span
                       style={{ cursor: "pointer" }}
                       title="Video Call"
                       onClick={() => {
                          this.patientVideoCall(list.id, list.name);
                       }}
                    >
                       Video Call
                    </span>
                 ) : (
                    ""
                 );

                 let dobForAge = moment(list.dob, "YYYYMMDD").format("MM/DD/YYYY");
                 dobForAge = new Date(dobForAge);
                 // dobForAge = moment().diff(dobForAge, "years");
                 let ageLabel = "";
                 let ageInDays = moment().diff(dobForAge, "days");
                 let ageInWeeks = moment().diff(dobForAge, "weeks");
                 let ageInMonths = moment().diff(dobForAge, "months");
                 let ageInYears = moment().diff(dobForAge, "years");
                 if (ageInDays > 6 && ageInWeeks > 4 && ageInMonths >= 12) {
                    ageLabel = ageInYears + " Y";
                 } else if (ageInDays > 6 && ageInWeeks > 4 && ageInMonths < 12) {
                    ageLabel = ageInMonths + " M";
                 } else if (ageInDays > 6 && ageInWeeks < 5) {
                    ageLabel = ageInWeeks + " W";
                 } else {
                    ageLabel = ageInDays + " D";
                 }
                 return (
                    <tr
                       key={uuid()} //{list.id + index}
                       onDragOver={(e) => this.dragPatientFile(e, list)}
                       className={this.state[list.id] ? "active" : ""}
                    >
                       {(checkSearch = list.firstName ? true : false)}

                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : list.assigningAuthority === "AIPB"
                                ? this.getRedirectOnName(list.mrn, list.firstName, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {list.name ? list.name : ""}
                          {list.name ? "" : list.firstName ? list.firstName : ""}{" "}
                          {list.name ? "" : list.lastName ? list.lastName : ""}
                          {list.assigningAuthority === "AIPB" ? (
                             <div className="logo-aipb ml-3">
                                <img src="/assets/images/favicon.svg" alt="" />
                             </div>
                          ) : (
                             ""
                          )}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {moment(list.dob, "YYYYMMDD").format("MM/DD/YYYY").toLowerCase() === "invalid date"
                             ? "-"
                             : moment(list.dob, "YYYYMMDD").format("MM/DD/YYYY")}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {isNaN(dobForAge) ? "-" : ageLabel}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {list.assigningAuthority === "AIPB" ? "" : list.mrn}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : list.assigningAuthority === "AIPB"
                                ? this.getRedirectOnName(list.mrn, list.firstName + " " + list.lastName, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          <div className={this.state.searchStatus ? "tooltip no-tooltip" : "tooltip"}>
                             {this.state.searchStatus ? (
                                <div>{list.hospitalName}</div> //""
                             ) : (
                                <div>
                                   {" "}
                                   {list.assigningAuthority === "AIPB"
                                      ? list.addedThroughAssigningAuthority
                                      : list.assigningAuthority}
                                </div>
                             )}

                             {list.addedThroughAssigningAuthorityName || list.assigningAuthorityName ? (
                                <span className="tooltiptext">
                                   {list.assigningAuthority === "AIPB"
                                      ? list.addedThroughAssigningAuthorityName
                                      : list.assigningAuthorityName}
                                </span>
                             ) : (
                                ""
                             )}
                          </div>
                          {/* </div> */}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {list.mobileNo}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {list.email}
                       </td>

                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {list.createdAt ? moment(list.createdAt).format("MM/DD/YYYY HH:mm") : ""}
                       </td>
                       <td
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                             !checkSearch
                                ? this.getRedirectOnName(list.id, list.name, list)
                                : this.getInviteNorthPatient(list)
                          }
                       >
                          {!checkSearch && list.lastLoginTime
                             ? moment(list.lastLoginTime).format("MM/DD/YYYY HH:mm")
                             : ""}
                       </td>
                       {!checkSearch ? (
                          <td className="action-btn-box">
                             {list.disabled ? (
                                ""
                             ) : (
                                <>
                                   <span
                                      title="Edit Patient"
                                      data-toggle="modal"
                                      data-target="#myModal"
                                      onClick={() => this.getPatientDetails(list.id)}
                                      aria-hidden="true"
                                   >
                                      Edit
                                   </span>
                                </>
                             )}
                             {this.state.isAdmin ? deletedPatient : ""}
                             {/* {this.state.isAdmin ? deleteIcon : ""} */}
                             {list.disabled ? "" : enableVideocall}
                             {list.disabled ? null : (
                                <span
                                   title="Send Text"
                                   data-toggle="modal"
                                   data-target="#sendTextModel"
                                   onClick={() => this.openSendTextModel(list)}
                                   aria-hidden="true"
                                >
                                   Message
                                </span>
                             )}
                          </td>
                       ) : (
                          ""
                       )}
                    </tr>
                 );
              })
            : [];

      let sharingList = "";
      if (this.state.careTeamList && this.state.careTeamList.length > 0) {
         sharingList = this.state.careTeamList.map((list, index) => {
            return (
               <li
                  key={list.id}
                  data-toggle={this.state.careTeamSelected ? "modal" : null}
                  data-target={this.state.careTeamSelected ? "#add-tocare-team" : null}
                  index={list.id}
                  className={this.state.careTeamSelected ? "care-team-cell" : "personal-team"}
                  onClick={() => {
                     if (this.state.careTeamSelected) {
                        this.setState({ careTeamProviderSelected: list });
                     }
                  }}
               >
                  <div className="user-icon">
                     {reverseString(
                        list.name
                           ? list.name && list.name.match(/\b(\w)/g).join("")
                           : list.email
                           ? list.email.match(/\b(\w)/g).join("")
                           : ""
                     )}
                  </div>
                  <div className="user-content">
                     <div
                        className="user-left"
                        onContextMenu={(e) => {
                           let ele = e;
                           displayCareTeamMenu(ele, {
                              id: CARETEAM_MENU_ID,
                              value: list,
                              userId: this.userdetails.id,
                              listType: this.state.careTeamListType,
                           });
                           this.setState({
                              careTeamMenuObject: list,
                           });
                        }}
                     >
                        <div className="usr-name">{list.name ? list.name : "Family member"}</div>
                        <div className="user-adderess">{list.email}</div>
                        <div className="user-adderess">{list.mobileNo}</div>
                     </div>
                     <Menu id={CARETEAM_MENU_ID}>
                        <Item
                           data={{
                              label: "delete",
                              listObject: list,
                           }}
                           onClick={(e) => {
                              swal({
                                 title: this.state.careTeamMenuObject.name,
                                 text: "Are you sure you want to delete this member?",
                                 buttons: true,
                                 dangerMode: true,
                              }).then((willDelete) => {
                                 if (willDelete) {
                                    this.contextMenuDeleteCareTeam(this.state.careTeamMenuObject);
                                 }
                              });
                           }}
                        >
                           Delete
                        </Item>
                     </Menu>
                     {/* <div className="user-check" onClick={() => this.selectSharingTeam(list.data)}></div> */}
                  </div>
               </li>
            );
         });
      }

      let viewedList = "";
      if (this.state.viewedListData && this.state.viewedListData.length > 0) {
         viewedList = this.state.viewedListData.map((list) => {
            return (
               <li index={list.id}>
                  <div className="user-icon">
                     {reverseString(
                        list.rawdata.name
                           ? list.rawdata.name && list.rawdata.name.match(/\b(\w)/g).join("")
                           : list.rawdata.email && list.rawdata.email.match(/\b(\w)/g).join("")
                     )}
                  </div>
                  <div className="user-content">
                     <div className="user-left">
                        <div className="usr-name">{list.rawdata.name}</div>
                        <div className="user-adderess">{list.rawdata.email}</div>
                        {/* <div className="user-adderess">{list.rawdata.userPhone ? this.formatPhoneNumber(list.rawdata.userPhone) : ""}</div> */}
                     </div>
                     <div className="act-date">{moment.unix(list.timestamp).format("hh:mm a, MM/DD/YYYY ")}</div>
                  </div>
               </li>
            );
         });
      }

      let recentActivityProvider = "";
      if (this.state.recentListProvider && this.state.recentListProvider.length > 0) {
         recentActivityProvider = this.state.recentListProvider.map((list) => {
            let mediaIcon = <img src="/assets/images/attachment-icon.svg" alt="" />;
            if (list.type === "referral") {
               mediaIcon = <img src="/assets/images/content-referral-icon.svg" alt="" />;
            } else if (
               list.fileType === undefined ||
               list.type === "text" ||
               list.fileType === "text" ||
               list.type === "item"
            ) {
               mediaIcon = <img src="/assets/images/document-icon.svg" alt="" />;
            } else if (list.fileType.includes("video")) {
               mediaIcon = <img src="/assets/images/video-icon.svg" alt="" />;
            } else if (list.fileType.includes("audio")) {
               mediaIcon = <img src="/assets/images/audio-icon.svg" alt="" />;
            } else if (list.fileType.includes("pdf") || list.fileType.includes("csv")) {
               mediaIcon = <img src="/assets/images/pdf-icon.svg" alt="" />;
            } else if (list.fileType.includes("image")) {
               mediaIcon = <img src="/assets/images/image-icon.svg" alt="" />;
            }

            //var lines = list.title.split("\n");   // split all lines into array
            var firstline = list.title; //lines.shift();   // read and remove first line
            //var rest = lines.join("\n");
            let titleFirstLine = firstline;
            let replaceTag;

            let newMentionArray = [];

            let numAnotherArr = [];
            if (list.mentions && list.mentions.length > 0) {
               list.mentions.map((mention) => {
                  if (mention.isForTitle) {
                     let strLength = mention.name.length + 1;

                     var result = "";
                     var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                     var charactersLength = characters.length;
                     for (var i = 0; i < strLength; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                     }
                     let numArr = [];
                     // let text =
                     //   mention.name && mention.name > 25
                     //     ? mention.name.substring(0, 20) + "..."
                     //     : mention.name;
                     numArr[result] =
                        ` <span class="other-link" tagv="` +
                        mention.id +
                        `" clickby = "pOnly" id="tag-mention-@" style="background-color:#EAF1F0;color:#21876F;cursor:pointer">@${mention.name}</span> `;
                     numAnotherArr[result] =
                        ` <span class="other-link" tagv="` +
                        mention.id +
                        `" clickby = "pOnly" id="tag-mention-@" style="color:#add8e6;cursor:pointer">@${mention.name}</span> `;
                     newMentionArray = [...newMentionArray, numArr];

                     //firstline = firstline.substring(0, mention.start) + <span style="color:#add8e6;cursor:pointer">${mention.name}</span> + firstline.substring(strLength);

                     firstline = firstline.replace(firstline.substr(mention.start, strLength), result);
                     titleFirstLine = titleFirstLine.replace(titleFirstLine.substr(mention.start, strLength), result);
                  }
               });
            }

            if (newMentionArray.length > 0) {
               newMentionArray.forEach((str, index) => {
                  firstline = firstline.replace(Object.keys(str)[0], str[Object.keys(str)[0]]);
                  titleFirstLine = titleFirstLine.replace(Object.keys(str)[0], numAnotherArr[Object.keys(str)[0]]);
               });
            }

            //return;

            if (list.tags && list.tags.length > 0) {
               replaceTag = list.tags.map((mTag) => {
                  return this.state.mentionTags.filter((tag) => {
                     if (tag.id === mTag.id) {
                        return {
                           id: tag.id,
                           name: mTag.name,
                        };
                     }
                  });
               });

               if (replaceTag) {
                  replaceTag.forEach((tag) => {
                     tag.forEach((newTag) => {
                        let newHashTag = newTag.name.replace(/_/g, " ");
                        firstline = firstline.replace(
                           new RegExp(`#${newTag.name}`, "g"),
                           ` <span id="tag-mention-#" tagv="` +
                              newTag.id +
                              `" clickby = "pOnly" class="other-link" style="color:#008DD0;cursor:pointer">${newHashTag}</span> `
                        );
                        titleFirstLine = titleFirstLine.replace(
                           new RegExp(`#${newTag.name}`, "g"),
                           ` <span id="tag-mention-#" tagv="` +
                              newTag.id +
                              `" clickby = "pOnly" class="other-link" style="color:#add8e6;cursor:pointer">${newHashTag}</span> `
                        );
                     });
                  });
               }
            }
            const currentTimeProviderOnly = moment().unix();
            const lastUpdateProviderOnly = moment(Number(list.lastUpdate) * 1000).unix();
            const timerProviderOnly = new Timer();
            let dateDiffProviderOnly =
               timerProviderOnly.secondsToHms(currentTimeProviderOnly).hours -
               timerProviderOnly.secondsToHms(lastUpdateProviderOnly).hours;
            let diffInDaysProviderOnly = Math.round(
               (currentTimeProviderOnly - lastUpdateProviderOnly) / Math.floor(60 * 60 * 24)
            );
            return (
               <div>
                  <div
                     className="act-row"
                     // index={list.id}
                     key={list.id}
                  >
                     <div
                        className="act-click-event"
                        onClick={() => this.showContentDescriptions(list, titleFirstLine)}
                     ></div>
                     <div className="act-icon">
                        <div style={{ width: "47px", height: "47px" }}>{mediaIcon}</div>
                     </div>
                     <div className="act-content" style={{ display: "flex" }}>
                        <div className="act-left">
                           <div className="act-title">
                              <div
                                 className="tick-icon text-truncate"
                                 style={{
                                    maxWidth: "210px",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                 }}
                              >
                                 {ReactHtmlParser(firstline)}
                              </div>
                              <div className="act-name">{list.addedByName}</div>
                              {/* <span className="hospital-name">
                    {"Linex Hill Hospital"}
                    </span> */}
                              {/* <div className="act-dec">Kensas Hospital</div> */}
                           </div>
                        </div>
                        <div className="spacer flex-grow-1" style={{ width: "20px" }} />
                        <div className="act-date" onClick={() => this.showContentDescriptions(list, titleFirstLine)}>
                           {diffInDaysProviderOnly === 0
                              ? moment.unix(list.lastUpdate, "MM/DD/YYYY").fromNow()
                              : diffInDaysProviderOnly === 1
                              ? "yesterday" + " at " + moment.unix(list.lastUpdate).format("hh:mm a")
                              : moment.unix(list.lastUpdate).format("MM/DD/YYYY") +
                                " at " +
                                moment.unix(list.lastUpdate).format("hh:mm a")}
                        </div>
                        {/* onClick={() => this.viewedByPatientProvider()}  */}
                        <div
                           onClick={() => this.viewedByPatientProvider(list.id)}
                           // onClick={
                           //   list.isProviderViewed || list.isPatientViewed
                           //     ? () => this.viewedByPatientProvider(list.id)
                           //     : false
                           // }
                           className="act-image"
                        >
                           {list.isProviderViewed && (list.isPatientViewed || list.isDoctorsOnly) ? (
                              <img src="/assets/images/tic-blue.svg" alt="view" />
                           ) : list.isPatientViewed || list.isProviderViewed ? (
                              <img src="/assets/images/tic-mix.svg" alt="one viewed" />
                           ) : (
                              <img src="/assets/images/tic-grey.svg" alt="pending" />
                           )}
                           {/* {list.title} */}
                        </div>
                     </div>
                     {list.type === "referral" ? null : (
                        <ReactionBar
                           obj={list}
                           userId={JSON.parse(this.props.userCredentials).user.id}
                           onLikeClick={() => this.recentActivity(this.props.match.params.patientid)}
                           onLoveClick={() => this.recentActivity(this.props.match.params.patientid)}
                           onThanksClick={() => this.recentActivity(this.props.match.params.patientid)}
                        />
                     )}
                     {list.type === "referral" ? null : (
                        <div>
                           <div class="btn-group dropleft">
                              {list.addedBy === this.userdetails.id ? (
                                 <img
                                    style={{
                                       zIndex: 1,
                                       background: "none",
                                       border: "none",
                                    }}
                                    src="/assets/images/vertical-ellipse-icon.svg"
                                    alt=""
                                    class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                 />
                              ) : null}
                              <div class="dropdown-menu vertical-ellipse-menu">
                                 {list.addedBy === this.userdetails.id && list.type === "media" ? (
                                    <div>
                                       <div
                                          className="download-option-main-div"
                                          onClick={() => {
                                             swal({
                                                title: list.title,
                                                text: `${
                                                   list.printEnable
                                                      ? "Restrict download of this content?"
                                                      : "Allow download of this content?"
                                                }`,
                                                buttons: ["Cancel", "Confirm"],
                                                dangerMode: false,
                                             }).then((willDownload) => {
                                                if (willDownload) {
                                                   this.contextMenuDownloadContent(
                                                      list.id,
                                                      list.printEnable ? false : true,
                                                      "providerOnly"
                                                   );
                                                }
                                             });
                                          }}
                                       >
                                          <div className="download-option-label-div">
                                             {list.printEnable ? "Restrict Download" : "Allow Download"}
                                          </div>
                                          <ToggleSwitch value={list.printEnable} width={"37px"} height={"19px"} />
                                       </div>
                                       <div class="dropdown-divider"></div>
                                    </div>
                                 ) : null}

                                 {list.addedBy === this.userdetails.id &&
                                 (list.type === "media" || list.type === "item") ? (
                                    <div
                                       className="download-option-main-div"
                                       onClick={() => this.openContentShareView(list)}
                                    >
                                       <div className="share-option-label-div">Send</div>
                                       <div>
                                          <img src="/assets/images/share-referral-icon.svg" alt="" />
                                       </div>
                                    </div>
                                 ) : null}
                                 {dateDiffProviderOnly <= 24 ? <div class="dropdown-divider"></div> : null}
                                 {list.addedBy === this.userdetails.id &&
                                 (list.type === "media" || list.type === "item") &&
                                 dateDiffProviderOnly <= 24 ? (
                                    <div
                                       className="download-option-main-div"
                                       onClick={() => {
                                          swal({
                                             title: list.title,
                                             text: "Are you sure you want to delete this file?",
                                             buttons: true,
                                             dangerMode: true,
                                          }).then((willDelete) => {
                                             if (willDelete) {
                                                this.contextMenuDeleteFile(
                                                   list.id,
                                                   list.type === "media" ? "mediaId" : "itemId"
                                                );
                                             }
                                          });
                                       }}
                                    >
                                       <div className="share-option-label-div">Delete</div>
                                       <div>
                                          <img src="/assets/images/delete-icon-context.svg" alt="" />
                                       </div>
                                    </div>
                                 ) : null}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            );
         });
      }

      let recentActivityList = "";
      if (this.state.recentList && this.state.recentList.length > 0) {
         recentActivityList = this.state.recentList.map((list) => {
            let mediaIcon = <img src="/assets/images/attachment-icon.svg" alt="" />;
            if (list.type === "referral") {
               mediaIcon = <img src="/assets/images/content-referral-icon.svg" alt="" />;
            } else if (
               list.fileType === undefined ||
               list.type === "text" ||
               list.fileType === "text" ||
               list.type === "item"
            ) {
               mediaIcon = <img src="/assets/images/document-icon.svg" alt="" />;
            } else if (list.fileType.includes("video")) {
               mediaIcon = <img src="/assets/images/video-icon.svg" alt="" />;
            } else if (list.fileType.includes("audio")) {
               mediaIcon = <img src="/assets/images/audio-icon.svg" alt="" />;
            } else if (list.fileType.includes("pdf") || list.fileType.includes("csv")) {
               mediaIcon = <img src="/assets/images/pdf-icon.svg" alt="" />;
            } else if (list.fileType.includes("image")) {
               mediaIcon = <img src="/assets/images/image-icon.svg" alt="" />;
            }
            //var lines = list.title.split("\n");   // split all lines into array
            var firstline = list.title; //lines.shift();   // read and remove first line
            //var rest = lines.join("\n");
            let titleFirstLine = firstline;
            let replaceTag;

            let newMentionArray = [];
            let anotherMentionArray = [];
            let numAnotherArr = [];

            if (list.mentions && list.mentions.length > 0) {
               list.mentions.map((mention) => {
                  if (mention.isForTitle && mention.start >= 0) {
                     let strLength = mention.name.length + 1;

                     var result = "";
                     var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                     var charactersLength = characters.length;
                     for (var i = 0; i < strLength; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                     }

                     let numArr = [];
                     // console.log(mention,"mention")
                     numArr[result] =
                        ` <span class="other-link" tagv="` +
                        mention.id +
                        `" clickby = "recent" id="tag-mention-@" style="background-color:#EAF1F0;color:#21876F;cursor:pointer">@${mention.name}</span> `;
                     numAnotherArr[result] =
                        ` <span class="other-link"  tagv="` +
                        mention.id +
                        `" clickby = "recent" id="tag-mention-@" style="color:#add8e6;cursor:pointer">@${mention.name}</span> `;
                     newMentionArray = [...newMentionArray, numArr];
                     //anotherMentionArray = [...anotherMentionArray, numAnotherArr];

                     firstline = firstline.replace(firstline.substr(mention.start, strLength), result);
                     titleFirstLine = titleFirstLine.replace(titleFirstLine.substr(mention.start, strLength), result);
                  }
               });
            }

            if (newMentionArray.length > 0) {
               newMentionArray.forEach((str, index) => {
                  firstline = firstline.replace(Object.keys(str)[0], str[Object.keys(str)[0]]);
                  titleFirstLine = titleFirstLine.replace(Object.keys(str)[0], numAnotherArr[Object.keys(str)[0]]);

                  firstline = firstline.replace(Object.keys(str)[0], "");
                  titleFirstLine = titleFirstLine.replace(Object.keys(str)[0], "");
               });
            }

            //return;

            if (list.tags && list.tags.length > 0) {
               replaceTag = list.tags.map((mTag) => {
                  return this.state.mentionTags.filter((tag) => {
                     if (tag.id === mTag.id) {
                        return {
                           id: tag.id,
                           name: mTag.name,
                        };
                     }
                  });
               });

               if (replaceTag) {
                  replaceTag.map((tag) => {
                     tag.map((newTag) => {
                        let newHashTag = newTag.name.replace(/_/g, " ");
                        firstline = firstline.replace(
                           new RegExp(`#${newTag.name}`, "g"),
                           ` <span  id="tag-mention-#" tagv="` +
                              newTag.id +
                              `" clickby = "recent" class="other-link" style="color:#008DD0;cursor:pointer">${newHashTag}</span> `
                        );
                        titleFirstLine = titleFirstLine.replace(
                           new RegExp(`#${newTag.name}`, "g"),
                           ` <span id="tag-mention-#" tagv="` +
                              newTag.id +
                              `" clickby = "recent" class="other-link" style="color:#add8e6;cursor:pointer">${newHashTag}</span> `
                        );
                     });
                  });
               }
            }

            const currentTimeRecentActivity = moment().unix();
            const lastUpdateRecentActivity = moment(Number(list.lastUpdate) * 1000).unix();
            const timerRecentActivity = new Timer();
            let dateDiffRecentActivity =
               timerRecentActivity.secondsToHms(currentTimeRecentActivity).hours -
               timerRecentActivity.secondsToHms(lastUpdateRecentActivity).hours;
            let diffInDaysRecentActivity = Math.round(
               (currentTimeRecentActivity - lastUpdateRecentActivity) / Math.floor(60 * 60 * 24)
            );

            return (
               <div className="position-relative w-100">
                  <div className="act-row position-relative w-100" index={list.id} key={list.id}>
                     <div
                        className="act-click-event"
                        onClick={() => this.showContentDescriptions(list, titleFirstLine)}
                     ></div>
                     <div className="act-icon">
                        <div style={{ width: "47px", height: "47px" }}>{mediaIcon}</div>
                     </div>
                     <div className="act-content" style={{ display: "flex" }}>
                        <div>
                           <div className="act-title">
                              <div
                                 className="text-truncate"
                                 style={{
                                    maxWidth: "210px",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                 }}
                              >
                                 {ReactHtmlParser(firstline)}
                              </div>
                              <div className="act-name">{list.addedByName}</div>
                           </div>
                        </div>
                        <div className="spacer flex-grow-1" style={{ width: "20px" }} />
                        <div className="act-date" onClick={() => this.showContentDescriptions(list, titleFirstLine)}>
                           {diffInDaysRecentActivity === 0
                              ? moment.unix(list.lastUpdate, "MM/DD/YYYY").fromNow()
                              : diffInDaysRecentActivity === 1
                              ? "yesterday" + " at " + moment.unix(list.lastUpdate).format("hh:mm a")
                              : moment.unix(list.lastUpdate).format("MM/DD/YYYY") +
                                " at " +
                                moment.unix(list.lastUpdate).format("hh:mm a")}
                        </div>
                        {/* onClick={() => this.viewedByPatientProvider()}  */}
                        <div
                           onClick={() => this.viewedByPatientProvider(list.id)}
                           // onClick={
                           //   list.isProviderViewed || list.isPatientViewed
                           //     ? () => this.viewedByPatientProvider(list.id)
                           //     : null
                           // }
                           className="act-image"
                        >
                           {list.isProviderViewed && list.isPatientViewed ? (
                              <img src="/assets/images/tic-blue.svg" alt="view" />
                           ) : list.isPatientViewed || list.isProviderViewed ? (
                              <img src="/assets/images/tic-mix.svg" alt="one viewed" />
                           ) : (
                              <img src="/assets/images/tic-grey.svg" alt="pending" />
                           )}
                        </div>
                     </div>
                     {list.type === "referral" ? null : (
                        <ReactionBar
                           obj={list}
                           userId={JSON.parse(this.props.userCredentials).user.id}
                           onLikeClick={() => this.recentActivity(this.props.match.params.patientid)}
                           onLoveClick={() => this.recentActivity(this.props.match.params.patientid)}
                           onThanksClick={() => this.recentActivity(this.props.match.params.patientid)}
                        />
                     )}
                     {list.type === "referral" ? null : (
                        <div>
                           <div class="btn-group dropleft">
                              {list.addedBy === this.userdetails.id ? (
                                 <img
                                    style={{
                                       zIndex: 1,
                                       background: "none",
                                       border: "none",
                                    }}
                                    src="/assets/images/vertical-ellipse-icon.svg"
                                    alt=""
                                    class="btn btn-secondary dropdown-toggle dropdown-toggle-split"
                                    data-toggle="dropdown"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                 />
                              ) : null}
                              <div class="dropdown-menu vertical-ellipse-menu">
                                 {list.addedBy === this.userdetails.id && list.type === "media" ? (
                                    <div>
                                       <div
                                          className="download-option-main-div"
                                          onClick={() => {
                                             swal({
                                                title: list.title,
                                                text: `${
                                                   list.printEnable
                                                      ? "Restrict download of this content?"
                                                      : "Allow download of this content?"
                                                }`,
                                                buttons: ["Cancel", "Confirm"],
                                                dangerMode: false,
                                             }).then((willDownload) => {
                                                if (willDownload) {
                                                   this.contextMenuDownloadContent(
                                                      list.id,
                                                      list.printEnable ? false : true,
                                                      "recentActivity"
                                                   );
                                                }
                                             });
                                          }}
                                       >
                                          <div className="download-option-label-div">
                                             {list.printEnable ? "Restrict Download" : "Allow Download"}
                                          </div>
                                          <ToggleSwitch value={list.printEnable} width={"37px"} height={"19px"} />
                                       </div>
                                       <div class="dropdown-divider"></div>
                                    </div>
                                 ) : null}

                                 {list.addedBy === this.userdetails.id &&
                                 (list.type === "media" || list.type === "item") ? (
                                    <div
                                       className="download-option-main-div"
                                       onClick={() => this.openContentShareView(list)}
                                    >
                                       <div className="share-option-label-div">Send</div>
                                       <div>
                                          <img src="/assets/images/share-referral-icon.svg" alt="" />
                                       </div>
                                    </div>
                                 ) : null}
                                 {dateDiffRecentActivity <= 24 ? <div class="dropdown-divider"></div> : null}
                                 {list.addedBy === this.userdetails.id &&
                                 (list.type === "media" || list.type === "item") &&
                                 dateDiffRecentActivity <= 24 ? (
                                    <div
                                       className="download-option-main-div"
                                       onClick={() => {
                                          swal({
                                             title: list.title,
                                             text: "Are you sure you want to delete this file?",
                                             buttons: true,
                                             dangerMode: true,
                                          }).then((willDelete) => {
                                             if (willDelete) {
                                                this.contextMenuDeleteFile(
                                                   list.id,
                                                   list.type === "media" ? "mediaId" : "itemId"
                                                );
                                             }
                                          });
                                       }}
                                    >
                                       <div class="dropdown-divider"></div>
                                       <div className="share-option-label-div">Delete</div>
                                       <div>
                                          <img src="/assets/images/delete-icon-context.svg" alt="" />
                                       </div>
                                    </div>
                                 ) : null}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            );
         });
      }

      var { visitid, patientid } = this.props.match.params;

      let modaltitle = this.state.title.includes("<span") ? ReactHtmlParser(this.state.title) : this.state.title;

      let showMedia = "";
      if (this.state.mediaData) {
         let splitLocation = "";
         if (this.state.mediaData.location) {
            let pt = this.state.mediaData.location.split(".");
            splitLocation = pt[1];
         }

         if (
            (this.state.mediaData.fileType === undefined ||
               this.state.mediaData.type === "item" ||
               this.state.mediaData.fileType === "text") &&
            (!this.state.mediaData.location ||
               this.state.mediaData.chapterType === "DAU" ||
               this.state.mediaData.chapterType === "DOC")
         ) {
            // Hash and Mention
            let actualData = "";
            if (this.state.mediaData.subTitle) {
               actualData = this.state.mediaData.subTitle;
            } else if (this.state.mediaData.description) {
               actualData = this.state.mediaData.description;
            }

            //var lines = list.title.split("\n");   // split all lines into array
            var firstline = actualData; //lines.shift();   // read and remove first line
            //var rest = lines.join("\n");

            let replaceTag;

            let newMentionArray = [];

            if (this.state.mediaData.mentions && this.state.mediaData.mentions.length > 0) {
               this.state.mediaData.mentions.forEach((mention) => {
                  if (!mention.isForTitle && mention.start >= 0) {
                     let strLength = mention.name.length + 1;

                     var result = "";
                     var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                     var charactersLength = characters.length;
                     for (var i = 0; i < strLength; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                     }
                     let numArr = [];
                     numArr[
                        result
                     ] = ` <div class="d-inline-block" style="color:#21876F;cursor:pointer">@${mention.name}</div> `;
                     newMentionArray = [...newMentionArray, numArr];

                     //firstline = firstline.substring(0, mention.start) + <span style="color:var(--theme-color-new);cursor:pointer">${mention.name}</span> + firstline.substring(strLength);
                     firstline = firstline.replace(firstline.substr(mention.start, strLength), result);
                  }
               });
            }

            if (newMentionArray.length > 0) {
               newMentionArray.forEach((str, index) => {
                  //firstline = firstline.replace('@', '');
                  firstline = firstline.replace(Object.keys(str)[0], str[Object.keys(str)[0]]);
               });
            }

            //return;

            if (this.state.mediaData.tags && this.state.mediaData.tags.length > 0) {
               replaceTag = this.state.mediaData.tags.map((mTag) => {
                  return this.state.mentionTags.filter((tag) => {
                     if (tag.id === mTag.id) {
                        return {
                           id: tag.id,
                           name: mTag.name,
                        };
                     }
                  });
               });

               if (replaceTag) {
                  replaceTag.map((tag) => {
                     tag.map((newTag) => {
                        let newHashTag = newTag.name.replace(/_/g, " ");
                        firstline = firstline.replace(
                           new RegExp(`#${newTag.name}`, "g"),
                           `<div class="d-inline-block" style="color:var(--theme-color-new);cursor:pointer">${newHashTag}</div>`
                        );
                     });
                  });
               }
            }

            //let lines = firstline.split("\n");   // split all lines into array
            //var firstline = lines.shift();   // read and remove first line
            //let rest = lines.join("\n");
            showMedia = (
               <div style={{ fontSize: "22px" }}>
                  {firstline.includes("div") ? ReactHtmlParser(firstline) : firstline}
               </div>
            );
         } else if (splitLocation.toLowerCase() === "pdf" || this.state.mediaData.fileType.includes("pdf")) {
            showMedia = (
               <iframe
                  title={this.state.mediaData.title}
                  src={this.state.medaiPath}
                  width="100%"
                  style={{ height: "600px" }}
               ></iframe>
            );
         } else if (this.state.mediaData.fileType.includes("image")) {
            showMedia = <img id="shared-content-image" alt={this.state.mediaData.title} src={this.state.medaiPath} />;
         } else if (this.state.mediaData.fileType.includes("video")) {
            showMedia = (
               <video
                  ref={this.videoPlayerRef}
                  id="content-video"
                  width="80%"
                  height="65%"
                  controls
                  src={this.state.medaiPath}
                  controlsList="nodownload"
                  onEnded={() => {
                     let seconds = parseInt(this.videoPlayerRef.current.currentTime).toString();
                     this.recordMediaAnalytics(
                        this.state.contentSelected,
                        seconds,
                        seconds,
                        Analytics.EventType.mediaFinished
                     );
                  }}
               ></video>
            );
         } else if (this.state.mediaData.fileType.includes("audio")) {
            showMedia = (
               <ReactAudioPlayer
                  ref={this.audioPlayerRef}
                  src={this.state.medaiPath}
                  controlsList="nodownload"
                  onEnded={() => {
                     let seconds = parseInt(this.audioPlayerRef.current.audioEl.current.currentTime).toString();
                     this.recordMediaAnalytics(
                        this.state.contentSelected,
                        seconds,
                        seconds,
                        Analytics.EventType.mediaFinished
                     );
                  }}
                  muted={this.state.mutedAudio}
                  controls
               />
            );
         } else {
            showMedia = (
               <>
                  <div
                     style={{
                        fontSize: "22px",
                        marginLeft: "25px",
                        marginTop: "25px",
                     }}
                  >
                     This file will be downloaded
                  </div>
                  <embed style={{ height: "0", width: "0" }} src={this.state.medaiPath} />
               </>
            );
         }
      }

      const { visitsData, image, isLoading, title, description, isForDoctor, visitChapters, percentageUploaded } =
         this.state;

      //let bgImage = image && image.blobData ? image.blobData : "";
      let bgStyle =
         image && image.file && image.file.name && backgroundImage.includes(image.file.name.split(".").pop())
            ? true
            : false;

      let optionsList = [];

      optionsList =
         visitsData.length > 0
            ? visitsData.map((dmp, index) => {
                 let rData = "";
                 if (index === 0) {
                    sVisit = {
                       value: dmp.id,
                       label: dmp.isHospitalVisit
                          ? `Hospital Visit (${dmp.location.name}) ${moment
                               .unix(dmp.lastActionDate)
                               .format("MM/DD/YYYY")}`
                          : `Office Visit (${dmp.location.name}) ${moment
                               .unix(dmp.lastActionDate)
                               .format("MM/DD/YYYY")}`,
                    };
                 }
                 if (dmp.visitType !== "WCV") {
                    rData = {
                       value: dmp.id,
                       label: dmp.isHospitalVisit
                          ? `Hospital Visit (${dmp.location.name}) ${moment
                               .unix(dmp.lastActionDate)
                               .format("MM/DD/YYYY")}`
                          : `Office Visit (${dmp.location.name}) ${moment
                               .unix(dmp.lastActionDate)
                               .format("MM/DD/YYYY")}`,
                    };
                 }

                 return rData;
              })
            : [];

      let chapterList = [];
      chapterList =
         visitChapters.length > 0
            ? visitChapters.map((dmp) => {
                 return {
                    value: dmp.id,
                    label: dmp.title,
                 };
              })
            : [];

      let libList = "";
      let tagList = "";

      if (this.state.libTagListCopy && this.state.libTagListCopy.length > 0) {
         tagList = this.state.libTagListCopy.map((list, index) => {
            return (
               <li key={index} style={{ cursor: "pointer" }}>
                  <div className="user-content">
                     <div
                        style={{
                           position: "relative",
                           display: "block",
                           width: "100%",
                        }}
                     >
                        <div className="user-left lib-listing-left">
                           <div
                              className="libr-div"
                              style={{ flex: 1 }}
                              onClick={(e) => {
                                 if (this.state.tagSelected?.id === list.id) {
                                    this.setState({
                                       tagSelected: null,
                                    });
                                    return;
                                 }
                                 Apimanager.getTagDocuments(list.name, (success) => {
                                    this.setState({
                                       tagSelected: { id: list.id, data: success.data },
                                       loadingDocumentsForTag: null,
                                    });
                                 });
                                 this.setState({
                                    loadingDocumentsForTag: list.id,
                                 });
                              }}
                           >
                              <div style={{ display: "flex", alignItems: "center" }}>
                                 <img
                                    src="/assets/images/webhook-icon.svg"
                                    alt=""
                                    style={{ marginRight: "10px", height: "45px" }}
                                 />

                                 <div className="usr-name">{list.name}</div>
                              </div>
                           </div>
                           {this.state.loadingDocumentsForTag === list.id ? (
                              <Loader
                                 type="ThreeDots"
                                 color="#c9c9c9"
                                 height={30}
                                 width={30}
                                 timeout={0}
                                 style={{ marginRight: "10px" }}
                              />
                           ) : null}
                           <div
                              className="share-btn-lib"
                              onClick={(e) => {
                                 e.preventDefault();
                                 this.tagSwalClick(e, list);
                              }} //this.swalClick(e, list)
                           >
                              <button className="btn btn-blue-block">
                                 Share all
                                 {/* {this.state.tagSelected?.id === list.id
                        ? "share all"
                        : "share"} */}
                                 <div style={{ display: "inline-block", marginLeft: "5px" }}>{shareIcon()}</div>
                              </button>
                           </div>
                           <div
                              style={{ display: "inline-block", marginLeft: "15px" }}
                              onClick={() => {
                                 if (this.state.tagSelected?.id === list.id) {
                                    this.setState({
                                       tagSelected: null,
                                    });
                                    return;
                                 }
                                 Apimanager.getTagDocuments(list.name, (success) => {
                                    this.setState({
                                       tagSelected: { id: list.id, data: success.data },
                                       loadingDocumentsForTag: null,
                                    });
                                 });
                                 this.setState({
                                    loadingDocumentsForTag: list.id,
                                 });
                              }}
                           >
                              {this.state.tagSelected?.id === list.id ? upArrow() : downArrow()}
                           </div>
                        </div>
                        {this.state.tagSelected?.id === list.id
                           ? this.state.tagSelected?.data?.map((document) => {
                                return (
                                   <div className="tag-document" style={{ width: "100%" }}>
                                      <div className="library-media-type-icon">
                                         {this.mediaTypeIcon(document?.type, "bundle")}
                                      </div>
                                      <label
                                         onClick={(e) => this.shareLibrary(e, document, true)}
                                         style={{ cursor: "pointer" }}
                                      >
                                         {document.title}
                                      </label>
                                      <div
                                         className="share-btn-lib"
                                         onClick={(e) => {
                                            this.swalClick(e, document);
                                         }}
                                      >
                                         <button style={{ border: "none", background: "none" }}>{shareIcon()}</button>
                                      </div>
                                   </div>
                                );
                             })
                           : null}
                     </div>
                  </div>
               </li>
            );
         });
      }

      if (this.state.libraryListCopy && this.state.libraryListCopy.length > 0) {
         libList = this.state.libraryListCopy.map((list, index) => {
            return (
               <li key={index} style={{ cursor: "pointer" }}>
                  <div className="user-content">
                     <div className="library-media-type-icon">{this.mediaTypeIcon(list?.type)}</div>
                     <div className="user-left lib-listing-left">
                        <div className="libr-div" onClick={(e) => this.shareLibrary(e, list, true)}>
                           <div className="usr-name">{list.title}</div>
                           <div className="user-adderess">{list.addedByName}</div>
                           <div className="user-adderess">{moment.unix(list.createdAt).format("MM/DD/YYYY")}</div>
                        </div>
                        <div className="share-btn-lib" onClick={(e) => this.swalClick(e, list)}>
                           <button className="btn btn-blue-block">share</button>
                        </div>
                     </div>
                  </div>
               </li>
            );
         });
      }

      let allTags = "";

      if (this.state.mentionTags.length > 0) {
         allTags = this.state.mentionTags.map((list) => {
            return {
               id: list.id,
               display: `#${list.name}`,
            };
         });
      }

      let providerTags = "";
      if (this.state.doctorDataList.length > 0) {
         providerTags = this.state.doctorDataList.map((list) => {
            return {
               id: list.id,
               display: `@${list.name}`,
            };
         });
      }

      let shortcutTags = [];

      if (this.state.shortcutsList?.length > 0) {
         shortcutTags = this.state.shortcutsList.map((list) => {
            return {
               id: list.id,
               display: `${list.phrase} (${list.shortcut})`,
            };
         });
      }

      return (
         <>
            {visitid || patientid ? (
               <div className="PatientProfile page-body-wrapper">
                  <div className="invite-user-page template-page" onMouseMove={() => this.dragLeave()}>
                     <div className="center-text">
                        {(visitid && patientid && (
                           <span>
                              <h2 className="no-result">{i18n && i18n.home && i18n.home.selectchapter}</h2>
                           </span>
                        )) ||
                           (patientid && (
                              <React.Fragment>
                                 <button
                                    id="open-create-recent-content"
                                    data-toggle="modal"
                                    data-target="#create-recent-content"
                                    style={{ display: "none" }}
                                 >
                                    open model
                                 </button>
                                 <div
                                    class="modal add-tocare custom-modal fade"
                                    id="add-tocare-team"
                                    tabIndex="-1"
                                    role="dialog"
                                    aria-labelledby="add-tocare-team"
                                    aria-hidden="true"
                                 >
                                    <div class="modal-dialog" role="document">
                                       <div class="modal-content">
                                          {this.state.careTeamSelected || this.state.careTeamProviderSelected ? (
                                             this.state.careTeamProviderSelected ? (
                                                <CareTeamProviderView
                                                   {...this.props}
                                                   provider={this.state.careTeamProviderSelected}
                                                   removed={() => this.getCareTeamList(true)}
                                                />
                                             ) : (
                                                <CareTeamInvite
                                                   {...this.props}
                                                   patientName={this.state.patientName}
                                                   providerAdded={(data) => {
                                                      let analytics = {
                                                         ...this.getPatientData(),
                                                         invitedUserEmail: data?.email || null,
                                                         invitedUserId: data?.id || null,
                                                         invitedUserMobile: data?.officeMobileNo || null,
                                                         invitedUserName: data?.name || null,
                                                      };
                                                      Analytics.record(
                                                         analytics,
                                                         this.userdetails.id,
                                                         Analytics.EventType.inviteCareTeam
                                                      );
                                                      this.getCareTeamList(true);
                                                   }}
                                                />
                                             )
                                          ) : (
                                             <>
                                                <div className="modal-header">
                                                   <h5 className="modal-title">Invite family and friends</h5>
                                                   <button
                                                      type="button"
                                                      className="close"
                                                      data-dismiss="modal"
                                                      aria-label="Close"
                                                      id="close-add-tocare-team"
                                                   >
                                                      <span aria-hidden="true">&times;</span>
                                                   </button>
                                                </div>
                                                <div className="modal-body">
                                                   <div className="row">
                                                      <div className="col-12 custom-filed">
                                                         <label>Name</label>
                                                         <input
                                                            type="text"
                                                            name="text"
                                                            value={this.state.patientCareName}
                                                            onChange={(e) => this.changeSharingName(e)}
                                                         />
                                                      </div>
                                                      <div className="col-12 custom-filed">
                                                         <label>Email</label>

                                                         <input
                                                            className="custom-input"
                                                            placeholder="abc@example.com"
                                                            value={this.state.patientCareEmail}
                                                            name="emailaddress"
                                                            onChange={this.handleChange.bind(
                                                               this,
                                                               this.state.patientCareEmail
                                                            )}
                                                         />
                                                      </div>
                                                      <div className="col-12 custom-filed">
                                                         <label>Phone</label>
                                                         <Input
                                                            name="patientPhoneNumber"
                                                            value={this.state.phoneNumber}
                                                            onChange={this.changeObjectvalue.bind(
                                                               this,
                                                               this.state.phoneNumber
                                                            )}
                                                         />
                                                      </div>
                                                   </div>
                                                </div>
                                                <div className="row">
                                                   <div className="col-sm-6 mt-4">
                                                      <button
                                                         className="btn btn-blue-border w-100"
                                                         onClick={() => this.closeNewModel("close-add-tocare-team")}
                                                      >
                                                         Cancel
                                                      </button>
                                                   </div>
                                                   <div class="col-sm-6 mt-4">
                                                      <button
                                                         class="btn btn-blue-block w-100"
                                                         disabled={
                                                            (email_regex.test(
                                                               String(this.state.patientCareEmail).toLowerCase()
                                                            ) &&
                                                               this.state.patientCareName) ||
                                                            (this.state.patientCareName &&
                                                               this.state.phoneNumber &&
                                                               this.state.phoneNumber.replace(/[^0-9]/g, "").length ===
                                                                  11)
                                                               ? false
                                                               : true
                                                         }
                                                         onClick={() => this.addShareingTeam()}
                                                      >
                                                         Add
                                                      </button>
                                                   </div>
                                                </div>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 <div
                                    className="modal add-tocare custom-modal fade"
                                    id="follow-patient-care-team"
                                    tabIndex="-1"
                                    role="dialog"
                                    aria-labelledby="follow-patient-care-team"
                                    aria-hidden="true"
                                 >
                                    <div class="modal-dialog" role="document">
                                       <div class="modal-content">
                                          <div className="CareTeamInvite">
                                             <FollowView
                                                closeButtonId="close-follow-patient-care-team"
                                                enterpriseId={
                                                   JSON.parse(this.props.storedObject.userCredentials).user.enterpriseId
                                                }
                                                patientId={this.props.match.params.patientid}
                                                addSelf={true}
                                                provider={{
                                                   slug: "",
                                                   image: "",
                                                   email: JSON.parse(this.props.storedObject.userCredentials).user
                                                      .email,
                                                   userId: JSON.parse(this.props.storedObject.userCredentials).user.id,
                                                }}
                                                providerAdded={() => {
                                                   this.getCareTeamList(true);
                                                   document.getElementById("close-follow-patient-care-team").click();
                                                }}
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Show content model */}
                                 <div
                                    class="modal create-recent-content custom-modal fade"
                                    id="create-recent-content"
                                    tabIndex="-1"
                                    role="dialog"
                                    aria-labelledby="create-recent-content"
                                    aria-hidden="true"
                                    onClick={() => {
                                       let watchTime = null,
                                          totalTime = null;
                                       if (this.audioPlayerRef?.current) {
                                          watchTime = parseInt(
                                             this.audioPlayerRef.current?.audioEl?.current.currentTime
                                          ).toString();
                                          totalTime = parseInt(
                                             this.audioPlayerRef.current?.audioEl?.current.duration
                                          ).toString();

                                          this.audioPlayerRef.current.audioEl.current.pause();
                                       }
                                       if (this.videoPlayerRef?.current) {
                                          watchTime = parseInt(this.videoPlayerRef.current?.currentTime).toString();
                                          totalTime = parseInt(this.videoPlayerRef.current?.duration).toString();
                                          this.videoPlayerRef.current.pause();
                                       }

                                       if (watchTime && totalTime && watchTime !== totalTime) {
                                          this.recordMediaAnalytics(
                                             this.state.contentSelected,
                                             watchTime,
                                             totalTime,
                                             Analytics.EventType.mediaUnfinished
                                          );
                                       }
                                    }}
                                 >
                                    <div class="modal-dialog" role="document">
                                       <div class="modal-content">
                                          <div class="modal-header">
                                             <h5 class="modal-title">
                                                {/* {ReactHtmlParser(
                                  this.state.title &&
                                    this.state.title.length < 50
                                    ? this.state.title
                                    : ""
                                )} */}
                                                {/* {this.state.mediaData?.title?.length < 50
                                  ? modaltitle
                                  : ""} */}
                                                {modaltitle}
                                             </h5>
                                             <button
                                                type="button"
                                                class="close"
                                                data-dismiss="modal"
                                                onClick={() => this.closeContentModel()}
                                                aria-label="Close"
                                             >
                                                <span aria-hidden="true">&times;</span>
                                             </button>
                                          </div>
                                          <div
                                             class="modal-body"
                                             style={{
                                                minHeight: "350px",
                                                alignItems: "flex-start",
                                             }}
                                          >
                                             {/* {this.state.mediaData?.title?.length > 50
                                ? modaltitle
                                : ""} */}
                                             {showMedia}
                                             <span>By: {this.state.mediaData.addedByName}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Show Viewed model */}
                                 <button
                                    id="open-viewed-media-patient"
                                    data-toggle="modal"
                                    data-target="#viewed-media-patient"
                                    style={{ display: "none" }}
                                 >
                                    open model
                                 </button>
                                 <div
                                    class="modal viewed-media-patient custom-modal fade"
                                    id="viewed-media-patient"
                                    tabIndex="-1"
                                    role="dialog"
                                    aria-labelledby="viewed-media-patient"
                                    aria-hidden="true"
                                 >
                                    <div class="modal-dialog" role="document">
                                       <div class="modal-content seen-by-width">
                                          <div class="modal-header">
                                             <h5 class="modal-title">Seen By</h5>
                                             <button
                                                type="button"
                                                class="close"
                                                data-dismiss="modal"
                                                aria-label="Close"
                                             >
                                                <span aria-hidden="true">&times;</span>
                                             </button>
                                          </div>
                                          <div class="modal-body" style={{ minHeight: "450px" }}>
                                             <div className="search-result">
                                                {viewedList ? (
                                                   <ul>{viewedList}</ul>
                                                ) : (
                                                   <div id="seen-by-no-results">
                                                      <img src="/assets/images/looking.png" alt="" />
                                                      <label>No views on this content yet</label>
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Create content model */}

                                 <button
                                    id="open-create-recent-media"
                                    data-toggle="modal"
                                    data-target="#create-recent-media"
                                    style={{ display: "none" }}
                                 >
                                    open model
                                 </button>
                                 <div
                                    class="modal create-recent-media custom-modal fade"
                                    id="create-recent-media"
                                    tabIndex="-1"
                                    role="dialog"
                                    aria-labelledby="create-recent-media"
                                    aria-hidden="true"
                                    onMouseDown={(e) => {
                                       if (e.target.id === "create-recent-media" && e.button === 0) {
                                          if (!this.state.isContentUploading && this.state.clearUploadingContent) {
                                             document.getElementById("content-upload-view").value = null;
                                             this.setState({ ...createContentDefaultStates });
                                          }
                                          this.props.setAudioRecordingStatus({
                                             isAudioRecording: false,
                                          });
                                          this.props.setVideoRecordingStatus({
                                             isVideoRecording: false,
                                          });
                                          if (this.streamRef.current) {
                                             this.streamRef.current.getTracks()[0].stop();
                                          }
                                       }
                                    }}
                                 >
                                    <div class="modal-dialog" role="document" style={{ minHeight: "auto" }}>
                                       <div
                                          class="modal-content"
                                          style={{ overflow: "hidden" }}
                                          onClick={(e) => {
                                             e.bubbles = false;
                                          }}
                                       >
                                          {this.state.isLoading && <LoadingIndicator />}
                                          {this.state.isContentUploading ? (
                                             <div className="create-content-loading" />
                                          ) : (
                                             ""
                                          )}
                                          <div class="modal-header">
                                             <h5 class="modal-title">{this.state.patientName}</h5>
                                             <button
                                                type="button"
                                                class="close"
                                                // data-dismiss="modal"
                                                aria-label="Close"
                                                onClick={(e) => this.closeCreateMedia(e)}
                                             >
                                                <span aria-hidden="true">&times;</span>
                                             </button>
                                          </div>
                                          <div class="modal-body">
                                             <div
                                                className=" segment-control share-btns share-centered"
                                                style={{ width: "100%" }}
                                             >
                                                <div
                                                   className={
                                                      "share-btn " + (this.state.mediatype === "media" ? "active" : "")
                                                   }
                                                   onClick={() => {
                                                      if (!this.hasRecordedMedia()) {
                                                         this.changeScreen("media");
                                                      }
                                                   }}
                                                   id="media"
                                                >
                                                   <button className="media-btn">Media</button>
                                                </div>
                                                <div
                                                   className={
                                                      "share-btn " + (this.state.mediatype === "text" ? "active" : "")
                                                   }
                                                   onClick={() => {
                                                      this.hasRecordedMedia()
                                                         ? this.contentSwitchPopup()
                                                         : this.changeScreen("text");
                                                   }}
                                                   id="text"
                                                >
                                                   <button className="text-btn">Message</button>
                                                </div>
                                                <div
                                                   className={
                                                      "share-btn " + (this.state.mediatype === "record" ? "active" : "")
                                                   }
                                                   onClick={() => {
                                                      this.hasRecordedMedia()
                                                         ? this.contentSwitchPopup()
                                                         : this.changeScreen("record");
                                                   }}
                                                   id="text"
                                                >
                                                   <button className="text-btn">Screen Record</button>
                                                </div>
                                                <div
                                                   className={
                                                      "share-btn " +
                                                      (this.state.mediatype === "library" ? "active" : "")
                                                   }
                                                   onClick={() => {
                                                      this.hasRecordedMedia()
                                                         ? this.contentSwitchPopup()
                                                         : this.changeScreen("library");
                                                   }}
                                                   id="text"
                                                >
                                                   <button className="text-btn">Library</button>
                                                </div>
                                             </div>
                                             {/* <div class="select-box-media">
                                <label>Select Visit</label>
                                <Select
                                  value={
                                    this.state.selectedVisit
                                      ? this.state.selectedVisit
                                      : sVisit
                                  }
                                  onChange={this.handleChangeSelect}
                                  options={optionsList}
                                  placeholder="Visit"
                                  className="select-wrap-media"

                                // menuIsOpen={true}
                                />
                              </div> */}
                                             {/* <div class="select-box-media">
                                <label>Select Chapter</label>
                                <Select
                                  value={this.state.selectedChapters}
                                  onChange={this.handleChangeSelectChapters}
                                  options={chapterList}
                                  placeholder="Chapter"
                                  className="select-wrap-media"
                                />
                              </div> */}

                                             <div className="invite-user-page template-page">
                                                <form action="">
                                                   {this.state.mediatype === "media" &&
                                                   navigator.userAgent.indexOf("Chrome") !== -1 ? (
                                                      <div id="media-rec-buttons-container">
                                                         <div
                                                            className={`${
                                                               this.props.isVideoRecording
                                                                  ? "media-rec-button-disable"
                                                                  : "media-rec-button"
                                                            } ${
                                                               this.state.isRecAudioActive
                                                                  ? "media-rec-button-active"
                                                                  : ""
                                                            }`}
                                                            onClick={(e) => {
                                                               if (
                                                                  this.props.isVideoRecording ||
                                                                  this.props.isAudioRecording
                                                               ) {
                                                                  return;
                                                               } else if (
                                                                  this.hasRecordedMedia() &&
                                                                  this.state.isRecVideoActive
                                                               ) {
                                                                  this.contentSwitchPopup(
                                                                     "Discard the recorded video first"
                                                                  );
                                                                  return;
                                                               } else {
                                                                  this.setState((prevstate) => {
                                                                     return {
                                                                        isRecVideoActive: false,
                                                                        isRecAudioActive: !this.state.isRecAudioActive,
                                                                        image:
                                                                           prevstate.isRecAudioActive && prevstate.image
                                                                              ? null
                                                                              : this.state.image,
                                                                        title: prevstate.isRecAudioActive
                                                                           ? ""
                                                                           : this.state.title,
                                                                     };
                                                                  });
                                                               }
                                                            }}
                                                         >
                                                            <RecordAudio />
                                                            {this.props.isAudioRecording
                                                               ? "Recording..."
                                                               : "Record Audio"}
                                                         </div>

                                                         <div
                                                            className={`${
                                                               this.props.isAudioRecording
                                                                  ? "media-rec-button-disable"
                                                                  : "media-rec-button"
                                                            } ${
                                                               this.state.isRecVideoActive
                                                                  ? "media-rec-button-active"
                                                                  : ""
                                                            }`}
                                                            onClick={(e) => {
                                                               if (
                                                                  this.props.isVideoRecording ||
                                                                  this.props.isAudioRecording
                                                               ) {
                                                                  return;
                                                               } else if (
                                                                  this.hasRecordedMedia() &&
                                                                  this.state.isRecAudioActive
                                                               ) {
                                                                  this.contentSwitchPopup(
                                                                     "Discard the recorded audio first"
                                                                  );
                                                               } else {
                                                                  this.setState((prevstate) => {
                                                                     return {
                                                                        isRecAudioActive: false,
                                                                        isRecVideoActive: !this.state.isRecVideoActive,
                                                                        image:
                                                                           prevstate.isRecVideoActive && prevstate.image
                                                                              ? null
                                                                              : this.state.image,
                                                                        title: prevstate.isRecVideoActive
                                                                           ? ""
                                                                           : this.state.title,
                                                                     };
                                                                  });
                                                               }
                                                            }}
                                                         >
                                                            <RecordVideo />
                                                            {this.props.isVideoRecording
                                                               ? "Recording..."
                                                               : "Record Video"}
                                                         </div>
                                                      </div>
                                                   ) : null}
                                                   {(this.state.mediatype === "media" ||
                                                      this.state.mediatype === "record") &&
                                                      (this.state.mediatype === "media" &&
                                                      (this.state.isRecAudioActive || this.state.isRecVideoActive) ? (
                                                         this.state.isRecAudioActive ? (
                                                            <AudioRecorder
                                                               recordStart={(stream) => {
                                                                  this.streamRef.current = stream;
                                                                  this.setState({
                                                                     isRecVideoEnabled: false,
                                                                  });
                                                               }}
                                                               recordStop={(file) => {
                                                                  this.getRecordedBlob(file);
                                                               }}
                                                            />
                                                         ) : (
                                                            <VideoRecorder
                                                               fileChanged={(file) => {
                                                                  this.getRecordedBlob(file);
                                                               }}
                                                            />
                                                         )
                                                      ) : (
                                                         <div className="file-input">
                                                            {this.state.mediatype === "media" ? (
                                                               <input
                                                                  id="content-upload-view"
                                                                  type="file"
                                                                  onChange={this.handleChangeFiles}
                                                                  accept="/*"
                                                                  value={this.state.inputValue}
                                                                  style={{ zIndex: "5" }}
                                                               />
                                                            ) : (
                                                               ""
                                                            )}

                                                            {image && image.file && image.file.name ? (
                                                               // style={{ backgroundImage: }}

                                                               bgStyle ? (
                                                                  <div className="imagewrap">
                                                                     {image.file.type &&
                                                                     attachmentTypes.includes(image.file.type) ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="attechment"
                                                                              id="target"
                                                                              src="/assets/images/icon-attechment.svg"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : image.file.type &&
                                                                       iconVideotypes.includes(image.file.type) ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="mp4"
                                                                              id="target"
                                                                              src="/assets/images/icon-mp4.svg"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : image.file.type ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="images"
                                                                              id="target"
                                                                              src="/assets/images/icon-images.svg"
                                                                              //data-toggle="modal"
                                                                              //data-target="#myfile"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : previewfileformat.includes(
                                                                          image.file.name.split(".").pop()
                                                                       ) ? (
                                                                        <img
                                                                           alt="attechment"
                                                                           id="target"
                                                                           src="/assets/images/icon-attechment.svg"
                                                                           onClick={() => this.showPreview(image)}
                                                                        />
                                                                     ) : (
                                                                        ""
                                                                     )}
                                                                  </div>
                                                               ) : (
                                                                  <div
                                                                     className={
                                                                        this.state.mediatype === "record"
                                                                           ? "imagewrap-record"
                                                                           : "imagewrap"
                                                                     }
                                                                  >
                                                                     {image.file.type &&
                                                                     attachmentTypes.includes(image.file.type) ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="attechment"
                                                                              id="target"
                                                                              src="/assets/images/icon-attechment.svg"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : image.file.type &&
                                                                       iconVideotypes.includes(image.file.type) ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="mp4"
                                                                              id="target"
                                                                              src="/assets/images/icon-mp4.svg"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : image.file.type ? (
                                                                        previewfileformat.includes(
                                                                           image.file.name.split(".").pop()
                                                                        ) ? (
                                                                           <img
                                                                              alt="images"
                                                                              id="target"
                                                                              src="/assets/images/icon-images.svg"
                                                                              data-toggle="modal"
                                                                              data-target="#myfile"
                                                                           />
                                                                        ) : (
                                                                           ""
                                                                        )
                                                                     ) : previewfileformat.includes(
                                                                          image.file.name.split(".").pop()
                                                                       ) ? (
                                                                        this.state.mediatype === "record" ? (
                                                                           <video
                                                                              className="recorded-video"
                                                                              controls
                                                                              src={image.attachmentUrl}
                                                                           ></video>
                                                                        ) : (
                                                                           <img
                                                                              alt="attechment"
                                                                              id="target"
                                                                              src="/assets/images/icon-attechment.svg"
                                                                              onClick={() => this.showPreview(image)}
                                                                           />
                                                                        )
                                                                     ) : (
                                                                        ""
                                                                     )}
                                                                  </div>
                                                               )
                                                            ) : (
                                                               <div className="dropzone-placeholder screen-record">
                                                                  {this.state.mediatype === "record" ? (
                                                                     <>
                                                                        <span>
                                                                           {this.state.recordStart ? (
                                                                              <>
                                                                                 <img
                                                                                    src="/assets/images/start_recording.gif"
                                                                                    alt="Screen Record"
                                                                                    style={{
                                                                                       width: "45px",
                                                                                       marginLeft: "350px",
                                                                                       margin: "auto",
                                                                                    }}
                                                                                 />
                                                                                 <span>
                                                                                    {i18n &&
                                                                                       i18n.share &&
                                                                                       i18n.share
                                                                                          .screenrecordingstarted}
                                                                                 </span>
                                                                              </>
                                                                           ) : (
                                                                              <>
                                                                                 <img
                                                                                    src="/assets/images/desktop.svg"
                                                                                    alt="Screen Record"
                                                                                 />
                                                                                 <span>
                                                                                    {i18n &&
                                                                                       i18n.share &&
                                                                                       i18n.share.screenplaceholder}
                                                                                 </span>
                                                                              </>
                                                                           )}
                                                                        </span>
                                                                        <div className="text-center">
                                                                           <ScreenRecording
                                                                              startRecod={this.startRecod}
                                                                              downloadBlob={this.getRecordedBlob}
                                                                           />
                                                                        </div>
                                                                     </>
                                                                  ) : (
                                                                     <span>
                                                                        <img
                                                                           src="/assets/images/cloud.svg"
                                                                           alt="Cloud Upload"
                                                                           className=""
                                                                        />
                                                                        <span>
                                                                           {i18n &&
                                                                              i18n.share &&
                                                                              i18n.share.fileplaceholder}
                                                                        </span>
                                                                     </span>
                                                                  )}
                                                               </div>
                                                            )}
                                                         </div>
                                                      ))}

                                                   {this.state.isContentUploading && (
                                                      <div
                                                         className="d-flex w-100 justify-content-between flex-column"
                                                         style={{
                                                            position: "relative",
                                                            zIndex: 10,
                                                            marginTop: "10px",
                                                         }}
                                                      >
                                                         <div className="w-100 d-flex justify-content-center align-items-center">
                                                            <Line
                                                               percent={percentageUploaded}
                                                               strokeWidth="1"
                                                               strokeColor="#009ADF"
                                                               trailColor="#D9D9D9"
                                                               gapDegree={0}
                                                               gapPosition="right"
                                                            />{" "}
                                                            <div
                                                               className="d-flex justify-content-center align-items-center cancel-upload"
                                                               onClick={() => {
                                                                  this.setState({
                                                                     isLoading: false,
                                                                     percentageUploaded: 0,
                                                                     isUploading: false,
                                                                     isContentUploading: false,
                                                                  });
                                                                  toast.done(this.toastId.current);
                                                                  this.contentUploadref.current.cancel();
                                                               }}
                                                            >
                                                               <span aria-hidden="true">&times;</span>
                                                            </div>
                                                         </div>
                                                         <p>{`${percentageUploaded}% completed`}</p>
                                                      </div>
                                                   )}

                                                   {isLoading && (
                                                      <p
                                                         style={{
                                                            fontSize: 20,
                                                            textAlign: "center",
                                                         }}
                                                         id="redirectmsg"
                                                      >
                                                         {" "}
                                                      </p>
                                                   )}
                                                   {this.state.mediatype !== "library" && (
                                                      <div className="form-inner">
                                                         {this.state.mediatype !== "text" ? (
                                                            <div className="floating-form">
                                                               <div className="floating-label clear-input">
                                                                  <label>Title</label>
                                                                  <MentionsInput
                                                                     singleLine={false}
                                                                     allowSuggestionsAboveCursor={false}
                                                                     // allowSpaceInQuery={true}
                                                                     onSelect={this.selectTags}
                                                                     name="description"
                                                                     value={title}
                                                                     onChange={this.handleTextChange}
                                                                     classNames={classNames}
                                                                  >
                                                                     {/* <Mention
                                                trigger={/(([A-Za-z0-9_.]*))/}
                                                data={shortcutTags}
                                                appendSpaceOnAdd={true}
                                                className={
                                                  classNames.mentions__mention
                                                }
                                                style={{
                                                  overflowY: "scroll",
                                                  maxHeight: "200px",
                                                }}
                                                onAdd={this.selectedHashTags}
                                                // style={{ color: '#0074ff' }}
                                              /> */}
                                                                     <Mention
                                                                        trigger="#"
                                                                        data={allTags}
                                                                        appendSpaceOnAdd={true}
                                                                        className={classNames.mentions__mention}
                                                                        style={{
                                                                           overflowY: "scroll",
                                                                           maxHeight: "200px",
                                                                        }}
                                                                        onAdd={this.selectedHashTags}
                                                                        // style={{ color: '#0074ff' }}
                                                                     />
                                                                     <Mention
                                                                        trigger="@"
                                                                        data={providerTags}
                                                                        appendSpaceOnAdd={true}
                                                                        onAdd={this.selectedTags}
                                                                        className={classNames.mentions__mention}
                                                                        style={{
                                                                           overflowY: "scroll",
                                                                           maxHeight: "200px",
                                                                        }}
                                                                     />
                                                                     <Mention
                                                                        trigger={/(([A-Za-z0-9_.]+$))/}
                                                                        data={shortcutTags}
                                                                        appendSpaceOnAdd={true}
                                                                        onAdd={this.selectedShortcutTags}
                                                                        className={classNames.mentions__mention}
                                                                        style={{
                                                                           overflowY: "scroll",
                                                                           maxHeight: "200px",
                                                                        }}
                                                                        markup="${/(([A-Za-z0-9_.]+$))/}[__display__](user:__id__)"
                                                                        displayTransform={(id, label) => {
                                                                           return label.substring(
                                                                              0,
                                                                              label.lastIndexOf(" ")
                                                                           );
                                                                        }}
                                                                     />
                                                                  </MentionsInput>
                                                                  {/* <input
                                            className="theme-input"
                                            placeholder={
                                              this.state.mediatype === "media"
                                                ? i18n &&
                                                i18n.share &&
                                                i18n.share.titlelabel
                                                : i18n &&
                                                i18n.share &&
                                                i18n.share.texttitle
                                            }
                                            type="text"
                                            name="title"
                                            value={title}
                                            onChange={this.handleTextChange}
                                            maxLength="40"
                                          /> */}
                                                                  {/* <label className="theme-label">
                                          {this.state.mediatype === "media"
                                            ? i18n && i18n.share && i18n.share.texttitle
                                            : i18n && i18n.share && i18n.share.texttitle}
                                        </label> */}
                                                               </div>
                                                            </div>
                                                         ) : (
                                                            ""
                                                         )}

                                                         {this.state.mediatype === "text" && (
                                                            <div className="floating-form">
                                                               <div className="floating-label clear-input text-mention-area">
                                                                  <MentionsInput
                                                                     allowSuggestionsAboveCursor={false}
                                                                     onSelect={this.selectTags}
                                                                     name="description"
                                                                     placeholder={
                                                                        i18n && i18n.share && i18n.share.textdesc
                                                                     }
                                                                     value={description}
                                                                     onChange={this.descriptionValue}
                                                                     id="bold-textarea-message"
                                                                     classNames={classNames}
                                                                  >
                                                                     <Mention
                                                                        trigger="#"
                                                                        data={allTags}
                                                                        appendSpaceOnAdd={true}
                                                                        className={classNames.mentions__mention}
                                                                        onAdd={this.selectedHashTags}
                                                                     />
                                                                     <Mention
                                                                        trigger="@"
                                                                        data={providerTags}
                                                                        appendSpaceOnAdd={true}
                                                                        onAdd={this.selectedTags}
                                                                        className={classNames.mentions__mention}
                                                                     />
                                                                     <Mention
                                                                        trigger={/(([A-Za-z0-9_.]+$))/}
                                                                        data={shortcutTags}
                                                                        appendSpaceOnAdd={true}
                                                                        onAdd={this.selectedShortcutTags}
                                                                        className={classNames.mentions__mention}
                                                                        style={{
                                                                           overflowY: "scroll",
                                                                           maxHeight: "200px",
                                                                        }}
                                                                        markup="${/(([A-Za-z0-9_.]+$))/}[__display__](user:__id__)"
                                                                        displayTransform={(id, label) => {
                                                                           return label.substring(
                                                                              0,
                                                                              label.lastIndexOf(" ")
                                                                           );
                                                                        }}
                                                                     />
                                                                  </MentionsInput>

                                                                  {/* <label className="theme-label">
                                            {i18n && i18n.share && i18n.share.textdesc}
                                          </label> */}
                                                               </div>
                                                            </div>
                                                         )}
                                                         {this.state.contentType === "recent" ? (
                                                            <div>
                                                               <div className="d-flex justify-content-start align-items-center">
                                                                  <label className="switch-title">
                                                                     {i18n && i18n.share && i18n.share.doctorlabel}
                                                                  </label>
                                                                  <div className="onoffswitch">
                                                                     <input
                                                                        type="checkbox"
                                                                        name="onoffswitch"
                                                                        className="onoffswitch-checkbox"
                                                                        checked={isForDoctor}
                                                                        id="myonoffswitch"
                                                                        onChange={() =>
                                                                           this.setState({
                                                                              isForDoctor: !isForDoctor,
                                                                           })
                                                                        }
                                                                     />
                                                                     <label
                                                                        className="onoffswitch-label"
                                                                        htmlFor="myonoffswitch"
                                                                     >
                                                                        <span className="onoffswitch-inner"></span>
                                                                        <span className="onoffswitch-switch new-switch"></span>
                                                                     </label>
                                                                  </div>
                                                               </div>
                                                            </div>
                                                         ) : (
                                                            ""
                                                         )}

                                                         <div className="general-btns-group">
                                                            <button
                                                               onClick={this.clearall}
                                                               className="btn btn-blue-border"
                                                               disabled={isLoading ? true : false}
                                                            >
                                                               {i18n && i18n.buttontext && i18n.buttontext.canceltext}
                                                            </button>
                                                            <button
                                                               onClick={
                                                                  this.state.mediatype === "text"
                                                                     ? this.addSendTextToPatient
                                                                     : this.state.mediatype === "media" ||
                                                                       this.state.mediatype === "record"
                                                                     ? this.addDirectShareToPatient
                                                                     : null
                                                               }
                                                               disabled={
                                                                  isLoading ? true : title || description ? false : true
                                                               }
                                                               className="btn btn-blue-block"
                                                            >
                                                               {/* {i18n &&
                                            i18n.buttontext &&
                                            i18n.buttontext.uploadtext} */}
                                                               Send
                                                            </button>
                                                         </div>
                                                      </div>
                                                   )}
                                                   {this.state.mediatype === "library" ? (
                                                      <div className="chapter-header content-list search-result-provider">
                                                         <div id="cahpterDetail" className=" care-team-result">
                                                            <div
                                                               className="segment-control"
                                                               style={{
                                                                  width: "100%",
                                                                  display: "flex",
                                                                  justifyContent: "center",
                                                                  alignItems: "center",
                                                                  margin: "10px 0",
                                                               }}
                                                            >
                                                               <div
                                                                  className={
                                                                     "share-btn " +
                                                                     (this.state.isLibraryDocument ? "active" : "")
                                                                  }
                                                                  onClick={(e) => {
                                                                     e.preventDefault();
                                                                     if (!this.state.isDocumentLibrary) {
                                                                        this.setState({
                                                                           ...this.state,
                                                                           isLibraryDocument: true,
                                                                        });
                                                                     }
                                                                  }}
                                                               >
                                                                  <button className="media-btn">Documents</button>
                                                               </div>
                                                               <div
                                                                  className={
                                                                     "share-btn " +
                                                                     (!this.state.isLibraryDocument ? "active" : "")
                                                                  }
                                                                  onClick={(e) => {
                                                                     e.preventDefault();
                                                                     this.setState({
                                                                        ...this.state,
                                                                        isLibraryDocument: false,
                                                                     });
                                                                  }}
                                                               >
                                                                  <button className="text-btn">Bundles</button>
                                                               </div>
                                                               <img
                                                                  src={
                                                                     this.state.documentSortOrder === ""
                                                                        ? "/assets/images/no-sort-icon.svg"
                                                                        : this.state.documentSortOrder
                                                                        ? "/assets/images/sort-AtoZ.svg"
                                                                        : "/assets/images/sort-ZtoA.svg"
                                                                  }
                                                                  alt=""
                                                                  style={{
                                                                     marginLeft: "10px",
                                                                     cursor: "pointer",
                                                                  }}
                                                                  onClick={() => {
                                                                     let arr = this.state.libraryListCopy.sort((a, b) =>
                                                                        this.sortToCompare(
                                                                           a,
                                                                           b,
                                                                           "title",
                                                                           this.state.documentSortOrder === ""
                                                                              ? true
                                                                              : !this.state.documentSortOrder
                                                                        )
                                                                     );
                                                                     let arrBundle = this.state.libTagListCopy.sort(
                                                                        (a, b) =>
                                                                           this.sortToCompare(
                                                                              a,
                                                                              b,
                                                                              "name",
                                                                              this.state.documentSortOrder === ""
                                                                                 ? true
                                                                                 : !this.state.documentSortOrder
                                                                           )
                                                                     );
                                                                     this.setState({
                                                                        libraryList: arr,
                                                                        libTagList: arrBundle,
                                                                        documentSortOrder:
                                                                           !this.state.documentSortOrder,
                                                                     });
                                                                  }}
                                                               />
                                                            </div>
                                                            <div className="document-searchbox-div">
                                                               <img
                                                                  src="/assets/images/document-search-icon.svg"
                                                                  alt=""
                                                                  className="document-search-icon"
                                                               />
                                                               <input
                                                                  type="text"
                                                                  className="document-search-input"
                                                                  placeholder="Search"
                                                                  onChange={(e) => this.searchDocumentBundle(e)}
                                                               />
                                                            </div>

                                                            <ul className="chapter-detail-list">
                                                               {this.state.isLibraryDocument ? (
                                                                  libList ? (
                                                                     libList
                                                                  ) : this.state.showOverlay ? (
                                                                     ""
                                                                  ) : (
                                                                     <h2 className="no-result">No record found</h2>
                                                                  )
                                                               ) : tagList ? (
                                                                  tagList
                                                               ) : this.state.showOverlay ? (
                                                                  ""
                                                               ) : (
                                                                  <h2 className="no-result">No record found</h2>
                                                               )}
                                                               {/* {libList ? (
                                            libList
                                          ) : this.state.showOverlay ? (
                                            ""
                                          ) : (
                                            <h2 className="no-result">
                                              No record found
                                            </h2>
                                          )} */}
                                                            </ul>
                                                         </div>
                                                      </div>
                                                   ) : (
                                                      ""
                                                   )}
                                                </form>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 {this.state.isLoading ? (
                                    <div className="patient-list-loading">
                                       <LoadingIndicator />
                                    </div>
                                 ) : (
                                    ""
                                 )}
                                 {this.state.patientName ? (
                                    <nav
                                       aria-label="breadcrumb"
                                       style={{
                                          display: "flex",
                                          width: "100%",
                                          justifyContent: "space-between",
                                       }}
                                    >
                                       <ol className="breadcrumb">
                                          <li className="breadcrumb-item">
                                             <a href="/">Home</a>
                                          </li>
                                          <li className="breadcrumb-item active" aria-current="page">
                                             {this.state.patientName ? this.state.patientName : ""}
                                          </li>
                                          <li style={{ marginLeft: "10px", marginTop: "2px" }}>
                                             {this.state.patientOnboardStatus.toLowerCase() === "active" ? (
                                                <img src="/assets/images/active-status.svg" alt="" />
                                             ) : this.state.patientOnboardStatus.toLowerCase() === "pending" ? (
                                                <img src="/assets/images/pending-status.svg" alt="" />
                                             ) : this.state.patientOnboardStatus.toLowerCase() === "invited" ? (
                                                <img src="/assets/images/invited-status.svg" alt="" />
                                             ) : this.state.patientOnboardStatus.toLowerCase() === "disable" ? (
                                                <img src="/assets/images/disabled-status.svg" alt="" />
                                             ) : (
                                                ""
                                             )}
                                          </li>
                                          {/* <li className="unverified-patient-remarks">
                              {this.state.patientRemarks
                                ? `(${this.state.patientRemarks})`
                                : ""}
                            </li> */}
                                       </ol>
                                       <div className="patient-profile-edit-controls">
                                          <button
                                             className="patient-profile-edit-btn"
                                             disabled={this.state.patientEditMode ? true : false}
                                             onClick={this.enablePatientEditMode}
                                             data-testid="patientProfileEdit"
                                          >
                                             Edit
                                          </button>
                                          {this.state.patientEditMode ? (
                                             <div style={{ display: "flex" }}>
                                                <div
                                                   style={{
                                                      marginLeft: "10px",
                                                      cursor: "pointer",
                                                   }}
                                                >
                                                   <img
                                                      src="/assets/images/edit-check.svg"
                                                      alt=""
                                                      onClick={() => this.updatePatientProfile(this.state.patientID)}
                                                      data-testid="patientProfileUpdate"
                                                   />
                                                </div>
                                                <div
                                                   style={{
                                                      marginLeft: "10px",
                                                      cursor: "pointer",
                                                   }}
                                                >
                                                   <img
                                                      src="/assets/images/edit-cross.svg"
                                                      alt=""
                                                      onClick={this.disablePatientEditMode}
                                                      data-testid="patientProfileCancel"
                                                   />
                                                </div>
                                             </div>
                                          ) : null}
                                       </div>
                                    </nav>
                                 ) : (
                                    ""
                                 )}

                                 <div className="card card-new info-card card-details-patient">
                                    <div className="card-body">
                                       <div className="row">
                                          <div className="patient-details-screen">
                                             <div className="card-inner">
                                                <div className="name-title">
                                                   <label>
                                                      <img
                                                         src="/assets/images/person-icon.svg"
                                                         alt=""
                                                         style={{ padding: "5px" }}
                                                      />
                                                      Name
                                                   </label>
                                                   {this.state.contentLoading ? null : (
                                                      <img
                                                         id="copy-patient-details-img"
                                                         src="/assets/images/copy.png"
                                                         alt=""
                                                         onClick={() => {
                                                            navigator.clipboard.writeText(copyDetails(this.state));
                                                            toast.info("Copied!", {
                                                               position: "top-left",
                                                               autoClose: 3000,
                                                               hideProgressBar: true,
                                                               closeOnClick: true,
                                                               className: "clipboard-toast",
                                                            });
                                                         }}
                                                      />
                                                   )}
                                                   <div className="descript-col">
                                                      {this.state.patientEditMode ? (
                                                         <div>
                                                            <input
                                                               type="text"
                                                               className="form-control"
                                                               placeholder="Enter Name"
                                                               value={this.state.editPatientName}
                                                               onChange={(e) => {
                                                                  this.setState({
                                                                     editPatientName: e.target.value,
                                                                     editPatientErrorObj: {
                                                                        editPatientNameError: "",
                                                                     },
                                                                  });
                                                               }}
                                                               data-testid="patientProfileNameInput"
                                                            />
                                                            <label
                                                               className="patient-error-label"
                                                               data-testid="patientProfileNameInputError"
                                                            >
                                                               {this.state.editPatientErrorObj.editPatientNameError}
                                                            </label>
                                                         </div>
                                                      ) : this.state.patientName ? (
                                                         this.state.patientName
                                                      ) : this.state.contentLoading ? (
                                                         <LoadingSmallContent />
                                                      ) : (
                                                         "-"
                                                      )}
                                                   </div>
                                                </div>
                                                {!this.state.patientEditMode && (
                                                   <div className="video-referral-icons-div">
                                                      <div className="video-play-icon">
                                                         <img
                                                            style={{
                                                               width: "5rem",
                                                               cursor: "pointer",
                                                            }}
                                                            src="/assets/images/video-call-icon.svg"
                                                            alt="Video"
                                                            title="Video Call"
                                                            onClick={() =>
                                                               this.patientVideoCall(patientid, this.state.patientName)
                                                            }
                                                         />
                                                      </div>
                                                      {this.state.showReferralFlag && (
                                                         <div className="referral-icon-div">
                                                            <img
                                                               src="/assets/images/referral-icon.svg"
                                                               title="Referral"
                                                               style={{
                                                                  width: "5rem",
                                                                  cursor: "pointer",
                                                               }}
                                                               onClick={this.openReferralPatientModal}
                                                            />
                                                         </div>
                                                      )}
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                          <div className="patient-details-screen">
                                             <div className="card-inner">
                                                <div className="name-title">
                                                   <label>
                                                      <img
                                                         src="/assets/images/calender-icon.svg"
                                                         alt=""
                                                         style={{ padding: "5px" }}
                                                      />
                                                      Date of Birth
                                                   </label>
                                                   <div className="descript-col">
                                                      {this.state.patientEditMode ? (
                                                         <div>
                                                            <DatePicker
                                                               onSelect={(date) => {
                                                                  this.setState({
                                                                     editPatientDOB: date,
                                                                     editPatientErrorObj: {
                                                                        editPatientDOBError: "",
                                                                     },
                                                                  });
                                                               }}
                                                               // isClearable
                                                               value={this.state.editPatientDOB}
                                                               selected={this.state.editPatientDOB}
                                                               showMonthDropdown
                                                               showYearDropdown
                                                               dropdownMode="select"
                                                               className="form-control"
                                                               id="patient-dob"
                                                               autoComplete="off"
                                                               placeholderText="MM/DD/YYYY"
                                                               dateFormat="MM-dd-yyyy"
                                                               data-testid="patientProfileDOBInput"
                                                               maxDate={new Date()}
                                                            />
                                                            <label
                                                               className="patient-error-label"
                                                               data-testid="patientProfileDOBInputError"
                                                            >
                                                               {this.state.editPatientErrorObj.editPatientDOBError}
                                                            </label>
                                                         </div>
                                                      ) : this.state.patientDOB ? (
                                                         moment(this.state.patientDOB).format("MM/DD/YYYY")
                                                      ) : this.state.contentLoading ? (
                                                         <LoadingSmallContent />
                                                      ) : (
                                                         "-"
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                          <div className="patient-details-screen">
                                             <div className="card-inner">
                                                <div className="name-title">
                                                   <label>
                                                      <img
                                                         src="/assets/images/mrn-icon.svg"
                                                         alt=""
                                                         style={{ padding: "5px" }}
                                                      />
                                                      MPIID
                                                   </label>
                                                   <div className="descript-col">
                                                      {this.state.patientEditMode ? (
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder={
                                                               this.state.patientMRN ? this.state.patientMRN : "-"
                                                            }
                                                            value={this.state.editPatientMRN}
                                                            onChange={(e) => {
                                                               this.setState({
                                                                  editPatientMRN: e.target.value,
                                                               });
                                                            }}
                                                            disabled
                                                         />
                                                      ) : this.state.patientMRN ? (
                                                         this.state.patientMRN
                                                      ) : this.state.contentLoading ? (
                                                         <LoadingSmallContent />
                                                      ) : (
                                                         "-"
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                          <div className="patient-details-screen">
                                             <div className="card-inner">
                                                <div className="name-title">
                                                   <label>
                                                      <img
                                                         src="/assets/images/email-icon.svg"
                                                         alt=""
                                                         style={{ padding: "5px" }}
                                                      />
                                                      Email
                                                   </label>
                                                   <div className="descript-col">
                                                      {this.state.patientEditMode ? (
                                                         <div>
                                                            <input
                                                               type="text"
                                                               className="form-control"
                                                               placeholder="abc@example.com"
                                                               value={this.state.editPatientEmail}
                                                               onChange={(e) => {
                                                                  this.setState({
                                                                     editPatientEmail: e.target.value,
                                                                     editPatientErrorObj: {
                                                                        editPatientEmailError: "",
                                                                     },
                                                                  });
                                                               }}
                                                               data-testid="patientProfileEmailInput"
                                                            />
                                                            <label
                                                               className="patient-error-label"
                                                               data-testid="patientProfileEmailInputError"
                                                            >
                                                               {this.state.editPatientErrorObj.editPatientEmailError}
                                                            </label>
                                                         </div>
                                                      ) : this.state.patientEmail ? (
                                                         this.state.patientEmail
                                                      ) : this.state.contentLoading ? (
                                                         <LoadingSmallContent />
                                                      ) : (
                                                         "-"
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                          <div className="patient-details-screen">
                                             <div className="card-inner">
                                                <div className="name-title">
                                                   <label>
                                                      <img
                                                         src="/assets/images/mobile-phone-icon.svg"
                                                         alt=""
                                                         style={{ padding: "5px" }}
                                                      />
                                                      Mobile Number
                                                   </label>
                                                   <div className="descript-col">
                                                      {this.state.patientEditMode ? (
                                                         <div>
                                                            <Input
                                                               name="editPatientMobile"
                                                               value={this.state.editPatientMobile}
                                                               onChange={(e) => {
                                                                  this.setState({
                                                                     editPatientMobile: e.target.value,
                                                                     editPatientErrorObj: {
                                                                        editPatientMobileError: "",
                                                                     },
                                                                  });
                                                               }}
                                                               data-testid="patientProfileMobileInput"
                                                            />
                                                            <label
                                                               className="patient-error-label"
                                                               data-testid="patientProfileMobileInputError"
                                                            >
                                                               {this.state.editPatientErrorObj.editPatientMobileError}
                                                            </label>
                                                         </div>
                                                      ) : this.state.patientMobile ? (
                                                         this.formatPhoneNumber(this.state.patientMobile)
                                                      ) : this.state.contentLoading ? (
                                                         <LoadingSmallContent />
                                                      ) : (
                                                         "-"
                                                      )}
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                          {/* <div className="patient-details-screen">
                              <div className="card-inner with-video">
                                <label>&nbsp;</label>
                                {this.state.isCallEnable ? (
                                  <button
                                    className="btn btn-blue-block"
                                    onClick={() =>
                                      this.patientVideoCall(
                                        patientid,
                                        this.state.patientName
                                      )
                                    }
                                  >
                                    <img
                                      src="/assets/images/video-call-icon.png"
                                      alt="Video"
                                    />
                                    Video Call
                                  </button>
                                ) : this.state.contentLoading ? (
                                  <LoadingSmallContent />
                                ) : (
                                      ""
                                    )}
                              </div>
                            </div> */}
                                       </div>
                                       <hr />
                                    </div>
                                 </div>

                                 <div className="row" ref={this.myRef}>
                                    {!this.state.showTagMentionDetails || this.state.showBlockType === "recent" ? (
                                       <div className="col-xl-4" onDragOver={(e) => this.dragFile(e, "recent")}>
                                          <div className={this.state.dragDropDiv}>
                                             <input type="file" onChange={this.handleDragFiles} accept="/*" value="" />
                                             <span className="drag-content">
                                                Drop Files to instantly upload them to:Activity
                                             </span>
                                          </div>

                                          <div className="card card-new activity">
                                             <div className="card-body">
                                                <h3>Recent Activity</h3>
                                                <div className="search-box-field recent-search-patient">
                                                   <div className="form-group search-new">
                                                      <span className="material-icons">search</span>
                                                      <input
                                                         type="text"
                                                         className="form-control"
                                                         aria-describedby="emailHelp"
                                                         onChange={(e) => this.handleChangeProviderOnly(e, "activity")}
                                                         autoComplete="off"
                                                         placeholder="Search"
                                                         value={this.state.searchActitivyOnly}
                                                      />
                                                   </div>
                                                </div>
                                                <div className="act-height">
                                                   {recentActivityList ? (
                                                      <>
                                                         <ul>{recentActivityList}</ul>
                                                         <Menu id={MENU_ID_RECENT}>
                                                            <Item
                                                               hidden={(e) => {
                                                                  return e.props.value.type !== "media";
                                                               }}
                                                               onClick={(e) => {
                                                                  swal({
                                                                     title: e.props.value.title,
                                                                     text: `${
                                                                        e.props.value.printEnable
                                                                           ? "Restrict download of this content?"
                                                                           : "Allow download of this content?"
                                                                     }`,
                                                                     buttons: ["Cancel", "Confirm"],
                                                                     dangerMode: false,
                                                                  }).then((willDownload) => {
                                                                     if (willDownload) {
                                                                        this.contextMenuDownloadContent(
                                                                           e.props.value.id,
                                                                           e.props.value.printEnable ? false : true,
                                                                           e.props.listType
                                                                        );
                                                                     }
                                                                  });
                                                               }}
                                                            >
                                                               <div className="context-menu-download">
                                                                  <div className="context-menu-download-label">
                                                                     {this.state.contextMenuObject.printEnable
                                                                        ? "Restrict Download"
                                                                        : "Allow Download"}
                                                                  </div>
                                                                  <ToggleSwitch
                                                                     value={this.state.contextMenuObject.printEnable}
                                                                  />
                                                               </div>
                                                            </Item>
                                                            {this.state.contextMenuObject.type === "media" ? (
                                                               <hr
                                                                  style={{
                                                                     border: "0px",
                                                                     marginTop: "0px",
                                                                     marginBottom: "0px",
                                                                  }}
                                                               ></hr>
                                                            ) : null}
                                                            <Item
                                                               hidden={(e) => {
                                                                  return e.props.hoursDiffRecentActivity > 24;
                                                               }}
                                                               onClick={(e) => {
                                                                  swal({
                                                                     title: e.props.value.title,
                                                                     text: "Are you sure you want to delete this file?",
                                                                     buttons: true,
                                                                     dangerMode: true,
                                                                  }).then((willDelete) => {
                                                                     if (willDelete) {
                                                                        this.contextMenuDeleteFile(
                                                                           e.props.value.id,
                                                                           e.props.value.type === "media"
                                                                              ? "mediaId"
                                                                              : "itemId"
                                                                        );
                                                                     }
                                                                  });
                                                               }}
                                                            >
                                                               <div
                                                                  style={{
                                                                     width: "85%",
                                                                     fontSize: "14px",
                                                                  }}
                                                               >
                                                                  Delete
                                                               </div>
                                                               <div>
                                                                  <img src="/assets/images/delete-icon-context.svg" />
                                                               </div>
                                                            </Item>
                                                         </Menu>

                                                         {this.state.recentActivityFetching ? (
                                                            <LoadingIndicator rootClass="loading-indicator" />
                                                         ) : (
                                                            <button
                                                               className={
                                                                  this.state.recentListPagination.listEnded
                                                                     ? "notif-list-end-text"
                                                                     : "showmore-notifications-button"
                                                               }
                                                               disabled={this.state.recentListPagination.listEnded}
                                                               onClick={() => {
                                                                  let page =
                                                                     this.state.recentListPagination.pagenumber + 1;
                                                                  this.setState(
                                                                     {
                                                                        recentActivityFetching: true,
                                                                        recentListPagination: {
                                                                           ...this.state.recentListPagination,
                                                                           pagenumber: page,
                                                                        },
                                                                     },
                                                                     () =>
                                                                        this.recentActivity(
                                                                           this.props.match.params.patientid,
                                                                           true
                                                                        )
                                                                  );
                                                               }}
                                                            >
                                                               {this.state.recentListPagination.listEnded
                                                                  ? "No more results"
                                                                  : "Show More"}
                                                            </button>
                                                         )}
                                                      </>
                                                   ) : this.state.recentActivityMessage ? (
                                                      <h2 className="no-result">No record found</h2>
                                                   ) : (
                                                      <LoadingContent />
                                                   )}
                                                </div>

                                                <div className="text-center mt-5">
                                                   <button
                                                      className="btn btn-blue-block"
                                                      onClick={() => this.openCreateContent("recent")}
                                                   >
                                                      Create Content
                                                   </button>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    ) : (
                                       ""
                                    )}

                                    {this.state.showBlockType === "pOnly" || !this.state.showTagMentionDetails ? (
                                       <div className="col-xl-4" onDragOver={(e) => this.dragFile(e, "provider")}>
                                          <div className={this.state.dragDropProviderDiv}>
                                             <input type="file" onChange={this.handleDragFiles} accept="/*" value="" />
                                             <span className="drag-content">
                                                Drop Files to instantly upload them to:Activity
                                             </span>
                                          </div>
                                          <div className="card card-new activity">
                                             <div className="card-body">
                                                <h3 style={{ color: "#DC114A" }}>Provider Only</h3>
                                                <div className="search-box-field recent-search-patient">
                                                   <div className="form-group search-new">
                                                      <span className="material-icons">search</span>
                                                      <input
                                                         type="text"
                                                         className="form-control"
                                                         aria-describedby="emailHelp"
                                                         onChange={(e) => this.handleChangeProviderOnly(e, "provider")}
                                                         autoComplete="off"
                                                         value={this.state.searchProviderOnly}
                                                         placeholder="Search"
                                                      />
                                                   </div>
                                                </div>
                                                <div className="act-height">
                                                   {recentActivityProvider ? (
                                                      <>
                                                         <ul>{recentActivityProvider}</ul>
                                                         <Menu id={MENU_ID_PROVIDER}>
                                                            <Item
                                                               hidden={(e) => {
                                                                  return e.props.value.type !== "media";
                                                               }}
                                                               onClick={(e) => {
                                                                  swal({
                                                                     title: e.props.value.title,
                                                                     text: `${
                                                                        e.props.value.printEnable
                                                                           ? "Restrict download of this content?"
                                                                           : "Allow download of this content?"
                                                                     }`,
                                                                     buttons: ["Cancel", "Confirm"],
                                                                     dangerMode: false,
                                                                  }).then((willDownload) => {
                                                                     if (willDownload) {
                                                                        this.contextMenuDownloadContent(
                                                                           e.props.value.id,
                                                                           e.props.value.printEnable ? false : true,
                                                                           e.props.listType
                                                                        );
                                                                     }
                                                                  });
                                                               }}
                                                            >
                                                               <div className="context-menu-download">
                                                                  <div className="context-menu-download-label">
                                                                     {this.state.contextMenuObject.printEnable
                                                                        ? "Restrict Download"
                                                                        : "Allow Download"}
                                                                  </div>
                                                                  <ToggleSwitch
                                                                     value={this.state.contextMenuObject.printEnable}
                                                                  />
                                                               </div>
                                                            </Item>
                                                            {this.state.contextMenuObject.type === "media" ? (
                                                               <hr
                                                                  style={{
                                                                     border: "0px",
                                                                     marginTop: "0px",
                                                                     marginBottom: "0px",
                                                                  }}
                                                               ></hr>
                                                            ) : null}
                                                            <Item
                                                               hidden={(e) => {
                                                                  return e.props.hoursDiffProvider > 24;
                                                               }}
                                                               onClick={(e) => {
                                                                  swal({
                                                                     title: e.props.value.title,
                                                                     text: "Are you sure you want to delete this file?",
                                                                     buttons: true,
                                                                     dangerMode: true,
                                                                  }).then((willDelete) => {
                                                                     if (willDelete) {
                                                                        this.contextMenuDeleteFile(
                                                                           e.props.value.id,
                                                                           e.props.value.type === "media"
                                                                              ? "mediaId"
                                                                              : "itemId"
                                                                        );
                                                                     }
                                                                  });
                                                               }}
                                                            >
                                                               <div
                                                                  style={{
                                                                     width: "85%",
                                                                     fontSize: "14px",
                                                                  }}
                                                               >
                                                                  Delete
                                                               </div>
                                                               <div>
                                                                  <img src="/assets/images/delete-icon-context.svg" />
                                                               </div>
                                                            </Item>
                                                         </Menu>
                                                         {this.state.providerOnlyFetching ? (
                                                            <LoadingIndicator rootClass="loading-indicator" />
                                                         ) : (
                                                            <button
                                                               className={
                                                                  this.state.providerListPagination.listEnded
                                                                     ? "notif-list-end-text"
                                                                     : "showmore-notifications-button"
                                                               }
                                                               disabled={this.state.providerListPagination.listEnded}
                                                               onClick={() => {
                                                                  let page =
                                                                     this.state.providerListPagination.pagenumber + 1;
                                                                  this.setState(
                                                                     {
                                                                        providerOnlyFetching: true,
                                                                        providerListPagination: {
                                                                           ...this.state.providerListPagination,
                                                                           pagenumber: page,
                                                                        },
                                                                     },
                                                                     () =>
                                                                        this.recentActivityProviderOnly(
                                                                           this.props.match.params.patientid,
                                                                           "",
                                                                           true
                                                                        )
                                                                  );
                                                               }}
                                                            >
                                                               {this.state.providerListPagination.listEnded
                                                                  ? "No more results"
                                                                  : "Show More"}
                                                            </button>
                                                         )}
                                                      </>
                                                   ) : this.state.recentActivityMessageProvider ? (
                                                      <h2 className="no-result">No record found</h2>
                                                   ) : (
                                                      <LoadingContent />
                                                   )}
                                                </div>
                                                {/* data-toggle="modal" data-target="#create-recent-content"  */}
                                                <div className="text-center mt-5">
                                                   <button
                                                      className="btn btn-blue-block"
                                                      onClick={() => this.openCreateContent("provider")}
                                                   >
                                                      Create Content
                                                   </button>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    ) : (
                                       ""
                                    )}

                                    {this.state.showTagMentionDetails ? (
                                       <TagMentionDetails
                                          id={this.state.tagId}
                                          tagType={this.state.tagType}
                                          closeDetails={() => this.hideBox()}
                                          headerName={this.state.contentNameDetails}
                                          openMediaView={this.showContentDescriptions}
                                       />
                                    ) : (
                                       <>
                                          <div className="col-xl-4">
                                             <div className="card card-new search-card">
                                                <div className="card-body" style={{ paddingTop: "5px" }}>
                                                   {/* <h3>Patient care team</h3> */}
                                                   <div
                                                      className="segment-control share-btns share-centered"
                                                      style={{ margin: "10px 0", width: "100%" }}
                                                   >
                                                      <div
                                                         className={
                                                            this.state.careTeamListType
                                                               ? "share-btn active"
                                                               : "share-btn"
                                                         }
                                                         onClick={() => this.getCareTeamList(true)}
                                                         id="text"
                                                      >
                                                         <button className="text-btn">Care Team</button>
                                                      </div>
                                                      <div
                                                         className={
                                                            this.state.careTeamListType
                                                               ? "share-btn "
                                                               : "share-btn active"
                                                         }
                                                         onClick={() => this.getCareTeamList(false)}
                                                         id="text"
                                                      >
                                                         <button className="text-btn">Family/Friends</button>
                                                      </div>
                                                      {this.state.showFollowButton ? (
                                                         <div
                                                            data-toggle={
                                                               this.state.addselfStatus.toLowerCase() !== "unfollow"
                                                                  ? "modal"
                                                                  : null
                                                            }
                                                            data-target={
                                                               this.state.addselfStatus.toLowerCase() !== "unfollow"
                                                                  ? "#follow-patient-care-team"
                                                                  : null
                                                            }
                                                            id="add-self-care-team"
                                                            className={
                                                               this.state.addselfStatus
                                                                  .toLowerCase()
                                                                  .includes("unfollow")
                                                                  ? "unfollow-patient"
                                                                  : "follow-patient"
                                                            }
                                                            onClick={() => {
                                                               if (
                                                                  this.state.addselfStatus.toLowerCase() === "unfollow"
                                                               ) {
                                                                  this.setState({ isLoading: true });
                                                                  Apimanager.unfollowPatientCareTeam(
                                                                     {
                                                                        userId: this.props.match.params.patientid,
                                                                     },
                                                                     () => {
                                                                        this.setState({
                                                                           isLoading: false,
                                                                        });
                                                                        this.getCareTeamList(true);
                                                                     },
                                                                     () =>
                                                                        this.setState({
                                                                           isLoading: false,
                                                                        })
                                                                  );
                                                               }
                                                            }}
                                                         >
                                                            {this.state.addselfStatus}
                                                         </div>
                                                      ) : null}
                                                   </div>
                                                   <div
                                                      className="search-box-field recent-search-patient"
                                                      style={{ display: "flex" }}
                                                   >
                                                      <div className="form-group search-new" style={{ width: "90%" }}>
                                                         <span className="material-icons">search</span>
                                                         <input
                                                            type="text"
                                                            className="form-control"
                                                            aria-describedby="emailHelp"
                                                            onChange={(e) => this.handleChangePatientCareTeam(e)}
                                                            autoComplete="off"
                                                            placeholder="Search"
                                                         />
                                                      </div>
                                                      <img
                                                         src={
                                                            this.state.sharingListSortOrder === ""
                                                               ? "/assets/images/no-sort-icon.svg"
                                                               : this.state.sharingListSortOrder
                                                               ? "/assets/images/sort-AtoZ.svg"
                                                               : "/assets/images/sort-ZtoA.svg"
                                                         }
                                                         alt=""
                                                         style={{
                                                            marginLeft: "17px",
                                                            cursor: "pointer",
                                                         }}
                                                         onClick={() => {
                                                            let arr = this.state.careTeamList.sort((a, b) =>
                                                               this.sortToCompare(
                                                                  a,
                                                                  b,
                                                                  "name",
                                                                  this.state.sharingListSortOrder === ""
                                                                     ? true
                                                                     : !this.state.sharingListSortOrder
                                                               )
                                                            );
                                                            this.setState({
                                                               careTeamList: arr,
                                                               sharingListSortOrder: !this.state.sharingListSortOrder,
                                                            });
                                                         }}
                                                      />
                                                   </div>
                                                   <div className="search-result">
                                                      {sharingList ? (
                                                         <ul>{sharingList}</ul>
                                                      ) : this.state.careTeamMessage ? (
                                                         <h2 className="no-result">No record found</h2>
                                                      ) : (
                                                         <LoadingContent />
                                                      )}
                                                   </div>
                                                   {/* onClick={() => this.addShareingTeam()} */}
                                                   <div className="text-center">
                                                      <button
                                                         className="btn btn-blue-block"
                                                         data-toggle="modal"
                                                         data-target="#add-tocare-team"
                                                         onClick={() => {
                                                            this.setState({
                                                               careTeamProviderSelected: false,
                                                            });
                                                         }}
                                                      >
                                                         {this.state.careTeamSelected ? "Add to Care Team" : "Invite"}
                                                      </button>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                       </>
                                    )}
                                 </div>
                              </React.Fragment>
                           ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div
                  className="page-body-wrapper patient-list-wrap"
                  id="get-focus"
                  onMouseMove={() => this.dragPatientLeave()}
                  onDrop={(e) => this.onDragLeave(e)}
               >
                  <div className="row">
                     <div className="search-box-field">
                        <div className="form-group search-new">
                           <span className="material-icons">search</span>
                           <input
                              ref={this.textInput}
                              onFocus={(e) => this.setState({ isPatientSearchActive: true })}
                              // onBlur={(e) =>
                              //   this.setState({ isPatientSearchActive: false })
                              // }
                              onMouseOut={(e) => this.setState({ isPatientSearchActive: false })}
                              type="text"
                              className="form-control get-focus-close"
                              id="exampleInputEmail2Search"
                              aria-describedby="emailHelp"
                              onChange={(e) => this.handleChangePatientName(e)}
                              autoComplete="off"
                              value={this.state.searchPatientName}
                              placeholder={
                                 this.state.searchStatus
                                    ? "Search by name, mobile, email"
                                    : "Search by first and last name"
                              }
                              // {
                              //   this.state.enterPriseDetails &&
                              //   this.state.enterPriseDetails.appIntegration
                              //     ? "Search by Name or Cell"
                              //     : "Search by Name or Cell"
                              // }
                              disabled={this.state.activeFilter}
                           />
                           {searchTooltip && this.state.isPatientSearchActive ? (
                              <div className="search-tooltip">
                                 <img src="assets/images/alert.svg" alt="Alert" /> We need full name to search in EMR
                              </div>
                           ) : (
                              ""
                           )}
                        </div>
                        {this.state.focusVal && recentSearch.length > 0 ? (
                           <div className="recent-search-box">
                              <h6>RECENTLY SEARCHED</h6>
                              {recentSearch.length > 0 ? (
                                 recentSearch.map((list, index) => {
                                    return (
                                       <div className="patient-search-drop-down">
                                          <div
                                             className="drop-down-row search-line-text"
                                             onClick={() =>
                                                this.getRedirectOnName(
                                                   list.id,
                                                   list.name,
                                                   list,
                                                   !this.state.searchStatus ? "emr" : ""
                                                )
                                             }
                                          >
                                             {list.name ? list.name : list.firstName + " " + list.lastName}
                                          </div>
                                       </div>
                                    );
                                 })
                              ) : (
                                 <p className="search-line-text">No results</p>
                              )}
                           </div>
                        ) : (
                           ""
                        )}
                     </div>
                     <div className="search-button-field">
                        <div className="general-btns-group">
                           <button
                              id="patient-list-search"
                              type="button"
                              className="btn btn-blue-block"
                              onClick={() => this.filterData()}
                              disabled={disbaleSearch}
                           >
                              Search
                           </button>

                           <span
                              className={this.state.activeFilter ? "search-filters active" : "search-filters"}
                              style={{ cursor: "pointer" }}
                              onClick={() => this.activeFilter()}
                           >
                              filter_list
                           </span>

                           {/* {this.state.enterPriseDetails &&
                    this.state.enterPriseDetails.appIntegration
                      .advanceSearch ? (
                      ""
                    ) : (
                      <button
                        type="button"
                        className="btn btn-blue-border"
                        onClick={() => this.resetData()}
                        disabled={disbaleSearch}
                      >
                        Clear
                      </button>
                    )} */}
                        </div>
                     </div>
                  </div>

                  {this.state.activeFilter ? (
                     <div>
                        <div className="north-wrap new-added">
                           <div className="north">
                              <label htmlFor="dob">Date Of Birth</label>
                              <DatePicker
                                 onSelect={(date) => {
                                    this.setState({
                                       searchDob: date,
                                    });
                                 }}
                                 // isClearable
                                 value={this.state.searchDob}
                                 selected={this.state.searchDob}
                                 showMonthDropdown
                                 showYearDropdown
                                 dropdownMode="select"
                                 className="form-control"
                                 id="dob"
                                 autoComplete="off"
                                 placeholderText="Date Of Birth"
                                 dateFormat="MM-dd-yyyy"
                                 disabled={this.state.searchMrn}
                              />
                           </div>
                           <div className="north">
                              <label htmlFor="dob">Patient MRN</label>
                              <input
                                 type="text"
                                 className="form-control"
                                 placeholder="MRN"
                                 value={this.state.searchMrn}
                                 onChange={(e) => {
                                    this.setState({
                                       searchMrn: e.target.value,
                                    });
                                 }}
                              ></input>
                           </div>

                           <div className="north">
                              <label>Hospital</label>
                              <Select
                                 value={this.state.hospitalSelected}
                                 onChange={(hsptl) => {
                                    this.setState({
                                       hospitalSelected: hsptl,
                                    });
                                 }}
                                 options={hospitalListVal}
                                 placeholder="Select Hospital"
                                 className="select-wrap-media"
                                 // menuIsOpen={true}
                                 isClearable={true}
                              />
                           </div>

                           <div className="north">
                              <label htmlFor="dob">Patient Name</label>
                              <input
                                 type="text"
                                 className="form-control"
                                 placeholder="First Name"
                                 value={this.state.searchFirstName}
                                 disabled={this.state.searchMrn}
                                 onChange={(e) => {
                                    this.setState({
                                       searchFirstName: e.target.value,
                                    });
                                 }}
                              ></input>
                           </div>
                           <div className="north">
                              <label>&nbsp;</label>

                              <input
                                 type="text"
                                 className="form-control"
                                 placeholder="Middle Name"
                                 value={this.state.searchMiddleName}
                                 disabled={this.state.searchMrn}
                                 onChange={(e) => {
                                    this.setState({
                                       searchMiddleName: e.target.value,
                                    });
                                 }}
                              ></input>
                           </div>
                           <div className="north">
                              <label>&nbsp;</label>
                              <input
                                 type="text"
                                 className="form-control"
                                 placeholder="Last Name"
                                 value={this.state.searchLastName}
                                 disabled={this.state.searchMrn}
                                 onChange={(e) => {
                                    this.setState({
                                       searchLastName: e.target.value,
                                    });
                                 }}
                              ></input>
                           </div>
                           <div className="apply-filter">
                              <span
                                 onClick={() => this.resetFilterData()}
                                 disabled={disabledAdvance}
                                 style={{ cursor: "pointer" }}
                              >
                                 Clear Filter
                              </span>
                              <button
                                 onClick={() => this.getApplyFilter("with")}
                                 className="btn btn-blue-block"
                                 disabled={disabledAdvance}
                              >
                                 Apply
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     ""
                  )}
                  {this.state.enterPriseDetails && this.state.enterPriseDetails.appIntegration.advanceSearch ? (
                     <div className="general-btns-group-filter">
                        <button
                           className={this.state.searchStatus ? "btn btn-blue-block" : "btn btn-blue-border"}
                           onClick={() => this.setSearchVal(true)}
                           style={{ float: "left" }}
                        >
                           Playback
                        </button>
                        <button
                           onClick={() => this.setSearchVal(false)}
                           className={!this.state.searchStatus ? "btn btn-blue-block" : "btn btn-blue-border"}
                        >
                           EMR
                        </button>
                     </div>
                  ) : (
                     ""
                  )}
                  <div className="table-responsive remove-over drag-drop-table-responsive">
                     <div className={this.state.dragPatientListDiv}>
                        <div className="drag-drop-second-div drag-drop-overlay file-input">
                           <input type="file" onChange={this.handleDragPatientFiles} accept="/*" value="" />
                        </div>
                        <span className="drag-content">Drop Files to instantly upload them to:Activity</span>
                     </div>
                     {this.state.isLoading ? (
                        <div className="patient-list-loading">
                           <LoadingIndicator />
                        </div>
                     ) : (
                        ""
                     )}
                     {this.state.emrLoading && !this.state.searchStatus ? (
                        <div className="patient-list-loading">
                           <LoadingIndicator />
                        </div>
                     ) : (
                        ""
                     )}

                     {/* <Link id="video-open-redirect" target="_blank" >Hello</Link> */}
                     <table id="example" className="table table-striped table-bordered patient-list-dragable">
                        <thead>
                           <tr>
                              <th>Name</th>
                              <th>DOB</th>
                              <th style={{ width: "5%" }}>Age</th>
                              <th>MPIID</th>
                              <th>Hospital</th>
                              <th>Cell</th>
                              <th>Email</th>
                              <th>Date Added</th>
                              {!checkSearch ? <th>Last Login</th> : ""}
                              {!checkSearch ? <th>Action</th> : ""}
                           </tr>
                        </thead>
                        <tbody>
                           {!this.state.emrLoading && !this.state.searchStatus ? (
                              <>
                                 {this.state.totalIteamCount &&
                                 !this.state.searchStatus &&
                                 this.state.northArr.length <= 0 ? (
                                    <tr>
                                       <td colSpan="9" style={{ textAlign: "center" }}>
                                          Search patient above to invite them.
                                       </td>
                                    </tr>
                                 ) : (
                                    ""
                                 )}
                              </>
                           ) : (
                              ""
                           )}

                           {this.state.recordMessage ? (
                              this.state.totalIteamCount ? (
                                 patientList
                              ) : (
                                 ""
                                 // <tr>
                                 //   <td colSpan="9" style={{ textAlign: "center" }}>
                                 //     No record found
                                 //   </td>
                                 // </tr>
                              )
                           ) : (
                              <tr>
                                 <td colSpan="9" style={{ textAlign: "center" }}>
                                    Loading patients please wait.
                                 </td>
                              </tr>
                           )}
                           {this.state.recordMessage && !this.state.isLoading ? (
                              this.state.patientList.length <= 0 && this.state.searchStatus ? (
                                 <td colSpan="9" style={{ textAlign: "center" }}>
                                    No results
                                 </td>
                              ) : (
                                 ""
                                 // <tr>
                                 //   <td colSpan="9" style={{ textAlign: "center" }}>
                                 //     No record found
                                 //   </td>
                                 // </tr>
                              )
                           ) : (
                              ""
                              // <tr>
                              //   <td colSpan="9" style={{ textAlign: "center" }}>
                              //     Loading patients please wait.
                              //   </td>
                              // </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
                  <div>
                     {!this.state.searchStatus ? (
                        <button
                           className="add-patient-manually-button-records"
                           style={{
                              display: !this.state.searchStatus ? "block" : "none",
                              left: "65rem",
                              top: this.state.isLoading
                                 ? "37rem"
                                 : !this.state.isLoading && this.state.northArr?.length === 0
                                 ? "32rem"
                                 : "20rem",
                           }}
                           onClick={() => {
                              swal({
                                 text: "Please use this option to add patient only if you are unable to find patient with EMR search.",
                                 buttons: ["Cancel", "Continue"],
                                 dangerMode: false,
                              }).then((willAdd) => {
                                 if (willAdd) {
                                    this.props.setInvitePatientModal({
                                       displayInviteModal: true,
                                    });
                                 }
                              });
                           }}
                        >
                           Add patient manually?
                        </button>
                     ) : null}
                  </div>

                  {this.state.totalIteamCount ? (
                     <div className="row">
                        {this.state.patientList.length > 0 && this.state.searchStatus ? (
                           <>
                              <div className="col-6">
                                 <div className="table Info">
                                    Showing{" "}
                                    {this.state.activePage === 1
                                       ? 1
                                       : this.state.itemperpage * (this.state.activePage - 1)}{" "}
                                    to {this.state.itemperpage * this.state.activePage} of {this.state.totalIteamCount}{" "}
                                    records
                                 </div>
                              </div>
                              <div className="col-6 d-flex justify-content-end">
                                 <Pagination
                                    activePage={this.state.activePage}
                                    itemsCountPerPage={this.state.itemperpage}
                                    totalItemsCount={this.state.totalIteamCount}
                                    pageRangeDisplayed={this.state.pageRangeDisplayed}
                                    onChange={this.pageChange}
                                    itemClass="page-item"
                                    linkClass="page-link"
                                    lastPageText="⟩⟩"
                                    firstPageText="⟨⟨"
                                 />
                              </div>
                           </>
                        ) : (
                           ""
                        )}
                     </div>
                  ) : (
                     ""
                  )}

                  {/* Edit Patinet Model   */}
                  <div id="myModal" className="modal fade patient-edit-popup" role="dialog">
                     <div className="modal-dialog">
                        <div className="modal-content invite-patient-sec">
                           <div className="invite-patient-block">
                              <div className="invite-patient-header">
                                 <h4 className="title">Update a Patient</h4>
                              </div>
                              <div className="invite-patient-content patient-form">
                                 {/* <div className="floating-form how-to-invite">
                        <label>
                          {i18n && i18n.inviteuser && i18n.inviteuser.mrnlabel}
                        </label>

                        <input
                          className="theme-input"
                          type="number"
                          value={this.state.patientMRN}
                          name="patientMRN"
                          onChange={(e) => this.handleMRNTextChange(e)}
                        />
                      </div> */}

                                 <div className="floating-form how-to-invite">
                                    <label>{i18n && i18n.inviteuser && i18n.inviteuser.namelabel}</label>
                                    <input
                                       className="theme-input"
                                       type="text"
                                       value={this.state.editPatientNameInList}
                                       name="patientName"
                                       onChange={(e) => this.handleNameTextChange(e)}
                                       onBlur={(e) => {
                                          this.setState({
                                             isValidName: nameRegex.test(this.state.editPatientNameInList),
                                          });
                                       }}
                                    />

                                    {this.state.patientName.length > 0 &&
                                    this.state.editPatientNameInList.trim().length === 0 ? (
                                       <label className="error-label">Name required.</label>
                                    ) : this.state.isValidName === false ? (
                                       <label className="error-label">
                                          Please enter both first and last name of at least two characters.
                                       </label>
                                    ) : null}
                                 </div>

                                 <div className="floating-form how-to-invite">
                                    <label>{i18n && i18n.inviteuser && i18n.inviteuser.DOBLabel}</label>
                                    <p>
                                       <DatePicker
                                          onSelect={this.handleDOBDateChange}
                                          value={this.state.editPatientDOBInList}
                                          selected={this.state.editPatientDOBInList}
                                          showMonthDropdown
                                          showYearDropdown
                                          dropdownMode="select"
                                          className="theme-input"
                                          maxDate={new Date()}
                                          onBlur={(e) => {
                                             this.setState({
                                                isValidDOB:
                                                   this.state.patientDOB !== "" &&
                                                   this.state.editPatientDOBInList === null
                                                      ? false
                                                      : true,
                                             });
                                          }}
                                       />
                                    </p>
                                    {this.state.isValidDOB === false ? (
                                       <label className="error-label">DOB required.</label>
                                    ) : null}
                                 </div>

                                 <div className="floating-form how-to-invite">
                                    <label>{i18n && i18n.inviteuser && i18n.inviteuser.mobilenumberlabel}</label>
                                    <div className="input-with-icon">
                                       <Input
                                          classname={"theme-input"}
                                          name="patientPhoneNumber"
                                          value={this.state.editPatientMobileInList}
                                          onblur={(e) => {
                                             this.setState({
                                                isValidMobile:
                                                   this.state.editPatientMobileInList === "" ||
                                                   this.state.editPatientMobileInList === "1" ||
                                                   this.state.editPatientMobileInList.length === 11 ||
                                                   (this.state.editPatientMobileInList.length === 12 &&
                                                      this.state.editPatientMobileInList.indexOf("+") === 0),
                                             });
                                          }}
                                          onChange={(e) => {
                                             this.setState({
                                                editPatientMobileInList: e.target.value.replace(/[^0-9]/g, ""),
                                             });
                                          }}
                                       />
                                       {/*<input
                            className={
                              this.userdetails.role.indexOf("admin") !== -1
                                ? "theme-input"
                                : "theme-input readonly-info"
                            }
                            readOnly={
                              this.userdetails.role.indexOf("admin") !== -1
                                ? false
                                : true
                            }
                            type="text"
                            value={
                              this.formatPhoneNumber(
                                this.state.patientMobile
                              ) || ""
                            }
                            name="patientMobile"
                            onBlur={() => {
                              this.setState({
                                isValidMobile:
                                  this.state.patientMobile.length === 11 ||
                                  this.state.patientMobile === "",
                              });
                            }}
                            autoComplete="off"
                            onChange={(e) => {
                              this.setState({
                                patientMobile: e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                ), //formatPhoneNumber(e.target.value).nformatted,
                              });
                            }}
                          />*/}
                                       {this.state.patientMobile.length > 0 &&
                                       this.state.editPatientMobileInList.trim().length === 0 ? (
                                          <label className="error-label">Mobile required.</label>
                                       ) : this.state.isValidMobile === false ? (
                                          <label className="error-label">Enter a valid mobile number</label>
                                       ) : null}
                                    </div>
                                 </div>
                                 <div className="floating-form how-to-invite">
                                    <label>{i18n && i18n.inviteuser && i18n.inviteuser.emaillabel}</label>
                                    <div className="input-with-icon">
                                       <input
                                          autoComplete="off"
                                          className={"theme-input"}
                                          onBlur={() => {
                                             this.setState({
                                                isValidEmail:
                                                   isValidEmail(this.state.editPatientEmailInList) ||
                                                   this.state.editPatientEmailInList === "",
                                             });
                                          }}
                                          type="text"
                                          value={this.state.editPatientEmailInList}
                                          name="patientEmail"
                                          onChange={(e) => {
                                             this.setState({
                                                // patientEmail: e.target.value,
                                                editPatientEmailInList: e.target.value,
                                             });
                                          }}
                                       />
                                       {this.state.patientEmail.length > 0 &&
                                       this.state.editPatientEmailInList.trim().length === 0 ? (
                                          <label className="error-label">Email required.</label>
                                       ) : this.state.isValidEmail === false ? (
                                          <label className="error-label">Enter a valid email</label>
                                       ) : null}
                                    </div>
                                 </div>
                              </div>
                              <div className="general-btns-group invite-patient-btns">
                                 <button
                                    type="button"
                                    className="btn btn-blue-border"
                                    data-dismiss="modal"
                                    onClick={() => this.resetPatientData()}
                                 >
                                    {i18n && i18n.buttontext && i18n.buttontext.closeText}
                                 </button>
                                 <button
                                    type="button"
                                    className="btn btn-blue-block"
                                    data-dismiss={
                                       this.state.isValidEmail === false ||
                                       this.state.isValidMobile === false ||
                                       this.state.isValidName === false ||
                                       this.state.isValidDOB === false ||
                                       (this.state.patientEmail.length > 0 &&
                                          this.state.editPatientEmailInList.trim().length === 0) ||
                                       (this.state.patientMobile.length > 0 &&
                                          this.state.editPatientMobileInList.trim().length === 0)
                                          ? null
                                          : "modal"
                                    }
                                    disabled={this.state.patientName ? false : true}
                                    onClick={() => {
                                       this.updatePatient(this.state.patientID);
                                    }}
                                 >
                                    {i18n && i18n.buttontext && i18n.buttontext.update}
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Send text model */}

                  <div
                     class="modal create-recent-media custom-modal fade"
                     id="sendTextModel"
                     tabIndex="-1"
                     role="dialog"
                     aria-hidden="true"
                  >
                     <div
                        class="modal-dialog"
                        role="document"
                        style={{ minHeight: "auto", maxWidth: "713px", top: "100px" }}
                     >
                        <div class="modal-content">
                           {this.state.isLoading ? (
                              <div className="create-content-loading">
                                 <LoadingIndicator />
                              </div>
                           ) : (
                              ""
                           )}
                           <div class="modal-header">
                              <h5 class="modal-title" style={{ fontSize: "40px" }}>
                                 {this.state.patientName}
                              </h5>
                              <button
                                 type="button"
                                 class="close"
                                 data-dismiss="modal"
                                 aria-label="Close"
                                 onClick={this.closeSendTextModel}
                              >
                                 <span aria-hidden="true">&times;</span>
                              </button>
                           </div>
                           <div class="modal-body">
                              <div className="search-result" style={{ backgroundColor: "#E5EFFC", margin: "0px" }}>
                                 <ul style={{ height: "auto", padding: "15px" }}>
                                    <li>
                                       {/* <div class="user-icon">{reverseString(
                              this.state.patientName ? this.state.patientName.match(/\b(\w)/g).join("") : this.state.patientEmail ? this.state.patientEmail.match(/\b(\w)/g).join("") : ""
                            )}</div> */}
                                       <div class="user-content">
                                          <div class="user-left">
                                             <div class="user-adderess" style={{ fontSize: "20px" }}>
                                                {this.state.patientMobile}
                                             </div>
                                             <div class="user-adderess" style={{ fontSize: "20px" }}>
                                                {this.state.patientEmail}
                                             </div>
                                          </div>
                                       </div>
                                    </li>
                                 </ul>
                              </div>

                              <div className="invite-user-page template-page" style={{ padding: "0px" }}>
                                 <form action="">
                                    <div className="form-inner">
                                       <div className="floating-form">
                                          <div className="floating-label clear-input text-mention-area">
                                             <MentionsInput
                                                allowSuggestionsAboveCursor={false}
                                                onSelect={this.selectTags}
                                                name="description"
                                                placeholder={i18n && i18n.share && i18n.share.textdesc}
                                                value={description}
                                                singleLine={false}
                                                onChange={this.descriptionValue}
                                                id="bold-textarea"
                                                classNames={classNames}
                                             >
                                                <Mention
                                                   trigger="#"
                                                   data={allTags}
                                                   appendSpaceOnAdd={true}
                                                   // className="mentionClass"
                                                   // style={{ color: 'blue' }}
                                                   className={classNames.mentions__mention}
                                                   onAdd={this.selectedHashTags}
                                                />
                                                <Mention
                                                   trigger="@"
                                                   data={providerTags}
                                                   appendSpaceOnAdd={true}
                                                   onAdd={this.selectedTags}
                                                   className={classNames.mentions__mention}
                                                   style={{
                                                      overflowY: "scroll",
                                                      maxHeight: "200px",
                                                   }}
                                                />
                                                <Mention
                                                   trigger={/(([A-Za-z0-9_.]+$))/}
                                                   data={shortcutTags}
                                                   appendSpaceOnAdd={true}
                                                   onAdd={this.selectedShortcutTags}
                                                   className={classNames.mentions__mention}
                                                   style={{
                                                      overflowY: "scroll",
                                                      maxHeight: "200px",
                                                   }}
                                                   markup="${/(([A-Za-z0-9_.]+$))/}[__display__](user:__id__)"
                                                   displayTransform={(id, label) => {
                                                      return label.substring(0, label.lastIndexOf(" "));
                                                   }}
                                                />
                                             </MentionsInput>
                                          </div>
                                       </div>

                                       <div className="d-flex justify-content-start align-items-center">
                                          <label className="switch-title">
                                             {i18n && i18n.share && i18n.share.doctorlabel}
                                          </label>
                                          <div className="onoffswitch">
                                             <input
                                                type="checkbox"
                                                name="onoffswitch"
                                                className="onoffswitch-checkbox"
                                                checked={isForDoctor}
                                                id="myonoffswitch"
                                                onChange={() =>
                                                   this.setState({
                                                      isForDoctor: !isForDoctor,
                                                   })
                                                }
                                             />
                                             <label className="onoffswitch-label" htmlFor="myonoffswitch">
                                                <span className="onoffswitch-inner"></span>
                                                <span className="onoffswitch-switch new-switch"></span>
                                             </label>
                                          </div>
                                       </div>

                                       <div className="general-btns-group">
                                          <button
                                             onClick={this.addSendTextToPatient}
                                             disabled={isLoading ? true : description ? false : true}
                                             className="btn btn-blue-block"
                                             style={{
                                                maxWidth: "100%",
                                                height: "45px",
                                                width: "100%",
                                                fontSize: "2.3rem",
                                             }}
                                          >
                                             Send
                                          </button>
                                       </div>
                                    </div>
                                 </form>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Direct Share */}

                  <button
                     id="open-direct-share-to-patient"
                     data-toggle="modal"
                     data-target="#direct-share-to-patient"
                     style={{ display: "none" }}
                  >
                     open model
                  </button>

                  <div
                     class="modal create-recent-media custom-modal fade"
                     id="direct-share-to-patient"
                     tabIndex="-1"
                     role="dialog"
                     aria-hidden="true"
                  >
                     <div
                        class="modal-dialog"
                        role="document"
                        style={{ minHeight: "auto", maxWidth: "713px", top: "100px" }}
                     >
                        <div class="modal-content">
                           {this.state.isLoading ? (
                              <div className="create-content-loading">
                                 <LoadingIndicator />
                              </div>
                           ) : (
                              ""
                           )}
                           <div class="modal-header">
                              <h5 class="modal-title" style={{ fontSize: "40px" }}>
                                 {this.state.patientName}
                              </h5>
                              <button
                                 id="close-direct-share"
                                 type="button"
                                 class="close"
                                 data-dismiss="modal"
                                 aria-label="Close"
                                 onClick={this.closeDirectShare}
                              >
                                 <span aria-hidden="true">&times;</span>
                              </button>
                           </div>
                           <div class="modal-body">
                              <div
                                 className="search-result"
                                 style={{
                                    backgroundColor: "#E5EFFC",
                                    marginBottom: "10px",
                                 }}
                              >
                                 <ul style={{ height: "auto", padding: "15px" }}>
                                    <li>
                                       {/* <div class="user-icon">{reverseString(
                              this.state.patientName ? this.state.patientName.match(/\b(\w)/g).join("") : this.state.patientEmail ? this.state.patientEmail.match(/\b(\w)/g).join("") : ""
                            )}</div> */}
                                       <div class="user-content">
                                          <div class="user-left">
                                             <div class="user-adderess" style={{ fontSize: "20px" }}>
                                                {this.state.patientMobile}
                                             </div>
                                             <div class="user-adderess" style={{ fontSize: "20px" }}>
                                                {this.state.patientEmail}
                                             </div>
                                          </div>
                                       </div>
                                    </li>
                                 </ul>
                              </div>

                              <div className="invite-user-page template-page" style={{ padding: "0px" }}>
                                 <form action="">
                                    <div className="file-input">
                                       <input
                                          type="file"
                                          onChange={this.handleChangeFiles}
                                          accept="/*"
                                          value={this.state.inputValue}
                                       />

                                       {image && image.file && image.file.name ? (
                                          // style={{ backgroundImage: }}

                                          bgStyle ? (
                                             <div className="imagewrap">
                                                {image.file.type && attachmentTypes.includes(image.file.type) ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="attechment"
                                                         id="target"
                                                         src="/assets/images/icon-attechment.svg"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : image.file.type && iconVideotypes.includes(image.file.type) ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="mp4"
                                                         id="target"
                                                         src="/assets/images/icon-mp4.svg"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : image.file.type ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="images"
                                                         id="target"
                                                         src="/assets/images/icon-images.svg"
                                                         //data-toggle="modal"
                                                         //data-target="#myfile"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                   <img
                                                      alt="attechment"
                                                      id="target"
                                                      src="/assets/images/icon-attechment.svg"
                                                      onClick={() => this.showPreview(image)}
                                                   />
                                                ) : (
                                                   ""
                                                )}
                                             </div>
                                          ) : (
                                             <div
                                                className={
                                                   this.state.mediatype === "record" ? "imagewrap-record" : "imagewrap"
                                                }
                                             >
                                                {image.file.type && attachmentTypes.includes(image.file.type) ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="attechment"
                                                         id="target"
                                                         src="/assets/images/icon-attechment.svg"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : image.file.type && iconVideotypes.includes(image.file.type) ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="mp4"
                                                         id="target"
                                                         src="/assets/images/icon-mp4.svg"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : image.file.type ? (
                                                   previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                      <img
                                                         alt="images"
                                                         id="target"
                                                         src="/assets/images/icon-images.svg"
                                                         data-toggle="modal"
                                                         data-target="#myfile"
                                                      />
                                                   ) : (
                                                      ""
                                                   )
                                                ) : previewfileformat.includes(image.file.name.split(".").pop()) ? (
                                                   this.state.mediatype === "record" ? (
                                                      <video
                                                         className="recorded-video"
                                                         controls
                                                         src={image.attachmentUrl}
                                                      ></video>
                                                   ) : (
                                                      <img
                                                         alt="attechment"
                                                         id="target"
                                                         src="/assets/images/icon-attechment.svg"
                                                         onClick={() => this.showPreview(image)}
                                                      />
                                                   )
                                                ) : (
                                                   ""
                                                )}
                                             </div>
                                          )
                                       ) : (
                                          <div className="dropzone-placeholder screen-record">
                                             <span>
                                                <img src="/assets/images/cloud.svg" alt="Cloud Upload" className="" />
                                                <span>{i18n && i18n.share && i18n.share.fileplaceholder}</span>
                                             </span>
                                          </div>
                                       )}
                                    </div>

                                    {this.state.isUploading && (
                                       <>
                                          <Line
                                             percent={percentageUploaded}
                                             strokeWidth="1"
                                             strokeColor="#009ADF"
                                             trailColor="#D9D9D9"
                                             gapDegree={0}
                                             gapPosition="right"
                                          />{" "}
                                          <p>{`${percentageUploaded}% completed`}</p>
                                       </>
                                    )}

                                    {isLoading && (
                                       <p
                                          style={{
                                             fontSize: 20,
                                             textAlign: "center",
                                          }}
                                          id="redirectmsg"
                                       >
                                          {" "}
                                       </p>
                                    )}

                                    <div className="form-inner">
                                       <div className="floating-form">
                                          <div className="floating-label clear-input">
                                             <label>Title</label>

                                             <MentionsInput
                                                name="title"
                                                onSelect={this.selectTags}
                                                value={title}
                                                onChange={this.handleTextChange}
                                                classNames={classNames}
                                                style={{ border: "1px solid #ccc;" }}
                                             >
                                                <Mention
                                                   trigger="#"
                                                   data={allTags}
                                                   appendSpaceOnAdd={true}
                                                   className={classNames.mentions__mention}
                                                   // style={{ overflowY: 'scroll', maxHeight: '200px' }}
                                                   onAdd={this.selectedHashTags}
                                                />
                                                <Mention
                                                   trigger="@"
                                                   data={providerTags}
                                                   appendSpaceOnAdd={true}
                                                   onAdd={this.selectedTags}
                                                   className={classNames.mentions__mention}
                                                   // style={{ overflowY: 'scroll', maxHeight: '200px' }}
                                                />
                                                <Mention
                                                   trigger={/(([A-Za-z0-9_.]+$))/}
                                                   data={shortcutTags}
                                                   appendSpaceOnAdd={true}
                                                   onAdd={this.selectedShortcutTags}
                                                   className={classNames.mentions__mention}
                                                   style={{
                                                      overflowY: "scroll",
                                                      maxHeight: "200px",
                                                   }}
                                                   markup="${/(([A-Za-z0-9_.]+$))/}[__display__](user:__id__)"
                                                   displayTransform={(id, label) => {
                                                      return label.substring(0, label.lastIndexOf(" "));
                                                   }}
                                                />
                                             </MentionsInput>
                                          </div>
                                       </div>

                                       <div className="d-flex justify-content-start align-items-center">
                                          <label className="switch-title">
                                             {i18n && i18n.share && i18n.share.doctorlabel}
                                          </label>
                                          <div className="onoffswitch">
                                             <input
                                                type="checkbox"
                                                name="onoffswitch"
                                                className="onoffswitch-checkbox"
                                                checked={isForDoctor}
                                                id="myonoffswitch"
                                                onChange={() =>
                                                   this.setState({
                                                      isForDoctor: !isForDoctor,
                                                   })
                                                }
                                             />
                                             <label className="onoffswitch-label" htmlFor="myonoffswitch">
                                                <span className="onoffswitch-inner"></span>
                                                <span className="onoffswitch-switch new-switch"></span>
                                             </label>
                                          </div>
                                       </div>

                                       <div className="general-btns-group">
                                          <button
                                             onClick={this.addDirectShareToPatient}
                                             disabled={isLoading ? true : title ? false : true}
                                             className="btn btn-blue-block"
                                             style={{
                                                maxWidth: "100%",
                                                height: "45px",
                                                width: "100%",
                                                fontSize: "2.3rem",
                                             }}
                                          >
                                             Send
                                          </button>
                                       </div>
                                    </div>
                                 </form>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <React.Fragment>
                     <div class="modal fade" id="myModal-1" role="dialog">
                        <div class="modal-dialog modal-blocker">
                           <div class="modal-content">
                              <div class="modal-header">
                                 {/* <h4 class="modal-title"></h4> */}
                                 <p>Please disable your pop-up blocker</p>
                                 <button type="button" class="close" data-dismiss="modal">
                                    &times;
                                 </button>
                              </div>
                              <div class="modal-body">
                                 <div className="general-btns-group invite-patient-btns">
                                    <img src={this.state.blockerImagePath} alt=""></img>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </React.Fragment>
                  <button
                     type="button"
                     style={{ display: "none" }}
                     id="modal-btn-open"
                     class="btn btn-info btn-lg"
                     data-toggle="modal"
                     data-target="#myModal-1"
                  >
                     Open Modal
                  </button>
               </div>
            )}
            <button
               type="button"
               className="btn btn-info btn-lg"
               data-toggle="modal"
               data-target="#myModal-invite-north"
               id="modal-open"
               style={{ display: "none" }}
            >
               Open Modal
            </button>

            <div id="myModal-invite-north" className="modal fade document-modal invite-northwell" role="dialog">
               <div className="modal-dialog">
                  <div className="modal-content">
                     <div className="modal-header">
                        <div className="logo-name">
                           <h2>
                              {nortDataObj.firstName ? nortDataObj.firstName.charAt(0).toUpperCase() : ""}
                              {nortDataObj.lastName ? nortDataObj.lastName.charAt(0).toUpperCase() : ""}
                           </h2>
                        </div>
                        <h4 className="modal-title">
                           {nortDataObj.firstName} {nortDataObj.lastName} (
                           {nortDataObj.dob ? this.getAge(nortDataObj.dob) : ""})
                        </h4>
                        <span>
                           {northAddress.streetAddress ? "#" + northAddress.streetAddress.replace(" ", ", ") : ""}
                           {northAddress.city ? "," + " " + northAddress.city : ""}
                        </span>
                        <span>{nortDataObj.dob ? moment(nortDataObj.dob).format("MM/DD/YYYY") : ""}</span>
                        <span>MRN: {nortDataObj.facility === "AIPB" ? "" : nortDataObj.mrn}</span>
                        <button type="button" className="close" data-dismiss="modal">
                           &times;
                        </button>
                     </div>
                     <div className="modal-body">
                        <p>Please confirm mobile number and/or email to send invite.</p>
                        <form className="">
                           <div className="form-group">
                              <label for="exampleInputEmail1">Mobile</label>

                              <NumberFormat
                                 value={this.state.northMobile}
                                 format="(###) ###-####"
                                 mask="_"
                                 className="form-control"
                                 onValueChange={(e) => {
                                    this.setState({
                                       northMobile: e.value,
                                    });
                                    window.addEventListener(
                                       "keydown",
                                       function (event) {
                                          if (
                                             event.keyIdentifier === "U+000A" ||
                                             event.keyIdentifier === "Enter" ||
                                             event.keyCode === 13
                                          ) {
                                             if (event.target.nodeName === "INPUT" && event.target.type === "text") {
                                                event.preventDefault();
                                                return false;
                                             }
                                          }
                                       },
                                       true
                                    );
                                 }}
                              />
                           </div>
                        </form>
                        <form className="">
                           <div className="form-group">
                              <label for="exampleInputEmail1">Email</label>
                              <input
                                 type="email"
                                 className="form-control"
                                 id="north-email"
                                 aria-describedby="emailHelp"
                                 autoComplete="off"
                                 value={this.state.northEmail}
                                 onChange={(e) => {
                                    this.setState({
                                       northEmail: e.target.value,
                                    });
                                 }}
                              />
                           </div>
                        </form>
                     </div>
                     {this.state.sendLoader ? <LoaderIndicate /> : ""}
                     <div className="modal-footer">
                        <button
                           type="button"
                           className="btn btn-blue-block"
                           onClick={() => this.sendInvite(nortDataObj)}
                           disabled={validateField || this.state.sendLoader}
                        >
                           Send Invite & Continue
                        </button>
                     </div>
                     <button
                        type="button"
                        className="btn btn-blue-border"
                        data-dismiss="modal"
                        id="close-north-invite-modal"
                        style={{ display: "none" }}
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
            <img
               src="/assets/images/help-logo.svg"
               id="patient-profile-help"
               alt=""
               onClick={() => {
                  Analytics.record(this.getPatientData(), this.userdetails.id, Analytics.EventType.faqViewed);
                  this.setState({ showHelp: true });
               }}
            />
            {this.state.showHelp ? (
               <HelpView
                  closeTapped={(e) => {
                     if (e.target.className === "HelpView" || e.target.id === "close-help-view") {
                        this.setState({ showHelp: false });
                     }
                  }}
               />
            ) : null}
            {this.props.displayInviteModal ? (
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
            {this.state.isReferralPatientView ? (
               <ReferralPatientView
                  closeReferralPatientModal={this.closeReferralPatientModal}
                  patientId={this.props.match.params.patientid}
                  pageNumber={this.state.recentListPagination.pagenumber}
                  listRecord={this.state.recentListPagination.itemperpage}
                  userDetails={this.userdetails}
               />
            ) : null}
            {this.state.showReferralDetails || this.props.referralDetailsObject?.displayFlag ? (
               <ReferralDetailsView
                  closeReferralDetail={this.closeReferralDetailsStatus}
                  showContentDescriptionObject={this.state.showContentDescriptionObject}
                  referralPatientDetails={this.state.referralPatientDetails}
                  userDetails={this.userdetails}
                  patientName={this.state.patientName}
               />
            ) : null}
            {this.state.isContentShareView ? (
               <ContentShareView
                  closeContentShareView={this.closeContentShareView}
                  contentObject={this.state.contentShareObject}
                  patientDetailsObject={this.state.patientDetailsObject}
               />
            ) : null}
         </>
      );
   }
}

const mapStateToProps = (state) => {
   return {
      data: state.auth,
      recentSearchPLBArr: state.auth.recentSearchPLB,
      recentSearrchNorthArr: state.auth.recentSearchNorth,
      userCredentials: state.auth.userCredentials,
      isAudioRecording: state.dashboardStates.isAudioRecording,
      isVideoRecording: state.dashboardStates.isVideoRecording,
      notificationObject: state.dashboardStates.notificationObject,
      invitePatientData: state.dashboardStates.invitePatientData,
      displayInviteModal: state.dashboardStates.displayInviteModal,
      referralDetailsObject: state.dashboardStates.referralDetailsObject,
      notificationCount: state.dashboardStates.notificationCount,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         recentsearchdataPLB: actions.recentsearchdataPLB,
         recentsearchdataNorth: actions.recentsearchdataNorth,
         setNotificationObject: dasboardActions.setNotificationObject,
         setInvitePatient: dasboardActions.setInvitePatient,
         setAudioRecordingStatus: dasboardActions.setAudioRecordingStatus,
         setVideoRecordingStatus: dasboardActions.setVideoRecordingStatus,
         setInvitePatientModal: dasboardActions.setInvitePatientModal,
         setReferralDetailsObject: dasboardActions.setReferralDetailsObject,
         setNotificationCount: dasboardActions.setNotificationCount,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
