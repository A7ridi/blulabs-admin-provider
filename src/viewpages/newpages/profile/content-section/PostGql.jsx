import React, { memo, useMemo, useState, useEffect } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { calculateDateLabel, clearConsole } from "../../../../helper/CommonFuncs";
import { giveReaction } from "../../../../Apimanager/Networking";
import { ReactComponent as LoveSvg } from "../../../../images/love-icon.svg";
import PostOptions from "./PostOptions";
import PostViewGql from "./PostViewGql.jsx";
import hospital from "../../../../assets/images/newimages/hospital-icon.svg";
import eye from "../../../../assets/images/eye.svg";
import eyefill from "../../../../assets/images/eye-fill.svg";
import "../Profile.css";
import { withRouter } from "react-router";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import SeenByViewCont from "../../profileModule/container/SeenByViewCont";
import ShareCont from "../mediaShareModule/container/ShareCont";

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

function PostGql(props) {
   const {
      postData,
      providerId,
      className,
      accessToken,
      isLoading,
      onPreview,
      isPreview,
      optionTapped,
      onTextClick,
      user,
      itemIndex,
      setPatientContent,
      isProvTab,
   } = props;

   const [data, setstate] = useState(postData);
   const [showSeenBy, setShowSeenBy] = useState(false);
   const [renderImage, setRenderImage] = useState(false);
   const hospitalId = data?.hospital?.id || false;
   const [showShareContent, setShowShareContent] = useState(false);

   // CHECK IF IMAGE EXISTS
   function checkIfImageExists(url, callback) {
      const img = new Image();
      img.src = url;

      if (img.complete) {
         callback(true);
      } else {
         img.onload = () => {
            callback(true);
         };

         img.onerror = () => {
            callback(false);
         };
      }
   }

   useEffect(() => {
      if (hospitalId) {
         checkIfImageExists(`${process.env.REACT_APP_PROFILE_URL}/${hospitalId}`, (exists) => {
            if (exists) {
               setRenderImage(true);
            } else {
               clearConsole();
            }
         });
      }
   }, []);

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

   const loadingCls = useMemo(() => (isLoading ? "loading-shade round-border-m" : ""), [isLoading]);

   const getDate = calculateDateLabel(postData?.createdAt);

   const seenImg = () => {
      let viewsArr = postData?.views?.map((o) => o.viewer.id) || [];
      if (viewsArr.length > 1 || (viewsArr.length === 1 && !viewsArr.includes(postData?.provider?.id))) {
         return true;
      } else {
         return false;
      }
   };

   const onReaction = (type, obj, indx) => {
      const { content } = props;
      giveReaction(obj).then(() => {
         const pushToLoves =
            data?.loves?.some((some) => {
               return some === providerId;
            }) || false;
         if (pushToLoves) {
            var index = data.loves.findIndex((find) => {
               return find === providerId;
            });
            data.loves.splice(index, 1);
         } else {
            var love = data?.loves || [];
            love.push(providerId);
            data.loves = love;
         }
         let updatedArray = content.map((s) => s);
         updatedArray[itemIndex] = data;
         setPatientContent(updatedArray);
      });
   };

   const getReactnObj = (type) => {
      const isItem = data?.type === "item" || data?.type === "text";
      const id = data.id;
      return {
         itemId: isItem ? id : "",
         mediaId: !isItem ? id : "",
         type: type,
      };
   };

   const onSeenByClick = () => {
      setShowSeenBy(true);
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
            <PostViewGql
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
                     onClick={(event) => {
                        onSeenByClick();
                        event.stopPropagation();
                     }}
                     className={`post-top flex-center justify-content-end p-2 round-border-m ${loadingCls}`}
                     style={{
                        background: `${seenImg() ? "#16A000" : "grey"}`,
                        zIndex: "100",
                     }}
                  >
                     <IconImg id={pendoIds.btnContentSeenBy} className="pointer" src={seenImg() ? eyefill : eye} />
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
               name={data?.title}
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
                                 onError={() => clearConsole()}
                                 src={
                                    renderImage
                                       ? `${process.env.REACT_APP_PROFILE_URL}/${hospitalId}`
                                       : `${process.env.REACT_APP_PROFILE_URL}/hospital.svg`
                                 }
                                 alt="source-img"
                              />
                           </div>
                           <div className={`text-truncate ${"title-div"} text-xmedium`}>
                              {props.postData?.provider?.name?.fullName}
                           </div>
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
                                 alt="source-img"
                                 onError={() => clearConsole()}
                                 src={
                                    renderImage ? `${process.env.REACT_APP_PROFILE_URL}/${hospitalId}` : `${hospital}`
                                 }
                              />
                           </div>

                           <div className="d-flex w-100 justify-content-between">
                              <div className="title-value-div flex-wrap text-xmedium f-w-500 overflow-hidden">
                                 <div className={`text-truncate ${"title-div"}`}>
                                    {props.postData?.provider?.name?.fullName}
                                 </div>
                              </div>
                              <div
                                 className={`d-flex align-items-center ${user?.id !== data?.provider?.id && "mr-2"}`}
                                 style={{ gap: `${isPreview ? "6%" : "5px"}` }}
                              >
                                 <ReactionIcon
                                    svg={
                                       <LoveSvg
                                          className={`${isLoved && "loved"} pointer `}
                                          onClick={() =>
                                             onReaction && onReaction("loves", getReactnObj("loves"), itemIndex)
                                          }
                                       />
                                    }
                                    numb={data?.loves?.length}
                                 />
                                 {showShareContent && (
                                    <ShareCont
                                       contentId={data?.id}
                                       ftype={data?.fileType?.split("/")[0] || data?.type}
                                       title={data?.title}
                                       setShowShareContent={setShowShareContent}
                                       showShareContent={showShareContent}
                                    />
                                 )}
                                 <PostOptions
                                    data={data}
                                    optionTapped={(id, obj, data) => {
                                       if (obj.id === 0) {
                                          setShowShareContent(true);
                                       } else optionTapped(id, obj, data);
                                    }}
                                    showShareContent={showShareContent}
                                    setShowShareContent={setShowShareContent}
                                    className={`flex align-center`}
                                 />
                              </div>
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
               {showSeenBy && (
                  <SeenByViewCont
                     isProvTab={isProvTab}
                     patientId={props.match.params.id}
                     contentId={data.id}
                     closeSeenBy={() => setShowSeenBy(false)}
                  />
               )}
            </div>
         </div>
      </div>
   );
}

export default withRouter(PostGql);
