import React from "react";
import "./tooltip.css";

export default function Switch({ title }) {
  return (
    <div
      onClick={() => {
        window.location.assign(process.env.REACT_APP_OLD_PORTAL_URL);
      }}
      className="d-flex align-items-center"
    >
      <div className="switch-label">{title}</div>
      <label className="switch">
        <input type="checkbox" checked />
        <span className="slider round"></span>
      </label>
    </div>
  );
}
