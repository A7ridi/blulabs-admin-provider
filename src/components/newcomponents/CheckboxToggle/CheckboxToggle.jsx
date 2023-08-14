import React, { memo } from "react";
import "./CheckboxToggle.css";

const CheckboxToggle = (props) => {
  let { toggled = () => {}, value = false, library, className, content = false } = props;
  return (
    <div className={`d-flex justify-content-center align-items-center ${className} ${content && "ml-3"}`}>
      <label className="checkbox-toggle-switch" style={{ width: `${props.width}`, height: `${props.height}` }}>
        <input type="checkbox" checked={value} onChange={() => toggled(value)} />
        <span className={` ${library === "library" ? "lib-checkbox-toggle-slider" : "checkbox-toggle-slider"} round`}></span>
      </label>
    </div>
  );
};

export default memo(CheckboxToggle);
// export default memo(CheckboxToggle, (prev, next) => prev.value === next.value);
