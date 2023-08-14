import React, { memo, useEffect } from "react";
import "../../viewpages/newpages/profileModule/container/profileSection.css";

export const Option = (props) => {
   const { obj, index, arrayLength, profile = false, post } = props;
   return (
      <div
         id={obj.pendoId}
         {...props}
         className={`${post && "div-main-post-view"} ${
            profile && index === arrayLength - 2 && "div-main-drop-option-last-second hover-default"
         } ${
            profile && index === arrayLength - 1
               ? "div-main-drop-option-last hover-default "
               : "div-main-drop-option hover-default"
         }`}
      >
         {obj.leftImg ? (
            <img
               className={`${profile && "image-size-drop"} ${
                  profile && (index === arrayLength - 1 || index === arrayLength - 2) && "image-second-last-icon"
               }
          ${profile ? " m-ad-drop" : "ml-2"} ${arrayLength} ${obj.margin ? "margin-adjust-library-option " : " mr-5"}`}
               src={obj.leftImg}
               alt=""
            />
         ) : null}
         {obj.leftView ? obj.leftView() : null}
         <div
            className={`${
               profile && (index === arrayLength - 1 || index === arrayLength - 2)
                  ? "dropDownToggleNewProfileOptionLast"
                  : "dropDownToggleNewProfileOption"
            }`}
         >
            {obj.text}
         </div>

         {obj.rightImg ? <img className="ml-5" src={obj.rightImg} alt="" /> : null}
         {obj.rightView ? obj.rightView() : null}
      </div>
   );
};

function Dropdowntoggle(props) {
   const { id, options = [], className, menuViewCls, dropDownView, onOptTapped, profile = false, post = false } = props;

   return (
      <div className={`dropdown ${className}`}>
         {props.children}
         <div
            className={`dropdown-menu ${!dropDownView && options?.length === 0 ? "no-border bg-transparent" : ""}
        ${profile && "dropdowm-render"}
        
        ${menuViewCls}`}
            id={`dropdown-${id}`}
            aria-labelledby={id}
         >
            <div>
               {dropDownView
                  ? dropDownView()
                  : options.map((obj, i) => (
                       <Option
                          post={post}
                          profile
                          key={i}
                          index={i}
                          arrayLength={options.length}
                          className={`dropdown-item hover-default ${obj.cls}`}
                          onClick={() => onOptTapped && onOptTapped(obj, i)}
                          obj={obj}
                       />
                    ))}
            </div>
            {/* <div className="dropdown-item" href="#">
        </div> */}
            {/* {dropDownView && dropDownView()} */}
         </div>
      </div>
   );
}

export default memo(Dropdowntoggle);
