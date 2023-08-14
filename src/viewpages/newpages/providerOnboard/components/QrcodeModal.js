import React, { useEffect, useState } from "react";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";
import QRCode from "react-qr-code";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import QrcodeScreen from "./QrcodeScreen";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import { error, ShowAlert } from "../../../../common/alert";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

const QrcodeModal = ({
   onClose,
   qrCodeText1,
   qrCodeText2,
   qrcode,
   isLoading,
   setIsLoading,
   savedEmail,
   savedFirstName,
   savedLastName,
   savedPhoneNumber,
   qrCodeScreenText,
}) => {
   const [showModal, setShowModal] = useState(false);
   const getLoginSystem = localStorage.getItem("providerLogin") === "true";
   const [loading, setLoading] = useState(true);

   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <div
               className="invite-patient-view col col-md-7 p-4 bg-white"
               style={{ maxWidth: "749.67px", height: "650px", borderRadius: "20px" }}
            >
               <div className="alert-title-div w-100 d-flex justify-content-end">
                  <h2 className={`text-black w-100 font-weight-normal text-center text-class`}>Verifying account</h2>
                  <button
                     className={`h1 m-0 h-100 flex-center pr-3 position-absolute x-button-class`}
                     onClick={onClose}
                  >
                     &times;
                  </button>
               </div>
               <div className="qrcode-modal-content">
                  <Avatar
                     //   src={imageSrc}
                     className={`flex-shrink-0`}
                     bgColor={window.initialColors[0]}
                     radius={60}
                     name={savedFirstName + " " + savedLastName}
                     qrcode
                  />
                  <h1 className="qrcode-name">{`${savedFirstName} ${savedLastName}`}</h1>
                  <h4 className="qrcode-email">{savedEmail}</h4>
                  <h4 className="qrcode-phone">
                     {getLoginSystem && "+1"}{" "}
                     {savedPhoneNumber
                        .replace(/\D+/g, "")
                        .substring(1)
                        .replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
                  </h4>

                  {qrcode && qrcode.length > 0 && (
                     <div className={`${loading ? "mt-3 loading-shade-qrcode qrcode-view" : "qrcode-img"}`}>
                        <img
                           id={pendoIds.providerQrCodeImage}
                           src={`https://chart.googleapis.com/chart?cht=qr&chl=${qrcode}&choe=UTF-8&chs=200x150`}
                           alt="qr-code"
                           onLoad={() => setLoading(false)}
                        />

                        {/* <QRCode value={qrcode} size={200} /> */}
                     </div>
                  )}

                  <h3 className="qrcode-text">{qrCodeText1}</h3>
                  <button
                     id={pendoIds.btnLinkHowQrCodeWorks}
                     className="qrcode-link"
                     onClick={() => {
                        // setIsLoading(true);
                        setShowModal(true);
                     }}
                  >
                     {qrCodeText2}
                  </button>

                  {showModal ? (
                     <ModalPopup id="provider-qrcode-modal" onModalTapped={() => setShowModal(false)}>
                        <QrcodeScreen
                           onClose={() => setShowModal(false)}
                           isLoading={isLoading}
                           qrCodeScreenText={qrCodeScreenText}
                        />
                     </ModalPopup>
                  ) : null}
               </div>
            </div>
         )}
      </>
   );
};

export default QrcodeModal;
