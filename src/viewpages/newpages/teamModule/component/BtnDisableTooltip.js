import React from "react";
import * as i18n from "../../../../I18n/en.json";

const BtnDisableTooltip = ({ checkMemberRole, className = "" }) => {
   const permissionTxt = i18n?.clinicalTeam.permissionText;

   return <>{!checkMemberRole && <span className={`${className || "tooltiptext"}`}>{permissionTxt}</span>}</>;
};

export default BtnDisableTooltip;
