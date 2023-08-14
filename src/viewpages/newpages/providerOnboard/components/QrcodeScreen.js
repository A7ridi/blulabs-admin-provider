import React, { useEffect, useState } from "react";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import QrImg from "../../../../assets/QrImg.png";
import QrImg2 from "../../../../assets/QrImg2.png";
import QrImg3 from "../../../../assets/QrImg3.png";

const QrcodeScreen = ({ onClose, qrCodeScreenText, isLoading }) => {
   const [toggleState, setToggleState] = useState(1);

   const toggleTab = (index) => {
      setToggleState(index);
   };

   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <div
               className="invite-patient-view col col-md-7 p-4 bg-white round-border-m"
               style={{ maxWidth: "749.67px", height: "650px", borderRadius: "20px" }}
            >
               <div className="alert-title-div w-100 d-flex justify-content-center">
                  <div className="qrmodal-header">
                     <h2 className={`text-black w-100 font-weight-bold text-center text-class`}>{qrCodeScreenText}</h2>
                  </div>
               </div>
               <button className={`h1 pr-3 position-absolute x-button-class close-btn-modal`} onClick={onClose}>
                  &times;
               </button>
               <div className="qrcode-modal-content">
                  <div className="slideshow-container">
                     <div
                        className="mySlides fadeCircle"
                        style={{ display: `${toggleState === 1 ? "block" : "none"}` }}
                     >
                        <img src={QrImg} alt="1st qrcode screen" />
                     </div>
                     <div
                        className="mySlides fadeCircle"
                        style={{ display: `${toggleState === 2 ? "block" : "none"}` }}
                     >
                        <img src={QrImg2} alt="2nd qrcode screen" />
                     </div>
                     <div
                        className="mySlides fadeCircle"
                        style={{ display: `${toggleState === 3 ? "block" : "none"}` }}
                     >
                        <img src={QrImg3} alt="3rd qrcode screen" />
                     </div>
                  </div>

                  <div className="qrcode-dot">
                     <span className={`dot ${toggleState === 1 ? "active" : ""}`} onClick={() => toggleTab(1)}></span>
                     <span className={`dot ${toggleState === 2 ? "active" : ""}`} onClick={() => toggleTab(2)}></span>
                     <span className={`dot ${toggleState === 3 ? "active" : ""}`} onClick={() => toggleTab(3)}></span>
                  </div>

                  <button className="btn btn-blue-block got-it-btn" onClick={onClose}>
                     Got it
                  </button>
               </div>
            </div>
         )}
      </>
   );
};

export default QrcodeScreen;
