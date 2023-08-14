import React, { memo, useMemo, useState } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { getMediaIcon, calculateDateLabel } from "../../../../helper/CommonFuncs";
import PostView from "./PostView";

function LibraryShareView(props) {
  const { postData, className, accessToken, isPreview, user } = props;

  const [data, setstate] = useState(postData);
  const [isLoading, setIsLoading] = useState(true);

  const getIconSrc = useMemo(() => {
    if (data?.type === "referral") {
      return "/assets/images/newimages/content-icons/referral-icon.svg";
    } else {
      return getMediaIcon(data?.fileType);
    }
  }, [data]);

  const loadingCls = useMemo(() => (isLoading ? "loading-shade round-border-m" : ""), [isLoading]);

  const getDate = calculateDateLabel(data?.createdAt);

  return (
    <div className={`Post flex-center justify-content-between flex-column shadow ${className} ${!isPreview && "h-100"}`}>
      <div className={`post-top w-100 flex-center justify-content-between `}>
        <PatientDetailsView className="w-85" iconView={() => null} imageSrc={getIconSrc} name={data?.title} details={[{ title: data?.addedByName }]} />
      </div>
      <div
        className={`post-mid w-100 h-100 flex-grow-1 ratio-16-9 mt-3 mb-4 round-border-m overflow-hidden pointer ${loadingCls} ${
          data?.type === "referral" ? "main-container-refer" : ""
        }`}
      >
        <PostView
          libraryShare={true}
          setIsLoading={setIsLoading}
          user={user}
          data={data}
          isLibraryFile={true}
          isPreview={isPreview}
          accessToken={accessToken}
          className="w-100 ratio-16-9"
          type={0}
        />
      </div>
      <div className="w-100 text-xsmall text-grey2 mt-2 d-flex justify-content-start">
        <div className={`${loadingCls}`}>
          <span>{getDate}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(LibraryShareView);
