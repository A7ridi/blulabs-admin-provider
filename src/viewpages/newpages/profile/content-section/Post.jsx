import React, { memo, useMemo, useRef, useState } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { getMediaIconNew, calculateDateLabel } from "../../../../helper/CommonFuncs";
import { giveReaction, mediaViews, readNotification } from "../../../../Apimanager/Networking";
import { ReactComponent as LikeSvg } from "../../../../images/like-icon.svg";
import { ReactComponent as LoveSvg } from "../../../../images/love-icon.svg";
import { ReactComponent as ThanksSvg } from "../../../../images/thanks-icon.svg";
import PostOptions from "./PostOptions";
import PostView from "./PostView";
import hospital from "../../../../assets/images/newimages/hospital-icon.svg";
import eye from "../../../../assets/images/eye.svg";
import eyefill from "../../../../assets/images/eye-fill.svg";
import "../Profile.css";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import AlertView from "../../../../components/newcomponents/AlertView";
import moment from "moment";
import { calculateDateDay } from "../../../../helper/CommonFuncs";
import { withRouter } from "react-router";
import { mediaType } from "../../../../helper";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

const IconImg = memo(
   (props) => <img width={"100%"} height={"100%"} {...props} alt="" />,
   (prev, next) => prev.src === next.src
);

const ReactionIcon = memo(
   (props) => {
      return (
         <div
            id={pendoIds.btnContentLoveIcon}
            data-toggle={props.dataToggle}
            className="flex-center flex-column flex-start"
         >
            {props.svg ? props.svg : <IconImg className="pointer mb-1" {...props} />}
            {/* <div style={{ height: "10px" }}>{props.numb > 0 ? props.numb : ""}</div> */}
         </div>
      );
   },
   (prev, next) => prev.numb === next.numb
);

function Post(props) {
   const {
      postData,
      providerId,
      className,
      accessToken,
      isLoading,
      onPreview,
      isPreview,
      optionTapped,
      onSeenBy,
      onTextClick,
      user,
   } = props;

   const localValue = localStorage.getItem("tableLayout");
   const defLayout = localValue !== null && localValue !== undefined ? parseInt(localValue) : 1;

   const defListStates = () => ({
      loadedOnce: false,
      hasMore: true,
      isFetchingNext: false,
      list: Array(6).fill(),
      pageSize: 20,
      page: 1,
      total: null,
      loadingSearch: false,
   });
   const defSeenByStates = () => ({
      show: false,
      isloading: true,
      list: Array(6).fill(),
   });

   const defState = {
      isProvOnly: false,
      viewType: defLayout,
      recent: { ...defListStates(), type: "patientOnly" },
      provOnly: { ...defListStates(), type: "providerOnly" },
      selectedData: {
         item: null,
         index: null,
      },
      seenBy: defSeenByStates(),
      isloading: false,
   };

   const [data, setstate] = useState(postData);
   const [preview, setPreview] = useState(false);
   const [showContent, setShowContent] = useState(false);
   const [state, setState] = useState(defState);
   const seenByRef = useRef(null);
   const SeenByView = memo((props) => {
      const { isloading, list = [] } = props;
      return (
         <AlertView
            alertclass="width-seenby h-4xl h-75 p-4 round-border-m"
            titleText="Seen By"
            buttons={[]}
            contentView={() => (
               <div className="my-4 h-100 div-content-main-seen-by">
                  {list.length === 0 && <div className="empty-seenby-view">No views available</div>}
                  {list?.reverse()?.map((obj, i) => {
                     const dateObj = obj?.isExternal
                        ? calculateDateDay(obj?.timestamp * 1000)
                        : calculateDateDay(obj?.createdat);
                     const currentDate = dateObj;
                     const isNew = currentDate !== seenByRef.current;
                     seenByRef.current = dateObj;
                     const timeFormat = obj?.isExternal ? new Date(obj?.timestamp * 1000) : obj?.createdat;

                     return (
                        <>
                           {((i === 0 && obj?.createdat) || isNew) && !isloading && (
                              <div className="date-seen-by">{currentDate}</div>
                           )}
                           <div
                              className={`
                           d-flex align-items-center justify-content-between
                           mb-3 h-xsmall ${isloading ? "loading-shade" : ""}`}
                           >
                              <PatientDetailsView
                                 userBg={window.initialColors[i % window.initialColors.length]}
                                 name={obj?.rawdata.name}
                                 details={[{ title: obj?.rawdata.mobileNo }, { title: obj?.rawdata.email }]}
                              />
                              <div className="timeStamp-seen-by">{moment(timeFormat).format("hh:mm a")}</div>
                           </div>
                        </>
                     );
                  })}
               </div>
            )}
            {...props}
         />
      );
   });

   const getIconSrc = useMemo(() => {
      if (data?.type === "") {
         return "/assets/images/newimages/content-icons/referral-icon.svg";
      } else {
         return getMediaIconNew(data?.fileType, true, data?.hospitalId);
      }
   }, [data]);

   const isLiked = useMemo(() => (data?.likes?.indexOf(providerId) > -1 ? "selected" : ""), [data?.likes?.length]);

   const isLoved = useMemo(
      () =>
         data?.activity
            ? data?.activity?.loves?.indexOf(providerId) > -1
               ? "selected"
               : ""
            : data?.loves?.indexOf(providerId) > -1
            ? "selected"
            : "",
      [data?.activity?.loves?.length, data?.loves?.length]
   );

   const isThanked = useMemo(() => (data?.thanks?.indexOf(providerId) > -1 ? "selected" : ""), [data?.thanks?.length]);

   const loadingCls = useMemo(() => (isLoading ? "loading-shade round-border-m" : ""), [isLoading]);

   const getDate = calculateDateLabel(postData?.createdAt);

   const seenImg =
      postData?.isProviderViewed && postData?.isPatientViewed
         ? eyefill
         : postData?.isPatientViewed || postData?.isProviderViewed
         ? eyefill
         : eye;

   const onReaction = async (type, obj, indx) => {
      var list = data?.activity?.loves || data[type];

      if (!list) list = [];
      let idIndx = list?.indexOf(providerId);
      if (idIndx === -1 || list.length == 0) {
         list.push(providerId);
      } else {
         list.splice(idIndx, 1);
      }
      var activity;
      if (data?.activity) {
         activity = { ...data?.activity };
         activity[type] = list;
      } else {
         activity = { [type]: list };
      }
      setstate({ ...data, ...activity });
      giveReaction(obj);
      if (data?.activity) {
         try {
            let res = await readNotification({
               mediaId: data.id,
               operationType: "read",
            });
            let resObj = res.data.data.media ? res.data.data.media : { ...res.data.data.item, type: "item" };
            let path = window.location.pathname;
            props.history.replace(path, {
               notif: { ...resObj, isGlobal: true },
            });
         } catch {}
      }
   };

   const getReactnObj = (type) => {
      return {
         itemId: data.type === "item" ? data.id : "",
         mediaId: mediaType.includes(data.type) ? data.id : "",
         type: type,
      };
   };

   const onSeenByClick = () => {
      let st = { ...state };
      st.seenBy = defSeenByStates();
      st.seenBy.show = true;
      st.selectedData = defState.selectedData;
      setState({ ...st });
      mediaViews({ mediaId: data?.id }).then((res) => {
         st.seenBy.list = res.data.data || [];
         st.seenBy.isloading = false;
         setState({ ...st });
      });
      setPreview(false);
      setShowContent(false);
   };

   const isReferal = data?.type === "referral";

   return (
      <div
         className={`${loadingCls && "p-3"} Post flex-center justify-content-between flex-column shadow ${className} ${
            !isPreview && "h-100"
         }`}
      >
         <div
            className={`w-100  flex-grow-1 ratio-16-9  round-border-xl  overflow-hidden pointer ${loadingCls} ${
               !loadingCls && " flat-border-br flat-border-bl "
            } ${isReferal ? "main-container-refer" : ""}`}
            onClick={postData && !isPreview && onPreview}
            style={{ height: `${isReferal ? "68%" : "70%"}` }}
         >
            {/* {isReferal && (
               <div className="referal-time">
                  <span>{getDate}</span>
               </div>
            )} */}
            <PostView
               onTextClick={onTextClick}
               user={user}
               data={data}
               isPreview={isPreview}
               accessToken={accessToken}
               className={`${(!data?.fileType?.includes("image") || !isPreview) && "w-100"}  ratio-16-9`}
               //className="w-100 ratio-16-9"
               type={0}
               PostCard={true}
            />

            {!isReferal && (
               <div
                  className="post-top position-absolute flex-center justify-content-end w-100 p-4"
                  style={{ top: "0" }}
               >
                  <div
                     className={`post-top flex-center justify-content-end p-2 round-border-m ${loadingCls}`}
                     style={{
                        background: `${
                           postData?.isProviderViewed && postData?.isPatientViewed
                              ? "#16A000"
                              : postData?.isPatientViewed || postData?.isProviderViewed
                              ? "#16A000"
                              : "grey"
                        }`,
                     }}
                  >
                     <IconImg
                        id={pendoIds.btnContentSeenBy}
                        className="pointer"
                        src={seenImg}
                        onClick={(event) => {
                           onSeenByClick();
                           event.stopPropagation();
                        }}
                     />
                  </div>
               </div>
            )}
         </div>

         <div
            className={`${!isPreview} ${loadingCls && `${loadingCls} mt-3 round-border-xl`} w-100 ${
               isPreview && " px-3 pt-3 "
            } `}
            // style={{ height: `${postData?.type == "referral" ? "32%" : ""}` }}
         >
            <PatientDetailsView
               className={`${"w-85 mt-2"}`}
               PostCard={true}
               name={data?.type === "item" ? "" : data?.title}
               details={[{ title: data?.addedByName }]}
               isPreview={isPreview}
               dataType={data?.type}
               // loadingCls={loadingCls}
            />

            <div className={`post-bottom d-flex w-100 ${loadingCls} flex-column p-2 ${isPreview && "mt-2"} `}>
               <>
                  {isReferal ? (
                     <>
                        <div className={`d-flex w-100  details-div align-items-center `}>
                           <div className="h-2xs ratio-eq  rounded-circle">
                              <img
                                 width="100%"
                                 height="100%"
                                 className="icon-content-share"
                                 src={getIconSrc}
                                 alt="source-img"
                                 onError={(event) => {
                                    event.target.src = `${hospital}`;
                                    event.onerror = null;
                                 }}
                              />
                           </div>
                           {[{ title: data?.addedByName }].map((obj, index) => {
                              return (
                                 <div
                                    key={index}
                                    className="title-value-div d-flex align-items-center flex-wrap w-75 text-xmedium f-w-500 overflow-hidden"
                                    overflow-hidden
                                 >
                                    <div className={`text-truncate ${"title-div"}`}>{obj.title}</div>

                                    <div className={`  text-truncate ${"value-div"}`}>{obj.value}</div>
                                 </div>
                              );
                           })}
                        </div>
                        <div className="w-100 text-xsmall text-black  d-flex justify-content-start ">
                           <div className={`${loadingCls} p-2 round-border-m`}>
                              <span>{getDate}</span>
                           </div>
                        </div>
                     </>
                  ) : (
                     <>
                        <div className={`d-flex w-100  details-div align-items-center `}>
                           <div className="h-2xs ratio-eq  rounded-circle">
                              <img
                                 width="100%"
                                 height="100%"
                                 className="icon-content-share"
                                 src={getIconSrc}
                                 alt="source-img"
                                 onError={(event) => {
                                    event.target.src = `${hospital}`;
                                    event.onerror = null;
                                 }}
                              />
                           </div>
                           {[{ title: data?.addedByName }].map((obj, index) => {
                              return (
                                 <div
                                    key={index}
                                    className="title-value-div d-flex align-items-center flex-wrap w-75 text-xmedium f-w-500 overflow-hidden"
                                    overflow-hidden
                                 >
                                    <div className={`text-truncate ${"title-div"}`}>{obj.title}</div>

                                    <div className={`  text-truncate ${"value-div"}`}>{obj.value}</div>
                                 </div>
                              );
                           })}
                           <div className="d-flex w-25 justify-content-end" style={{ gap: `${isPreview && "6%"}` }}>
                              <ReactionIcon
                                 svg={
                                    <LoveSvg
                                       className={`${isLoved && "loved"}  pointer`}
                                       onClick={() => onReaction && onReaction("loves", getReactnObj("loves"))}
                                    />
                                 }
                                 numb={data?.loves?.length}
                              />
                              <PostOptions data={data} optionTapped={optionTapped} className={`flex align-center`} />
                           </div>
                        </div>

                        <div
                           className={`w-100 text-xsmall text-black  d-flex justify-content-start ${
                              isPreview && "mt-2"
                           }`}
                        >
                           <div className={`${loadingCls} p-2 round-border-m`}>
                              <span>{getDate}</span>
                           </div>
                        </div>
                     </>
                  )}
               </>
               {state.seenBy.show ? (
                  <ModalPopup
                     onModalTapped={() => {
                        setState({
                           ...state,
                           seenBy: defSeenByStates(),
                        });
                        setPreview(false);
                        setShowContent(false);
                     }}
                  >
                     <SeenByView
                        list={state.seenBy.list}
                        onClose={() => {
                           setState({
                              ...state,
                              seenBy: defSeenByStates(),
                           });
                           setPreview(false);
                           setShowContent(false);
                        }}
                        isloading={state.seenBy.isloading}
                     />
                  </ModalPopup>
               ) : null}
            </div>
         </div>
      </div>
   );
}

export default withRouter(memo(Post));
