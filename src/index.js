import React from "react";
import ReactDOM from "react-dom";
import Root from "./Root";
import * as serviceWorker from "./serviceWorker";
import Swal from "sweetalert2";
import "./css/App.css";
import "./css/index.css";
import "./css/responsive.css";
import "./css/style.css";
import "./css/styles.css";
import "./css/variables.css";
import { Provider } from "react-redux";
import { store } from "./redux/store";

window.addEventListener("load", function () {
   function updateOnlineStatus(event) {
      var condition = navigator.onLine ? "online" : "offline";
      if (condition === "offline") {
         let timerInterval;
         let time = 10000;
         Swal.fire({
            title: "There is a problem with your internet connection.",
            html: "This alert will close in <strong></strong> seconds.<br/><br/>",
            timer: time,
            onBeforeOpen: () => {
               Swal.showLoading();
               timerInterval = setInterval(() => {
                  let increaseTime = "";
                  if (Swal.getTimerLeft() < 500) {
                     increaseTime = time + 5000;
                     Swal.increaseTimer(increaseTime);
                     //increaseTime = +5000;
                  }

                  Swal.getContent().querySelector("strong").textContent = (Swal.getTimerLeft() / 1000).toFixed(0);
               }, 100);
            },
            onClose: () => {
               clearInterval(timerInterval);
            },
         });
         //window.location.replace('/network_error')
      } else {
         // window.location.replace('/')
         window.location.reload();
      }
   }
   window.addEventListener("online", updateOnlineStatus);
   window.addEventListener("offline", updateOnlineStatus);
});
ReactDOM.render(
   <Provider store={store}>
      <Root />
   </Provider>,
   document.getElementById("root")
);
serviceWorker.unregister();
