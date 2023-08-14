import React, { memo } from "react";
import { blueBtnCls, greyBtnCls, redBtnCls } from "../../common/constants";
import BtnDisableTooltip from "../../viewpages/newpages/teamModule/component/BtnDisableTooltip";

const AlertView = (props) => {
   const {
      alertclass,
      titleText,
      contentText,
      titleView,
      contentView,
      confirmText,
      cancelText,
      showLoader,
      onAction,
      onClose,
      showClose = true,
      confirmcls = "",
      cancelcls = "",
      createTeamList,
      teamSection,
      createNewTeam,
      deletedTeam,
      className,
      createClassName,
      message = false,
      textClass,
      xbuttonClass,
      createTeamBtn,
      confirmButtonId = null,
      confirmButtonText = null,
      cancelButtonId = null,
      buttons = [
         !message && {
            id: "alert-cancel-button",
            className: `${greyBtnCls} ${cancelcls} m-2`,
            text: "Cancel",
         },
         {
            id: confirmButtonId ? confirmButtonId : "alert-confirm-button",
            className: `${blueBtnCls} ${confirmcls} m-2`,
            text: confirmButtonText ? confirmButtonText : "Confirm",
         },
      ],
      checkRole = true,
      boldText = "",
      contentText2 = "",
   } = props;

   const getButtonText = (button) => {
      if (button.id === "alert-cancel-button" && cancelText) {
         return cancelText;
      } else if (button.id === "alert-confirm-button" && confirmText) {
         return confirmText;
      } else {
         return button.text;
      }
   };

   return (
      <div className={`AlertView bg-white ${alertclass}`}>
         <div className={`alert-title-div w-100 d-flex justify-content-end  ${createClassName}`}>
            {titleView ? (
               titleView()
            ) : (
               <h2 className={`text-black w-100 font-weight-bold text-center ${textClass}`}>{titleText}</h2>
            )}
            {showClose ? (
               <button className={`h1 m-0 h-100 flex-center position-absolute ${xbuttonClass}`} onClick={onClose}>
                  &times;
               </button>
            ) : null}
         </div>
         <div className="alert-content-div w-100">
            {contentView ? (
               contentView()
            ) : (
               <h2 className="my-5 text-black fw-500">
                  {contentText} <strong>{boldText}</strong> {contentText2}
               </h2>
            )}
         </div>
         <div className={`alert-actions-div w-100 flex-center ${className} ${createTeamBtn}`}>
            {showLoader ? (
               <div className="w-100 flex-center mt-5">
                  <img width="40px" height="40px" src="/assets/gif/newgifs/loader.gif" alt="" />
               </div>
            ) : createTeamList ? (
               <button
                  id={confirmButtonId ? confirmButtonId : "alert-confirm-button"}
                  className={`${blueBtnCls} ${confirmcls} m-2`}
                  onClick={createNewTeam}
               >
                  {confirmButtonText ? confirmButtonText : "Create team"}
               </button>
            ) : teamSection ? (
               <div className="d-flex flex-column">
                  <button
                     id={confirmButtonId ? confirmButtonId : "alert-confirm-button"}
                     className={`${blueBtnCls} ${confirmcls} m-2`}
                     onClick={() => onAction && onAction()}
                  >
                     Update
                  </button>
                  <button
                     id={cancelButtonId ? cancelButtonId : "alert-cancel-button"}
                     className={`${redBtnCls} ${cancelcls} m-2`}
                     onClick={deletedTeam}
                     style={{ marginTop: "-2px !important" }}
                  >
                     Delete
                     <BtnDisableTooltip checkMemberRole={checkRole} />
                  </button>
               </div>
            ) : (
               buttons.map((btn) => (
                  <button
                     key={btn.id}
                     onClick={() => onAction && onAction(btn)}
                     id={btn.id}
                     // className={btn.classes}
                     {...btn}
                  >
                     {getButtonText(btn)}
                  </button>
               ))
            )}
         </div>
      </div>
   );
};

export default memo(AlertView);
