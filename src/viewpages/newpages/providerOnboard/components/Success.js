import React, { Fragment, useEffect, useRef, useState } from "react";
import success from "../../../../assets/success.gif";
import Frame from "../../../../assets/Frame.png";
import * as i18n from "../../../../I18n/en.json";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import QrcodeModal from "./QrcodeModal";
import { withRouter } from "react-router-dom";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import * as actions from "../../../../redux/actions/auth.action";
import { bindActionCreators } from "redux";
import { showSwal } from "../../../../common/alert";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

const Success = (props) => {
   const {
      qrcode,
      providerQrCode,
      setIsLoading,
      isLoading,
      savedEmail,
      savedFirstName,
      savedLastName,
      savedPhoneNumber,
      qrCodeScreenText,
      videoUrl,
      videosData,
      localStorageData,
      northwellLogin,
   } = props;
   const [gif, setGif] = useState(success);
   const [isShown, setIsShown] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [videoData, setVideoData] = useState([]);
   const [provActivated, setProvActivated] = useState(false);

   useEffect(() => {
      if (videosData === undefined || videosData === null) {
         return setVideoData([]);
      } else {
         setVideoData(JSON.parse(videosData));
      }
   }, []);

   useEffect(() => {
      setTimeout(() => {
         setGif(Frame);
         setIsShown(true);
      }, 1000);
   }, [gif]);

   const welcome = i18n?.onboarding?.welcome;
   const welcomeText = i18n?.onboarding?.welcomeText;
   const showQrCodeText = i18n?.onboarding?.qrCode;
   const qrCodeText = i18n?.onboarding?.qrCodeText;
   const qrCodeText1 = i18n?.onboarding?.qrCodeText1;
   const qrCodeText2 = i18n?.onboarding?.qrCodeText2;
   const verificationText = i18n?.onboarding?.verificationText;
   const verificationTextNorthwell = i18n?.onboarding?.verificationTextNorthwell;
   const helpText = i18n?.onboarding?.helpText;
   const standingBy = i18n?.onboarding?.standingBy;
   const continueText = i18n?.onboarding?.continueText;
   const congratulations = i18n?.onboarding?.congratulations;

   const getProviderKey = localStorage.getItem("providerKey");

   let timerInterval = null;

   const getProviderLogin = localStorage.getItem("providerLogin");
   localStorage.removeItem("provEmail");

   const providerActivated = () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.isProviderActivated,
         key: getProviderKey,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.data?.isActivated === true) {
            localStorage.removeItem("providerEmail");
            localStorage.removeItem("providerFirstName");
            localStorage.removeItem("providerLastName");
            localStorage.removeItem("providerPhoneNumber");
            localStorage.removeItem("providerQrCode");
            localStorage.removeItem("savedVideoData");

            localStorage.setItem("stopRefetch", "yes");

            if (getProviderLogin === "true") {
               firebase
                  .auth()
                  .signInWithCustomToken(resultStatus?.data?.customToken)
                  .then((storeDataRedux) => {
                     localStorage.setItem("login", "yes");
                     localStorage.setItem("redirected", "yes");
                     let userData = {};
                     userData.id = storeDataRedux.user.uid;
                     props.savenorthwelluserobj(JSON.parse(JSON.stringify(storeDataRedux)));
                     props.saveusercredentials(userData);
                  })
                  .catch((error) => {
                     console.log(error);
                  });
            }
         } else {
            // console.log(resultStatus?.settings?.message);
         }
      });
   };

   useEffect(() => {
      refetchSocket();
   }, []);

   const refetchSocket = () => {
      timerInterval = setInterval(() => {
         providerActivated();
         const key = localStorage.getItem("stopRefetch") === "yes" || false;
         if (key) {
            setProvActivated(true);
            clearInterval(timerInterval);
            localStorage.removeItem("stopRefetch");
         }
      }, 10000);
   };
   const moveToHomePage = () => {
      localStorage.removeItem("providerKey");
      localStorage.removeItem("providerLogin");
      props.history.push("/");
   };

   return (
      <div className="success-gif">
         {
            provActivated ? (
               <div className="fadeout-frame">
                  <img src={gif} alt="success" />
               </div>
            ) : (
               isShown && (
                  <div className="small-frame">
                     <img src={gif} alt="success" />
                  </div>
               )
            )
            //  : (
            //    <div className="fadeout-frame">
            //       <img src={gif} alt="success" />
            //    </div>
            // )
         }

         {provActivated ? (
            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", width: "400px" }}>
               <h1 className="congratulations-text">{congratulations}</h1>
               {getProviderLogin === "true" ? (
                  <>
                     <span className="verification-text">{verificationText} </span>
                     <div className="d-flex">
                        <a href="mailto:help@playbackhealth.com?subject=Support" className="help-text">
                           {helpText}{" "}
                        </a>{" "}
                        <span className="standby-text"> {standingBy}</span>
                     </div>
                     <button
                        className="btn btn-blue-block got-it-btn"
                        style={{ background: "#FF567A", border: "none" }}
                        onClick={() => moveToHomePage()}
                     >
                        {continueText}
                     </button>
                  </>
               ) : (
                  <>
                     <span className="verification-text">{verificationTextNorthwell} </span>
                     <div className="d-flex">
                        <a href="mailto:help@playbackhealth.com?subject=Support" className="help-text">
                           {helpText}{" "}
                        </a>{" "}
                        <span className="standby-text"> {standingBy}</span>
                     </div>
                     <button
                        className="btn btn-blue-block got-it-btn"
                        style={{ background: "#FF567A", border: "none" }}
                        onClick={() => {
                           northwellLogin();
                        }}
                     >
                        Login
                     </button>
                  </>
               )}
            </div>
         ) : isShown ? (
            <>
               <div className="welcome-text">
                  <h1>{welcome}</h1>
                  <p>{welcomeText}</p>
                  <p className="qrcode-text">{qrCodeText}</p>

                  <button
                     id={pendoIds.btnshowProviderQrCode}
                     className="qr-code"
                     onClick={() => {
                        providerQrCode();
                        setShowModal(true);
                     }}
                  >
                     {showQrCodeText}
                  </button>

                  {showModal ? (
                     <ModalPopup id="provider-qrcode-modal" onModalTapped={() => setShowModal(false)}>
                        <QrcodeModal
                           onClose={() => setShowModal(false)}
                           qrCodeText1={qrCodeText1}
                           qrCodeText2={qrCodeText2}
                           qrcode={qrcode}
                           isLoading={isLoading}
                           setIsLoading={setIsLoading}
                           savedEmail={savedEmail}
                           savedFirstName={savedFirstName}
                           savedLastName={savedLastName}
                           savedPhoneNumber={savedPhoneNumber}
                           qrCodeScreenText={qrCodeScreenText}
                        />
                     </ModalPopup>
                  ) : null}

                  {/* <div className="video-tag"> */}
                  <div className="row" style={{ width: "1132px" }}>
                     {localStorageData
                        ? videoData?.map((item, id) => (
                             <div className="col-sm-12 col-md-6 mb-5 d-flex flex-column align-items-start" key={id}>
                                <video
                                   src={item.location}
                                   poster={item.thumbnail}
                                   width="535"
                                   height="300"
                                   controls="controls"
                                />
                                <h3 className="playback-health mt-3" style={{ lineHeight: "25px" }}>
                                   {item.title}
                                </h3>
                             </div>
                          ))
                        : videoUrl
                        ? videoUrl?.map((item, id) => (
                             <div className="col-sm-12 col-md-6 mb-5">
                                <Fragment key={id}>
                                   <video src={item[1]} poster={item[0]} width="535" height="300" controls="controls" />
                                   <h3 className="playback-health mt-3" style={{ lineHeight: "25px" }}>
                                      {item[2]}
                                   </h3>
                                </Fragment>
                             </div>
                          ))
                        : null}
                  </div>
               </div>
            </>
         ) : null}
      </div>
   );
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
      },
      dispatch
   );
};

export default withRouter(connect(null, mapDispatchToProps)(Success));
