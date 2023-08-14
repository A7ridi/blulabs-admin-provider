import React from "react";

const CustomBtn = (props) => {
   const { successText, cancelText, successClass, cancelClass, successClick, cancelClick, className } = props;
   return (
      <div className={className}>
         <button className={successClass} onClick={successClick}>
            {successText}
         </button>
         <button className={cancelClass} onClick={cancelClick}>
            {cancelText}
         </button>
      </div>
   );
};

export default CustomBtn;
