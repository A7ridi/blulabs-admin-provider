import React, { memo, useState, useEffect } from "react";
import { clearConsole } from "../../helper/CommonFuncs";
// import "./VideoRecorder.css";

export const Video = (props) => {
   return (
      <video
         style={{
            transform: props.mirrored ? "rotateY(180deg)" : null,
            WebkitTransform: props.mirrored ? "rotateY(180deg)" : null,
            MozTransform: props.mirrored ? "rotateY(180deg)" : null,
            backgroundColor: "black",
         }}
         // controls={state.file ? "controls" : ""}
         onError={() => {
            clearConsole();
         }}
         controlsList="nodownload"
         disablePictureInPicture
         {...props}
      >
         {props.children}
      </video>
   );
};

let video;
let rec;
let stream;
let data = [];

function setPreview(callback) {
   // return;
   navigator.mediaDevices
      .getUserMedia({
         video: true,
         audio: true,
      })
      .then((mediaStream) => {
         // Collection for recorded data.
         stream = mediaStream;
         const recorder = new MediaRecorder(stream);
         rec = recorder;

         video = document.getElementById("video-view");
         if (video) {
            video.srcObject = stream;
            video.src = null;
            video.muted = true;
            video.onloadedmetadata = (e) => video.play();
         }

         //   completion();
         callback && callback();
      });
}

function VideoRecorder(props) {
   const { videoView, containerclass, videoclass, playBtnclass, stopBtnclass, onStart, onStop, onPause, onResume } =
      props;
   const [state, setstate] = useState({
      isRecording: false,
      isPaused: false,
   });
   useEffect(() => {
      setPreview(() => {
         rec.ondataavailable = (e) => {
            data.push(e.data);
         };
         rec.onstart = (e) => {
            setstate({ ...state, isRecording: true });
            onStart && onStart();
            data.length = 0;
         };
         rec.onpause = () => {
            setstate({ ...state, isPaused: true, isRecording: true });
            onPause && onPause();
         };
         rec.onresume = (e) => {
            setstate({ ...state, isPaused: false, isRecording: true });
            onResume && onResume();
         };
         rec.onstop = (e) => {
            setstate({
               ...state,
               isRecording: false,
               isPaused: false,
            });
            video.srcObject = null;
            const blob = new Blob(data, { type: "video/webm" });
            video.src = URL.createObjectURL(blob);
            stream.getTracks().forEach((track) => track.stop());

            const reader = new FileReader();
            reader.onload = function (evt) {
               onStop && onStop({ file: blob, mediaUrl: video.src });
            };
            reader.readAsDataURL(blob);
         };
         let startBtn = document.getElementById("btn-start-video");
         if (startBtn) {
            startBtn.onclick = () => rec.start();
         }

         let stopBtn = document.getElementById("btn-stop-video");
         if (stopBtn) {
            stopBtn.onclick = () => rec.stop();
         }

         let pauseBtn = document.getElementById("btn-pause-video");
         if (pauseBtn) {
            pauseBtn.onclick = () => {
               if (rec.state === "recording") rec.pause();
               else rec.resume();
            };
         }
      });
      return () => {
         stream && stream.getTracks().forEach((track) => track.stop());
      };
   }, []);

   return (
      <div className="w-100 h-100">
         {props.children ? (
            props.children
         ) : videoView ? (
            videoView
         ) : (
            <div
               className={`video-recorder-content flex-center w-100 h-100 overflow-hidden bg-black ${containerclass}`}
            >
               <Video style={{ maxHeight: 260 }} className={`video-tag w-100 h-100 ${videoclass}`} id="video-view" />
               <div style={{ bottom: "20px" }} className="position-absolute flex-center w-100">
                  <button
                     style={{
                        display: !state.isRecording && !state.isPaused ? "flex" : "none",
                     }}
                     className={`flex-center ${playBtnclass} mx-4`}
                     id="btn-start-video"
                  >
                     <img src="/assets/images/newimages/recording-icons/video-rec-start.svg" alt="" />
                  </button>
                  <button
                     style={{
                        display: state.isRecording ? "flex" : "none",
                     }}
                     className={`flex-center ${playBtnclass} mx-4`}
                     id="btn-pause-video"
                  >
                     <img
                        src={`/assets/images/newimages/recording-icons/${state.isPaused ? "resume" : "rec-pause"}.svg`}
                        alt=""
                     />
                  </button>
                  <button
                     style={{
                        display: state.isRecording ? "flex" : "none",
                     }}
                     className={`flex-center ${stopBtnclass} mx-4`}
                     id="btn-stop-video"
                  >
                     <img src="/assets/images/newimages/recording-icons/rec-stop.svg" alt="" />
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default memo(VideoRecorder);
