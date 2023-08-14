import React, { memo, useState } from "react";
import CreateFolderView from "./CreateFolderView";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import MyLibraryFolderView from "./FolderView/MyLibraryFolderView";
import AlertView from "../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import { createOrRenameFolder, updateDocumentFile } from "../../../Apimanager/Networking";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";

function MoveFolderView(props) {
   const {
      close,
      currentFolder,
      libraryData,
      showResponseAlert,
      closeCreateFolder,
      currentFile,
      selectedIndex,
      getUpdatedTree,
   } = props;
   const [state, setState] = useState({
      folderObject: null,
      showCreateFolderView: false,
      fileObject: null,
   });

   // Below function gets the information of the selected folder inside the mover folder view.
   const getSelectedFolderInfo = (folderData) => {
      setState({ ...state, folderObject: folderData });
   };

   // Below function will move the current folder to the selected folder and change its hierarchy.
   const moveToSelectedFolder = () => {
      swal(
         <AlertView
            showClose={false}
            titleText="Confirm"
            contentText={`Are you sure you want to move ${currentFile ? currentFile.title : currentFolder.title} to ${
               state.folderObject === null ? "My library" : state.folderObject.title
            }?`}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  if (currentFile) {
                     let bodyParams = {
                        title: currentFile.title,
                        printEnable: currentFile.printEnable,
                        id: currentFile.id,
                        tags: currentFile.tags,
                        autoSend: {
                           shareWithAll: currentFile.shareWithAll,
                           shareWithDepartment: null,
                           shareWithHospital: null,
                        },
                        parentId: state.folderObject.id,
                     };
                     updateDocumentFile(bodyParams)
                        .then((result) => {
                           showResponseAlert && showResponseAlert(result?.data?.message, "success");
                           close && close("success");
                        })
                        .catch((error) => {
                           let err = error?.data?.settings?.message || "Something went wrong.";
                           showResponseAlert && showResponseAlert(err, "error");
                           close && close("error");
                        });
                  } else {
                     let folderInfo = {
                        id: currentFile ? currentFile.id : currentFolder.id,
                        title: currentFile ? currentFile.title : currentFolder.title,
                        parentId: state.folderObject === null ? "root" : state.folderObject.id,
                     };
                     createOrRenameFolder(folderInfo)
                        .then((result) => {
                           showResponseAlert && showResponseAlert(result?.data?.message, "success");
                           close && close("success");
                        })
                        .catch((error) => {
                           let err = error?.data?.settings?.message || "Something went wrong.";
                           showResponseAlert && showResponseAlert(err, "error");
                           close && close("error");
                        });
                  }
               }
            }}
         />,
         { buttons: false }
      );
   };

   const showMoveToRoot = selectedIndex === 0 || (selectedIndex === 1 && state.folderObject !== null);
   return (
      <div
         className="h-2xl-medium w-normal bg-white round-border-m"
         style={{ position: "absolute", left: "56px", top: "180px" }}
      >
         <div className="flex-center justify-content-between w-100">
            <div className="text-truncate mx-3 text-grey5 text-large text-bold justify-content-start flex-center w-100">
               {currentFile ? currentFile.title : currentFolder.title}
            </div>
            <div className="text-xlarge2 flex-center w-1xs mx-3 pointer" onClick={() => close && close()}>
               &times;
            </div>
         </div>
         <div className="w-100 h-100 separator" style={{ maxHeight: "240px", overflowY: "auto" }}>
            <MyLibraryFolderView
               data={libraryData}
               noActionMenus={true}
               getSelectedFolder={getSelectedFolderInfo}
               currentFolderToMove={currentFolder}
               currentFileToMove={currentFile}
               selectedOption={state.folderObject?.id || null}
            />
         </div>
         <div className="mt-3 flex-center justify-content-between w-100">
            {showMoveToRoot && (
               <div className="mx-3">
                  <img
                     src="/assets/images/newimages/add-folder-blue.svg"
                     alt=""
                     className="pointer"
                     onClick={() => setState({ ...state, showCreateFolderView: true })}
                  />
               </div>
            )}
            <div className="mx-3">
               {showMoveToRoot && (
                  <button className={`text-medium ${"text-primary"}`} onClick={() => moveToSelectedFolder()}>
                     {state.folderObject === null ? "Move to root" : "Move Here"}
                  </button>
               )}
            </div>
         </div>
         {state.showCreateFolderView ? (
            <ModalPopup id={pendoIds.btnCreateFolderModal}>
               <CreateFolderView
                  buttonId={pendoIds.btnCreateFolderModal}
                  close={(closeValue, folderId) => {
                     closeCreateFolder && closeCreateFolder(closeValue, folderId);
                     getUpdatedTree && getUpdatedTree();
                     return setState({ ...state, showCreateFolderView: false });
                  }}
                  viewTitle="New Folder"
                  confirmText="Create"
                  currentFolder={state.folderObject}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}
export default memo(MoveFolderView);
