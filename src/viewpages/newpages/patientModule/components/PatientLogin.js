import React, { useEffect, useState, useRef } from "react";
import defaultLogo from "../../../../images/PBH.Vector 1.png";
import OtpInput from "react-otp-input";
import eyeOn from "../../../../assets/eyeOn.png";
import eyeOff from "../../../../assets/eyeOff.png";
import mail from "../../../../assets/Mail.png";
import google from "../../../../assets/Google.png";
import apple from "../../../../assets/apple.png";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import { ShowAlert, showSwal } from "../../../../common/alert";
import { emailReg } from "../../../../helper/CommonFuncs";
import InputMask from "react-input-mask";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../../components/newcomponents/ToastView";

const Input = (props) => {
   const inputField = useRef(null);

   useEffect(() => {
      inputField.current.focus();
   }, []);

   return (
      <InputMask mask="+1 (999) 999-9999" value={props.value} onChange={props.onChange}>
         {(inputProps) => (
            <input
               type="text"
               autofocus
               className="login-input new"
               placeholder="(000) 000-0000"
               onKeyDown={props.onKeyDown}
               ref={inputField}
               {...inputProps}
            />
         )}
      </InputMask>
   );
};

export const closeButton = {
   closeButton: false,
};

const PatientLogin = ({
   nextStepHandler,
   healthcareTitle,
   healthcareContent,
   otp,
   password,
   phoneNumber,
   providerDetails,
   className,
   classThird,
   number,
   props,
   step,
   setStep,
   keyProvider,
   setKeyProvider,
   emailOtp,
   patientDetails,
   providerQrCode,
   setSavedEmail,
   setSavedFirstName,
   setSavedLastName,
   setSavedPhoneNumber,
   setVideoUrl,
   hospitalLocation,
}) => {
   const [eye, seteye] = useState(eyeOff);
   const [passwordField, setPasswordField] = useState("password");
   const [otpEmail, setOtpEmail] = useState("");
   const [otpNumber, setOtpNumber] = useState("");
   const { userCredentials, accessToken } = props;
   const [isLoading, setIsLoading] = useState(false);
   const [emailProvider, setEmailProvider] = useState("");
   const [phoneNumberProv, setPhoneNumberProv] = useState(null);
   const [passwordProv, setPasswordProv] = useState(null);
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const inputField = useRef(null);

   const providerEmail = (email, e) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.checkProvider,
         email: email,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         setKeyProvider(resultStatus?.data?.key);
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const verifyOtp = (code) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.verifyProviderEmail,
         key: keyProvider,
         code: code,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const resendEmailOtp = () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.resendProviderEmailOTP,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            toast(<ToastView text={resultStatus?.settings?.message} />, defaultToastProps);
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const resendMobileOtp = () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.resendProviderMobileOTP,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            ShowAlert(resultStatus?.settings?.message);
            // toast(<Snackbar message={resultStatus?.settings?.message} type="success" />, closeButton);
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const createPassword = (passwordProv) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.createPassword,
         password: passwordProv,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const mobileNumber = (phoneNumberProv) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.sendOTPToProviderMobile,
         mobileNo: phoneNumberProv,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const providerMobile = (otpNumber) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.verifyProviderMobile,
         code: otpNumber,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const getVideo = () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getVideoURLs,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            setVideoUrl(
               resultStatus?.data.map((item) => {
                  let itemThumbnail = item.thumbnail;
                  let itemLocation = item.location;
                  let itemTitle = item.title;
                  let items = [itemThumbnail, itemLocation, itemTitle];
                  return items;
               })
            );
         } else if (resultStatus?.settings?.status === 0) {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.message);
            setIsLoading(false);
         }
      });
   };

   const submitProvidersDetails = (firstName, lastName) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.submitProviderDetails,
         firstName: firstName,
         lastName: lastName,
         key: keyProvider,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         setSavedEmail(resultStatus?.data?.userData?.email);
         setSavedFirstName(resultStatus?.data?.userData?.firstName);
         setSavedLastName(resultStatus?.data?.userData?.lastName);
         setSavedPhoneNumber(resultStatus?.data?.userData?.mobileNo);
         if (resultStatus?.settings?.status === 1) {
            setIsLoading(false);
            nextStepHandler();
            getVideo();
         } else if (resultStatus?.settings?.status === 0) {
            showSwal("Please enter full name");
            setIsLoading(false);
         } else {
            showSwal(resultStatus?.settings?.message);
            setIsLoading(false);
         }
      });
   };

   const EyeIcon = () => {
      if (passwordField == "password") {
         setPasswordField("text");
         seteye(eyeOn);
      } else {
         setPasswordField("password");
         seteye(eyeOff);
      }
   };

   useEffect(() => {
      window.addEventListener("keypress", onEnterSubmit);
      return () => {
         window.removeEventListener("keypress", onEnterSubmit);
      };
   }, []);

   const onEnterSubmit = (e) => {
      if (e.key === "Enter" || e.code === "NumpadEnter") {
         document.getElementById("enter-btn-provider") && document.getElementById("enter-btn-provider").click();
      }
   };

   // useEffect(() => {
   //    inputField.current.focus();
   // }, []);

   const validateField = () => {
      if (step === 1) {
         if (!emailReg.test(emailProvider) || emailProvider.length === 0) {
            showSwal("Please enter a valid email address");
            setIsLoading(false);
         } else {
            setIsLoading(true);
            providerEmail(emailProvider);
         }
      } else if (step === 2) {
         setIsLoading(true);
         verifyOtp(otpEmail.toString());
      } else if (step === 3) {
         setIsLoading(true);
         createPassword(passwordProv);
      } else if (step === 4) {
         let mobileWithoutFormat = phoneNumberProv.replace(/\D/g, "").substring(1);
         if (mobileWithoutFormat.length === 10) {
            setIsLoading(true);
            mobileNumber(mobileWithoutFormat);
         } else {
            setIsLoading(false);
            showSwal("Please enter a valid phone number");
         }
      } else if (step === 5) {
         setIsLoading(true);
         providerMobile(otpNumber.toString());
      } else if (step === 6) {
         if (firstName.length === "" || lastName.length === "") {
            showSwal("Please enter a full name");
         } else {
            setIsLoading(true);
            submitProvidersDetails(firstName, lastName);
         }
      } else {
         setIsLoading(true);
         providerQrCode();
      }
   };
   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <div className="login-content">
               <img src={defaultLogo} alt="" />
               <div className="login-patient-container">
                  <div className={`title-container ${className}`}>
                     <h3>
                        <span className="healthcare-title">
                           {healthcareTitle}{" "}
                           {otp &&
                              phoneNumberProv
                                 .replace(/\D+/g, "")
                                 .substring(1)
                                 .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                        </span>
                        <br />
                        <p> {healthcareContent}</p>
                     </h3>
                  </div>

                  <div className={`form-group ${classThird}`}>
                     {otp ? (
                        <>
                           <div className="form-group otp-center">
                              <OtpInput
                                 inputStyle="form-control otp-input"
                                 numInputs={6}
                                 separator={<span className="otp-span">-</span>}
                                 otpType="number"
                                 onChange={(e) => {
                                    setOtpNumber(e);
                                 }}
                                 value={otpNumber}
                                 shouldAutoFocus={true}
                                 isInputNum="true"
                                 ref={inputField}
                              />
                           </div>
                           <div className="did-not-get flex-center" style={{ justifyContent: "flex-end" }}>
                              <div className="resend-box flex-center">
                                 <button
                                    className="resend-link"
                                    id="resend-otp-email"
                                    onClick={() => {
                                       if (otp) {
                                          setIsLoading(true);
                                          resendMobileOtp();
                                       }
                                    }}
                                 >
                                    Resend
                                 </button>
                              </div>
                           </div>
                        </>
                     ) : hospitalLocation ? (
                        <div className="input-text">
                           <input
                              autoComplete="off"
                              autoFocus
                              type={passwordField}
                              className="login-input new"
                              placeholder="Enter password"
                              value={passwordProv}
                              onChange={(e) => {
                                 setPasswordProv(e.target.value);
                              }}
                              name="password"
                              ref={inputField}
                           />
                           <img src={eye} onClick={EyeIcon} alt="" className="fa-eye" />
                        </div>
                     ) : phoneNumber ? (
                        <Input
                           value={phoneNumberProv}
                           onChange={(e) => {
                              setPhoneNumberProv(e.target.value);
                           }}
                        />
                     ) : patientDetails ? (
                        <>
                           <input
                              // value={firstName}
                              autoComplete="off"
                              autoFocus
                              className="login-input new"
                              placeholder="Full name"
                              // onChange={(e) => setFirstName(e.target.value)}
                              type="name"
                              name="fullname"
                              ref={inputField}
                           />
                           <Input
                              value={phoneNumberProv}
                              onChange={(e) => {
                                 setPhoneNumberProv(e.target.value);
                              }}
                           />
                           <input
                              // value={lastName}
                              autoComplete="off"
                              className="login-input new"
                              placeholder="Email"
                              // onChange={(e) => setLastName(e.target.value)}
                              type="email"
                              name="email"
                              autofocus
                              ref={inputField}
                           />
                           <input
                              // value={lastName}
                              autoComplete="off"
                              className="login-input new"
                              placeholder="Date of birth"
                              // onChange={(e) => setLastName(e.target.value)}
                              type="lastName"
                              name="lastname"
                              autofocus
                              ref={inputField}
                           />
                        </>
                     ) : (
                        <Input
                           value={phoneNumberProv}
                           onChange={(e) => {
                              setPhoneNumberProv(e.target.value);
                           }}
                        />
                     )}
                  </div>

                  <button
                     className="btn btn-blue-block got-it-btn"
                     id="enter-btn-provider"
                     //   disabled={email_regex.test(String(this.state.email).toLowerCase()) ? false : true}
                     onClick={() => nextStepHandler()}
                  >
                     Next
                  </button>
                  {step === 1 && (
                     <div className="patient-login">
                        <h4 className="create-account">or create account with</h4>
                        <div className="login-provider-cred">
                           <img src={mail} alt="mail login" className="mail-login-logo" />
                           <img src={apple} alt="apple login" className="apple-login-logo" />
                           <img src={google} alt="google login" className="google-login-logo" />
                        </div>
                        <h4 className="already-account">Already have an account?</h4>
                        <button className="btn btn-red-block sign-in">Sign in</button>
                     </div>
                  )}
               </div>
            </div>
         )}
      </>
   );
};

export default PatientLogin;
