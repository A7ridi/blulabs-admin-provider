import React, { useEffect, useState } from "react";

export default function Stopwatch({ stopWatch }) {
   let startTime;
   let elapsedTime = 0;
   var timerInterval = null;

   const [time, setTime] = useState("00:00:00");
   const [startTimeLocal, setStartTime] = useState(null);

   useEffect(() => {
      if (stopWatch.start) {
         start();
      }
      if (stopWatch.play) {
         start(true);
      }
      if (stopWatch.stop) {
         setStartTime(null);
         reset();
      }
   }, [stopWatch]);

   const timeToString = (time) => {
      let diffInHrs = time / 3600000;
      let hh = Math.floor(diffInHrs);

      let diffInMin = (diffInHrs - hh) * 60;
      let mm = Math.floor(diffInMin);

      let diffInSec = (diffInMin - mm) * 60;
      let ss = Math.floor(diffInSec);

      let diffInMs = (diffInSec - ss) * 100;
      let ms = Math.floor(diffInMs);

      let formattedMM = mm.toString().padStart(2, "0");
      let formattedSS = ss.toString().padStart(2, "0");
      let formattedMS = ms.toString().padStart(2, "0");

      return `${formattedMM}:${formattedSS}:${formattedMS}`;
   };
   const print = (txt) => {
      setTime(txt);
   };
   function start(val = false) {
      localStorage.setItem("intervalStart", "true");
      if (!val) {
         startTime = Date.now() - elapsedTime;
      } else {
         startTime = Date.now() - startTimeLocal;
      }
      timerInterval = setInterval(function printTime() {
         elapsedTime = Date.now() - startTime;

         print(timeToString(elapsedTime));

         let stop = localStorage.getItem("stopWatch");
         if (stop && stop === "true") {
            setStartTime(elapsedTime);
            clearInterval(timerInterval);
            localStorage.removeItem("stopWatch");
            localStorage.removeItem("intervalStart");
         }
      }, 10);
   }

   const reset = () => {
      localStorage.setItem("stopWatch", "true");
   };

   return (
      <div>
         <span id="display">{time}</span>
      </div>
   );
}
