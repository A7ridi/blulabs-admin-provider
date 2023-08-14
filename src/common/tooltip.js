import React from "react";
import "./tooltip.css";

export default function Tooltip({ title, text, name, children, home }) {
   const classString = name ? "tooltipName" : "tooltip";
   return (
      <div className={classString}>
         {children && children}
         {title && title + "..."}
         <div className={home ? "homeToolTip" : "tooltiptextCustom"}>{text}</div>
      </div>
   );
}
