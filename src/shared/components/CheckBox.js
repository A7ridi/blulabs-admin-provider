import React from "react";
import "./checkBox/checkBox.css";

const CheckBox = (props) => {
   const { i, className = "", value = "", onClick, selected, clsName = "", checked = false } = props;
   return (
      <label className={`container ${className} ${clsName}`} for={i}>
         <input
            type="checkbox"
            className="form-control-input filled-in pointer checked"
            value={value}
            selected={selected}
            checked={checked}
            id={i}
            onChange={onClick}
         />
         <span className="checkmark"></span>
         {props.children}
      </label>
   );
};

export default CheckBox;
