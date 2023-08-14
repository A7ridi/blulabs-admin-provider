import React, { memo, useMemo, useState } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { getMediaIconNew, calculateDateLabel } from "../../../../helper/CommonFuncs";
import { giveReaction } from "../../../../Apimanager/Networking";
import LoveSvg from "../../../../images/providerListing/Vector.svg";
import UnfillLove from "../../../../images/providerListing/unfillHeart (2).svg";
import PostOptions from "./PostOptions";
import PostView from "./postViewGqls";
import hospital from "../../../../assets/images/newimages/hospital-icon.svg";
import "../Profile.css";
import { checkLoved } from "../../../../helper/CommonFuncs";
import { withRouter } from "react-router";
import { mediaType } from "../../../../helper";

import crossBtn from "../../../../images/cross.svg";

function Post(props) {
   const {
      postData,
      className,
      accessToken,
      isLoading,
      onPreview,
      isPreview,
      optionTapped,
      onTextClick,
      user,
      refetch,
      onModalTapped,
      loggedInUserId,
   } = props;

   const loved = checkLoved(postData.loves, loggedInUserId);
   const [data, setstate] = useState(postData);
   const [isLoved, setIsLoved] = useState(loved);

   const getIconSrc = useMemo(() => {
      if (data?.type === "") {
         return "/assets/images/newimages/content-icons/referral-icon.svg";
      } else {
         return getMediaIconNew(data?.type, true, data?.hospital.id);
      }
   }, [data]);

   const loadingCls = useMemo(() => (isLoading ? "loading-shade round-border-m" : ""), [isLoading]);

   const getDate = calculateDateLabel(postData?.createdAt);

   const onReaction = async (type, obj) => {
      giveReaction(obj).then(() => {
         setIsLoved(!isLoved);
         refetch();
      });
   };

   const getReactnObj = (type) => {
      return {
         itemId: data.type === "text" ? data.id : "",
         mediaId: mediaType.includes(data.type) ? data.id : "",
         type: type,
      };
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
                  <div className={`post-top flex-center justify-content-end p-2 round-border-m ${loadingCls}`}>
                     <img
                        src={crossBtn}
                        onClick={(e) => {
                           e.stopPropagation();
                           onModalTapped();
                        }}
                        alt="seen-img"
                        className="pointer"
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
                           {[{ title: data?.provider.name.fullName }].map((obj, index) => {
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
                              <img
                                 onClick={() => {
                                    onReaction && onReaction("loves", getReactnObj("loves"));
                                 }}
                                 className={`pointer image-heart-imp`}
                                 src={isLoved ? LoveSvg : UnfillLove}
                                 alt="love-svg"
                              />

                              {/* <PostOptions data={data} optionTapped={optionTapped} className={`flex align-center`} /> */}
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
            </div>
         </div>
      </div>
   );
}

export default withRouter(memo(Post));
