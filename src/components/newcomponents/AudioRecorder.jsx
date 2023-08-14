import React, { memo, useState, useEffect } from "react";
import Timer from "../../helper/Timer";
import Stopwatch from "../../components/newcomponents/stopwatch/stopwatch";
import { clearConsole } from "../../helper/CommonFuncs";

let rec;
let stream = null;
let audioFile = null;
// let audioPlayer = new Audio();
let counter = new Timer();
let timerLabel;
let data = [];

let startBtn;
let stopBtn;
let pauseBtn;

let animFrame;

export const Audio = (props) => (
   <audio
      controls
      className="shadow round-border-l"
      onError={() => {
         clearConsole();
      }}
      controlsList="nodownload"
      {...props}
   />
);

async function createNode(h) {
   let node = document.createElement("div");
   node.style.width = "8px";
   node.style.height = `${h}px`;
   node.className = "bg-primary rounded-top rounded-bottom m-3 float-left flex-shrink-0";

   let visualizer = document.getElementsByClassName("visualizer-div")[0];
   visualizer && visualizer.appendChild(node);
   visualizer.scrollLeft += 100;
}

async function visualise() {
   if (!stream) return;
   var audioContext = new (window.AudioContext || window.webkitAudioContext)();
   var analyser = audioContext.createAnalyser();
   var dataArray = new Uint8Array(analyser.frequencyBinCount);

   if (stream instanceof Blob) {
      const arrayBuffer = await new Response(stream).arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(analyser);
      source.start(0);
   } else {
      var source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
   }

   analyser.fftSize = 64;
   var bufferLength = analyser.fftSize;
   var dataArray = new Uint8Array(bufferLength);

   var viz = () => {
      analyser.getByteFrequencyData(dataArray);
      let val = dataArray.reduce((prev, curr) => prev + curr) / 64;
      createNode(val);
      createNode(dataArray[12]);
      createNode(dataArray[21]);
      createNode(dataArray[42]);
      // for (let i = 0; i < 7; i++) {
      //   createNode(dataArray[i]);
      //   console.log(i);
      // }
      // for (let i = 6; i == 0; i--) {
      //   createNode(dataArray[i]);
      //   console.log("reverse " + i);
      // }
      // createNode(val);
      animFrame = requestAnimationFrame(viz);
   };
   viz();
}

function startRecorder(onstop) {
   navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
      // Collection for recorded data.
      stream = mediaStream;
      visualise();
      const recorder = new MediaRecorder(stream);

      rec = recorder;

      timerLabel = document.getElementById("time-label");

      rec.onstart = () => {
         // Empty the collection when starting recording.
         // timerLabel.innerText = "00:00:00";
         counter.start(() => {
            // timerLabel.innerText = counter.time();
         });
         data.length = 0;
      };

      // rec.onresume = (e) => {
      //   visualise();
      // };

      rec.ondataavailable = async (e) => {
         // Push recorded data to collection.
         data.push(e.data);
      };

      // Create a Blob when recording has stopped.
      rec.onstop = (e) => {
         counter.stop();
         // audioFile = new Blob(data, { type: "audio/wav" }); //old code line with 422 error issue.
         audioFile = new Blob(data, { type: "audio/mpeg" });

         let src = window.URL.createObjectURL(audioFile);

         stream.getTracks().forEach((track) => track.stop());

         const reader = new FileReader();
         reader.onload = function (evt) {
            onstop && onstop({ file: audioFile, mediaUrl: src });
         };
         reader.readAsDataURL(audioFile);
      };
      recorder.start(1);
   });
}

function AudioRecorder(props) {
   const { onStart, onStop, onPause, onResume } = props;
   const [state, setstate] = useState({
      isRecording: false,
      isPaused: false,
      isBlocked: false,
   });

   const [stopWatch, setStopWatch] = useState({
      start: false,
      pause: false,
      stop: false,
      play: false,
   });

   useEffect(() => {
      localStorage.removeItem("stopWatch");
      localStorage.removeItem("intervalStart");
      startBtn = document.getElementById("btn-start-video");
      startBtn.onclick = () => {
         onStart && onStart();
         startBtn.style.display = "none";
         stopBtn.style.display = "initial";
         pauseBtn.style.display = "initial";
         setstate({ ...state, isRecording: true, isPaused: false });
         setStopWatch({ start: true, pause: false, stop: false, play: false });
      };

      stopBtn = document.getElementById("btn-stop-video");
      stopBtn.onclick = () => {
         cancelAnimationFrame(animFrame);
         setstate({ ...state, isRecording: false, isPaused: false });
         setStopWatch({ start: false, pause: false, stop: true, play: false });
      };

      pauseBtn = document.getElementById("btn-pause-video");
      pauseBtn.onclick = () => {
         setstate({
            ...state,
            isPaused: rec.state === "recording",
            isRecording: true,
         });
         setStopWatch({
            start: false,
            pause: rec.state === "recording" ? true : false,
            stop: false,
            play: rec.state === "recording" ? false : true,
         });
         let stop = localStorage.getItem("intervalStart");
         if (stop && stop === "true") {
            localStorage.setItem("stopWatch", "true");
            localStorage.removeItem("intervalStart");
         }
         rec.state === "recording" ? onPause && onPause() : onResume && onResume();
         rec.state === "recording" ? rec.pause() : rec.resume();
      };
      return () => {
         cancelAnimationFrame(animFrame);
         stream && stream.getTracks().forEach((track) => track.stop());
      };
   }, []);

   useEffect(() => {
      if (!state.isRecording) {
         rec && rec.state !== "inactive" && rec.stop();
         startBtn.style.display = "initial";
         stopBtn.style.display = "none";
         pauseBtn.style.display = "none";
         return;
      }
      startRecorder(onStop);
   }, [state.isRecording]);

   return (
      <div className="bg-white w-100 h-100 position-relative">
         <div className="width-content border visualizer-div d-flex align-items-center overflow-auto  w-100 ratio-21-9  round-border-s scroll-bar-audio-recorder">
            {!state.isRecording ? <div style={{ height: "5px", width: "100%" }} className="bg-prime" /> : null}
         </div>
         <div className="footer-div mb-1 flex-center flex-column record-button-audio ">
            <div>
               <Stopwatch stopWatch={stopWatch} />
            </div>
            <div className="text-small mb-2">Click to {!state.isRecording ? "Start" : "Stop"} Recording</div>

            <div>
               <img
                  id="btn-start-video"
                  className="p-2 h-xsmall ratio-eq bg-danger rounded-circle pointer"
                  src="/assets/images/newimages/recording-icons/mic-icon-white.svg"
                  alt=""
               />
               <img
                  style={{ border: "2px solid #c4c4c4", objectFit: "none" }}
                  className="p-2 h-xsmall ratio-eq rounded-circle pointer mx-4"
                  id="btn-pause-video"
                  src={`/assets/images/newimages/recording-icons/${
                     state.isPaused ? "play-icon-grey" : "rec-pause-grey"
                  }.svg`}
                  alt=""
               />
               <img
                  style={{ border: "2px solid #c4c4c4" }}
                  id="btn-stop-video"
                  className="rounded-circle h-xsmall ratio-eq pointer"
                  src="/assets/images/newimages/recording-icons/rec-stop.svg"
                  alt=""
               />
            </div>
         </div>
      </div>
   );
}

export default memo(AudioRecorder);
