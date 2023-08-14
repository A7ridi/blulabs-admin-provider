import React, { useState, useEffect, useRef } from "react";
import Apimanager from "../../Apimanager";
import ReactDOM from "react-dom";
import moment from "moment";
import "./NotificationView.css";
import LoadingIndicator from "../../common/LoadingIndicator";
import { withRouter } from "react-router";
import * as dashboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import swal from "sweetalert";

let dateHeader = "";
let dateArray = [];
let loader = false;
let maxRecords = false;

let checkIconType = (notification) => {
  if (notification.record.type === "content") {
    if (notification.record.fileType.includes("image")) {
      return "/assets/images/image-icon.svg";
    } else if (notification.record.fileType.includes("audio")) {
      return "/assets/images/audio-icon.svg";
    } else if (notification.record.fileType.includes("video")) {
      return "/assets/images/video-icon.svg";
    } else if (notification.record.fileType.includes("pdf")) {
      return "/assets/images/pdf-icon.svg";
    } else if (notification.record.fileType.includes("text")) {
      return "/assets/images/document-icon.svg";
    } else if (notification.record.fileType.includes("webhook")) {
      return "/assets/images/webhook-icon.svg";
    }
  } else if (notification.record.type === "careTeam") {
    return "/assets/images/care-team-icon.svg";
  } else if (notification.record.type === "bundle") {
    return "/assets/images/bundle-icon.svg";
  } else if (notification.record.type === "care") {
    return "/assets/images/care-icon.svg";
  } else if (notification.record.type === "referral") {
    return "/assets/images/content-referral-icon.svg";
  }
  return "/assets/images/care-icon.svg";
};

const NotificationView = (props) => {
  let { closeTapped = () => {} } = props;
  let [state, setState] = useState({
    loader: false,
    gettingNotifications: true,
    notificationArray: [],
    pageNumber: 1,
    pageSize: 10,
    backToTop: false,
    scrollPosition: 0,
    endOfList: false,
    openModal: false,
    markAllLabel: "active",
    markAsRead: false,
  });

  useEffect(() => {
    fetchNotifications(state.pageNumber, state.pageSize);
  }, []);

  const fetchNotifications = (page, pSize) => {
    loader = true;
    setState({
      ...state,
      gettingNotifications: true,
      loader: true,
    });
    let queryParams = {
      page: page,
      pageSize: pSize,
    };
    Apimanager.getActivityFeed(
      queryParams,
      (success) => {
        if (queryParams.page === 1) {
          dateArray = [];
        }
        if (
          success &&
          success.status === 200 &&
          success.data &&
          success.data.data
        ) {
          success.data.data.map((obj, index) => {
            if (
              dateHeader === moment.unix(obj.createdAt).format("MM/DD/YYYY")
            ) {
              let notifObject = {
                title: false,
                record: obj,
              };
              dateArray.push(notifObject);
            } else {
              let notifObject = {
                title: true,
                record: obj,
              };
              dateArray.push(notifObject);
            }
            dateHeader = moment.unix(obj.createdAt).format("MM/DD/YYYY");
          });
          loader = false;
          maxRecords = success.data.count === 0 ? true : false;
          let readNotificationsArray = dateArray.filter((obj) => {
            return obj.record.status === "viewed";
          });
          let markLabel =
            readNotificationsArray.length > 0 ? "active" : "inactive";
          setState({
            ...state,
            pageNumber: queryParams.page,
            gettingNotifications: false,
            loader: false,
            notificationArray: dateArray,
            markAllLabel: markLabel,
          });
        }
      },
      (error) => {
        console.log(JSON.stringify(error, null, 4));
        setState({
          ...state,
          endOfList: true,
        });
        loader = false;
      }
    );
  };

  function loadMoreHandle() {
    let scrollelement = document.getElementById("notif-view");
    if (scrollelement.scrollTop > 500) {
      setState({ ...state, backToTop: true });
    } else {
      setState({ ...state, backToTop: false });
    }
  }

  const showMoreNotifications = () => {
    let scrollelement = document.getElementById("notif-view");
    var newPage = state.pageNumber + 1;
    let currentScrollPosition = scrollelement.scrollTop;
    fetchNotifications(newPage, state.pageSize);
    setState({
      ...state,
      pageNumber: newPage,
      scrollPosition: currentScrollPosition,
    });
  };

  function hideBackToTop(e) {
    let scrollelement = document.getElementById("notif-view");
    scrollelement.scrollTop = 0;
    setState({
      ...state,
      backToTop: false,
      loader: false,
    });
  }

  const markAllNotifications = () => {
    let bodyParams = {
      markAllAsRead: true,
    };
    Apimanager.markAllNotificationsRead(
      bodyParams,
      (success) => {
        fetchNotifications(1, 10);
        setState({
          ...state,
          markAllLabel: "inactive",
        });
      },
      (error) => {
        console.log(JSON.stringify(error, null, 4));
      }
    );
  };

  const openNotification = (obj) => {
    if (obj === null) {
      return;
    }
    if (obj.record.status !== "read") {
      let notificationData = {
        id: obj.record.id,
      };
      Apimanager.updateNotificationStatus(
        notificationData,
        (success) => {
          console.log("Successful -->" + JSON.stringify(success.data.success));
        },
        (error) => {
          console.log(JSON.stringify(error, null, 4));
        }
      );
    }
    if (obj.record.type === "careTeam") {
      props.setNotificationObject({
        notificationObject: obj,
      });
      if (window.location.pathname.includes("/patient/")) {
        localStorage.setItem("notifCareTeam", "yes");
        window.location.assign(`/patient/${obj.record.patientUser.id}`);
      } else if (!window.location.pathname.includes("/patient/")) {
        localStorage.setItem("pushCareTeam", "yes");
        props.history.push("/patient/" + obj.record.patientUser.id);
      }
    } else if (obj.record.type === "care") {
      props.setNotificationObject({
        notificationObject: obj,
      });
      if (window.location.pathname.includes("/patient/")) {
        window.location.assign(`/patient/${obj.record.patientUser.id}`);
      } else if (!window.location.pathname.includes("/patient/")) {
        props.history.push("/patient/" + obj.record.patientUser.id);
      }
    } else if (obj.record.type === "referral") {
      let queryParams = {
        referralId: obj.record.contentId,
      };
      Apimanager.getReferralDetails(
        queryParams,
        (success) => {
          if (success && success.data && success.data.data) {
            console.log("success");
            props.setReferralDetailsObject({
              referralDetailsObject: {
                details: success.data.data,
                displayFlag: true,
              },
            });
          }
        },
        (error) => {
          console.log("error");
        }
      );
    } else {
      let notificationDetails = {
        notifObject: obj,
      };
      let queryParams = {
        mediaId: obj.record.contentId,
        operationType: "read",
      };
      Apimanager.readNotification(
        queryParams,
        (success) => {
          if (success?.data?.data?.media?.isDisabled) {
            swal("This content has been removed by the provider.");
            props.closeNotification(false);
            return;
          }
          if (success && success.data && success.data.data) {
            props.setNotificationObject({
              notificationObject: success.data.data,
            });
            props.setShowMediaPopup({
              showMediaPopup: true,
              notificationObjectDetails: notificationDetails,
            });
          }
        },
        (error) => {
          console.log(JSON.stringify(error, null, 4));
        }
      );
    }
    props.closeNotification(false);
  };

  return ReactDOM.createPortal(
    <div className="notification-portal" onClick={closeTapped}>
      <div
        className="notification-view"
        onScroll={loadMoreHandle}
        id="notif-view"
      >
        {state.backToTop ? (
          <img
            src="/assets/images/back-to-top.svg"
            alt=""
            className="notification-view-top"
            onClick={hideBackToTop}
          />
        ) : null}
        {state.gettingNotifications ? (
          <div className="loading-indicator-class">
            <LoadingIndicator />
          </div>
        ) : (
          <div className="content-div" id="notification-content-div">
            {state.notificationArray && state.notificationArray.length > 0 ? (
              state.notificationArray.map((notification, index) => {
                let currentTime = moment().unix();
                let createdAtDate = moment(
                  Number(notification.record.createdAt) * 1000
                ).unix();
                let diffInDaysNotification = Math.round(
                  (currentTime - createdAtDate) / Math.floor(60 * 60 * 24)
                );

                return (
                  <div className="section-div" key={notification.record.id}>
                    {notification.title === true || index === 0 ? (
                      <div className="w-100 d-flex justify-content-between align-items-center">
                        <div className="section-label">
                          {moment().format("MM/DD/YYYY") ===
                          moment
                            .unix(notification.record.createdAt)
                            .format("MM/DD/YYYY")
                            ? "Today"
                            : diffInDaysNotification === 1
                            ? "Yesterday"
                            : moment
                                .unix(notification.record.createdAt)
                                .format("MM/DD/YYYY")}
                        </div>
                        {index === 0 ? (
                          <button
                            className={`${
                              state.markAllLabel === "active"
                                ? "mark-as-read-active"
                                : "mark-as-read"
                            }`}
                            onClick={markAllNotifications}
                            disabled={
                              state.markAllLabel === "active" ? false : true
                            }
                          >
                            Mark all as read
                          </button>
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className={`${
                        notification.record.status !== "read"
                          ? "row-and-time"
                          : ""
                      }`}
                      onClick={() => {
                        openNotification(notification);
                      }}
                    >
                      <div className="row-div">
                        <img
                          src="/assets/images/redcircle.svg"
                          alt=""
                          className={`${
                            notification.record.status !== "read"
                              ? "redcircle"
                              : "redcircle-transparent"
                          }`}
                        />
                        <img
                          src={checkIconType(notification)}
                          alt=""
                          className="notification-icon"
                        />

                        <div className="details-div" style={{ width: "100%" }}>
                          <div style={{ display: "flex" }}>
                            <div className="notification-title text-truncate">
                              {notification?.record?.display?.title?.length < 50
                                ? notification?.record?.display?.title
                                : (notification?.record?.display?.title?.substr(
                                    0,
                                    25
                                  ) || "No title") + "..."}
                            </div>
                            <div className="notification-time">
                              {moment
                                .unix(notification.record.createdAt)
                                .format("hh:mm a")}
                            </div>
                          </div>
                          <div
                            className={`${
                              notification.record.status !== "read"
                                ? "notification-description-unread"
                                : "notification-description"
                            }`}
                          >
                            {notification?.record?.display?.body ||
                              "No description"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="notification-view-end" id="no-more-notif">
                <img src="../../assets/images/notification-no-data.svg" />
              </div>
            )}
            {maxRecords ? (
              <div className="notification-view-end">
                No more notifications.
              </div>
            ) : loader ? (
              <LoadingIndicator />
            ) : state.notificationArray?.length > 5 ? (
              <button
                className="showmore-notifications-button"
                onClick={showMoreNotifications}
              >
                Show More
              </button>
            ) : state.endOfList ? (
              <div className="notification-view-end">
                No more notifications.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>,
    document.getElementById("portal")
  );
};

const mapStateToProps = (state) => {
  return {
    notificationObject: state.dashboardStates?.notificationObject,
    showMediaPopup: state.dashboardStates.showMediaPopup,
    referralDetailsObject: state.dashboardStates.referralDetailsObject,
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setNotificationObject: dashboardActions.setNotificationObject,
      setShowMediaPopup: dashboardActions.setShowMediaPopup,
      setReferralDetailsObject: dashboardActions.setReferralDetailsObject,
    },
    dispatch
  );
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(NotificationView)
);
