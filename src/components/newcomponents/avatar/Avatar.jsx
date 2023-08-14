import React, { useMemo, useRef, useEffect } from "react";
import { clearConsole } from "../../../helper/CommonFuncs";

let dotStyle = {
   backgroundColor: "green",
   aspectRatio: "1 / 1",
   borderRadius: "50%",
   position: "absolute",
   right: "18%",
   right: "0",
   border: "0px solid white",
   bottom: 0,
   zIndex: 3,
};

const Avatar = (props) => {
   const {
      radius = 30,
      name = "",
      className,
      src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      status,
      bgColor,
      datatoggle,
      gotImage,
      profile = false,
      qrcode,
      initialsApi = false,
      errorImage = () => {},
   } = props;

   const imageRef = useRef();
   const initials = useMemo(() => {
      let lastCommaIndex = name.lastIndexOf(",");
      let result = lastCommaIndex > -1 ? name.substr(0, lastCommaIndex) : name;
      let nameArray = result.trim().split(" ");
      if (nameArray && nameArray.length > 1)
         return nameArray[0][0]?.toUpperCase() + (nameArray[nameArray.length - 1][0]?.toUpperCase() || "");
      return nameArray[0][0]?.toUpperCase() || "";
   }, [name]);

   useEffect(() => {
      if (imageRef.current) {
         imageRef.current.style.opacity = "1";
      }
   }, [name, src]);

   return (
      <div
         data-toggle={datatoggle}
         style={{ width: radius, height: radius }}
         className={`Avatar flex-center overflow-hidden ${className}`}
      >
         <div style={{ background: bgColor, borderRadius: "50%" }} className="w-100 h-100 flex-center overflow-hidden">
            {src && (
               <img
                  className="position-absolute"
                  onError={(e) => {
                     clearConsole();
                     errorImage();
                     e.target.style.opacity = 0;
                     e.target.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                  }}
                  onLoad={() => {
                     gotImage && gotImage();
                  }}
                  width="100%"
                  height="100%"
                  style={{ zIndex: 1, borderRadius: "50%" }}
                  src={src}
                  alt=""
                  ref={imageRef}
               />
            )}
            <h3
               style={{ fontSize: `${qrcode ? 17 : radius === 120 ? "22px" : 13}` }}
               className={`w-100 h-100 flex-center text-white ${profile && "avatar-header-text"}`}
            >
               {initialsApi ? initialsApi : initials}
            </h3>
         </div>
         {status ? <div style={dotStyle} className={`inner-dot w-25 ${status}`} /> : null}
      </div>
   );
};

export default Avatar;
