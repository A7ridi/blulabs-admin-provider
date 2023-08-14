import React, { useState, useEffect } from "react";
import "./AudioRecorder.css";
import PlayPauseButton from "../PlayPauseButton";
import { connect } from "react-redux";
import * as dashboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import Timer from "../../helper/Timer";

let micIcon = "/assets/images/mic-icon.png";
let playIcon = "/assets/images/play-icon.png";
let pauseIcon = "/assets/images/audio-pause-icon.png";

let rec;
let stream = null;
let audioFile = null;
let audioPlayer = new Audio();
let counter = new Timer();
let timerLabel;

function setAndStartRecorder(recordingStopped, recordStart) {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
    // Collection for recorded data.
    stream = mediaStream;
    let data = [];
    const recorder = new MediaRecorder(stream);

    rec = recorder;

    timerLabel = document.getElementById("time-label");

    recorder.addEventListener("start", (e) => {
      // Empty the collection when starting recording.
      timerLabel.innerText = "00:00:00";
      counter.start(() => {
        timerLabel.innerText = counter.time();
      });
      recordStart(stream);
      data.length = 0;
    });

    recorder.addEventListener("dataavailable", (e) => {
      // Push recorded data to collection.
      data.push(e.data);
    });

    // Create a Blob when recording has stopped.
    recorder.addEventListener("stop", (e) => {
      counter.stop();
      audioFile = new Blob(data, { type: "audio/mpeg" });

      let audioTag = document.querySelector("audio");
      if (audioTag) {
        audioTag.src = window.URL.createObjectURL(audioFile);
      }

      stream.getTracks().forEach((track) => track.stop());
      recordingStopped(audioFile);
    });

    recorder.start(1);
  });
}

function AudioRecorder(props) {
  let { styles, recordStart, recordStop } = props;
  let [state, setState] = useState({
    isRecording: false,
    audio: "",
    isPlaying: false,
    buttonIcon: "",
  });

  useEffect(() => {
    if (!props.isAudioRecording) {
      counter.stop();
    }
    audioPlayer.addEventListener("ended", () => {
      setState({ ...state, isPlaying: false });
    });
  }, [state]);

  function getIcon() {
    let icon = "";
    if (state.audio === "" && !state.isRecording) {
      icon = micIcon;
    } else if (state.isPlaying || state.isRecording) {
      icon = pauseIcon;
    } else {
      icon = playIcon;
    }
    return icon;
  }

  function playPauseRecorder() {
    if (state.isRecording) {
      rec.stop();
      props.setAudioRecordingStatus({ isAudioRecording: false });
    } else {
      props.setAudioRecordingStatus({ isAudioRecording: true });
      setAndStartRecorder((file) => {
        recordStop(file);
        setState({
          ...state,
          audio: file,
        });
      }, recordStart);
    }
    setState({
      ...state,
      isRecording: !state.isRecording,
    });
  }

  function playPauseAudio() {
    if (!state.isPlaying) {
      audioPlayer.src = URL.createObjectURL(state.audio);
      audioPlayer.play();
    } else {
      audioPlayer.pause();
    }
    setState({ ...state, isPlaying: !state.isPlaying });
  }

  return (
    <div style={styles} className="AudioRecorder">
      {state.audio !== "" ? (
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => {
            audioPlayer.pause();
            recordStop(null);
            props.setAudioRecordingStatus(false);
            timerLabel.innerText = "00:00:00";
            setState({
              ...state,
              audio: "",
              isPlaying: false,
            });
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      ) : null}
      <div
        className="controls"
        style={{
          position: state.audio ? "absolute" : "relative",
          zIndex: state.audio ? -1 : 0,
        }}
      >
        <PlayPauseButton
          imageSrc={getIcon()}
          className={
            state.isRecording && state.audio === ""
              ? "animate-max play-button-active"
              : ""
          }
          click={() =>
            state.audio !== "" ? playPauseAudio() : playPauseRecorder()
          }
        />
        <label id="time-label">00:00:00</label>
      </div>
      <audio
        style={{
          position: state.audio ? "relative" : "absolute",
          zIndex: state.audio ? 0 : -1,
        }}
        controls
        controlsList="nodownload"
      />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isAudioRecording: state.dashboardStates.isAudioRecording,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setAudioRecordingStatus: dashboardActions.setAudioRecordingStatus,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(AudioRecorder));
