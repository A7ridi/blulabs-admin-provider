import React from "react";
import "./StatusView.css";

let colorSuccess = "#4CAF50";
let colorError = "#611a15";

function StatusView(props) {
  let {
    message = "",
    type = "success",
    classname = "",
    showCloseButton = true,
    actionText = null,
    actionTapped = () => {},
    closeTapped = () => {},
  } = props;

  let imageSrc = () => {
    let basePath = "./assets/images/";
    if (type === "success") {
      basePath = basePath + "status-success.svg";
    } else if (type === "error") {
      basePath = basePath + "status-error.svg";
    } else if (type === "none") {
      basePath = null;
    }

    return basePath;
  };

  let crossColor = () => {
    let color = "";
    if (type === "success") {
      color = colorSuccess;
    } else if (type === "error") {
      color = colorError;
    }
    return color;
  };

  return (
    <div className="StatusView">
      <div className={`${classname} alert ${type}`} role="alert">
        {showCloseButton ? (
          <label
            className="label-close"
            onClick={closeTapped}
            style={{ color: crossColor() }}
          >
            &times;
          </label>
        ) : null}
        {type !== "none" ? <img src={imageSrc()} alt="" /> : null}
        {message}

        {actionText ? (
          <>
            <span></span>
            <div
              className="action-button"
              onClick={actionTapped}
              style={{ color: crossColor() }}
            >
              {actionText}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default React.memo(StatusView);
