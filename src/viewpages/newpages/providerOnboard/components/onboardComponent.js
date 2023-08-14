import React, { useEffect, useState } from "react";
import * as i18n from "../../../../I18n/en.json";
import "../container/onboard.css";
import Healthcare from "./Healthcare";
import Success from "./Success";
import FreshChatComp from "../../../../freshChat";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import { error, ShowAlert } from "../../../../common/alert";
import defaultLogo from "../../../../images/Logo.svg";

const OnBoardComponent = (props) => {
   const { email } = props;
   const [step, setStep] = useState(1);
   const [keyProvider, setKeyProvider] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [qrCode, setQrCode] = useState("");
   const [savedEmail, setSavedEmail] = useState("");
   const [savedFirstName, setSavedFirstName] = useState("");
   const [savedLastName, setSavedLastName] = useState("");
   const [savedPhoneNumber, setSavedPhoneNumber] = useState("");
   const [videoUrl, setVideoUrl] = useState([]);
   const [localStorageData, setLocalStorageData] = useState(false);
   const [providerLoginSystem, setProviderLoghinSystem] = useState("");
   const [isNorthwellProvider, setIsNorthwellProvider] = useState(false);
   const [emailProvider, setEmailProvider] = useState("");
   const [providerEntpId, setProviderEntpId] = useState("");
   const [providerOnboardData, setProviderOnboardData] = useState(null);
   const [isActivated, setIsActivated] = useState(false);

   useEffect(() => {
      if (window.fcWidget && step == 7) {
         window.fcWidget.destroy();
         window.fcWidget.user.clear();
      }
   }, [step]);

   if (providerLoginSystem === "playback") {
      localStorage.setItem("providerLogin", "true");
   }

   const nextStep = () => {
      if (step < 7) {
         setStep(step + 1);
      } else if (step === 7) {
         console.log("no step further");
      }
   };

   const prevStep = () => {
      if (step > 1 && step < 7) {
         setStep(step - 1);
      } else if (step === 7) {
         console.log("no step further");
      }
   };

   const getEmail = localStorage.getItem("providerEmail");
   const getFirstName = localStorage.getItem("providerFirstName");
   const getLastName = localStorage.getItem("providerLastName");
   const getPhoneNumber = localStorage.getItem("providerPhoneNumber");
   const getProviderKey = localStorage.getItem("providerKey");
   const getVideoData = localStorage.getItem("savedVideoData");
   const getQrCode = localStorage.getItem("providerQrCode");

   const providerQrCode = () => {
      setIsLoading(true);
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getProviderQrCode,
         key: getProviderKey,
      };

      window.socket.send(onboardingParams, (resultStatus) => {
         try {
            if (resultStatus?.settings?.status === 1) {
               setQrCode(resultStatus?.data?.qrcode);
               localStorage.setItem("providerQrCode", resultStatus?.data?.qrcode);
               setIsLoading(false);
            } else {
               ShowAlert(resultStatus?.message, error);
               setIsLoading(false);
            }
         } catch (error) {
            console.log(error);
         }
      });
   };

   const healthcareTitle = i18n?.onboarding?.healthcare;
   const healthcareContent = i18n?.onboarding?.healthcareContent;
   const numberAuth = i18n?.onboarding?.numberAuth;
   const emailVerify = i18n?.onboarding?.emailVerify;
   const healthcareCode = i18n?.onboarding?.code;
   const healthcarePassword = i18n?.onboarding?.password;
   const passwordContent = i18n?.onboarding?.passwordContent;
   const verifyNumber = i18n?.onboarding?.verifyNumber;
   const healthcareNumber = i18n?.onboarding?.number;
   const healthcareOtpSend = i18n?.onboarding?.otpSend;
   const healthcareAlmostThere = i18n?.onboarding?.almostThere;
   const healthcarePatientInfo = i18n?.onboarding?.patientInfo;
   const qrCodeScreenText = i18n?.onboarding?.qrCodeScreenText;
   const healthcareOtpSend2 = i18n?.onboarding?.otpSend2;

   let verfiedLocalStorage = getEmail === "" || getEmail === null;

   useEffect(() => {
      localStorage.removeItem("stopRefetch");
      if (verfiedLocalStorage) {
         setIsLoading(true);
         setLocalStorageData(false);
      } else {
         setLocalStorageData(true);
      }
   }, []);

   return (
      <>
         {step >= 7 ? <FreshChatComp color="#FF567A" /> : <FreshChatComp />}
         <div className="App" style={{ flex: 1 }}>
            <div
               className={`${
                  step === 7
                     ? "login-provider-wrapper-success"
                     : localStorageData || (isNorthwellProvider && step === 2)
                     ? ""
                     : "login-provider-wrapper"
               }`}
            >
               <div className={`${step === 7 && "provider-logo"}`}>
                  {step === 7 && <img src={defaultLogo} alt="Playback logo" />}
               </div>
               <div className={`${(step === 7 || localStorageData) && "provider-circle-one"}`}></div>
               <div className={`${(step === 7 || localStorageData) && "provider-circle-two"}`}></div>
               <div className={`${(step === 7 || localStorageData) && "provider-circle-three"}`}></div>
               {localStorageData ? (
                  <div className="login-provider-wrapper-success">
                     <div className={`${localStorageData && "provider-logo"}`}>
                        <img src={defaultLogo} alt="Playback logo" />
                     </div>
                     <div className={`${localStorageData && "provider-circle-one"}`}></div>
                     <div className={`${localStorageData && "provider-circle-two"}`}></div>
                     <div className={`${localStorageData && "provider-circle-three"}`}></div>
                     <Success
                        props={props}
                        qrcode={getQrCode}
                        providerQrCode={providerQrCode}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        savedEmail={getEmail}
                        savedFirstName={getFirstName}
                        savedLastName={getLastName}
                        savedPhoneNumber={getPhoneNumber}
                        qrCodeScreenText={qrCodeScreenText}
                        videosData={getVideoData}
                        localStorageData={localStorageData}
                        providerLoginSystem={providerLoginSystem}
                        northwellLogin={props.northwellLogin}
                        setIsNorthwellProvider={setIsNorthwellProvider}
                        isNorthwellProvider={isNorthwellProvider}
                     />
                  </div>
               ) : isNorthwellProvider ? (
                  <>
                     <div className={`${step === 2 && "login-provider-wrapper-success"}`}>
                        <div className={`${isNorthwellProvider && step === 2 && "provider-logo"}`}>
                           {step === 2 && <img src={defaultLogo} alt="Playback logo" />}
                        </div>
                        <div className={`${isNorthwellProvider && step === 2 && "provider-circle-one"}`}></div>
                        <div className={`${isNorthwellProvider && step === 2 && "provider-circle-two"}`}></div>
                        <div className={`${isNorthwellProvider && step === 2 && "provider-circle-three"}`}></div>

                        {
                           {
                              1: (
                                 <Healthcare
                                    email={email}
                                    providerOnboardData={providerOnboardData}
                                    setProviderOnboardData={setProviderOnboardData}
                                    nextStepHandler={nextStep}
                                    healthcareTitle={healthcareAlmostThere}
                                    healthcareContent={healthcarePatientInfo}
                                    step={step}
                                    setStep={setStep}
                                    keyProvider={keyProvider}
                                    setKeyProvider={setKeyProvider}
                                    providerDetails
                                    providerQrCode={providerQrCode}
                                    setSavedEmail={setSavedEmail}
                                    setSavedFirstName={setSavedFirstName}
                                    setSavedLastName={setSavedLastName}
                                    setSavedPhoneNumber={setSavedPhoneNumber}
                                    providerLoginSystem={providerLoginSystem}
                                    setVideoUrl={setVideoUrl}
                                    prevStep={prevStep}
                                    setIsNorthwellProvider={setIsNorthwellProvider}
                                    isNorthwellProvider={isNorthwellProvider}
                                    backBtn
                                    classBtn="classBtn6"
                                    setIsActivated={setIsActivated}
                                 />
                              ),
                              2: (
                                 <Success
                                    props={props}
                                    qrcode={qrCode}
                                    providerQrCode={providerQrCode}
                                    isLoading={isLoading}
                                    setIsLoading={setIsLoading}
                                    savedEmail={savedEmail}
                                    savedFirstName={savedFirstName}
                                    savedLastName={savedLastName}
                                    savedPhoneNumber={savedPhoneNumber}
                                    qrCodeScreenText={qrCodeScreenText}
                                    videoUrl={videoUrl}
                                    providerLoginSystem={providerLoginSystem}
                                    northwellLogin={props.northwellLogin}
                                    setIsNorthwellProvider={setIsNorthwellProvider}
                                    isNorthwellProvider={isNorthwellProvider}
                                 />
                              ),
                           }[step]
                        }
                     </div>
                  </>
               ) : (
                  <>
                     {
                        {
                           1: (
                              <Healthcare
                                 email={email}
                                 setProviderOnboardData={setProviderOnboardData}
                                 nextStepHandler={nextStep}
                                 healthcareTitle={healthcareTitle}
                                 healthcareContent={healthcareContent}
                                 step={step}
                                 setStep={setStep}
                                 props={props}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 emailProvider={emailProvider}
                                 setEmailProvider={setEmailProvider}
                                 setIsActivated={setIsActivated}
                                 {...props}
                              />
                           ),
                           2: (
                              <Healthcare
                                 email={email}
                                 nextStepHandler={nextStep}
                                 prevStep={prevStep}
                                 healthcareTitle={emailVerify}
                                 healthcareContent={healthcareCode}
                                 step={step}
                                 setStep={setStep}
                                 props={props}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 emailOtp
                                 className="second-step"
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 backBtn
                                 classBtn="classBtn2"
                              />
                           ),
                           3: (
                              <Healthcare
                                 email={email}
                                 nextStepHandler={nextStep}
                                 healthcareTitle={healthcarePassword}
                                 healthcareContent={passwordContent}
                                 step={step}
                                 setStep={setStep}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 password
                                 classThird={"third-step"}
                                 props={props}
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 prevStep={prevStep}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 backBtn
                                 classBtn="classBtn3"
                              />
                           ),
                           4: (
                              <Healthcare
                                 email={email}
                                 nextStepHandler={nextStep}
                                 healthcareTitle={healthcareNumber}
                                 healthcareContent={numberAuth}
                                 step={step}
                                 setStep={setStep}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 phoneNumber
                                 classThird={"third-step"}
                                 props={props}
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 prevStep={prevStep}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 backBtn
                                 classBtn="classBtn4"
                              />
                           ),
                           5: (
                              <Healthcare
                                 email={email}
                                 nextStepHandler={nextStep}
                                 healthcareTitle={verifyNumber}
                                 healthcareContent={healthcareOtpSend}
                                 healthcareOtpSend2={healthcareOtpSend2}
                                 step={step}
                                 setStep={setStep}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 otp
                                 className="second-step"
                                 props={props}
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 prevStep={prevStep}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 backBtn
                                 classBtn="classBtn5"
                                 setProviderEntpId={setProviderEntpId}
                              />
                           ),
                           6: (
                              <Healthcare
                                 email={email}
                                 providerOnboardData={providerOnboardData}
                                 nextStepHandler={nextStep}
                                 healthcareTitle={healthcareAlmostThere}
                                 healthcareContent={healthcarePatientInfo}
                                 step={step}
                                 setStep={setStep}
                                 keyProvider={keyProvider}
                                 setKeyProvider={setKeyProvider}
                                 providerDetails
                                 props={props}
                                 providerQrCode={providerQrCode}
                                 setSavedEmail={setSavedEmail}
                                 setSavedFirstName={setSavedFirstName}
                                 setSavedLastName={setSavedLastName}
                                 setSavedPhoneNumber={setSavedPhoneNumber}
                                 setVideoUrl={setVideoUrl}
                                 prevStep={prevStep}
                                 setProviderLoghinSystem={setProviderLoghinSystem}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                                 backBtn
                                 classBtn="classBtn6"
                                 providerEntpId={providerEntpId}
                                 isActivated={isActivated}
                              />
                           ),
                           7: (
                              <Success
                                 props={props}
                                 qrcode={qrCode}
                                 providerQrCode={providerQrCode}
                                 isLoading={isLoading}
                                 setIsLoading={setIsLoading}
                                 savedEmail={savedEmail}
                                 savedFirstName={savedFirstName}
                                 savedLastName={savedLastName}
                                 savedPhoneNumber={savedPhoneNumber}
                                 qrCodeScreenText={qrCodeScreenText}
                                 videoUrl={videoUrl}
                                 providerLoginSystem={providerLoginSystem}
                                 northwellLogin={props.northwellLogin}
                                 setIsNorthwellProvider={setIsNorthwellProvider}
                                 isNorthwellProvider={isNorthwellProvider}
                              />
                           ),
                        }[step]
                     }
                  </>
               )}
            </div>
         </div>
      </>
   );
};

export default OnBoardComponent;
