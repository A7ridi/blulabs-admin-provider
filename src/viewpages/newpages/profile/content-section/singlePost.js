import React, { memo, useMemo, useState } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { getMediaIconNew, calculateDateLabel } from "../../../../helper/CommonFuncs";
import { giveReaction, mediaViews } from "../../../../Apimanager/Networking";
import { ReactComponent as LikeSvg } from "../../../../images/like-icon.svg";
import { ReactComponent as LoveSvg } from "../../../../images/love-icon.svg";
import { ReactComponent as ThanksSvg } from "../../../../images/thanks-icon.svg";
import PostOptions from "./PostOptions";
import PostView from "./postViewDashboard";
import hospital from "../../../../assets/images/newimages/hospital-icon.svg";
import eye from "../../../../assets/images/eye.svg";
import eyefill from "../../../../assets/images/eye-fill.svg";
import "../Profile.css";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import AlertView from "../../../../components/newcomponents/AlertView";
import SeenByViewCont from "../../profileModule/container/SeenByViewCont";

const IconImg = memo(
   (props) => <img width={"100%"} height={"100%"} {...props} alt="" />,
   (prev, next) => prev.src === next.src
);

const ReactionIcon = memo(
   (props) => {
      return (
         <div data-toggle={props.dataToggle} className="flex-center flex-column flex-start">
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
      actions,
      onClickPost = () => {},
      modal = false,
   } = props;

   const localValue = localStorage.getItem("tableLayout");
   const defLayout = localValue !== null && localValue !== undefined ? parseInt(localValue) : 1;

   // const { actions } = postData;

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

   const getIconSrc = useMemo(() => {
      if (data?.type === "") {
         return "/assets/images/newimages/content-icons/referral-icon.svg";
      } else {
         return getMediaIconNew(data?.fileType, true, data?.hospitalId);
      }
   }, [data]);

   const isLiked = useMemo(() => (data?.likes?.indexOf(providerId) > -1 ? "selected" : ""), [data?.likes?.length]);

   const isLoved = useMemo(() => (data?.loves?.indexOf(providerId) > -1 ? "selected" : ""), [data?.loves?.length]);

   const isThanked = useMemo(() => (data?.thanks?.indexOf(providerId) > -1 ? "selected" : ""), [data?.thanks?.length]);

   const loadingCls = useMemo(() => (isLoading ? "loading-shade round-border-m" : ""), [isLoading]);

   const getDate = calculateDateLabel(data.content.createdAt);

   const seenImg =
      postData?.isProviderViewed && postData?.isPatientViewed
         ? eyefill
         : postData?.isPatientViewed || postData?.isProviderViewed
         ? eyefill
         : eye;

   const onReaction = (type, obj, indx) => {
      let list = data[type];

      if (!list) list = [];
      let idIndx = list?.indexOf(providerId);
      if (idIndx === -1) {
         list.push(providerId);
      } else {
         list.splice(idIndx, 1);
      }
      setstate({ ...data, [type]: list });
      giveReaction(obj);
   };

   const getReactnObj = (type) => {
      return {
         itemId: data.type === "item" ? data.id : "",
         mediaId:
            data.type === "media" ||
            data.type === "image/jpeg" ||
            data.type === "audio/m4a" ||
            data.type === "video/mp4"
               ? data.id
               : "",
         type: type,
      };
   };

   const onSeenByClick = () => {
      let st = { ...state };
      st.seenBy = defSeenByStates();
      st.seenBy.show = true;
      st.selectedData = defState.selectedData;
      setState({ ...st });
   };
   const isTitleVisible = actions.some((some) => {
      return some.type === "title";
   });
   const isSeenVisible = actions.some((some) => {
      return some.type === "views";
   });
   const isReactVisible = actions.some((some) => {
      return some.type === "like";
   });
   const isOptionsVisible = actions.some((some) => {
      return some.type === "options";
   });

   return (
      <div
         onClick={() => {
            onClickPost(postData);
         }}
         style={{ borderRadius: "10px", backgroundColor: "white" }}
         className={`${loadingCls && "p-3"} relative w-100 h-100 Post ${
            modal ? " post-dashboard-modal" : "post-dashboard"
         }  flex-center justify-content-between flex-column shadow ${className} ${!isPreview && "h-100"}`}
      >
         {isTitleVisible && <div className="div-absolute-title">{postData.content.patient.name.fullName}</div>}
         <div
            className={`w-100  flex-grow-1  round-border-xl  overflow-hidden pointer ${loadingCls} ${
               !loadingCls && " flat-border-br flat-border-bl "
            } ${data?.type === "referral" ? "main-container-refer" : ""}`}
            // onClick={postData && !isPreview && onPreview}
            // style={{ height: `${data?.type === "referral" ? "68%" : "70%"}` }}
         >
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

            {isSeenVisible && (
               <div
                  className="post-top position-absolute flex-center justify-content-end w-100 p-4"
                  style={{ top: "0", zIndex: "10000" }}
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
                        display: `${data?.type === "referral" && "none"}`,
                     }}
                  >
                     {data?.type === "referral" ? null : (
                        <IconImg
                           className="pointer"
                           src={seenImg}
                           onClick={(event) => {
                              onSeenByClick();
                              event.stopPropagation();
                           }}
                        />
                     )}
                  </div>
               </div>
            )}
         </div>

         <div
            className={`${!isPreview} ${loadingCls && `${loadingCls} mt-3 round-border-xl`} w-100  ${
               isPreview && " px-3 pt-3 "
            } `}
         >
            <PatientDetailsView
               className={`   ${data?.type === "referral" ? "" : "w-85 mt-2"}`}
               PostCard={true}
               name={data?.type === "item" ? "" : data?.content.title}
               details={[{ title: data?.addedByName }]}
               isPreview={isPreview}
               dataType={data?.type}
               // loadingCls={loadingCls}
            />

            <div className={`post-bottom d-flex w-100 ${loadingCls} flex-column p-2 ml-2 ${isPreview && "mt-2 "} `}>
               <>
                  {/* {data?.type === "referral" ? (
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
                     <> */}
                  <div className={`d-flex w-100  details-div align-items-center `}>
                     {/* {[{ title: data?.content.provider.name.fullName }].map((obj, index) => {
                        return (
                           <div
                              key={index}
                              className="title-value-div d-flex align-items-center flex-wrap w-75 text-xmedium f-w-500 overflow-hidden truncate ..."
                              overflow-hidden
                           >
                              <div className={`text-truncate ${"title-div"}`}>{obj.title}</div>

                              <div className={`  text-truncate ${"value-div"}`}>{obj.value}</div>
                           </div>
                        );
                     })} */}
                     <div className="d-flex w-25 justify-content-end" style={{ gap: `${isPreview && "6%"}` }}>
                        {/* {isReactVisible && (
                           <ReactionIcon
                              svg={
                                 <LoveSvg
                                    className={`${isLoved && "loved"}  pointer`}
                                    onClick={() => onReaction && onReaction("loves", getReactnObj("loves"))}
                                 />
                              }
                              numb={data?.loves?.length}
                           />
                        )}
                        {isOptionsVisible && (
                           <PostOptions data={data} optionTapped={optionTapped} className={`flex align-center`} />
                        )} */}
                     </div>
                  </div>
                  <div
                     className={`w-100 text-xsmall text-black mb-2  d-flex justify-content-start ${
                        isPreview && "mt-2"
                     }`}
                  >
                     <div className={`${loadingCls} round-border-m`}>
                        <span>{getDate}</span>
                     </div>
                  </div>
               </>

               {state.seenBy.show && (
                  <SeenByViewCont
                     contentId={postData.content.id}
                     patientId={postData.content.patient.id}
                     closeSeenBy={() => {
                        setState({
                           ...state,
                           seenBy: defSeenByStates(),
                        });
                     }}
                  />
               )}
            </div>
         </div>
      </div>
   );
}

export default memo(Post);
