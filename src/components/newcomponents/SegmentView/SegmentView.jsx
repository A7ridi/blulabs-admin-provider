import React, { memo, Fragment } from "react";
import "./SegmentView.css";
import separator from "../../../images/profileSection/Separator.svg";

function SegmentView(props) {
   const {
      options,
      className,
      onSelect,
      selectedIndex = 0,
      profile = false,
      tabOne,
      tabTwo,
      teamProfile,
      teamClass,
      teamClassName,
      library = false,
   } = props;

   return (
      <center>
         <div
            className={`${
               profile || teamProfile ? "segmentViewProfile" : "SegmentView"
            } flex-center round-border-s ${className}`}
         >
            <div className={`h-100 position-absolute flex-center w-100 ${teamClass}`}>
               {options?.map((opt, index) => (
                  <Fragment key={index}>
                     <div
                        id={opt.pendoId}
                        // id={opt.text}
                        key={opt.id}
                        className={`opt-div flex-center pointer ${
                           selectedIndex === index
                              ? "selected"
                              : profile
                              ? "unslected-segment-profile"
                              : "unslected-segment"
                        } ${teamClassName}`}
                        onClick={() => onSelect && onSelect(opt, index)}
                     >
                        {opt.text}
                        {profile && !library && ` (${index === 0 ? tabOne : tabTwo})`}
                     </div>
                     {!profile &&
                        !(selectedIndex === index || index === options.length - 1 || index === selectedIndex - 1) && (
                           <div>
                              <img src={separator} alt="separator" />
                           </div>
                        )}
                  </Fragment>
               ))}
            </div>
         </div>
      </center>
   );
}

export default memo(SegmentView);
