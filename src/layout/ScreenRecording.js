import React, { memo } from "react";

import useMediaRecorder from "@wmik/use-media-recorder";
import { showSwal } from "../common/alert";

const ScreenRecording = ({ downloadBlob, startRecod }) => {
   let { mediaBlob, stopRecording, startRecording, liveStream, error, status, getMediaStream } = useMediaRecorder({
      recordScreen: true,
      blobOptions: { type: "video/webm" },
      mediaStreamConstraints: { audio: true, video: true },
   });

   if (mediaBlob) {
      downloadBlob(mediaBlob);
   }
   if (error) {
      console.log(error);
      showSwal("Please allow permission");
   }

   if (status === "failed") {
      stopRecording();
   }
   if (status === "ready") {
      startRecording();
   }

   if (liveStream) {
      startRecod(true);
      liveStream.getTracks().forEach(function (track) {
         track.onended = stopRecording;
      });
   }

   function clickRecording() {
      getMediaStream();
   }

   const stopRecord=()=>{
      stopRecording()
   }
   if(liveStream){
      liveStream.oninactive = ()=>{
         document.getElementById("patient-list").style.opacity="1"
      }
   }

   return (
      <>
         {!liveStream ? (
            <button
               type="button"
               className="screen-record-button w-2xs h-2xs btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3"
               onClick={clickRecording}
            >
               Start
            </button>
         ) : (
            <button
               type="button"
               className="screen-record-button w-2xs h-2xs btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3"
               onClick={stopRecord}
            >
               Stop
            </button>
         )}
      </>
   );
};

export default memo(ScreenRecording, () => true);
