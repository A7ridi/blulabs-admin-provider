import React, { memo } from "react";

function CreateOrUploadView(props) {
  const { close, openCreateFolder, openFileUpload, folderChosen, currentFolder } = props;
  return (
    <div className="bg-white w-xlarge flex-center flex-column round-border-m">
      <div className="pointer px-5 py-3 w-100 flex-center justify-content-between separator" onClick={() => openCreateFolder(false, currentFolder)}>
        <div className="w-100 text-grey5 text-medium">Create Folder</div>
        <img src="/assets/images/newimages/add-folder-icon.svg" alt="" width="35" />
      </div>
      <div className="pointer px-5 py-3 w-100 flex-center justify-content-between separator" onClick={() => openFileUpload(folderChosen)}>
        <div className="w-100 text-grey5 text-medium">File Upload</div>
        <img src="/assets/images/newimages/file-upload-icon.svg" alt="" width="35" />
      </div>
      <div className="py-4  justify-aligned-center">
        <button className="text-extra-bold text-medium text-grey2" onClick={() => close()}>
          Cancel
        </button>
      </div>
    </div>
  );
}
export default memo(CreateOrUploadView);
