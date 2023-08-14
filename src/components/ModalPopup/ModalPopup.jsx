import React, { useEffect } from "react";
import { connect } from "react-redux";
import ReactHtmlParser from "react-html-parser";
import "./ModalPopup.css";
import ReactAudioPlayer from "react-audio-player";
import * as dashboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";

// ModalPopup Component.
const ModalPopup = (props) => {
  let mediaData = props.notificationObject?.media
    ? props.notificationObject?.media?.type
    : "";

  useEffect(() => {
    document.getElementById("popup-modal-button").click();
  });

  function closePopup() {
    setTimeout(() => {
      props.setShowMediaPopup({ showMediaPopup: false });
      props.setNotificationObject({ notificationObject: null });
    }, 150);
    document.getElementById("popup-modal-button").click();
  }

  return (
    <div className="ModalPopup">
      <button
        id="popup-modal-button"
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target="#exampleModalLong"
        style={{ display: "none" }}
      >
        Launch demo modal
      </button>

      <div
        className="modal fade"
        id="exampleModalLong"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLongTitle"
        aria-hidden="true"
        onMouseDown={(e) => {
          if (e.target.id === "exampleModalLong") {
            closePopup();
          }
        }}
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLongTitle">
                <div className="modal-flex-container">
                  <div className="flex-container1">
                    For Patient:{" "}
                    {
                      props.notificationObjectDetails?.notifObject?.record
                        ?.patientUser?.name
                    }
                  </div>
                  <div className="flex-container2">
                    {ReactHtmlParser(
                      props.notificationObject?.item?.title?.length < 50
                        ? props.notificationObject?.item?.title
                        : props.notificationObject?.media?.fileName || ""
                    )}
                  </div>
                </div>
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={closePopup}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {mediaData !== "" && mediaData.includes("image") ? (
                <img
                  alt={props.notificationObject.media.title}
                  src={props.notificationObject.signedUrl}
                  className="loading"
                  style={{ objectFit: "contain", maxHeight: "85vh" }}
                />
              ) : mediaData !== "" && mediaData.includes("pdf") ? (
                <iframe
                  title={props.notificationObject.media.title}
                  src={props.notificationObject.signedUrl}
                  className="loading"
                  width="100%"
                  style={{ height: "500px" }}
                ></iframe>
              ) : mediaData !== "" && mediaData.includes("video") ? (
                <video
                  id="content-video"
                  width="80%"
                  height="65%"
                  controls
                  src={props.notificationObject.signedUrl}
                  controlsList="nodownload"
                ></video>
              ) : mediaData !== "" && mediaData.includes("audio") ? (
                <ReactAudioPlayer
                  muted="true"
                  src={props.notificationObject.signedUrl}
                  controls
                />
              ) : props.notificationObject?.item?.title.length >= 50 ? (
                props.notificationObject?.item?.title +
                "\n" +
                props.notificationObject?.item?.subTitle
              ) : (
                props.notificationObject?.item?.subTitle
              )}
              <span>
                By:{" "}
                {mediaData !== ""
                  ? props.notificationObject?.media?.addedByName
                  : props.notificationObject?.item?.addedByName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    notificationObject: state.dashboardStates?.notificationObject,
    notificationObjectDetails: state.dashboardStates?.notificationObjectDetails,
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setNotificationObject: dashboardActions.setNotificationObject,
      setShowMediaPopup: dashboardActions.setShowMediaPopup,
    },
    dispatch
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalPopup);
