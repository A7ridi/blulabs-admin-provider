import React from "react";
import "./ReferralPatientView.css";
import Apimanager from "../../Apimanager/index";
import * as dashboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import "../VideoRecorder/VideoRecorder.css";

import Timer from "../../helper/Timer";
import swal from "sweetalert";
import Socket, {
  socketActions,
  socketSubActions,
} from "../../helper/Websocket";
import { v4 as uuid } from "uuid";
import LoadingIndicator from "../../common/LoadingIndicator";
import * as Analytics from "../../helper/AWSPinPoint";
import Select, { components } from "react-select";

let rec = null;
let stream = null;
let data = [];
let video;
let counter = new Timer();
let timerLabel;
// let socket = new Socket();
let isWebCam = [];

let checkIconType = (iconObject) => {
  if (iconObject.type === "media") {
    if (iconObject.fileType.includes("image")) {
      return "/assets/images/image-icon.svg";
    } else if (iconObject.fileType.includes("audio")) {
      return "/assets/images/audio-icon.svg";
    } else if (iconObject.fileType.includes("video")) {
      return "/assets/images/video-icon.svg";
    } else if (iconObject.fileType.includes("pdf")) {
      return "/assets/images/pdf-icon.svg";
    } else if (iconObject.fileType.includes("webhook")) {
      return "/assets/images/webhook-icon.svg";
    }
  } else if (iconObject.type === "item") {
    return "/assets/images/document-icon.svg";
  } else if (iconObject.type === "careTeam") {
    return "/assets/images/care-team-icon.svg";
  } else if (iconObject.type === "bundle") {
    return "/assets/images/bundle-icon.svg";
  } else if (iconObject.type === "care") {
    return "/assets/images/care-icon.svg";
  }
  return "/assets/images/care-icon.svg";
};

let getBackground = (index) => {
  if (index % 10 === 0) {
    return "#FA9490";
  } else if (index % 10 === 1) {
    return "#F9B198";
  } else if (index % 10 === 2) {
    return "#BED6E0";
  } else if (index % 10 === 3) {
    return "#AED6B3";
  } else if (index % 10 === 4) {
    return "#C0C0C0";
  } else if (index % 10 === 5) {
    return "#A36361";
  } else if (index % 10 === 6) {
    return "#D3A29D";
  } else if (index % 10 === 7) {
    return "#EECC8C";
  } else if (index % 10 === 8) {
    return "#9EABA2";
  } else if (index % 10 === 9) {
    return "#7277F4";
  }
};

let getInitials = (label) => {
  var matches = label.match(/\b(\w)/g); // returns array of first letter of every word in a string
  // return matches.join("").toUpperCase(); // returns the initials joined together
  if (matches.length === 1) {
    return matches[0].toUpperCase();
  } else {
    return (matches[0] + matches[matches.length - 1]).toUpperCase();
  }
};
const Option = (props) => (
  <div>
    <components.Option {...props}>
      <div className="multiselect-options-main-div">
        <div>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
            className="multiselect-options-checkbox"
          />{" "}
        </div>
        {props.data?.type ? (
          <div>
            <img
              src={checkIconType(props.data)}
              alt=""
              className="multiselect-options-content-icon"
            />
          </div>
        ) : (
          <div
            className="multiselect-options-initials-div"
            style={{ background: `${getBackground(props.data.index)}` }}
          >
            {getInitials(props.label)}
          </div>
        )}

        <div className="multiselect-options-label-div text-truncate">
          {props.label}
        </div>
      </div>
    </components.Option>
  </div>
);

const SingleValue = (props) => (
  <components.SingleValue {...props}>
    <span>{props.data.label}</span>
  </components.SingleValue>
);

const MultiValue = (props) => (
  <components.MultiValue {...props}>
    <span>{props.data.label}</span>
  </components.MultiValue>
);

const ValueContainer = ({ children, ...props }) => {
  let [values, input] = children;

  if (Array.isArray(values)) {
    values = values.length > 2 ? `${values.length} selected` : values;
  }

  return (
    <components.ValueContainer {...props}>
      {values}
      {input}
    </components.ValueContainer>
  );
};

class ReferralPatientView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      referralEnterpriseList: [],
      referralPhysicianList: [],
      referralContentList: [],
      selectedReferralEnterpriseList: null,
      selectedReferralPhysicianList: null,
      selectedReferralContentList: null,
      referralTextMessage: "",
      referralVideoMessage: null,
      referralEnterpriseListError: "",
      referralPhysicianListError: "",
      referralContentListError: "",
      referralTextMessageError: "",
      isVideoMessageStatus: false,
      checked: false,
      isRecording: false,
      file: null,
      videoSource: null,
      websocketSignedUrl: "",
      websocketFileName: "",
      loading: false,
      listLoading: false,
    };
  }

  componentDidMount() {
    document.getElementById("referral-modal-button").click();
    this.getReferralEnterpriseList();
    this.getReferralPatientContentList(this.props.patientId);
    this.checkforWebCam();
  }

  checkforWebCam = () => {
    //Check if there is any video device
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      isWebCam = devices.filter((device) => device.kind === "videoinput");
    });
  };

  setAndStartRecorder = (completion = () => {}) => {
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
  };

  setRecorder = () => {
    this.setAndStartRecorder(() => {
      timerLabel = document.getElementById("video-message-time-label");

      rec.addEventListener("start", (e) => {
        counter.start(() => {
          timerLabel.innerText = counter.time();
        });
        this.props.setVideoRecordingStatus({ isVideoRecording: true });
        data.length = 0;
      });

      rec.addEventListener("dataavailable", (e) => data.push(e.data));

      rec.addEventListener("stop", (e) => {
        counter.stop();
        video.srcObject = null;
        const blob = new Blob(data, { type: "video/mp4" });
        video.src = URL.createObjectURL(blob);
        stream.getTracks().forEach((track) => track.stop());
        this.setState({ file: blob, videoSource: video.src });
        this.props.setVideoRecordingStatus({ isVideoRecording: false });
      });
    });
  };

  getReferralEnterpriseList = () => {
    let bodyParams = {
      byProvider: true,
    };
    Apimanager.getReferralEntpList(
      bodyParams,
      (success) => {
        if (success && success.status === 200 && success.data) {
          this.setState({
            referralEnterpriseList: success.data.data.map(
              (enterprise, index) => {
                return {
                  label: enterprise.name,
                  value: enterprise.id,
                  index: index,
                };
              }
            ),
          });
        }
      },
      (error) => {
        if (error && error.status === 500) {
          console.log("Something went wrong -->" + error);
        }
      }
    );
  };

  getReferralPhysicianList = (id) => {
    this.setState({
      listLoading: true,
    });
    let bodyParams = {
      enterpriseId: id,
      byProvider: true,
      pageSize: 1000,
    };
    Apimanager.getReferralPhysList(
      bodyParams,
      (success) => {
        if (success && success.status === 200 && success.data) {
          this.setState({
            referralPhysicianList: success.data.data.map((physician, index) => {
              let mName =
                physician.middleName === null ||
                physician.middleName === undefined
                  ? ""
                  : physician.middleName;
              return {
                label: (
                  physician.firstname +
                  " " +
                  mName +
                  " " +
                  physician.lastname
                ).replace(/\s+/g, " "),
                value: physician.email,
                index: index,
              };
            }),
          });
        }
        this.setState({
          listLoading: false,
        });
      },
      (error) => {
        if (error && error.status === 500) {
          console.log("Something went wrong -->" + error);
        }
        this.setState({
          listLoading: false,
        });
      }
    );
  };

  getReferralPatientContentList = (id) => {
    let page = this.props.pageNumber;
    let listRecord = this.props.listRecord;
    let queryParams = {
      userId: id,
      v: 1.2,
      page: page,
      pageSize: 1000,
      listtype: "",
      sendThumbnail: false,
    };
    Apimanager.getReferralContentList(
      queryParams,
      (success) => {
        if (success && success.status === 200 && success.data) {
          this.setState({
            referralContentList: success.data.map((content) => {
              return {
                label: content.title,
                value: content.id,
                type: content.type,
                fileType: content.fileType,
              };
            }),
          });
        }
      },
      (error) => {
        if (error && error.status === 500) {
          console.log("Something went wrong -->" + error);
        }
      }
    );
  };

  selectedReferralEnterprise = (entpObj) => {
    this.setState({
      selectedReferralEnterpriseList: entpObj,
      selectedReferralPhysicianList: [],
      referralEnterpriseListError: "",
      referralPhysicianListError: "",
      referralContentListError: "",
      referralTextMessageError: "",
    });
    this.getReferralPhysicianList(entpObj?.value);
  };

  selectedReferralPhysician = (phyObj) => {
    this.setState({
      selectedReferralPhysicianList: phyObj,
      referralEnterpriseListError: "",
      referralPhysicianListError: "",
      referralContentListError: "",
      referralTextMessageError: "",
    });
  };

  selectedReferralContent = (contObj) => {
    this.setState({
      selectedReferralContentList: contObj,
      checked: false,
      referralEnterpriseListError: "",
      referralPhysicianListError: "",
      referralContentListError: "",
      referralTextMessageError: "",
    });
    if (contObj?.length === this.state.referralContentList?.length) {
      this.setState({
        checked: true,
      });
    }
  };

  validateReferralForm = () => {
    let validateReferralFields = true;
    let referralEnterpriseListError,
      referralPhysicianListError,
      referralContentListError,
      referralTextMessageError;
    if (
      this.state.selectedReferralEnterpriseList === null ||
      this.state.selectedReferralEnterpriseList.length < 0
    ) {
      referralEnterpriseListError = "Health system is required.";
      validateReferralFields = false;
    }
    if (
      this.state.selectedReferralPhysicianList === null ||
      this.state.selectedReferralPhysicianList.length <= 0
    ) {
      referralPhysicianListError = "Physician is required.";
      validateReferralFields = false;
    }
    if (this.state.referralTextMessage.length > 300) {
      referralTextMessageError = "Note should not exceed 300 characters.";
      validateReferralFields = false;
    }

    this.setState({
      referralEnterpriseListError: referralEnterpriseListError,
      referralPhysicianListError: referralPhysicianListError,
      referralContentListError: referralContentListError,
      referralTextMessageError: referralTextMessageError,
    });
    return validateReferralFields;
  };

  changeTextareaMessage = (e) => {
    this.setState({
      referralTextMessage: e.target.value,
      referralEnterpriseListError: "",
      referralPhysicianListError: "",
      referralContentListError: "",
      referralTextMessageError: "",
    });
  };

  patientReferralStringFunction = (obj) => {
    let { token } = obj;

    let contentNameArray = this.state.selectedReferralContentList?.map(
      (content) => {
        return content.value;
      }
    );
    let physicianNameArray = this.state.selectedReferralPhysicianList.map(
      (physician) => {
        return physician.value;
      }
    );
    let enterpriseName = Object.assign(
      {},
      this.state.selectedReferralEnterpriseList
    );
    let referredAnalyticsDetails = {
      referredEnterprise: enterpriseName.value,
    };

    let patientReferralStr = JSON.stringify({
      Authorization: token,
      action: socketActions.referral,
      subAction: socketSubActions.patientReferral,
      loggedInUserId: this.props.userDetails.id,
      enterpriseId: enterpriseName.value,
      patientId: this.props.patientId,
      videoContent: this.state.websocketFileName
        ? this.state.websocketFileName
        : "",
      messageContent: this.state.referralTextMessage,
      providers: physicianNameArray,
      contents: contentNameArray,
      allContent: false,
    });
    window.socket.send(patientReferralStr, (resultPatient) => {
      if (resultPatient.settings?.status === 1) {
        this.setState({
          loading: false,
        });
        swal({
          title: "Success!",
          text: "Patient's referral sent successfully.",
          icon: "success",
          button: "Ok",
        });
        Analytics.record(
          referredAnalyticsDetails,
          this.props.userDetails.id,
          Analytics.EventType.referred
        );
        document.getElementById("close-referral-modal").click();
      } else {
        this.setState({
          loading: false,
        });
        swal({
          title: "Error!",
          text: "Something went wrong.",
          icon: "error",
          button: "Ok",
          dangerMode: true,
        });
      }
    });
  };

  referPatientNow = (e) => {
    if (this.validateReferralForm()) {
      this.setState({
        loading: true,
      });
      let authtoken = "";
      let storedObject = JSON.parse(this.props.data.northwelluser);
      authtoken = `Bearer ${storedObject.user.stsTokenManager.accessToken}`;
      if (this.state.file) {
        let referralDocumentStr = JSON.stringify({
          Authorization: authtoken,
          action: socketActions.referral,
          subAction: socketSubActions.referralDocument,
          fileName: "Video" + uuid() + ".mp4",
          loggedInUserId: this.props.userDetails.id,
        });
        window.socket.send(referralDocumentStr, (result) => {
          if (result.settings?.status === 1) {
            let signedUrl = result.data?.signedUrl;
            let fileName = result.data?.fileName;
            this.setState({
              websocketSignedUrl: signedUrl,
              websocketFileName: fileName,
            });
            Apimanager.uploadmedia(
              this.state.websocketSignedUrl,
              this.state.file,
              (success) => {
                this.patientReferralStringFunction({ token: authtoken });
              },
              (error) => {
                this.setState({
                  loading: false,
                });
                swal({
                  title: "Error!",
                  text: "Something went wrong.",
                  icon: "error",
                  button: "Ok",
                  dangerMode: true,
                });
              },
              () => {}
            );
          }
        });
      } else {
        this.patientReferralStringFunction({ token: authtoken });
      }
    }
  };

  changeVideoMessageStatus = () => {
    if (isWebCam.length > 0) {
      document.getElementById("video-message-modal-popup").click();

      this.setState({
        isVideoMessageStatus: true,
        file: null,
      });

      this.setRecorder();
      return () => {
        if (rec.state !== "inactive") {
          rec.stop();
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    } else {
      swal({
        title: "Error!",
        text: "Webcam not detected.",
        icon: "error",
        button: "Ok",
        dangerMode: true,
      });
    }
  };

  onChangeCheckbox = (e) => {
    const isChecked = !this.state.checked;
    this.setState({
      checked: isChecked,
      selectedReferralContentList: isChecked
        ? this.state.referralContentList
        : [],
    });
  };

  closeVideoRecorder = () => {
    stream.getTracks().forEach((track) => track.stop());
    this.setState({
      isVideoMessageStatus: false,
      isRecording: false,
      file: null,
    });
  };

  uploadVideoMessage = () => {
    this.setState({
      isVideoMessageStatus: false,
    });
  };

  removeVideoMessage = () => {
    swal({
      text: "Are you sure? You want to delete this file.",
      buttons: ["Cancel", "Delete"],
      dangerMode: false,
    }).then((willDelete) => {
      if (willDelete) {
        this.setState({
          file: null,
          videoSource: null,
        });
      }
    });
  };

  render() {
    return (
      <div>
        <div className="referral-view-modal">
          <button
            id="referral-modal-button"
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#exampleModal"
            style={{ display: "none" }}
          >
            Launch demo modal
          </button>

          <div
            class="modal fade"
            id="exampleModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
            data-backdrop="static"
          >
            {this.state.loading ? (
              <div
                classname="referral-loading"
                style={{
                  position: "absolute",
                  content: "",
                  width: "100%",
                  height: "100%",
                  zIndex: 1,
                  background: "rgb(0 0 0 / 20%)",
                  writingMode: "vertical-rl",
                }}
              >
                <LoadingIndicator />
              </div>
            ) : null}
            <div class="modal-dialog" role="document">
              <div
                class="modal-content referral-modal-content"
                style={{
                  display: this.state.isVideoMessageStatus ? "none" : "block",
                }}
              >
                <div class="modal-header text-center referral-header">
                  <h5 class="modal-title referral-title" id="exampleModalLabel">
                    Playback Connect
                  </h5>
                  <button
                    id="close-referral-modal"
                    type="button"
                    class="close referral-close-button"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => {
                      this.props.closeReferralPatientModal(false);
                    }}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div className="patient-referral-form">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div>
                        <label className="label-styling">Health System</label>
                      </div>
                      <div>
                        <Select
                          options={this.state.referralEnterpriseList}
                          value={this.state.selectedReferralEnterpriseList}
                          onChange={(e) => {
                            this.selectedReferralEnterprise(e);
                          }}
                          components={{ Option, SingleValue }}
                          isClearable={true}
                        />
                        {
                          <span className="error-label">
                            {this.state.referralEnterpriseListError}
                          </span>
                        }
                      </div>
                      <div className="label-styling">Physician</div>
                      <div>
                        <Select
                          options={
                            this.state.selectedReferralEnterpriseList !== null
                              ? this.state.referralPhysicianList
                              : []
                          }
                          value={this.state.selectedReferralPhysicianList}
                          onChange={(e) => {
                            this.selectedReferralPhysician(e);
                          }}
                          components={{ Option, MultiValue, ValueContainer }}
                          isMulti
                          hideSelectedOptions={false}
                          closeMenuOnSelect={false}
                          isLoading={this.state.listLoading ? true : false}
                          isDisabled={this.state.listLoading ? true : false}
                        />
                        {
                          <span className="error-label">
                            {this.state.referralPhysicianListError}
                          </span>
                        }
                      </div>
                      <div className="content-dropdown-main-div">
                        <div className="label-styling">Content</div>
                        <div className="select-all-content-checkbox-label">
                          <input
                            className="select-all-content-checkbox"
                            onChange={this.onChangeCheckbox}
                            type="checkbox"
                            id="selectAll"
                            value="selectAll"
                            checked={this.state.checked}
                          />
                          <label
                            for="selectAll"
                            className="select-all-content-label"
                          >
                            Select all
                          </label>
                        </div>
                      </div>
                      <div>
                        <Select
                          options={this.state.referralContentList}
                          value={this.state.selectedReferralContentList}
                          isMulti
                          onChange={(e) => this.selectedReferralContent(e)}
                          hideSelectedOptions={false}
                          closeMenuOnSelect={false}
                          components={{ Option, MultiValue, ValueContainer }}
                        />
                        {
                          <span className="error-label">
                            {this.state.referralContentListError}
                          </span>
                        }
                      </div>
                      <div className="label-styling">Note</div>
                      <div>
                        <textarea
                          placeholder="Write a note for physician here......."
                          rows={5}
                          className="message-text-area"
                          value={this.state.referralTextMessage}
                          onChange={(e) => this.changeTextareaMessage(e)}
                        />
                        <span className="error-label">
                          {this.state.referralTextMessageError}
                        </span>
                      </div>
                      <div className="label-styling">Video Message</div>
                      <div className="video-message-area">
                        {this.state.file ? (
                          <div style={{ position: "relative" }}>
                            <video
                              src={this.state.videoSource}
                              controls
                              disablePictureInPicture
                              controlsList="nodownload"
                              type={"video/webm"}
                              style={{ height: "95px", width: "345px" }}
                            />
                            <button
                              className="video-area-cross-button"
                              onClick={this.removeVideoMessage}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <img
                            src="/assets/images/record-icon.svg"
                            alt=""
                            style={{ cursor: "pointer" }}
                            onClick={this.changeVideoMessageStatus}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer referral-footer">
                  <button
                    type="button"
                    class="btn btn-blue-block refer-now-button"
                    onClick={(e) => this.referPatientNow(e)}
                  >
                    Connect Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="referral-video-message-modal">
          <button
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#videoMessageModal"
            id="video-message-modal-popup"
            style={{ display: "none" }}
          >
            Launch demo modal
          </button>

          <div
            class="modal fade"
            id="videoMessageModal"
            tabindex="-1"
            role="dialog"
            aria-labelledby="videoMessageModalLabel"
            aria-hidden="true"
            data-backdrop="static"
          >
            <div class="modal-dialog" role="document">
              <div class="modal-content video-message-content-div">
                <div class="modal-header">
                  <button
                    type="button"
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={this.closeVideoRecorder}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body video-message-body">
                  {this.state.isVideoMessageStatus ? (
                    <div className="video-tag-main-div">
                      <video
                        className="video-message-tag"
                        id="vidSave"
                        controls={this.state.file ? "controls" : ""}
                        controlsList="nodownload"
                      />
                      {this.state.file ? (
                        <div className="retry-upload-main-div">
                          <div>
                            <img
                              src="../assets/images/retry-button.svg"
                              alt=""
                              className="retry-button"
                              onClick={() => {
                                this.setState({ file: null });
                                this.setRecorder();
                              }}
                            />
                          </div>
                          <div className="upload-button">
                            <img
                              src="../assets/images/upload-button.svg"
                              alt=""
                              className="upload-button"
                              onClick={this.uploadVideoMessage}
                              data-dismiss="modal"
                              aria-label="Close"
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {this.state.file ? null : (
                  <div class="modal-footer video-message-footer">
                    <div
                      className="video-message-timer-label"
                      id="video-message-time-label"
                    >
                      00:00:00
                    </div>
                    <div className="video-message-start-stop-button">
                      {this.state.isRecording ? (
                        <img
                          src="../assets/images/stop-recorder.svg"
                          alt=""
                          onClick={() => {
                            this.state.isRecording ? rec.stop() : rec.start(10);
                            this.setState({
                              isRecording: !this.state.isRecording,
                            });
                          }}
                        />
                      ) : (
                        <img
                          src="../assets/images/start-recorder.svg"
                          alt=""
                          onClick={() => {
                            this.state.isRecording ? rec.stop() : rec.start(10);
                            this.setState({
                              isRecording: !this.state.isRecording,
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    data: state.auth,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setVideoRecordingStatus: dashboardActions.setVideoRecordingStatus,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralPatientView);
