import React, { memo, useEffect } from "react";
import ReactDOM from "react-dom";
import { v4 as uuid } from "uuid";

const modalRoot = document.getElementById("portal");

function ModalPopup(props) {
   const { id = "enter-action-button", className = "", isReferralView = false.valueOf, withdrawAction = true } = props;
   const modalId = uuid();
   useEffect(() => {
      let body = document.querySelector("body");
      body.style.overflow = "hidden";
      if (withdrawAction) {
         window.addEventListener("keypress", onKeyPress);
      }

      return () => {
         if (withdrawAction) {
            window.removeEventListener("keypress", onKeyPress);
         }

         let popup = document.getElementsByClassName("ModalPopup");
         if (popup.length > 0) return;
         body.style.overflow = "initial";
      };
   }, []);

   const onKeyPress = (e) => {
      if (e.key === "Enter") {
         document.getElementById(id) && document.getElementById(id).click();
      }
   };
   return ReactDOM.createPortal(
      <div
         id={modalId}
         style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 3,
            overflow: "hidden",
            backgroundColor: "rgba(79, 79, 79, 0.31)",
            ...props.styles,
            overflowY: isReferralView && "auto",
         }}
         className={`ModalPopup flex-center ${className}`}
         onMouseDown={(e) => {
            if (e.target.classList.contains("ModalPopup")) {
               e.stopPropagation();
               props.onModalTapped && props.onModalTapped();
            }
         }}
      >
         {props.children}
      </div>,
      modalRoot
   );
}
export default memo(ModalPopup);
