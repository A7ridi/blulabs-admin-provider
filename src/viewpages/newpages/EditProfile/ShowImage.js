import React from "react";

const ShowImage = ({ srcImg, isPhotoSelected }) => {
   return (
      <img
         src={srcImg}
         onError={(e) => {
            e.target.style.opacity = 0;
            e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
         }}
         alt=""
         height={!isPhotoSelected ? "180px" : "252px"}
         width={!isPhotoSelected ? "180px" : "252px"}
         style={{ top: `${!isPhotoSelected ? "20px" : "0px"}` }}
         className={`${!isPhotoSelected && "position-absolute"} full-round-border`}
      />
   );
};

export default ShowImage;
