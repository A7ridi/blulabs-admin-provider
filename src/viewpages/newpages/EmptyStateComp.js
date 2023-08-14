import React from "react";
import BtnDisableTooltip from "./teamModule/component/BtnDisableTooltip";

const EmptyStateComp = ({
   headerText,
   description,
   btnText = false,
   className,
   disabled,
   onClick = () => {},
   src = "",
   btnClassName = "",
   checkMemberRole = true,
}) => {
   return (
      <div
         className={`d-flex h-100 flex-center justify-content-center flex-column align-items-center gap-5 ${className}`}
      >
         <div className="no-patients-svg">
            <img src={src} alt={headerText} width={100} />
         </div>
         <h2 className="no-content-text mt-3">{headerText}</h2>
         <h4 className="no-content-description mt-4 text-center desc-width">{description}</h4>
         {btnText && (
            <button
               className={`btn-sm btn-default text-white font-weight-bold text-small round-border-m flex-center mx-3 mt-4 ${btnClassName}`}
               disabled={disabled}
               onClick={onClick}
            >
               {btnText}
               <BtnDisableTooltip checkMemberRole={checkMemberRole} className="tooltiptext" />
            </button>
         )}
      </div>
   );
};

export default EmptyStateComp;
