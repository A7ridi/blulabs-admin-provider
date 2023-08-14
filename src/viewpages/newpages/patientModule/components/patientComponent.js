import React, { useState } from "react";
import PatientLogin from "./PatientLogin";
import * as i18n from "../../../../I18n/en.json";
import "../container/patientLogin.css";

const PatientComponent = (props) => {
   const [step, setStep] = useState(1);
   const [keyProvider, setKeyProvider] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [savedEmail, setSavedEmail] = useState("");
   const [savedFirstName, setSavedFirstName] = useState("");
   const [savedLastName, setSavedLastName] = useState("");
   const [savedPhoneNumber, setSavedPhoneNumber] = useState("");

   const nextStep = () => {
      if (step < 4) {
         setStep(step + 1);
      } else if (step === 4) {
         console.log("no step further");
      }
   };

   const createAcc = i18n?.patientOnboard?.createAcc;
   const createAccSubtitle = i18n?.patientOnboard?.createAccSubtitle;
   const enterDetails = i18n?.patientOnboard?.enterDetails;
   const enterDetailsSubtitle = i18n?.patientOnboard?.enterDetailsSubtitle;
   const healthcareFacility = i18n?.patientOnboard?.healthcareFacility;
   const healthcareFacilitySubtitle = i18n?.patientOnboard?.healthcareFacilitySubtitle;
   const codeSent = i18n?.patientOnboard?.codeSent;

   return (
      <div className="App" style={{ flex: 1 }}>
         <div className={"login-patient-wrapper"}>
            {
               {
                  1: (
                     <PatientLogin
                        nextStepHandler={nextStep}
                        healthcareTitle={createAcc}
                        healthcareContent={createAccSubtitle}
                        step={step}
                        setStep={setStep}
                        props={props}
                        keyProvider={keyProvider}
                        setKeyProvider={setKeyProvider}
                        setSavedEmail={setSavedEmail}
                        setSavedFirstName={setSavedFirstName}
                        setSavedLastName={setSavedLastName}
                        setSavedPhoneNumber={setSavedPhoneNumber}
                     />
                  ),
                  2: (
                     <PatientLogin
                        nextStepHandler={nextStep}
                        healthcareTitle={enterDetails}
                        healthcareContent={enterDetailsSubtitle}
                        step={step}
                        setStep={setStep}
                        props={props}
                        keyProvider={keyProvider}
                        setKeyProvider={setKeyProvider}
                        patientDetails
                        className="second-step"
                        setSavedEmail={setSavedEmail}
                        setSavedFirstName={setSavedFirstName}
                        setSavedLastName={setSavedLastName}
                        setSavedPhoneNumber={setSavedPhoneNumber}
                     />
                  ),
                  3: (
                     <PatientLogin
                        nextStepHandler={nextStep}
                        healthcareTitle={healthcareFacility}
                        healthcareContent={healthcareFacilitySubtitle}
                        step={step}
                        setStep={setStep}
                        keyProvider={keyProvider}
                        setKeyProvider={setKeyProvider}
                        hospitalLocation
                        classThird={"third-step"}
                        props={props}
                        setSavedEmail={setSavedEmail}
                        setSavedFirstName={setSavedFirstName}
                        setSavedLastName={setSavedLastName}
                        setSavedPhoneNumber={setSavedPhoneNumber}
                     />
                  ),
                  4: (
                     <PatientLogin
                        nextStepHandler={nextStep}
                        healthcareTitle={codeSent}
                        step={step}
                        setStep={setStep}
                        keyProvider={keyProvider}
                        setKeyProvider={setKeyProvider}
                        phoneNumber
                        classThird={"third-step"}
                        props={props}
                        otp
                        setSavedEmail={setSavedEmail}
                        setSavedFirstName={setSavedFirstName}
                        setSavedLastName={setSavedLastName}
                        setSavedPhoneNumber={setSavedPhoneNumber}
                     />
                  ),
               }[step]
            }
         </div>
      </div>
   );
};

export default PatientComponent;
