import React, { useState } from "react";
import "./ToggleSwitch.css";

const ToggleSwitch = (props) => {
  let { toggled = () => {}, value = false } = props;
  return (
    <div>
      <label
        class="toggle-switch"
        style={{ width: `${props.width}`, height: `${props.height}` }}
      >
        <input
          type="checkbox"
          checked={value}
          onChange={() => {
            toggled(value);
          }}
        />
        <span class="toggle-slider round"></span>
      </label>
    </div>
  );
};

export default ToggleSwitch;
