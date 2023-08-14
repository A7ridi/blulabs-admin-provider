import React, { memo, useState, useMemo } from "react";
import { Video } from "../../../../components/newcomponents/VideoRecorder";
import { AudioPlaybackView } from "../createContent/subviews";
import { GET_THUMBNAIL_SIGNED_URL } from "../../profileModule/actions/profileQueries";
import { useQuery } from "@apollo/client";
import {
   isValidUrl,
   isNumber,
   callMobileNumber,
   sendMail,
   openLink,
   isValidEmail,
   clearConsole,
} from "../../../../helper/CommonFuncs";

const PostView = memo(
   (props) => {
      const {
         data,
         className,
         accessToken,
         isPreview,
         PostCard,
         user,
         isLibraryFile = false,
         libraryShare = false,
         setIsLoading,
         onTextClick,
      } = props;

      const [signedUrl, setsignedUrl] = useState(null);
      let mentionNumber = -1;
      let title = "";
      const dataType = data?.type || "";
      const skip = dataType === "text" || dataType === "item" || dataType === "referral";

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
            setsignedUrl(result.getSignedURL?.url);
         },
      });

      const ftype = data?.fileType?.split("/")[0] || data?.type;

      const getMediaURL = useMemo(() => {
         if (isPreview && signedUrl) {
            return signedUrl;
         } else {
            if (data?.type === "referral")
               return `${process.env.REACT_APP_PROFILE_URL}/${user?.enterpriseId}_logo?id=${Date.now()}`;
            else if (!data?.thumbnail) return "/assets/images/newimages/default-thumb.svg";
            let url = `${process.env.REACT_APP_URL}/media/getMedia/${data?.thumbnail}?authorization=Bearer ${accessToken}`;
            return url;
         }
      }, [data?.thumbnail, signedUrl]);

      const addDefaultSrc = (e) => {
         clearConsole();
         e.target.src = "/assets/images/newimages/default-thumb.svg";
      };
      if (data?.type === "text") {
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
      } else if (ftype === "image" || !isPreview) {
         let fitType = "cover";
         return (
            <div className={data?.type === "referral" ? "h-100" : "flex-center h-100 "}>
               {data?.type === "referral" ? (
                  <div style={{ paddingTop: "10px" }} className={`${PostCard && "ml-4"}`}>
                     <div className="para-one">{data.titleDescription}</div>
                     <div className="para-two">
                        {data.subTitleDescription}
                        <br />
                     </div>

                     <div className="para-two">see more...</div>
                  </div>
               ) : (
                  <img
                     style={
                        data?.type === "referral"
                           ? {
                                padding: 0,
                                opacity: 0.7,
                                objectFit: "contain",
                                maxWidth: "100%",
                                maxHeight: "100%",
                             }
                           : { objectFit: isPreview ? "contain" : fitType }
                     }
                     className={`${className} h-100`}
                     src={getMediaURL}
                     onError={() => clearConsole()}
                     width="100%"
                     alt=""
                  />
               )}
               {ftype === "video" ? (
                  <img className="position-absolute" src="/assets/images/newimages/recording-icons/play-icon.svg" />
               ) : null}
               {ftype === "audio" ? (
                  <div className="position-absolute w-100 h-100 flex-center bg-white">
                     <img
                        className="w-100 h-100 p-5 bg-light-blue"
                        width="80%"
                        height="80%"
                        src="/assets/images/newimages/recording-icons/visualizer.svg"
                     />
                  </div>
               ) : null}
            </div>
         );
      } else if (ftype === "video" || ftype?.includes("video")) {
         return <Video width="100%" height="100%" controls src={getMediaURL} autoPlay={isPreview} />;
      } else if (ftype?.includes("application")) {
         return signedUrl ? (
            <embed
               width="100%"
               height="100%"
               src={`${getMediaURL}#zoom=0&scrollbar=0&#toolbar=0&navpanes=0` + "#toolbar=0"}
               onContextMenu={(e) => e.preventDefault()}
               style={{ zIndex: "9" }}
               onError={() => {
                  clearConsole();
               }}
            />
         ) : (
            <div className="loading-shade w-100 h-100" alt="" />
         );
      } else if (ftype === "audio" || ftype?.includes("audio")) {
         return <AudioPlaybackView src={getMediaURL} isPreview={isPreview} />;
      } else {
         return (
            <img
               className={`w-100 ${className}`}
               src={getMediaURL}
               onError={addDefaultSrc}
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

export default PostView;
