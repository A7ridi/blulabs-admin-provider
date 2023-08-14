import React, { useEffect } from "react";
import captureBtn from "../../images/capture.svg";
import crossBtn from "../../images/cross.svg";
export default function WebCam({ clickImage, getImage, close, setShowDP }) {
   useEffect(() => {
      startCamera();
      return () => {
         window.localStream && window.localStream.getVideoTracks()[0].stop();
      };
   }, []);

   const startCamera = async () => {
      let video = document.querySelector("#video");
      let click_button = document.querySelector("#click-photo");
      let canvas = document.querySelector("#canvas");

      let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = stream;
      window.localStream = stream;

      click_button.addEventListener("click", function () {
         canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
         let file = null;
         document.querySelector("#canvas").toBlob(function (blob) {
            file = new File([blob], "test.jpg", { type: "image/jpeg" });
            clickImage(file);
            stream.getTracks().forEach(function (track) {
               track.stop();
            });
         }, "image/jpeg");
      });
   };
   return (
      <div>
         <div className="relative" style={{ height: "450px" }}>
            <div className="round-border-m" style={{ position: "absolute", top: 10, right: 20, zIndex: "9" }}>
               <img id="click-photo-new" src={crossBtn} alt="cross" className="pointer " onClick={close} />
            </div>
            <video
               style={{ marginTop: "-11px", backgroundColor: "black" }}
               id="video"
               width="600"
               height="450"
               autoPlay
            ></video>

            <img
               id="click-photo"
               src={captureBtn}
               alt="capture"
               className="absolute pointer "
               style={{ bottom: 66, left: "45.99%" }}
            />
         </div>
         <div className="flex-center flex-column">
            <div style={{ fontSize: "17px", color: "black", paddingBottom: "5px" }}>or</div>
            <button
               onClick={() => {
                  document.getElementById("input-photo-upload") &&
                     document.getElementById("input-photo-upload").click();
                  setShowDP(false);
               }}
               className=" btn-default-capture round-border-s text-normal"
               id="click-photo-btn"
            >
               upload
            </button>
            <input
               id="input-photo-upload"
               style={{ width: 0, height: 0, visibility: "hidden" }}
               type="file"
               onChange={(e) => getImage(e)}
               accept="image/*"
            />
         </div>

         <br />
         <canvas id="canvas" style={{ visibility: "hidden", position: "absolute" }} width="320" height="240"></canvas>
      </div>
   );
}
