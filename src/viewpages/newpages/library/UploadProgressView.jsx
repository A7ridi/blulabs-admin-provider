import React, { memo, useState } from "react";

function UploadProgressView(props) {
  const { close } = props;
  const [expand, setExpand] = useState(false);
  return (
    <div
      className="w-large position-absolute"
      style={{ bottom: "0px", right: "50px" }}
    >
      <div
        className="flex-center justify-content-around h-xsmall bg-grey text-white text-normal justify-aligned-center"
        style={{ borderRadius: "4px 4px 0px 0px" }}
      >
        <div>
          {props.files?.length > 1
            ? `Uploading ${props.files.length} items`
            : "Uploading 1 item"}
        </div>
        <div className="w-50 flex-center justify-content-end">
          <div className="mx-3 pointer">
            <img
              style={{ transform: expand ? "rotate(180deg)" : "rotate(0deg)" }}
              src="/assets/images/newimages/expand-collapse-icon.svg"
              alt=""
              onClick={() => setExpand(!expand)}
            />
          </div>
          <div className="mx-3 pointer">
            <img
              src="/assets/images/newimages/cross-grey-icon.svg"
              alt=""
              onClick={() => close && close()}
            />
          </div>
        </div>
      </div>
      <div
        className={`${
          expand ? "max-height-normal vertical-scroll" : "max-height-xsmall"
        } `}
      >
        {props.files.map((file, i) => {
          return (
            <div
              key={i}
              className={`flex-center justify-content-between bg-white py-3`}
            >
              <div className="flex-center">
                <img
                  src="/assets/images/newimages/content-icons/pdf-icon.svg"
                  alt=""
                  className="mx-3"
                />
                <div className="text-small max-width-normal">
                  {file.file?.name || "Sample File"}
                </div>
              </div>
              <img
                src={`/assets/images/newimages/${
                  file.isUploaded
                    ? "upload-complete-icon.svg"
                    : "upload-progress-icon.svg"
                }`}
                alt=""
                className={` ${expand ? "mr-2" : "mr-3 pr-3"}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(UploadProgressView);
