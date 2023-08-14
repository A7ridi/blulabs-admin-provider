import React, { memo } from "react";
import "../../../../components/newcomponents/patientDetailsView/PatientDetailsView.css";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";
import { usePopperTooltip } from "react-popper-tooltip";
import "react-popper-tooltip/dist/styles.css";

function TeamDetailsView(props) {
   const {
      imageSrc,
      className = "",
      name = "",
      nameclass = "",
      imageRad = 38,
      details = [],
      userBg,
      initialsApi = false,
      teamTable,
      providerList = false,
   } = props;

   const { getTooltipProps, setTooltipRef, setTriggerRef, visible } = usePopperTooltip();
   return (
      <>
         <div
            className={`PatientDetailsView w-100 flex-center justify-content-between overflow-hidden ${className}`}
            style={{ height: `${providerList ? "50px" : "60px"}`, marginLeft: "20px" }}
         >
            {teamTable ? (
               <Avatar
                  initialsApi={initialsApi}
                  src={imageSrc}
                  className={`flex-shrink-0 avatar-initials`}
                  bgColor={userBg}
                  radius={imageRad}
               />
            ) : null}
            <div className={`details-div d-flex flex-column flex-grow-1 overflow-hidden`}>
               <div
                  className={`name text-truncate text-medium first-letter-cap text-capitalize ${nameclass}`}
                  style={{ paddingBottom: "2px", position: "relative" }}
               >
                  {name.length > 23 ? (
                     <div
                        ref={setTriggerRef}
                        className="text-truncate"
                        style={{ paddingBottom: "2px", position: "relative" }}
                     >
                        {name}
                     </div>
                  ) : (
                     name
                  )}
               </div>
               {details?.map((obj, index) => {
                  const title = obj?.title;
                  const degree = obj?.degree;
                  const checkTitle = title?.length === 0 || title === null || title === undefined;
                  const checkDegree = degree?.length === 0 || degree === null || degree === undefined;
                  return (
                     <div key={index} className="title-value-div d-flex flex-wrap w-100">
                        <div className={`text-truncate title-div`}>{title}</div>
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
                  top: "110%",
                  justifyContent: "center",
                  alignItems: "center",
               }}
            >
               {name}
               <div />
            </div>
         )}
      </>
   );
}

export default memo(TeamDetailsView);
