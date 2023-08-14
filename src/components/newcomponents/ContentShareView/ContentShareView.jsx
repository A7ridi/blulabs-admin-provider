import React, { Component } from "react";
import Apimanager from "../../../Apimanager";
import ReactAudioPlayer from "react-audio-player";
import "./ContentShareView.css";
import moment from "moment";
import { socketActions, socketSubActions } from "../../../helper/Websocket";
import { connect } from "react-redux";
import * as Analytics from "../../../helper/AWSPinPoint";
import TitleTextView from "../../../components/newcomponents/TitleTextView";
import { blueBtnCls, isValidEmail, isValidMob, nameRegex } from "../../../helper/CommonFuncs";
import AlertView from "../AlertView";
import swal from "@sweetalert/with-react";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../components/newcomponents/ToastView";
import InputMask from "react-input-mask";
import texts from "../../../helper/texts";
import { fetchSignedUrlContentShare } from "../../../viewpages/newpages/profileModule/actions/profileQueries";
class ContentShareView extends Component {
   constructor(props) {
      super(props);
      this.state = {
         name: "",
         emailMobile: "",
         comment: "",
         contentUrl: "",
         errorName: "",
         errorEmailMobile: "",
         loading: false,
         isNumber: false,
      };
   }

   setUrlValue = (contentUrl) => {
      this.setState({
         contentUrl,
      });
   };

   componentDidMount() {
      let obj = {
         content: {
            id: this.props.contentObject?.id,
            description: "",
         },
         thumbnail: true,
      };
      fetchSignedUrlContentShare(obj, this.setUrlValue);
   }

   handleInputChange = (e) => {
      let valArr = e.target.value.split(" ");
      let isMobNum = valArr[0] === "+1" || parseInt(valArr[0]);
      let phone = e.target.value.mobileInputMaskValue();
      // if (valArr[1] === "(___)") {
      //   let mobField = document.getElementsByClassName("details-input")[0];
      //   mobField.value = "";
      // }
      this.setState({
         errorEmailMobile: "",
         emailMobile: phone,
         isNumber: isMobNum,
      });
   };

   validateContentForm = () => {
      let errorName, errorEmailMobile, validateField;

      validateField = true;

      if (!nameRegex.test(this.state.name)) {
         errorName = texts.invalidName;
         validateField = false;
      }

      if (!isValidMob(this.state.emailMobile) && !isValidEmail(this.state.emailMobile)) {
         errorEmailMobile = texts.invalidEmailMob;
         validateField = false;
      }

      this.setState({
         errorName: errorName,
         errorEmailMobile: errorEmailMobile,
      });
      return validateField;
   };

   shareContent = () => {
      let { patientEmail, patientID, patientMobile, patientName } = this.props.patientDetailsObject;
      let { id, addedBy, addedByName } = this.props.contentObject;
      let authtoken = "";
      let storedObject = this.props.data.northwelluser;
      authtoken = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
      let contentShareStr = "";
      let contentShareAnalyticsDetails = {
         patientEmail: patientEmail,
         contentId: id,
         patientId: patientID,
         sendContentToName: this.state.name,
         patientName: patientName,
         patientNumber: patientMobile,
         UserID: storedObject.user.uid,
         addedBy: addedBy,
         addedByName: addedByName,
         sendContentToEmail: this.state.emailMobile.includes("@") ? this.state.emailMobile : "",
         sendContentToMobile: this.state.emailMobile.includes("@")
            ? ""
            : "+" + this.state.emailMobile.replace(/\D/g, "").substring(0, 11),
      };
      let $this = this;
      if (this.validateContentForm()) {
         this.setState({ loading: true });
         swal(
            <AlertView
               showClose={false}
               contentText="You are about to share patient data outside Playback Health. Please confirm patient consent."
               onAction={(btn) => {
                  swal.close();
                  if (btn.id === "alert-confirm-button") {
                     const { emailMobile } = this.state;
                     const isEmail = emailMobile.includes("@");
                     var numberToSend = emailMobile;
                     if (!isEmail && !emailMobile.includes("+1")) {
                        numberToSend = "+1" + emailMobile;
                     }

                     contentShareStr = {
                        action: socketActions.referral,
                        subAction: socketSubActions.shareContent,
                        Authorization: authtoken,
                        contentId: this.props.contentObject?.id,
                        email: isEmail ? this.state.emailMobile : "",
                        mobileNo: isEmail ? "" : numberToSend,
                        name: this.state.name,
                        loggedInUserId: storedObject.user.uid,
                        comment: this.state.comment,
                     };
                     window.socket.send(contentShareStr, (result) => {
                        if (result.settings?.status === 1) {
                           this.setState({ loading: false });
                           toast(
                              <ToastView text={`Content shared successfully with ${this.state.name}`} />,
                              defaultToastProps
                           );
                           Analytics.record(
                              contentShareAnalyticsDetails,
                              storedObject.user.uid,
                              Analytics.EventType.sendFileExternal
                           );
                           this.props.closeContentShareView && this.props.closeContentShareView();
                        } else {
                           this.setState({ loading: false });
                           toast(<ToastView text="Something went wrong." type="error" />, defaultToastProps);
                        }
                     });
                  } else {
                     this.setState({ loading: false });
                  }
               }}
            />,
            { buttons: false }
         );
      }
   };

   contentType = (contentObject) => {
      // To check content type before render.
      if (contentObject.type?.includes("image")) {
         return (
            <img
               alt="."
               src={
                  this.state.contentUrl
                     ? this.state.contentUrl
                     : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
               }
               onLoad={(e) => {
                  e.target.style.padding = 0;
                  e.target.style.backgroundImage = this.state.contentUrl
                     ? null
                     : "url(/assets/gif/newgifs/spinner.gif)";
               }}
               // onerror={(e) => {
               //   e.target.style.display = "none";
               // }}
               width="100%"
               height="100%"
               style={{
                  objectFit: "contain",
                  backgroundImage: "url(/assets/gif/newgifs/spinner.gif)",
                  padding: "40%",
                  paddingTop: "50%",
                  paddingLeft: "57%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "32px 32px",
               }}
            />
         );
      } else if (contentObject.type?.includes("pdf")) {
         return (
            <iframe
               title={contentObject.title}
               src={this.state.contentUrl}
               className="loading"
               width="100%"
               style={{ height: "100%" }}
            ></iframe>
         );
      } else if (contentObject.type?.includes("video")) {
         return (
            <video
               style={{ width: "100%", height: "100%", backgroundColor: "black" }}
               controls
               src={this.state.contentUrl}
               controlsList="nodownload"
               disablePictureInPicture
            ></video>
         );
      } else if (contentObject.type?.includes("audio")) {
         return <ReactAudioPlayer muted="true" src={this.state.contentUrl} controls controlsList="nodownload" />;
      } else {
         return <div style={{ fontSize: "15px" }}>{contentObject.title}</div>;
      }
   };
   render() {
      let { contentObject } = this.props;
      return (
         <div className="bg-white round-border-l w-xlarge flex-center flex-column py-4 px-5">
            <div className="d-flex mb-4 w-100 justify-content-end">
               <div className="font-weight-bold text-large w-100 text-center">Send</div>
               <button className="position-absolute text-xlarge text-center" onClick={this.props.closeContentShareView}>
                  &times;
               </button>
            </div>
            <div className="w-100 round-border-m overflow-hidden bg-light-grey-50 h-1xl-medium">
               <div className="w-100 flex-center ratio-eq" style={{ height: "220px" }}>
                  {this.contentType(contentObject)}
               </div>
               <div className="w-100  px-3">
                  <div className="content-share-view-description-heading text-truncate">{contentObject.title}</div>
                  <div className="content-share-view-description-details">
                     Created By: {contentObject.provider?.name?.fullName} at{" "}
                     {moment(contentObject?.createdAt).format("hh:mm A")}
                  </div>
               </div>
            </div>
            <div className="w-100 my-4">
               <TitleTextView
                  style={{ border: "1px solid #bdbdbd" }}
                  title="none"
                  inputclass="name-input"
                  placeholder="Full Name"
                  onChange={(e) => {
                     this.setState({
                        errorName: "",
                        name: e.target.value,
                     });
                  }}
               />
               <span className="text-small text-start w-100 text-danger">{this.state.errorName}</span>
            </div>
            <div className="w-100 mb-4">
               <TitleTextView
                  inputclass="details-input"
                  title="none"
                  renderInput={() => (
                     <InputMask
                        className="default-text-input details-input h-small text-small p-3"
                        mask={this.state.isNumber ? "+1 (999) 999-9999" : ""}
                        placeholder="Email / Mobile Number"
                        onChange={this.handleInputChange}
                     />
                  )}
               />
               <span className="text-small text-start w-100 text-danger">{this.state.errorEmailMobile}</span>
            </div>
            <div className="w-100 mb-4">
               <TitleTextView
                  inputclass="comments-input"
                  title="none"
                  renderInput={() => (
                     <textarea
                        style={{ overflow: "auto", resize: "none" }}
                        className="default-text-input p-3"
                        placeholder="Comment"
                        rows={3}
                        value={this.state.comment}
                        onChange={(e) => {
                           this.setState({
                              comment: e.target.value,
                           });
                        }}
                     />
                  )}
               />
            </div>

            <button
               id={this.props.buttonId}
               className={`btn-default my-4 w-85 ${blueBtnCls}`}
               onClick={this.shareContent}
            >
               Send
            </button>
         </div>
      );
   }
}

const mapStateToProps = (state) => {
   return {
      data: state.auth,
   };
};

export default connect(mapStateToProps, "")(ContentShareView);
