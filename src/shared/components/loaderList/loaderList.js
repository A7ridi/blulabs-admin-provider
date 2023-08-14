import React from "react";
export default function LoaderList({ fullWidth = false }) {
   return Array(10)
      .fill()
      .map((o, index) => (
         <div key={index} style={fullWidth ? { width: "96%" } : {}} className="loading-shade-list demo-view " />
      ));
}
