import React, { memo, useState } from "react";
import * as dasboardActions from "../../../redux/actions/dashboard.action";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createOrRenameFolder, updateDocumentFile } from "../../../Apimanager/Networking";
import arrowFolder from "../../../images/library/arrowFolder.svg";

function CreateFolderView(props) {
   const {
      close,
      currentFolder = null,
      viewTitle = "",
      confirmText = "",
      showResponseAlert,
      currentFile = null,
      folderFiles,
      setFiles,
      setSelectedOption,
      closeNewFlder,
      generateBreadcrumbs,
      crumbsArr,
      selectedOption,
      selectedNode,
      setDragParent,
      buttonId,
      DragParent,
   } = props;
   const [state, setState] = useState({
      folderName: currentFile
         ? currentFile?.title
         : viewTitle.toLowerCase() === "rename"
         ? currentFolder?.title
         : "" || "",
   });
   const createFolder = () => {
      // if (currentFolder === null) return;
      let fileInfo = {};
      let folderInfo = {};
      if (currentFile) {
         fileInfo = {
            id: currentFile.id,
            title: state.folderName,
            parentId: currentFile.parentId ? currentFile.parentId : null,
         };
      } else {
         folderInfo = {
            // ...(viewTitle.toLowerCase() === "rename" && {
            //   id: currentFolder.id,
            // }),
            id: viewTitle.toLowerCase() === "rename" ? currentFolder.id : "",
            title: state.folderName,
            parentId: viewTitle.toLowerCase() === "rename" ? currentFolder?.parentId : currentFolder?.id,
         };
      }
      if (currentFile) {
         let bodyParams = {
            title: state.folderName,
            printEnable: currentFile.printEnable,
            id: currentFile.id,
            tags: currentFile.tags,
            autoSend: {
               shareWithAll: currentFile.shareWithAll,
               shareWithDepartment: null,
               shareWithHospital: null,
            },
         };
         updateDocumentFile(bodyParams)
            .then((result) => {
               let tempArr = DragParent.map((i) => {
                  if (i.id === currentFile?.id) {
                     i.title = state.folderName;
                     return i;
                  } else {
                     return i;
                  }
               });
               setFiles(tempArr);
               setDragParent(tempArr);
               showResponseAlert && showResponseAlert(result?.data?.message, "success");
               close && close("success");
            })
            .catch((error) => {
               let err = error?.data?.settings?.message || "Something went wrong.";
               showResponseAlert && showResponseAlert(err, "error");
               close && close("error");
            });
      } else {
         createOrRenameFolder(folderInfo)
            .then((result) => {
               const isRename = confirmText === "Rename";
               const text = isRename ? result?.data?.message : result?.data?.settings?.message;
               showResponseAlert && showResponseAlert(text, "success");
               if (!isRename) {
                  setSelectedOption(result.data.data.id);
                  closeNewFlder(currentFolder, result.data.data, crumbsArr);
               } else {
                  close && close("success");
                  if (selectedOption !== null) {
                     generateBreadcrumbs(currentFolder?.id, state?.folderName, crumbsArr);
                  }
               }
            })
            .catch((error) => {
               let err = error?.data?.settings?.message || "Something went wrong.";
               showResponseAlert && showResponseAlert(err, "error");
               close && close("error");
            });
      }
   };
   return (
      <div className="flex-center flex-column bg-white w-xlarge h-2xl round-border-m">
         <div className="flex-center w-100 justify-content-between px-5 pb-4">
            <div className="text-extra-bold text-large text-grey5">{viewTitle}</div>
            <button className="m-0 h1 flex-center" onClick={() => close && close()}>
               &times;
            </button>
         </div>

         <div>
            {props.currentFolder && viewTitle !== "Rename" && (
               <div className="sub-head-upload-files ">
                  <img src={arrowFolder} alt="arrow-folder" />
                  &nbsp;
                  {props.currentFolder.title}
               </div>
            )}
            <input
               type="text"
               value={state.folderName}
               className="default-border w-large h-2xs round-border-s text-small p-3"
               onChange={(e) => setState({ ...state, folderName: e.target.value })}
            />
         </div>
         <div className="h-xsmall w-100 flex-center justify-content-end mr-5 mt-5 text-small fw-bold">
            <button
               className="w-xsmall h-100 bg-disabled text-black round-border-s mx-3"
               onClick={() => close("cancel")}
            >
               Cancel
            </button>
            <button
               id={buttonId}
               disabled={state.folderName?.length < 1}
               className="w-xsmall h-100 btn-default text-white round-border-s mx-3"
               onClick={() => createFolder()}
            >
               {confirmText}
            </button>
         </div>
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      // folders: state.dashboardStates.folders,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         // setCreateFolder: dasboardActions.setCreateFolder,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateFolderView));
