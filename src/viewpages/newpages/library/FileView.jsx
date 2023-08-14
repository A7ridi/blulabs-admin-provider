import React, { memo } from "react";
import DropdownToggle from "../../../components/newcomponents/DropdownToggle";
import AlertView from "../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import PostView from "../profile/content-section/PostView";
import { deleteDocumentFile } from "../../../Apimanager/Networking";

function FileView(props) {
   const {
      close,
      data,
      accessToken,
      user,
      openShare,
      openEdit,
      setFiles,
      folderFiles,
      openMoveFileModal,
      selectedIndex,
      getSameStateData,
   } = props;
   const fileActionMenu = (obj) => {
      if (obj.option.text.toLowerCase() === "rename") {
         openEdit && openEdit(obj?.props?.data?.item);
      } else if (obj.option.text.toLowerCase() === "delete") {
         swal(
            <AlertView
               showClose={false}
               titleText="Confirm"
               contentText={`Are you sure you want to remove this file?`}
               onAction={(btnData) => {
                  swal.close();
                  if (btnData.id === "alert-confirm-button") {
                     deleteDocumentFile({ id: obj?.props?.data?.item?.id })
                        .then((success) => {
                           getSameStateData();
                           let tempArr = folderFiles.filter((i) => {
                              return i.id !== obj?.props?.data?.item?.id;
                           });
                           setFiles(tempArr);
                           close && close(success?.data?.message, true);
                        })
                        .catch((err) => {
                           close && close(err.data.settings.message, false);
                        });
                  }
               }}
            />,
            { buttons: false }
         );
      } else if (obj.option.text.toLowerCase() === "share") {
         openShare && openShare(obj?.props?.data?.item);
      } else if (obj.option.text.toLowerCase() === "move") {
         openMoveFileModal && openMoveFileModal(obj?.props?.data?.item);
      }
   };
   return (
      <div className="flex-center justify-content-between flex-column grid-view-post px-5 py-3 bg-white w-75 h-85 round-border-l">
         <div className="w-100 flex-center justify-content-between">
            <div className="d-flex">
               <div>
                  <div className="text-black2 fw-500 text-xlarge">{data.item?.title}</div>
                  <div className="text-grey5 fw-500 text-medium">{data.item?.addedByName}</div>
               </div>
               <DropdownToggle
                  className="h-100 options-view dropleft"
                  menuViewCls="w-xsmall shadow no-border round-border-m"
                  id="library-document-actions"
                  onOptTapped={(obj) => {
                     fileActionMenu({ option: obj, props });
                  }}
                  options={[
                     {
                        text: "Rename",
                        leftImg: "/assets/images/newimages/edit-info-black-icon.svg",
                        cls: "mb-2 text-small",
                        margin: true,
                     },
                     {
                        text: "Delete",
                        leftImg: "/assets/images/newimages/delete-icon.svg",
                        cls: "text-small",
                        margin: true,
                     },
                     {
                        text: "Share",
                        leftImg: "/assets/images/newimages/folder-share-icon.svg",
                        cls: "text-small",
                        margin: true,
                     },
                     {
                        text: "Move",
                        leftImg: "/assets/images/newimages/folder-move-icon.svg",
                        cls: "text-small",
                        margin: true,
                     },
                  ]}
               >
                  <img
                     src="/assets/images/newimages/dots-v.svg"
                     alt=""
                     className="ml-3 mt-4 pointer"
                     data-toggle="dropdown"
                  />
               </DropdownToggle>
            </div>
            <div>
               <button className="text-medium text-xlarge2" onClick={() => close && close()}>
                  &times;
               </button>
            </div>
         </div>
         <div className="flex-center w-100 h-75 round-border-xl my-3">
            <PostView
               className="img-contain"
               data={data.item}
               isPreview={true}
               accessToken={accessToken}
               user={user}
               isLibraryFile={true}
            />
         </div>
         <div></div>
      </div>
   );
}

export default memo(FileView);
