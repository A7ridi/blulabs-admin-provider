import React, { memo } from "react";
import "./PatientDetailsView.css";
import Avatar from "../../../components/newcomponents/avatar/Avatar";
import "../../../css/styles.css";
import Tooltip from "../../../common/tooltip";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";

function PatientDetailsView(props) {
   const {
      iconView,
      imageSrc,
      className,
      name,
      nameclass,
      PostCard,
      imageRad = 38,
      details = [],
      userBg,
      avatarCls,
      documentName,
      isLibTitle = false,
      isShareTeam = false,
      profile = false,
      loadingCls = false,
      isPreview,
      dataType,
      dashboard = false,
      initialsApi = false,
      careTeam,
      familyFriends,
   } = props;

   const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();

   return (
      <>
         <div
            className={`PatientDetailsView w-100  flex-center justify-content-between ${
               details.length > 1 && "py-2"
            } ${className}`}
         >
            {PostCard ? (
               ""
            ) : iconView ? (
               iconView()
            ) : (
               <Avatar
                  initialsApi={initialsApi}
                  src={imageSrc}
                  className={`flex-shrink-0 ${avatarCls} `}
                  bgColor={userBg}
                  radius={imageRad}
                  name={name}
               />
            )}
            <div
               className={`details-div d-flex flex-column flex-grow-1 overflow-hidden  ${loadingCls} ${
                  PostCard && "ml-0"
               }  ${profile && "color-profile-text"}`}
            >
               <div
                  className={`${
                     isLibTitle ? "libDocName" : "name"
                  } text-truncate text-xlarge first-letter-cap ${nameclass} ${
                     PostCard && "font-size-large f-w-600 ml-3"
                  } `}
                  style={{
                     fontSize: `${PostCard && "20PX"}`,
                     marginTop: `${dataType === "referral" && "-5px"}`,
                     fontWeight: `${dashboard ? "600" : ""}`,
                     height: `${(careTeam || familyFriends) && "19px"}`,
                     textTransform: "capitalize",
                  }}
               >
                  {documentName ? (
                     documentName
                  ) : name && isPreview ? (
                     name.length > 100 ? (
                        <Tooltip name title={name.substring(0, 100)} text={name} />
                     ) : (
                        name
                     )
                  ) : name && name.length > 22 ? (
                     <div className="text-truncate-custom" ref={setTriggerRef} style={{ position: "relative" }}>
                        {name}
                     </div>
                  ) : (
                     name
                  )}
               </div>
               {!PostCard &&
                  details.map((obj, index) => {
                     return (
                        <div key={index} className="title-value-div d-flex flex-wrap w-100">
                           {isShareTeam ? null : (
                              <div className={`  text-truncate ${profile ? "profile-title-div" : "title-div"}`}>
                                 {obj?.title}
                              </div>
                           )}
                           <div className={`  text-truncate ${profile ? "profile-value-div" : "value-div"}`}>
                              {obj?.value}
                           </div>
                        </div>
                     );
                  })}
               {props.children}
            </div>
         </div>
         {visible && (
            <div
               ref={setTooltipRef}
               {...getTooltipProps({ className: "tooltip-container" })}
               data-popper-placement="top"
               style={{
                  background: "#555",
                  color: "#fff",
                  fontSize: "12px",
                  zIndex: "9999999",
                  position: "absolute",
                  top: "35%",
                  justifyContent: "center",
                  alignItems: "center",
               }}
            >
               {name?.length > 100 ? name.substring(0, 100) + "..." : name}
               <div />
            </div>
         )}
      </>
   );
}

export default memo(PatientDetailsView);
