import React, { memo, useState, useMemo, useRef, useEffect } from "react";
import VideoRecorder, { Video } from "../../../../components/newcomponents/VideoRecorder";
import AudioRecorder, { Audio } from "../../../../components/newcomponents/AudioRecorder";
import SegmentView from "../../../../components/newcomponents/SegmentView/SegmentView";
import TitleTextView from "../../../../components/newcomponents/TitleTextView";
import ScreenRecording from "../../../../layout/ScreenRecording";
import { fileTypes, isSafari } from "../../../../helper/CommonFuncs";
import { MentionsInput, Mention } from "react-mentions";
import "../../../../MentionInput.css";
import crossButton from "../../../../images/crossButton.svg";

const ProgressBar = ({ onCancel }) => {
   return (
      <div className="flex-center w-100 mt-3">
         <progress style={{ width: "100%", height: "20px" }} id="create-content-progress-div" value={0} max="100" />

         <img className="h-2xs ratio-eq pointer p-1 ml-3" src="/assets/images/cross.png" alt="" onClick={onCancel} />
      </div>
   );
};

export const MediaView = memo(({ showProgress, media, onRecordTap, onMediaChange, onCancel, shareAgain }) => {
   const getMediaTypeRealTime = (type) => {
      if (type?.includes("application/pdf"))
         return (
            <img
               className="img-media-thumb-pdf"
               alt="pdf-img"
               title="pdf"
               src={"/assets/images/newimages/content-icons/pdf-icon.svg"}
            />
         );
      else if (type?.includes("image")) {
         return <img className="img-media-thumb" width="100%" height="100%" src={media.mediaUrl} alt="" />;
      } else if (type?.includes("video")) {
         return <Video width="400" height="100%" className="ratio-16-9" controls src={media.mediaUrl} />;
      } else if (type?.includes("audio")) {
         return <div className="h-100 ratio-16-9 bg-black" />;
      } else if (type?.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
         return (
            <img
               className="img-media-thumb-document"
               alt="pdf-img"
               title="pdf"
               src={"/assets/images/newimages/content-icons/xls-icon.svg"}
            />
         );
      } else {
         return (
            <img
               className="img-media-thumb-document"
               alt="pdf-img"
               title="pdf"
               src={"/assets/images/newimages/content-icons/document-icon.svg"}
            />
         );
      }
   };
   let type = media?.file?.type?.toLowerCase();
   const getMediaView = getMediaTypeRealTime(type);
   return (
      <div className="MediaView w-100 flex-center flex-column h-100">
         <div style={{ height: 260 }} className="flex-center w-100 border  round-border-s">
            {media?.file ? (
               <div style={{ position: "relative" }} className="flex-center h-100 flex-grow-1">
                  <button
                     onClick={shareAgain}
                     className={
                        media?.file?.type?.toLowerCase()?.includes("video")
                           ? "cross-button-video"
                           : "cross-button-media"
                     }
                  >
                     <img src={crossButton} alt="cross-button" />
                  </button>
                  {getMediaView}
               </div>
            ) : (
               <div className="position-absolute text-grey3 w-75 d-inline-flex flex-column justify-content-center align-items-center font-weight-bold h-100 text-small">
                  {
                     <>
                        <img className="mr-5" src="/assets/images/newimages/lib-upload-cloud.svg" alt="" />
                        <div>
                           Drag & Drop your files here , or <span className="text-primary2">browse</span>
                        </div>
                     </>
                  }
               </div>
            )}
            {media.file?.type.includes("audio") ? (
               <audio className="position-absolute shadow" controls autoPlay>
                  <source src={media.mediaUrl} type="audio/mpeg" />
               </audio>
            ) : null}
            {!media?.file && (
               <input
                  accept={fileTypes}
                  onDrop={onMediaChange}
                  type="file"
                  className="position-absolute w-100 h-100 opacity-0 pointer"
                  onChange={onMediaChange}
               />
            )}
         </div>
         {showProgress ? <ProgressBar onCancel={onCancel} /> : null}
      </div>
   );
});

export const MessageView = (props) => {
   const { hashTags, mentions, shortcuts, onSelect, onChange, value } = props;
   return (
      <div className="MediaView w-100 h-100 flex-center flex-column ">
         <TitleTextView
            titleclass="mb-3"
            title="Message"
            containerclass="h-100"
            renderInput={() => (
               <MentionsInput
                  markup="{{__id__}}"
                  displayTransform={(id) => `<<${id}>>`}
                  className="mention-input-message default-border round-border-s "
                  value={value}
                  singleLine={false}
                  allowSuggestionsAboveCursor={false}
                  placeholder="e.g. Your test result review"
                  onSelect={onSelect}
                  onChange={onChange}
               >
                  <Mention
                     trigger={/(([A-Za-z0-9_.]+$))/}
                     data={(search) => {
                        return [];
                     }}
                     appendSpaceOnAdd={true}
                  />
               </MentionsInput>
            )}
         />
      </div>
   );
};

export const ScreenRecordView = memo(({ media, recordingStop, onCancel, showProgress, shareAgain }) => {
   const [state, setState] = useState({
      isRecording: false,
      recordFlag: false,
   });
   const [firstTimeVideo, setFirstTimeVideo] = useState(true);

   const videoRef = useRef();
   const [progress, setProgress] = useState(0);

   useEffect(() => {
      document.getElementById("patient-list").style.opacity = state.isRecording && "0";
   }, [state.recordFlag]);

   const handleProgress = (e) => {
      if (isNaN(e.target.duration))
         // duration is NotaNumber at Beginning.
         return;
      setProgress((e.target.currentTime / e.target.duration) * 100);
   };

   return (
      <div className="ScreenRecordView w-100 flex-center flex-column h-100">
         <div
            style={{ height: 260, position: "relative" }}
            className=" flex-center w-100 flex-grow-1 h-2xl  round-border-s border"
         >
            {media.file ? (
               <>
                  <button
                     onClick={() => {
                        shareAgain();
                        setFirstTimeVideo(true);
                     }}
                     className="cross-button"
                  >
                     <img src={crossButton} alt="cross-button" />
                  </button>

                  {isSafari() ? (
                     <video
                        height="100%"
                        controls
                        className="ratio-16-9"
                        preload="metadata"
                        src={media.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                     >
                        Your browser does not support the video tag.
                     </video>
                  ) : (
                     <video
                        height="100%"
                        controls
                        className="ratio-16-9"
                        id={`${firstTimeVideo && "video"}`}
                        src={media.mediaUrl}
                        onEnded={() => {
                           setFirstTimeVideo(false);
                        }}
                     />
                  )}
               </>
            ) : (
               <div className="position-absolute text-grey3 w-75 flex-center flex-column font-weight-bold text-small">
                  <img src="/assets/images/newimages/monitor-icon.svg" alt="" />
                  <div className="m-4">Start Screen Sharing</div>
                  <ScreenRecording
                     startRecod={(rec) => setState({ ...state, isRecording: rec, recordFlag: !state.recordFlag })}
                     downloadBlob={recordingStop}
                  />
               </div>
            )}
         </div>
         {showProgress ? <ProgressBar onCancel={onCancel} /> : null}
      </div>
   );
});

export const LibraryView = () => {
   return (
      <div className="ScreenRecordView w-100 flex-center flex-column">
         <SegmentView
            className="text-small w-50"
            options={[
               {
                  text: "Documents",
                  id: 1,
               },
               {
                  text: "Tags",
                  id: 2,
               },
            ]}
         />
         <input
            placeholder="Search"
            className="w-large bg-light-grey-50 round-border-m h-xsmall no-border p-3 text-normal my-4"
         />
      </div>
   );
};

export const VideoRecordView = memo((props) => {
   const { onSave } = props;
   const [state, setstate] = useState({
      file: null,
      mediaUrl: null,
   });
   return (
      <AudVidView
         state={state}
         title="Record Video"
         view={() => {
            return state.file ? (
               <Video style={{ width: "446px" }} className="bg-black round-border-s" controls>
                  <source src={state.mediaUrl} type={state.file?.type}></source>
               </Video>
            ) : (
               <VideoRecorder containerclass="round-border-s" onStop={(obj) => onSave && onSave(obj)} {...props} />
            );
         }}
         onRecord={() => setstate({ file: null, mediaUrl: null })}
         onSave={() => onSave && onSave(state)}
      />
   );
});

export const AudioPlaybackView = (props) => {
   return (
      <div className="w-100 h-100 flex-center bg-light-blue flex-column p-4">
         <img className="w-85 h-100 mb-5 px-5" src="/assets/images/newimages/recording-icons/visualizer.svg" alt="" />
         <Audio src={props.src} autoPlay={props.isPreview} />
      </div>
   );
};

export const AudioRecordView = memo((props) => {
   const { onSave } = props;
   const [state, setstate] = useState({
      file: null,
      mediaUrl: null,
   });
   return (
      <AudVidView
         state={state}
         title="Record Audio"
         view={() => {
            return state.file ? (
               <div className="round-border-m w-100 ratio-16-9">
                  <AudioPlaybackView src={state.mediaUrl} />
               </div>
            ) : (
               <AudioRecorder onStop={(obj) => onSave && onSave(obj)} />
            );
         }}
         onRecord={() => setstate({ file: null, mediaUrl: null })}
         onSave={() => onSave && onSave(state)}
      />
   );
});

const AudVidView = ({ state, title, view, onRecord, onSave }) => {
   return (
      <div className="w-100 bg-white flex-center flex-column round-border-m overflow-scroll">
         {/* <div style={{ marginTop: "-30px", marginBottom: "10px" }} className="w-100 text-large text-center font-weight-bold">
        {title}
      </div> */}
         {view()}
         {/* {state.file ? (
        <div className="action-div flex-center h-small mt-5">
          <button className="w-xsmall h-100 bg-disabled text-black font-weight-bold text-small round-border-s flex-center mx-3" onClick={onRecord}>
            Re-Record
          </button>
          <button className="w-xsmall h-100 btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3" onClick={onSave}>
            Save
          </button>
        </div>
      ) : null} */}
      </div>
   );
};
