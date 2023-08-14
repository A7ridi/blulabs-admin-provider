import React, { memo } from "react";

const BadgeView = memo((props) => {
   const {
      text,
      imageTag,
      src = "/assets/images/newimages/notification-icon.svg",
      dotStyle,
      onClick,
      className,
      dotclass,
      id,
   } = props;
   return (
      <div id={id} className={`${className} BadgeView flex-center`} onClick={onClick}>
         {imageTag ? imageTag() : <img src={src} />}
         {text ? (
            <div
               style={{
                  height: "16px",
                  minWidth: "16px",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "14px",
                  borderRadius: "8px",
                  top: "0px",
                  left: "16px",
                  color: "white",
                  ...dotStyle,
               }}
               className={`dot ${dotclass} position-absolute bg-red flex-center px-1`}
            >
               {text}
            </div>
         ) : null}
      </div>
   );
});

export default BadgeView;
