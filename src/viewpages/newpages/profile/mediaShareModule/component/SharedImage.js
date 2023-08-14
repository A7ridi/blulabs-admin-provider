import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import TextContent from "../../../../../I18n/en.json";
import { GET_THUMBNAIL_SIGNED_URL } from "../../../profileModule/actions/profileQueries";

const SharedImage = ({ contentId, ftype, closeModal, setComments, comments = "", title = "" }) => {
   const defaultImg = "/assets/images/newimages/default-thumb.svg";
   const [thumbnailUrl, setThumbnailUrl] = useState(defaultImg);

   const skip = ftype === "text" || ftype === "item" || ftype === "referral";
   const isAudio = ftype?.includes("audio");

   useQuery(GET_THUMBNAIL_SIGNED_URL, {
      skip,
      fetchPolicy: "no-cache",
      variables: {
         content: {
            id: contentId,
            description: "",
         },
         thumbnail: true,
      },
      onCompleted(result) {
         setThumbnailUrl(result.getSignedURL?.thumbnailUrl);
      },
   });
   return (
      <div className="image-commentBox overflow-hidden">
         <div
            className="d-flex flex-column align-items-center position-relative justify-content-center image-box"
            style={{ height: "94%" }}
         >
            {skip ? (
               <h3 className="text-bold px-4">{title}</h3>
            ) : (
               <img src={thumbnailUrl} alt="" style={{ height: "100%" }} />
            )}
            {isAudio ? (
               <div className="position-absolute w-100 h-100 flex-center bg-white">
                  <img
                     alt="audio-visualizer"
                     width="200"
                     src="/assets/images/newimages/recording-icons/visualizer.svg"
                  />
               </div>
            ) : null}
            <span className="img-shadow-effect"></span>
         </div>
         <div className="close-share-modal" onClick={closeModal}>
            &times;
         </div>
         <input
            type="text"
            placeholder={TextContent.shareFeature.placeholder}
            className="comment-input position-absolute round-border-m px-4 py-3"
            style={{ bottom: "15%" }}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
         />
      </div>
   );
};

export default SharedImage;
