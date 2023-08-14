import React, { useEffect, useState, useRef } from "react";
import defaultLogo from "../../../../images/PBH.Vector 1.png";
import OtpInput from "react-otp-input";
import eyeOn from "../../../../assets/eyeOn.png";
import eyeOff from "../../../../assets/eyeOff.png";
import ArrowBack from "../../../../assets/arrow-back.svg";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import { ShowAlert, error } from "../../../../common/alert";
import { emailReg } from "../../../../helper/CommonFuncs";
import InputMask from "react-input-mask";
import "react-toastify/dist/ReactToastify.css";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import InfoComponent from "./InfoComponent";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../../../../redux/actions/auth.action";

const Input = (props) => {
   const inputField = useRef(null);

   useEffect(() => {
      inputField.current.focus();
   }, []);

   return (
      <InputMask mask="+1 (999) 999-9999" value={props.value} onChange={props.onChange}>
         {(inputProps) => (
            <input
               id={props.id ? props.id : ""}
               type="text"
               autofocus
               className="login-input new"
               placeholder="(000) 000-0000"
               onKeyDown={props.onKeyDown}
               style={{ marginTop: "25px" }}
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
const Healthcare = ({
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
   // props,
   step,
   setStep,
   keyProvider,
   setKeyProvider,
   emailOtp,
   providerQrCode,
   setSavedEmail,
   setSavedFirstName,
   setSavedLastName,
   setSavedPhoneNumber,
   setVideoUrl,
   setNewLoading,
   setEnablePassword,
   prevStep,
   backBtn,
   classBtn,
   healthcareOtpSend2,
   setProviderLoghinSystem,
   northwellLogin,
   isNorthwellProvider,
   setIsNorthwellProvider,
   providerLoginSystem,
   emailProvider,
   setEmailProvider,
   providerEntpId,
   setProviderEntpId,
   setProviderOnboardData,
   providerOnboardData = false,
   isActivated = false,
   setIsActivated,
   savenorthwelluserobj,
   saveusercredentials,
   history,
   email,
}) => {
   const isEmail = email !== "" ? true : false;
   const [eye, seteye] = useState(eyeOff);
   const [passwordField, setPasswordField] = useState("password");
   const [otpEmail, setOtpEmail] = useState("");
   const [otpNumber, setOtpNumber] = useState("");
   const [isLoading, setIsLoading] = useState(isEmail);
   const [phoneNumberProv, setPhoneNumberProv] = useState(null);
   const [passwordProv, setPasswordProv] = useState(null);
   const [firstName, setFirstName] = useState("");
   const [lastName, setLastName] = useState("");
   const inputField = useRef(null);
   const getProviderKey = localStorage.getItem("providerKey");
   const [providerTitle, setProviderTitle] = useState("");
   const [hospitalList, setHospitalList] = useState([]);
   const [departmentList, setDepartmentList] = useState([]);
   const [degreeList, setDegreeList] = useState([]);
   const [selectedHosp, setSelectedHosp] = useState(null);
   const [selectedDept, setSelectedDept] = useState(null);
   const [selectedDegree, setSelectedDegree] = useState(null);
   const [hospLoading, setHospLoading] = useState(true);
   const [deptLoading, setDeptLoading] = useState(false);
   const [degreeLoading, setDegreeLoading] = useState(true);

   useEffect(() => {
      if (email && email !== "") {
         providerEmail(email);
      }
   }, [email]);

   const providerEmail = (email, e) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.checkProvider,
         email: email,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         setKeyProvider(resultStatus?.data?.key);
         setProviderLoghinSystem(resultStatus?.data?.loginSystem);
         setPrefilledInfo(resultStatus?.data?.userData);
         setProviderOnboardData(resultStatus?.data);
         setIsActivated(resultStatus?.data?.isActivated || false);
         localStorage.setItem("providerKey", resultStatus?.data?.key);
         localStorage.setItem("provEmail", email);
         if (resultStatus?.data?.isUserExist === true) {
            if (resultStatus?.data?.loginSystem === "northwell") {
               localStorage.setItem("loginSystem", resultStatus?.data?.loginSystem);
               northwellLogin();
            } else {
               setIsLoading(false);
               setEnablePassword(email);
               setNewLoading();
            }
         } else if (resultStatus?.data?.isUserExist === false) {
            if (resultStatus?.data?.loginSystem === "northwell") {
               localStorage.setItem("loginSystem", resultStatus?.data?.loginSystem);
               setIsNorthwellProvider(true);
               setIsLoading(false);
               // nextStepHandler();
            } else if (resultStatus?.settings?.status === 0) {
               ShowAlert(resultStatus?.settings?.message, error);
               setIsLoading(false);
            } else {
               setIsLoading(false);
               if (isEmail) {
                  setStep(3);
               } else {
                  nextStepHandler();
               }
               let entpId = resultStatus?.data?.userData
                  ? resultStatus?.data?.userData?.enterpriseId
                  : resultStatus?.data?.enterpriseId;
               providerGetShortTitle(entpId, resultStatus?.data?.userData);
            }
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
            setIsLoading(false);
         }
      });
   };

   const setPrefilledInfo = (providerInfo) => {
      if (providerInfo) {
         const { firstName, lastName, hospitalId, hospitalName, departmentId, departmentName, degree, title } =
            providerInfo;
         setSelectedHosp(hospitalId ? { label: hospitalName, value: hospitalId } : null);
         setSelectedDept(departmentId ? { label: departmentName, value: departmentId } : null);
         setSelectedDegree(degree !== null ? { label: degree, value: degree } : null);
         setFirstName(firstName);
         setLastName(lastName);
         setProviderTitle(title);
      }
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
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
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
            ShowAlert(resultStatus?.settings?.message);
            setIsLoading(false);
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
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
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
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
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
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
            ShowAlert(resultStatus?.message, error);
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
            // setProviderEntpId(resultStatus?.data?.enterpriseId);
            setIsLoading(false);
            // providerGetShortTitle(resultStatus?.data?.enterpriseId);
            nextStepHandler();
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
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
               resultStatus?.data?.map((item) => {
                  let itemThumbnail = item.thumbnail;
                  let itemLocation = item.location;
                  let itemTitle = item.title;
                  let items = [itemThumbnail, itemLocation, itemTitle];
                  return items;
               })
            );
            localStorage.setItem("savedVideoData", JSON.stringify(resultStatus?.data));
         } else if (resultStatus?.settings?.status === 0) {
            // ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            // ShowAlert(resultStatus?.message, error);
            setIsLoading(false);
         }
      });
   };

   const submitProvidersDetails = (provDetails) => {
      const { firstName, lastName, hospital, department, degree, title } = provDetails;
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.submitProviderDetails,
         firstName: firstName,
         lastName: lastName,
         title: title,
         degree: degree?.value || "",
         hospitalId: hospital.value,
         departmentId: department.value,
         key: keyProvider,
         alreadyVerified: isEmail,
      };

      window.socket.send(onboardingParams, (resultStatus) => {
         if (isActivated) {
            providerActivated();
         } else if (resultStatus?.settings?.status === 1) {
            setSavedEmail(resultStatus?.data?.userData?.email);
            setSavedFirstName(resultStatus?.data?.userData?.firstName);
            setSavedLastName(resultStatus?.data?.userData?.lastName);
            setSavedPhoneNumber(resultStatus?.data?.userData?.mobileNo);

            localStorage.setItem("providerEmail", resultStatus?.data?.userData?.email);
            localStorage.setItem("providerFirstName", resultStatus?.data?.userData?.firstName);
            localStorage.setItem("providerLastName", resultStatus?.data?.userData?.lastName);
            localStorage.setItem("providerPhoneNumber", resultStatus?.data?.userData?.mobileNo);

            setIsLoading(false);
            nextStepHandler();
            getVideo();
         } else if (resultStatus?.settings?.status === 0) {
            ShowAlert(resultStatus?.settings?.message, error);
            setIsLoading(false);
         } else {
            ShowAlert(resultStatus?.message, error);
            setIsLoading(false);
         }
      });
   };

   const EyeIcon = () => {
      if (passwordField === "password") {
         setPasswordField("text");
         seteye(eyeOn);
      } else {
         setPasswordField("password");
         seteye(eyeOff);
      }
   };

   useEffect(() => {
      if (providerOnboardData) {
         providerGetShortTitle(providerOnboardData?.enterpriseId, providerOnboardData?.userData);
      }
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

   useEffect(() => {
      inputField.current && inputField.current.focus();
   }, []);

   const validateNewFields = () => {
      if (firstName === "" || lastName === "" || firstName.length < 2 || lastName.length < 2) {
         ShowAlert("Please enter your full name", error);
      } else if (selectedHosp === null || selectedHosp?.length === 0) {
         ShowAlert("Please select your hospital.", error);
      } else if (selectedDept === null || selectedDept?.length === 0) {
         ShowAlert("Please select your department.", error);
      } else if (
         providerTitle === undefined ||
         providerTitle === null ||
         providerTitle?.replace(/[^A-Z0-9]/gi, "")?.length === 0
      ) {
         ShowAlert("Please enter a valid title.", error);
      } else {
         setIsLoading(true);
         const providerDetailsObj = {
            firstName: firstName,
            lastName: lastName,
            hospital: selectedHosp,
            department: selectedDept,
            degree: selectedDegree,
            title: providerTitle,
         };
         submitProvidersDetails(providerDetailsObj);
      }
   };

   const validateField = () => {
      if (isNorthwellProvider) {
         if (step === 1) {
            validateNewFields();
         } else {
            setIsLoading(true);
            providerQrCode();
         }
      } else {
         if (step === 1) {
            if (!emailReg.test(emailProvider) || emailProvider.length === 0) {
               ShowAlert("Please enter a valid email address", error);
               setIsLoading(false);
            } else {
               setIsLoading(true);
               providerEmail(emailProvider);
            }
         } else if (step === 2) {
            if (otpEmail.length === 0 || otpEmail.length < 6) {
               ShowAlert("Please enter a valid otp", error);
            } else {
               setIsLoading(true);
               verifyOtp(otpEmail.toString());
            }
         } else if (step === 3) {
            if (passwordProv === null || passwordProv === "") {
               ShowAlert("Password cannot be empty", error);
               return;
            }
            setIsLoading(true);
            createPassword(passwordProv);
         } else if (step === 4) {
            let mobileWithoutFormat = phoneNumberProv.replace(/\D/g, "").substring(1);
            if (mobileWithoutFormat.length === 10) {
               setIsLoading(true);
               mobileNumber(mobileWithoutFormat);
            } else {
               setIsLoading(false);
               ShowAlert("Please enter a valid phone number", error);
            }
         } else if (step === 5) {
            if (otpNumber.length === 0 || otpNumber.length < 6) {
               ShowAlert("Please enter a valid otp", error);
            } else {
               setIsLoading(true);
               providerMobile(otpNumber.toString());
            }
         } else if (step === 6) {
            validateNewFields();
         } else {
            setIsLoading(true);
            providerQrCode();
         }
      }
   };

   const providerGetShortTitle = async (enterprise, provData) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getShortTitle,
         degree: providerTitle,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data =
               resultStatus?.data
                  ?.filter((o) => o.length > 1)
                  ?.map((o, i) => {
                     return { label: o, value: o, data: o };
                  }) || [];
            setDegreeList(data);
            setDegreeLoading(false);
            providerGetHospitals(enterprise, provData);
         } else {
            ShowAlert(resultStatus?.settings?.message);
         }
      });
   };

   const providerGetHospitals = async (enterpriseId, provData) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getHospitals,
         enterpriseId,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data = resultStatus?.hospitals?.map((o) => {
               return { label: o.name, value: o.id, data: o };
            });

            setHospitalList(data);

            if (provData?.hospitalId) {
               providerGetDepartments({ label: provData?.hospitalName, value: provData?.hospitalId });
            }
            setHospLoading(false);
         } else {
            ShowAlert(resultStatus?.message);
         }
      });
   };

   const providerGetDepartments = (hospital) => {
      setDeptLoading(true);

      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getDepartmentsV2,
         // department: department?.value,
         hospitalId: hospital?.value,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data = resultStatus?.data?.map((o) => {
               return { label: o.name, value: o.id, data: o };
            });
            setDepartmentList(data);
            setDeptLoading(false);
         } else {
            ShowAlert(resultStatus?.settings?.message);
         }
      });
   };

   const providerActivated = () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.isProviderActivated,
         key: getProviderKey,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.data?.isActivated === true) {
            firebase
               .auth()
               .signInWithCustomToken(resultStatus?.data?.customToken)
               .then((storeDataRedux) => {
                  localStorage.setItem("login", "yes");
                  localStorage.setItem("redirected", "yes");
                  let userData = {};
                  userData.id = storeDataRedux.user.uid;
                  savenorthwelluserobj(JSON.parse(JSON.stringify(storeDataRedux)));
                  saveusercredentials(userData);
                  history.push("/");
               })
               .catch((error) => {
                  console.log(error);
               });
         } else {
            // console.log(resultStatus?.settings?.message);
         }
      });
   };

   // useEffect(() => {
   //    if (window.performance) {
   //       if (performance.navigation.type == 1) {
   //          alert("This page is reloaded");
   //          // localStorage.removeItem("loginSystem");
   //       } else {
   //          alert("This page is not reloaded");
   //       }
   //    }
   // }, [window.performance]);

   const finalStepCondition = step === 6 || providerLoginSystem === "northwell" || false;
   const showBackButton = backBtn && !isEmail;
   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <div className="login-content">
               <img src={defaultLogo} alt="playback logo" />
               <div className="login-box-container" style={{ height: finalStepCondition ? "601px" : "466.9px" }}>
                  {showBackButton && (
                     <div
                        className="back-btn-container"
                        onClick={() => {
                           if (providerLoginSystem === "northwell") {
                              // setStep(step - 1);
                              setIsNorthwellProvider(false);
                              // window.location.reload();
                           } else {
                              prevStep();
                           }
                        }}
                     >
                        <img src={ArrowBack} className="back-btn" />
                     </div>
                  )}

                  <div className={`title-container ${className}`}>
                     <h3>
                        <span className="healthcare-title">{healthcareTitle} </span>
                        <br />
                        <div
                           style={{
                              width: `${(phoneNumber || password) && "400px"}`,
                              marginBottom: `${(phoneNumber || password) && "-30px"}`,
                           }}
                        >
                           <p>
                              {healthcareContent}{" "}
                              {otp &&
                                 phoneNumberProv
                                    .replace(/\D+/g, "")
                                    .substring(1)
                                    .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}{" "}
                              {otp && healthcareOtpSend2}
                           </p>
                        </div>
                     </h3>
                  </div>

                  <div
                     className={`form-group ${classThird}`}
                     style={{ marginTop: finalStepCondition ? "0px" : "25px" }}
                  >
                     {otp || emailOtp ? (
                        <>
                           <div className="form-group otp-center" id={pendoIds.inputProviderLoginOtp}>
                              <OtpInput
                                 inputStyle="form-control otp-input"
                                 numInputs={6}
                                 separator={<span className="otp-span">-</span>}
                                 onChange={(e) => {
                                    otp ? setOtpNumber(e) : setOtpEmail(e);
                                 }}
                                 value={otp ? otpNumber : otpEmail}
                                 shouldAutoFocus={true}
                                 isInputNum={true}
                                 ref={inputField}
                                 containerStyle={{
                                    gap: "13px",
                                 }}
                              />
                           </div>
                           <div className="did-not-get flex-center" style={{ justifyContent: "flex-end" }}>
                              {" "}
                              Didn’t get code yet?{" "}
                              <div className="resend-box flex-center">
                                 <button
                                    className="resend-link"
                                    id="resend-otp-email"
                                    onClick={() => {
                                       if (otp) {
                                          setIsLoading(true);
                                          resendMobileOtp();
                                       } else {
                                          setIsLoading(true);
                                          resendEmailOtp();
                                       }
                                    }}
                                 >
                                    Resend
                                 </button>
                              </div>
                           </div>
                        </>
                     ) : password ? (
                        <div className="input-text">
                           <input
                              id={pendoIds.inputFieldProviderPassword}
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
                           id={pendoIds.inputFieldProviderMobile}
                           value={phoneNumberProv}
                           onChange={(e) => {
                              setPhoneNumberProv(e.target.value);
                           }}
                        />
                     ) : providerDetails ? (
                        <>
                           <InfoComponent
                              firstName={firstName}
                              setFirstName={setFirstName}
                              lastName={lastName}
                              setLastName={setLastName}
                              inputField={inputField}
                              providerTitle={providerTitle}
                              setProviderTitle={setProviderTitle}
                              hospitalList={hospitalList}
                              setHospitalList={setHospitalList}
                              departmentList={departmentList}
                              setDepartmentList={setDepartmentList}
                              degreeList={degreeList}
                              setDegreeList={setDegreeList}
                              selectedHosp={selectedHosp}
                              setSelectedHosp={setSelectedHosp}
                              selectedDept={selectedDept}
                              setSelectedDept={setSelectedDept}
                              selectedDegree={selectedDegree}
                              setSelectedDegree={setSelectedDegree}
                              providerGetDepartments={providerGetDepartments}
                              hospLoading={hospLoading}
                              deptLoading={deptLoading}
                              degreeLoading={degreeLoading}
                           />
                        </>
                     ) : (
                        <input
                           id={pendoIds.inputFieldProviderEmail}
                           value={emailProvider}
                           autoComplete="off"
                           autoFocus
                           className="login-input new"
                           placeholder="Enter email"
                           onChange={(e) => setEmailProvider(e.target.value)}
                           type="email"
                           name="email"
                           ref={inputField}
                        />
                     )}
                  </div>

                  <button
                     className="btn btn-blue-block"
                     style={{ marginTop: finalStepCondition ? "15px" : "56px" }}
                     id="enter-btn-provider"
                     //   disabled={email_regex.test(String(this.state.email).toLowerCase()) ? false : true}
                     onClick={() => validateField()}
                  >
                     Next
                  </button>
               </div>
            </div>
         )}
      </>
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

export default withRouter(connect(null, mapDispatchToProps)(Healthcare));
