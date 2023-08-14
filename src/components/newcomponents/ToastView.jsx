import React, { memo } from "react";
import { v4 as uuid } from "uuid";

let style = {
   color: "#17182d",
   background: "rgba(242, 242, 242, 1)",
   boxShadow: "0px 4px 40px rgba(0, 0, 0, 0.25)",
   width: "450px",
   minHeight: "65px",
   fontWeight: "500",
};

export const defaultToastProps = {
   position: "top-center",
   autoClose: 3000,
   hideProgressBar: true,
   closeOnClick: true,
   closeButton: false,
   pauseOnHover: true,
   toastId: uuid(),
};

function ToastView(props) {
   // type => success/error/info/warning
   const { type = "success", text = "" } = props;

   return (
      <div style={style} className="toast-view round-border-l flex-center justify-content-start">
         <img className="ml-4 mr-3" src={`/assets/images/newimages/${type}-icon.svg`} alt="" />
         <div className={`h3 m-0 p-2`}>{text}</div>
      </div>
   );
}

export default memo(ToastView);
