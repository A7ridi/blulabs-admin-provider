//useCallback
// /*global chrome*/
import React, { useState, useEffect, useCallback, useRef } from "react";
import Video from "twilio-video";
import Participant from "./Participant";
import swal from "sweetalert";
import { first } from "lodash";

function reverseString(str) {
   if (str) {
      return str.split("").join("");
   } else {
      return "";
   }
}

var browserName = false;
var screenTrackNew;
var stopShare;
const Room = ({ roomName, token, handleLogout }) => {
   const [room, setRoom] = useState(null);
   const [participants, setParticipants] = useState([]);
   const [mikeVoice, setMikeVoice] = useState([]);
   const [remoteVideo, setRemoteVodeo] = useState([]);
   const [callConnection, setCallConnection] = useState([]);
   const [localVideoTrack, setlocalVideoTrack] = useState([]);
   //const [browserName, setBrowserName] = useState(false);

   const callRef = useRef();

   const isChrome = () => {
      return "chrome" in window;
   };

   const canScreenShare = () => {
      return isChrome || isFirefox;
   };

   useEffect(() => {
      browserName = isChrome() ? false : true;
      var localRoom = roomName || "";
      async function doSubmit() {
         setMikeVoice(true);
         setRemoteVodeo(true);
         setCallConnection(true);
         const participantConnected = (participant) => {
            setCallConnection(false);
            window.participant = true;
            var d = new Date();
            window.startTime = d.getTime();
            setParticipants((prevParticipants) => [...prevParticipants, participant]);
         };

         const participantDisconnected = (participant) => {
            setParticipants((prevParticipants) => prevParticipants.filter((p) => p !== participant));
            handleLogout(localRoom);
         };
         Video.connect(token, {
            name: roomName,
            audio: true,
            video: {
               name: "video-track",
            },
         })
            .then((roomN) => {
               roomN.localParticipant.videoTracks.forEach((publication) => {
                  setlocalVideoTrack(publication.track);
               });
               localRoom = roomN;
               setRoom(roomN);
               window.local = roomN;
               roomN.on("participantConnected", participantConnected);
               roomN.on("participantDisconnected", participantDisconnected);
               //room.on('participantReject', participantReject)
               roomN.participants.forEach(participantConnected);
            })
            .catch(function (error) {
               console.log("Could not connect to Twilio: " + error.message);
            });

         return () => {
            setRoom((currentRoom) => {
               if (currentRoom && currentRoom.localParticipant.state === "connected") {
                  currentRoom.localParticipant.tracks.forEach(function (trackPublication) {
                     trackPublication.track.stop();
                  });

                  currentRoom.disconnect();
                  return null;
               } else {
                  return currentRoom;
               }
            });
         };
      }
      doSubmit();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [roomName, token]);

   const remoteParticipants = participants.map((participant) => (
      <Participant key={participant.sid} participant={participant} />
   ));

   const handleVoice = useCallback(
      (event) => {
         setMikeVoice(!mikeVoice);
         if (mikeVoice) {
            window.local &&
               window.local.localParticipant.audioTracks.forEach((publication) => {
                  publication.track.disable();
               });
         } else {
            window.local &&
               window.local.localParticipant.tracks.forEach((publication) => {
                  publication.track.enable();
               });
         }
      },
      [mikeVoice]
   );

   const handleVideo = useCallback(
      (event) => {
         setRemoteVodeo(!remoteVideo);
         if (remoteVideo) {
            window.local.localParticipant.videoTracks.forEach((publication) => {
               publication.track.disable();
            });
         } else {
            //stopTrack("screenTrack")
            window.local.localParticipant.videoTracks.forEach((publication) => {
               publication.track.enable();
            });
         }
      },
      [remoteVideo]
   );

   const callNotReceived = useCallback((event) => {
      if (callConnection) {
         swal(localStorage.getItem("patientNameVideo") + " didn't accept your call, please try after some time.").then(
            (value) => {
               localStorage.removeItem("videoCallToken");
               localStorage.removeItem("patientNameVideo");
               localStorage.removeItem("teleHealthID");
               localStorage.removeItem("videoPatientID");
               window.close();
            }
         );
      }
   });

   var activeRoom = room;
   var screenTrack;

   const isFirefox = () => {
      //setBrowserName(true)
      browserName = true;
      var mediaSourceSupport = !!navigator.mediaDevices.getSupportedConstraints().mediaSource;
      var matchData = navigator.userAgent.match(/Firefox\/(\d+)/);
      var firefoxVersion = 0;
      if (matchData && matchData[1]) {
         firefoxVersion = parseInt(matchData[1], 10);
      }
      return mediaSourceSupport && firefoxVersion >= 52;
   };

   const getUserScreen = async () => {
      if (!canScreenShare()) {
         return;
      }
      if (isChrome()) {
         try {
            browserName = false;
            if (!screenTrack) {
               const stream = await navigator.mediaDevices.getDisplayMedia({
                  video: true,
               });
               const newScreenTrack = first(stream.getVideoTracks());
               stopShare = newScreenTrack;
               document.getElementById("button-share-screen-test").style.display = "none";
               document.getElementById("button-unshare-screen-test").style.display = "inline";
               room.localParticipant.publishTrack(newScreenTrack);
               room.localParticipant.unpublishTrack(localVideoTrack);
               handleVideo();
            } else {
               room.localParticipant.unpublishTrack(screenTrack);
               room.localParticipant.publishTrack(localVideoTrack);
               stopScreenTrack();
            }
         } catch (error) {
            console.log(error, "error");
            stopScreenTrack();

            // this.setState({
            //     errorMessage: error.message
            // });
         }
         // return new Promise((resolve, reject) => {
         //     const request = {
         //         sources: ['screen']
         //     };
         //     chrome.runtime.sendMessage(extensionId, request, response => {
         //         if (response && response.type === 'success') {
         //             resolve({ streamId: response.streamId });
         //         } else {
         //             reject(new Error('Could not get stream'));
         //         }
         //     });
         // }).then(response => {
         //     return navigator.mediaDevices.getUserMedia({
         //         video: {
         //             mandatory: {
         //                 chromeMediaSource: 'desktop',
         //                 chromeMediaSourceId: response.streamId
         //             }
         //         }
         //     });
         // });
      } else if (isFirefox()) {
         return navigator.mediaDevices.getUserMedia({
            video: {
               mediaSource: "screen",
            },
         });
      }
   };

   const stopScreenTrack = () => stopTrack("screenTrack");

   const stopTrack = (trackName) => {
      if (stopShare) {
         room.localParticipant.publishTrack(localVideoTrack);
         room.localParticipant.unpublishTrack(stopShare);
         document.getElementById("button-share-screen-test").style.display = "inline";
         document.getElementById("button-unshare-screen-test").style.display = "none";
         handleVideo();
      }
   };

   //if (browserName) {

   if (document.getElementById("button-share-screen")) {
      document.getElementById("button-share-screen").onclick = function () {
         getUserScreen().then(function (stream) {
            console.log(stream, "stream");
            handleVideo();

            screenTrackNew = stream.getVideoTracks()[0];
            activeRoom.localParticipant.publishTrack(screenTrackNew);
            activeRoom.localParticipant.unpublishTrack(localVideoTrack);
            document.getElementById("button-share-screen").style.display = "none";
            document.getElementById("button-unshare-screen").style.display = "inline";
         });
      };
   }

   if (document.getElementById("button-unshare-screen")) {
      document.getElementById("button-unshare-screen").onclick = function () {
         activeRoom.localParticipant.unpublishTrack(screenTrackNew);
         activeRoom.localParticipant.publishTrack(localVideoTrack);
         screenTrackNew = null;
         document.getElementById("button-share-screen").style.display = "inline";
         document.getElementById("button-unshare-screen").style.display = "none";
         handleVideo();
      };
   }

   const hideBeforeCall = (status) => {
      if (status) {
         document.getElementById("button-share-screen-before").style.display = "none";
         document.getElementById("button-unshare-before").style.display = "inline";
      } else {
         document.getElementById("button-share-screen-before").style.display = "inline";
         document.getElementById("button-unshare-before").style.display = "none";
      }
   };

   return (
      <div className="room room-full-height">
         <span style={{ display: "none" }} onClick={callNotReceived} ref={callRef}>
            Button
         </span>
         {callConnection ? (
            <div className="mute-dis-buttton">
               {mikeVoice ? (
                  <button className="pre-mute" onClick={handleVoice}>
                     Mute
                  </button>
               ) : (
                  <button className="pre-unmute" onClick={handleVoice}>
                     Mute
                  </button>
               )}
               {remoteVideo ? (
                  <button className="pre-on-video" onClick={handleVideo}>
                     Video
                  </button>
               ) : (
                  <button className="pre-block-video" onClick={handleVideo}>
                     Block Video
                  </button>
               )}
               <button className="close" title="Disconnect" onClick={() => handleLogout(room)}>
                  Disconnet
               </button>
            </div>
         ) : (
            <div className="mute-dis-buttton">
               {mikeVoice ? (
                  <button className="pre-mute" onClick={handleVoice}>
                     Mute
                  </button>
               ) : (
                  <button className="pre-unmute" onClick={handleVoice}>
                     Mute
                  </button>
               )}
               {remoteVideo ? (
                  <button className="pre-on-video" onClick={handleVideo}>
                     Video
                  </button>
               ) : (
                  <button className="pre-block-video" onClick={handleVideo}>
                     Block Video
                  </button>
               )}
               <button className="close" title="Disconnect" onClick={() => handleLogout(room)}>
                  Disconnet
               </button>
            </div>
         )}

         <div className="txt">{localStorage.getItem("patientNameVideo")}</div>
         <div className="remote-participants">
            <div className="participants-wrap">
               {callConnection ? (
                  <div className="box-icon">
                     <p>
                        {reverseString(
                           localStorage
                              .getItem("patientNameVideo")
                              ?.match(/\b(\w)/g)
                              ?.join("")
                        )}
                     </p>
                  </div>
               ) : (
                  ""
               )}
               {remoteParticipants}
            </div>
         </div>
         <div className="local-participant">
            {room ? <Participant key={room.localParticipant.sid} participant={room.localParticipant} /> : ""}
         </div>
      </div>
   );
};

export default Room;
