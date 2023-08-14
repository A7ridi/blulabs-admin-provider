import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./VideoRecorder.css";
import PlayPauseButton from "../PlayPauseButton";
import * as dashboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Timer from "../../helper/Timer";

let rec = null;
let stream = null;
let data = [];
let video;
let counter = new Timer();
let timerLabel;

let stopIcon = "/assets/images/video-stop-icon.png";

function setAndStartRecorder(completion = () => {}) {
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

      video = document.querySelector("video");
      video.srcObject = stream;
      video.src = null;
      video.muted = true;
      video.onloadedmetadata = (e) => video.play();

      completion();
    });
}

function VideoRecorder(props) {
  let { fileChanged } = props;
  let [state, setState] = useState({
    isRecording: false,
    file: null,
  });

  function setRecorder() {
    setAndStartRecorder(() => {
      timerLabel = document.getElementById("time-label");

      rec.addEventListener("start", (e) => {
        counter.start(() => {
          timerLabel.innerText = counter.time();
        });
        props.setVideoRecordingStatus({ isVideoRecording: true });
        data.length = 0;
      });

      rec.addEventListener("dataavailable", (e) => data.push(e.data));

      rec.addEventListener("stop", (e) => {
        counter.stop();
        video.srcObject = null;
        const blob = new Blob(data, { type: "video/webm" });
        video.src = URL.createObjectURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        setState({ ...state, file: blob });
        fileChanged(blob);
        props.setVideoRecordingStatus({ isVideoRecording: false });
      });
    });
  }

  useEffect(() => {
    setRecorder();
    return () => {
      if (rec.state !== "inactive") {
        rec.stop();
      } else {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <div className="VideoRecorder">
      {state.file ? (
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => {
            fileChanged(null);
            setState({ ...state, file: null });
            setRecorder();
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
      <video
        className="video-tag"
        id="vidSave"
        controls={state.file ? "controls" : ""}
        controlsList="nodownload"
      />
      {state.file ? null : (
        <div className="controls">
          <PlayPauseButton
            imageSrc={state.isRecording ? stopIcon : ""}
            recording={state.isRecording}
            className={state.isRecording ? "animate-max" : ""}
            click={() => {
              state.isRecording ? rec.stop() : rec.start(10);
              setState({ ...state, isRecording: !state.isRecording });
            }}
          />
          <label id="time-label">00:00:00</label>
        </div>
      )}
    </div>
  );
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setVideoRecordingStatus: dashboardActions.setVideoRecordingStatus,
    },
    dispatch
  );
};
// export default React.memo(VideoRecorder);
export default connect("", mapDispatchToProps)(React.memo(VideoRecorder));
