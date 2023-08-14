import React, { memo, useState, useMemo } from "react";
import { Video } from "../../../../components/newcomponents/VideoRecorder";
import { AudioPlaybackView } from "../createContent/subviews";
import { GET_THUMBNAIL_SIGNED_URL } from "../../profileModule/actions/profileQueries";
import { useQuery } from "@apollo/client";
import playIcon from "../../../../images/play-icon.svg";
import {
   isValidUrl,
   isNumber,
   callMobileNumber,
   sendMail,
   openLink,
   isValidEmail,
   clearConsole,
} from "../../../../helper/CommonFuncs";

const PostViewGql = memo(
   (props) => {
      const { data, className, isPreview, PostCard, user } = props;

      const [signedUrl, setsignedUrl] = useState(null);
      const [thumbnailUrl, setThumbnailUrl] = useState(null);
      const ftype = data?.fileType?.split("/")[0] || data?.type;
      const skip = data?.type === "text" || data?.type === "item" || data?.type === "referral" ? true : false;
      const skipSigned = data?.type === "text" || data?.type === "item" || data?.type === "referral" || !isPreview;

      useQuery(GET_THUMBNAIL_SIGNED_URL, {
         skip: skipSigned,
         fetchPolicy: "no-cache",
         variables: {
            content: {
               id: data.id,
            },
            thumbnail: true,
         },
         onCompleted(result) {
            setsignedUrl(result.getSignedURL?.url);
         },
         onError() {
            clearConsole();
         },
      });

      useQuery(GET_THUMBNAIL_SIGNED_URL, {
         skip,
         variables: {
            content: {
               id: data.id,
               description: "",
            },
            thumbnail: true,
         },
         onCompleted(result) {
            setThumbnailUrl(result.getSignedURL?.thumbnailUrl);
         },
         onError() {
            clearConsole();
         },
      });

      const getMediaURL = useMemo(() => {
         if (isPreview && signedUrl) {
            return signedUrl;
         } else {
            if (data?.type === "referral")
               return `${process.env.REACT_APP_PROFILE_URL}/${user?.enterpriseId}_logo?id=${Date.now()}`;
            else if (thumbnailUrl) return thumbnailUrl;
            return "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
         }
      }, [data?.hasThumbnail, signedUrl, thumbnailUrl]);

      const addDefaultSrc = (e) => {
         e.target.src = "/assets/images/newimages/default-thumb.svg";
      };
      if (data?.type === "item" || data?.type === "text") {
         return (
            <div className={`w-100 h-100 text-large ${isPreview && "overflow-auto"} `}>
               <div
                  style={{ marginTop: `${PostCard && "0.7em"}`, whiteSpace: "pre-line" }}
                  className={`${PostCard && "ml-4"}`}
               >
                  <div>
                     {data?.title.split(" ").map((s) => {
                        const isNew = s === "/n";
                        const isValidURI = isValidUrl(s.replace("/\n/gi", ""));
                        const isColoured = isNumber(s) || isValidURI;

                        return (
                           <div
                              onClick={(e) => {
                                 if (isColoured && isPreview) {
                                    if (isValidEmail(s.replace("\n", ""))) {
                                       sendMail(s);
                                    }
                                    if (isNumber(s)) {
                                       callMobileNumber(s);
                                    }
                                    if (isValidURI) {
                                       openLink(s);
                                    }
                                 }
                              }}
                              style={{ zIndex: 100 }}
                              className={`${!isNew && "break-line-div"} ${
                                 (isColoured || isValidURI) && "div-mention-content"
                              } `}
                           >
                              {s + " "}
                           </div>
                        );
                     })}
                  </div>

                  {data?.subTitle}
               </div>
            </div>
         );
      } else if (ftype?.includes("image") || !isPreview) {
         let fitType = "cover";
         return (
            <div className={data?.type === "referral" ? "h-100" : "flex-center h-100 "}>
               {data?.type === "referral" ? (
                  <div style={{ paddingTop: "10px" }} className={`${PostCard && "ml-4"}`}>
                     <div className="para-one">{data.description}</div>
                     <div className="para-two">see more...</div>
                  </div>
               ) : (
                  <>
                     {isPreview ? (
                        <img
                           style={{ objectFit: isPreview ? "contain" : fitType }}
                           className={`${className} h-100`}
                           src={getMediaURL}
                           width="100%"
                           alt=""
                           onError={addDefaultSrc}
                        />
                     ) : (
                        <div
                           style={{
                              background: `url(${thumbnailUrl}) no-repeat center`,
                           }}
                           className="image-border-remove-gql"
                        ></div>
                     )}
                  </>
               )}

               {ftype?.includes("video") || ftype?.includes("audio") ? (
                  <img className="position-absolute" style={{ zIndex: "1" }} src={playIcon} alt="" />
               ) : null}
               {ftype?.includes("audio") ? (
                  <div className="position-absolute w-100 h-100 flex-center bg-white">
                     <img
                        alt=""
                        className="w-100 h-100 p-5 bg-light-blue"
                        width="80%"
                        height="80%"
                        src="/assets/images/newimages/recording-icons/visualizer.svg"
                     />
                  </div>
               ) : null}
            </div>
         );
      } else if (ftype?.includes("video")) {
         return <Video width="100%" height="100%" controls src={getMediaURL} autoPlay={isPreview} />;
      } else if (ftype?.includes("application")) {
         return signedUrl ? (
            <embed
               width="100%"
               height="100%"
               src={`${getMediaURL}#zoom=0&scrollbar=0&#toolbar=0&navpanes=0` + "#toolbar=0"}
               onContextMenu={(e) => e.preventDefault()}
               style={{ zIndex: "9" }}
            />
         ) : (
            <div className="loading-shade w-100 h-100" alt="" />
         );
      } else if (ftype?.includes("audio")) {
         return <AudioPlaybackView src={getMediaURL} isPreview={isPreview} />;
      } else {
         return (
            <img
               className={`w-100 ${className}`}
               src={getMediaURL}
               onError={addDefaultSrc}
               // style={{ objectFit: "contain" }}
               width="100%"
               height="100%"
               alt=""
               style={{
                  objectFit: "contain",
               }}
            />
         );
      }
   },
   (prev, next) => prev.type === next.type
);

export default PostViewGql;
