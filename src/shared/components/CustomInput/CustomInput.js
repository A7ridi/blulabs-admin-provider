import React from "react";
export default function CustomInput({ placeHolder, onChange, value, className = "" }) {
   return (
      <div className="w-75 my-3">
         <input
            type="text"
            className={`w-100 default-text-input h-xsmall p-3 ${className}`}
            placeholder={placeHolder}
            value={value}
            onChange={onChange}
         />
      </div>
   );
}
