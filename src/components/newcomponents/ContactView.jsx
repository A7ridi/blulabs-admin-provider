import React, { memo } from "react";

const ContactView = (props) => {
  const { src, title, value, className, valueView } = props;
  return (
    <div
      className={`flex-center d-inline-flex mb-4 justify-content-start ${className}`}
    >
      <img src={src} alt="" />
      <div className="ml-4 d-flex flex-column w-100">
        <h5 className="mb-2">{title}</h5>
        <h4 className="text-truncate">{valueView ? valueView() : value}</h4>
      </div>
    </div>
  );
};

export default memo(ContactView);
