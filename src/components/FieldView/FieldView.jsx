import React from "react";
import "./FieldView.css";

function FieldView({
  appendClass = "",
  title = "Title",
  placeholder = "Placeholder",
  value = "",
  onchange = () => {},
  inputType = "text",
  component = null,
  labelText = null,
  labelTextColor = "red",
}) {
  return (
    <div className={`FieldView ${appendClass}`}>
      <label className="title-label text-style">{title}</label>
      {component ? (
        <div className="drop-down">
          {/* <select className="input-field text-style">
            <option value="volvo">Volvo</option>
            <option value="saab">Saab</option>
            <option value="mercedes">Mercedes</option>
            <option value="audi">Audi</option>
          </select>
          <img
            className="down-arrow"
            src="/assets/images/down-arrow.png"
            alt=""
          /> */}
          {component()}
          <label
            style={{ color: `${labelTextColor}` }}
            className="fieldview-label"
          >
            {labelText}
          </label>
        </div>
      ) : (
        <>
          <input
            className="input-field text-style"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onchange(e.target.value, e)}
            type={inputType}
          />
          <label
            style={{ color: `${labelTextColor}` }}
            className="fieldview-label"
          >
            {labelText}
          </label>
        </>
      )}
    </div>
  );
}

export default React.memo(FieldView);
