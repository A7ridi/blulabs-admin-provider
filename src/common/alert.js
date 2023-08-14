import swal from "@sweetalert/with-react";
import React from "react";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../components/newcomponents/ToastView";
import AlertView from "../components/newcomponents/AlertView";
import { blueBtnCls, greyBtnCls } from "./constants";

const error = "error";

const showSwal = (
   titleText,
   contentText,
   callback = () => {},
   showButton = true,
   showClose = false,
   id = "alert-confirm-button"
) => {
   if (showButton)
      return swal(
         <AlertView
            showClose={showClose}
            titleText={titleText}
            contentText={contentText}
            onClose={() => {
               swal.close();
            }}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === id) {
                  callback();
               }
            }}
            buttons={showButton ? [{ className: blueBtnCls, text: "OK", id }] : []}
         />,
         { buttons: false }
      );
   else
      swal(
         <AlertView
            showClose={showClose}
            titleText={titleText}
            contentText={contentText}
            onClose={() => {
               swal.close();
            }}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  callback();
               }
            }}
         />,
         { buttons: false }
      );
};

const showSwal2 = (
   titleText,
   contentText,
   callback = () => {},
   showClose = false,
   boldText = "",
   contentText2 = "",
   buttons = [
      {
         className: `${greyBtnCls} mr-4`,
         text: "Cancel",
         id: "alert-cancel-button",
      },
      { className: blueBtnCls, text: "Confirm", id: "alert-confirm-button" },
   ]
) => {
   return swal(
      <AlertView
         showClose={showClose}
         titleText={titleText}
         contentText={contentText}
         boldText={boldText}
         contentText2={contentText2}
         onClose={() => swal.close()}
         onAction={(btnData) => {
            swal.close();
            if (btnData.id === "alert-confirm-button") {
               callback();
            }
         }}
         buttons={buttons}
      />,
      { buttons: false }
   );
};

const ShowAlert = (text, type) => toast(<ToastView text={text} type={type} />, defaultToastProps);

export { showSwal, showSwal2, ShowAlert, error };
