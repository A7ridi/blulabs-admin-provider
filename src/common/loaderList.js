import React from "react";
export default function LoaderList() {
   return (
      <div className="">
         {Array(10)
            .fill()
            .map((o, index) => (
               <div key={index} className="loading-shade-max  " />
            ))}
      </div>
   );
}
