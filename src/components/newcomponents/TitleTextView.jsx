import React, { memo } from "react";
import "../../viewpages/newpages/teamModule/team.css";

const TitleTextView = (props) => {
   const {
      title = "Title",
      id,
      containerclass,
      titleClass,
      inputclass,
      renderInput,
      defaultValue,
      inputView,
      placeholderClass,
      onBlur,
      disabled = false,
   } = props;

   return (
      <div id={id} className={`TitleTextView d-flex flex-column w-100 ${containerclass}`}>
         {!inputView && (
            <div
               style={{
                  minHeight: "24px",
                  display: title === "none" ? "none" : "block",
               }}
               className={`${`text-normal font-weight-bold mb-2 ${titleClass}`}`}
            >
               {title}
            </div>
         )}
         {renderInput ? (
            renderInput()
         ) : (
            <input
               id="input-title-update"
               className={`default-text-input h-small text-small p-3 ${inputclass} ${placeholderClass}`}
               value={defaultValue}
               type="text"
               onChange={onBlur}
               disabled={disabled}
               {...props}
            />
         )}
      </div>
   );
};

export default memo(TitleTextView);
