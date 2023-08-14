import React, { memo, useState, useEffect, useMemo } from "react";
import { getReferralDetails } from "../../../Apimanager/Networking";
import "./NotificationView.css";
import moment from "moment";
import * as dashboardActions from "../../../redux/actions/dashboard.action";
import { errorToDisplay, getMediaIconNew } from "../../../helper/CommonFuncs";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import Document from "../../../images/media-icons/media-icon-document.svg";
import textIcon from "../../../images/media-icons/media-icon-text.svg";
import referral from "../../../images/media-icons/media-icon-referral.svg";
import careTeam from "../../../images/media-icons/media-icon-careteam.svg";
import share from "../../../images/media-icons/media-icon-share.svg";
import { fetchQuery } from "../../../actions";
import {
   GET_PROVIDER_NOTIFICATIONS,
   UPDATE_NOTIFICATIONS,
} from "../../../viewpages/newpages/notificationsModule/actions/notificationsModuleActions";
import InfiniteScroll from "../../../shared/components/infiniteScroll/infiniteScroll";
import LoaderList from "../../../shared/components/loaderList/loaderList";
import { useMutation } from "@apollo/client";
import { ShowAlert } from "../../../common/alert";

const NotificationRow = memo(({ notif, prevNotif, index, markAll, markAllNotifications, openNotif }) => {
   const getIconSrc = useMemo(() => {
      const typeContent = notif?.type;
      const type =
         typeContent === "care"
            ? typeContent
            : typeContent === "careTeam"
            ? typeContent
            : typeContent === "referral"
            ? typeContent
            : notif?.content?.type;
      const isCareTeam = notif?.type === "careTeam";

      if (type === "referral") {
         return referral;
      } else if (isCareTeam) {
         return careTeam;
      } else if (type === "care") {
         return share;
      } else if (type === "share") {
         return share;
      } else if (type) {
         if (
            type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            type === "application/docx" ||
            type === "application/document" ||
            type === "application/msword" ||
            type === "text/rtf" ||
            type === "text/plain"
         ) {
            return Document;
         }
         return getMediaIconNew(type);
      } else {
         return textIcon;
      }
   }, [notif]);

   let notifData = useMemo(() => {
      let currentDate = moment(notif?.createdAt).format("MM/DD/YYYY").toString();
      let prevDate = moment(prevNotif?.createdAt).format("MM/DD/YYYY").toString();
      let diffInDays = moment().diff(currentDate, "days");
      let titleLabel = diffInDays === 0 ? "Today" : diffInDays === 1 ? "Yesterday" : currentDate;

      return {
         showTitle: currentDate === prevDate ? false : true,
         isRead: notif.status !== "read",
         titleLabel: titleLabel,
      };
   }, [notif, prevNotif]);

   const title = notif?.content?.title || "No Title";
   return (
      <div className="d-flex flex-column">
         {notifData?.showTitle || index === 0 ? (
            <div className="w-100 d-flex justify-content-between align-items-center">
               <div className="text-black3 text-medium p-3">{notifData.titleLabel} </div>
               {index === 0 && (
                  <button
                     className={`${
                        markAll === "active" ? "text-primary" : "text-grey"
                     } mark-all-label pointer button text-small p-2`}
                     onClick={() => markAllNotifications && markAllNotifications()}
                     disabled={markAll === "active" ? false : true}
                  >
                     Mark all as read
                  </button>
               )}
            </div>
         ) : null}
         <div
            className={`${notif.status !== "read" ? "bg-selected" : ""} flex-center justify-content-start py-3 px-3`}
            onClick={() => openNotif(notif)}
         >
            <div
               style={{ width: "10px", height: "10px" }}
               className={`${notif?.status !== "read" ? "bg-red" : "bg-transparent"} flex-shrink-0 rounded-circle`}
            />
            <img
               src={getIconSrc}
               alt="file-type"
               className="ml-3 mr-4"
               style={{
                  height: "60px",
                  width: "60px",
                  marginRight: "20px",
                  marginLeft: "10px",
                  minHeight: "24px",
                  minWidth: "24px",
               }}
            />
            <div className="d-flex flex-column w-100 pointer">
               <div className="d-flex align-items-center justify-content-between">
                  <div className="text-truncate font-weight-bold text-normal w-small2">{title}</div>
                  <div className="text-small text-grey2">{moment(notif?.createdAt).format("hh:mm a")}</div>
               </div>
               <div className="text-xsmall" style={{ whiteSpace: "break-spaces" }}>
                  {notif?.content?.body || "No description"}
               </div>
            </div>
         </div>
      </div>
   );
});

function NotificationView(props) {
   const { toggleContent } = props;
   const [state, setState] = useState({
      pageNumber: 0,
      pageSize: 10,
      notificationArray: [],
      isLoading: true,
      markAllLabel: "active",
      loadedOnce: false,
      hasMore: true,
      backToTop: false,
      noNotifications: false,
   });

   const [updateNotifications] = useMutation(UPDATE_NOTIFICATIONS, {
      onCompleted(res) {},
      onError(error) {
         ShowAlert(errorToDisplay(error), "error");
      },
   });

   const fetchNotifications = (callback = () => {}) => {
      let obj = {
         paginationOptions: {
            page: state.pageNumber,
            pageSize: state.pageSize,
         },
      };
      fetchQuery(
         GET_PROVIDER_NOTIFICATIONS,
         obj,
         (data) => {
            callback();
            let allNotifications = [...state.notificationArray, ...data?.data?.recentUpdates?.data] || [];
            let totalCount = data?.data?.recentUpdates?.totalCount || 0;
            setState({
               ...state,
               pageNumber: state.pageNumber + 1,
               isLoading: false,
               notificationArray: allNotifications,
               hasMore: allNotifications.length < totalCount,
            });
         },
         (error) => {}
      );
   };
   useEffect(() => {
      fetchNotifications();
   }, []);

   const markAllNotifications = () => {
      let bodyParams = {
         options: {
            type: "updateActivityStatus",
            markAllAsRead: true,
         },
      };
      updateNotifications({
         variables: bodyParams,
      });
   };

   const showBackToTop = () => {
      let scrollelement = document.getElementById("notif-view");
      if (scrollelement.scrollTop > 500) {
         setState({ ...state, backToTop: true });
      } else {
         setState({ ...state, backToTop: false });
      }
   };

   const hideBackToTop = () => {
      let scrollelement = document.getElementById("notif-view");
      scrollelement.scrollTop = 0;
      setState({
         ...state,
         backToTop: false,
      });
   };

   const openNotification = async (obj) => {
      if (obj.status !== "read") {
         let params = {
            options: {
               id: obj.id,
               type: "updateActivityStatus",
               status: "viewed",
            },
         };
         updateNotifications({
            variables: params,
         });
      }

      if (obj.type === "care") {
         props.history.push(`/patient/${obj.careTeam.patient.id}?tab=4`);
      } else if (obj.type === "careTeam") {
         props.history.push(`/patient/${obj.careTeam.patient.id}?tab=3`);
      } else if (obj.type === "referral") {
         try {
            getReferralDetails({
               referralId: obj.content.id,
            })
               .then((res) => {
                  toggleContent({ patientId: res.data.data, contentId: "referral" });
               })
               .catch(() => {});
         } catch {}
      } else {
         toggleContent({ patientId: obj?.content?.patient?.id, contentId: obj?.content?.id });
      }
      props.closeNotifView();
   };

   const noNotifications = !state.isLoading && state.notificationArray.length === 0;

   return (
      <div className="notification-view-div" id="notif-view" onScroll={showBackToTop}>
         {state.backToTop && (
            <div className="position-relative flex-center">
               <img
                  src="/assets/images/newimages/back-to-top.svg"
                  alt=""
                  className="back-to-top pointer"
                  onClick={hideBackToTop}
               />
            </div>
         )}
         {state.isLoading && (
            <div className="pt-3">
               <LoaderList fullWidth={true} />
            </div>
         )}
         <InfiniteScroll callBack={fetchNotifications} showLoader={state.hasMore}>
            {state.notificationArray?.map((notification, index) => {
               return (
                  <NotificationRow
                     notif={notification}
                     key={notification.id}
                     prevNotif={index === 0 ? null : state.notificationArray[index - 1]}
                     index={index}
                     markAll={state.markAllLabel}
                     markAllNotifications={markAllNotifications}
                     openNotif={openNotification}
                  />
               );
            })}
         </InfiniteScroll>
         {noNotifications && (
            <div className="h-100 flex-center flex-column">
               <img src="../../assets/images/newimages/notification-no-data.svg" />
               <div className="text-large my-3">No new notifications.</div>
            </div>
         )}
      </div>
   );
}
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
         toggleContent: dashboardActions.toggleContent,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(memo(NotificationView)));
