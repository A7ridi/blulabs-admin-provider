import React from "react";
import open from "../../../../images/resetScreen/open.png";
import close from "../../../../images/resetScreen/close.png";
function EachRow({ value, setValue, text, placeholder }) {
  const [id, setId] = React.useState(null);

  return (
    <div className="parent-row">
      <div className="label-reset">{text}</div>
      <div className="each-field">
        <input
          value={value}
          autoComplete="off"
          autoFocus
          className="reset-input"
          placeholder={placeholder}
          type={id === 1 ? "text" : "password"}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
        <img
          onClick={() => {
            setId(id === 1 ? null : 1);
          }}
          src={id !== 1 ? open : close}
          alt="search"
          className="absoluteImageSearch"
        />
      </div>
    </div>
  );
}
export default EachRow;
