import React, { memo, useState, useEffect, useRef } from "react";
import "./UploadLibraryDocumentView.css";
import { connect } from "react-redux";
import { multipleLibrary, uploadmedia } from "../../../../Apimanager/Networking";
import { v4 as uuid } from "uuid";
import axios from "axios";
import { getFilteredFiles } from "../../../../helper/CommonFuncs";

function UploadLibraryDocumentView(props) {
   const {
      close,
      upload,
      currentFolder = null,
      fileToEdit = null,
      closeEdit,
      isEditMode = false,
      files,
      fileInfo,
      stateInfo,
      getFolderNodeData,
      buttonId,
   } = props;
   const defaultSelectedValues = {
      list: [],
      isLoading: true,
      isDisabled: true,
      selected: null,
      error: "",
   };
   const [fileUploading, setFileUploading] = useState(false);
   const [state, setState] = useState({
      files: [],
      hospital: defaultSelectedValues,
      department: defaultSelectedValues,
      initialLoading: true,
      shareWithSelected: null,
      filesToUpload: [],
      percentageUploaded: 0,
      filesUploading: false,
      showProgressView: false,
      titleError: "",
      currentSelectedFolder: currentFolder ? currentFolder : stateInfo?.draggedFileInfo || null,
   });

   const isDisabled = fileUploading || state.filesToUpload.length === 0;

   const setSelectState = (key, value) => {
      setState({
         ...state,
         [key]: { ...state[key], ...value },
      });
   };

   useEffect(() => {
      if (stateInfo?.draggedFile === null) return;
      setState({
         ...state,
         filesToUpload: stateInfo?.draggedFile,
         currentSelectedFolder: stateInfo?.draggedFileInfo,
      });
      getDraggedFiles(stateInfo?.draggedFile);
   }, [stateInfo?.draggedFile]);

   const fileUploadToken = useRef(null);

   const getFile = (e) => {
      if (e.target.files.length > 0) {
         const filteredFiles = getFilteredFiles(e.target.files);
         for (let i = 0; i < filteredFiles.length; i++) {
            setImage(filteredFiles[i], i);
         }
      }
      setState({ ...state });
   };

   const getDraggedFiles = (e) => {
      if (e.length > 0) {
         const filteredFiles = getFilteredFiles(e);
         for (let i = 0; i < filteredFiles.length; i++) {
            setImage(filteredFiles[i], i);
         }
      }
      setState({ ...state });
   };

   const removeSelectedFile = (id) => {
      setState((prevState) => {
         let remainingFiles = prevState.filesToUpload.filter((list) => {
            if (list.id !== id) {
               return list;
            }
         });
         return {
            ...prevState,
            filesToUpload: remainingFiles,
         };
      });
   };

   const uploadDocuments = (objIndx = null) => {
      setFileUploading(true);
      setState({
         ...state,
         filesUploading: true,
         showProgressView: true,
      });
      let files = state.filesToUpload;

      let filesArr = files.map((file) => {
         file.isUploading = true;
         file.isUploaded = false;
         file.isCancelled = false;
         return file;
      });
      let bodyParams = {
         documents: filesArr,
         tags: "",
         autoSend: {
            shareWithAll: state.shareWithSelected?.value === 1 ? true : false,
            shareWithDepartment: state.shareWithSelected?.value === 3 ? state.department?.selected?.value : null,
            shareWithHospital:
               state.shareWithSelected?.value === 1 || state.shareWithSelected?.value === 4
                  ? null
                  : state.hospital?.selected?.value || null,
         },
      };
      fileUploadToken.current = axios.CancelToken.source();
      multipleLibrary(bodyParams)
         .then((success) => {
            uploadMediaFiles(success);
         })
         .catch((error) => {
            console.log("Caught Error in upload document-->", JSON.stringify());
         });
   };

   const uploadMediaFiles = (successData, index = 0) => {
      if (index === state.filesToUpload.length) {
         close && close("response", state);
         setState({ ...state, filesUploading: false });
         return;
      }
      let uploadObj = {
         id: state.filesToUpload[index].id,
         imageObject: state.filesToUpload[index].file,
         filename: state.filesToUpload[index].file.name,
         token: {},
         signedUrl: successData.data[index].signedUrl,
         isUploading: state.filesToUpload[index].isUploading,
         isUploaded: state.filesToUpload[index].isUploaded,
      };

      let isLast = index === state.filesToUpload.length - 1;
      uploadmediaTest(uploadObj, isLast, () => {
         let indx = index + 1;
         state.filesToUpload[index].isUploaded = true;
         state.filesToUpload[index].isUploading = false;
         state.filesUploading = true;
         setState({ ...state });
         uploadMediaFiles(successData, index + 1);
      });
   };

   const uploadmediaTest = async (fileObject, last = false, uploadComplete, index = 0) => {
      var params = fileObject.imageObject;
      fileObject.token["Content-Type"] = "application/octet-stream";
      if (fileUploadToken.current) {
         fileUploadToken.current = axios.CancelToken.source();
      }
      if (!fileObject.isUploaded || !fileObject.isCancelled) {
         uploadmedia(fileObject.signedUrl, params, fileUploadToken.current, (uploadmedia) => {
            let progBar = document.getElementById(`progress-bar-${fileObject.id}`);
            let FileProgress = Math.floor((uploadmedia / fileObject.imageObject.size) * 100);
            if (progBar) {
               progBar.value = FileProgress;
            }
            if (FileProgress === 100) {
               uploadComplete && uploadComplete();
            }

            setState({ ...state });
         })
            .then((res) => {})
            .catch((err) => {
               state.filesToUpload[index].isCancelled = true;
               setState({ ...state });
            });
      } else {
         uploadComplete && uploadComplete();
      }
   };

   const getFileSizeWithUnits = (size) => {
      let fSExt = new Array("Bytes", "KB", "MB", "GB");
      let j = 0;
      while (size > 900) {
         size /= 1024;
         j++;
      }
      return Math.round(size * 100) / 100 + " " + fSExt[j];
   };

   const setImage = (file, i) => {
      let exactSize = getFileSizeWithUnits(file.size);
      let reader = new FileReader();
      let url = reader.readAsDataURL(file);
      reader.onloadend = (e) => {
         setState((prevState) => {
            return {
               ...prevState,
               files: [
                  ...prevState.files,
                  {
                     src: reader.result,
                     location: file.name,
                     type: file.type,
                     size: exactSize,
                     id: uuid(),
                     description: "",
                     printEnable: false,
                     title: file.name,
                     parentId: state.currentSelectedFolder?.id ? state.currentSelectedFolder?.id : null,
                  },
               ],
               filesToUpload: [
                  ...prevState.filesToUpload,
                  {
                     file: file,
                     isUploaded: false,
                     progress: 0,
                     isCancelled: false,
                     isUploading: false,
                     location: file.name,
                     type: file.type,
                     size: exactSize,
                     id: uuid(),
                     description: "",
                     printEnable: false,
                     title: file.name,
                     parentId: state.currentSelectedFolder?.id ? state.currentSelectedFolder?.id : null,
                  },
               ],
            };
         });
      };
   };

   const titleChange = (e, file, index) => {
      let FilesArray = state.filesToUpload;
      FilesArray[index].title = e.target.value;
      setState({
         ...state,
         filesToUpload: FilesArray,
         titleError: "",
      });
   };

   const getLibDocIcon = (libFile) => {
      if (libFile.type.includes("image")) {
         return "/assets/images/newimages/lib-image.svg";
      } else if (libFile.type.includes("audio")) {
         return "/assets/images/newimages/lib-audio.svg";
      } else if (libFile.type.includes("video")) {
         return "/assets/images/newimages/lib-video.svg";
      } else if (libFile.type.includes("txt")) {
         return "/assets/images/newimages/lib-text.svg";
      } else if (libFile.type.includes("pdf")) {
         return "/assets/images/newimages/lib-pdf.svg";
      } else {
         return "/assets/images/newimages/lib-doc.svg";
      }
   };

   let uploadedFilesList = [];

   if (state.filesToUpload && state.filesToUpload.length > 0) {
      uploadedFilesList = state.filesToUpload.map((file, index) => {
         return (
            <div key={file.id}>
               <div className="w-100 justify-content-start flex-center">
                  <div className="flex-center mr-4 my-3">
                     <img src={getLibDocIcon(file)} alt="" className="w-1xs h-small" />
                  </div>
                  <div className="file-desc w-100 flex-center justify-content-between">
                     <div className="w-small">
                        <input
                           type="text"
                           name="title"
                           value={file.title}
                           onChange={(e) => titleChange(e, file, index)}
                           className="round-border-s w-100 text-xsmall py-1 px-2 my-2 default-border"
                        />
                     </div>
                     <div className="mr-3 pointer">
                        {file.isUploading && !file.isUploaded ? (
                           <div>
                              <progress
                                 id={`progress-bar-${file.id}`}
                                 max="100"
                                 value={0}
                                 style={{
                                    width: "200px",
                                 }}
                                 className="mb-1"
                              />
                           </div>
                        ) : !file.isUploading && file.isCancelled ? (
                           <div
                              onClick={() => {
                                 uploadDocuments();
                              }}
                           >
                              <img src="/assets/images/newimages/upload-again.svg" alt="" />
                           </div>
                        ) : !file.isUploading && file.isUploaded ? (
                           <img src="/assets/images/newimages/upload-complete-icon.svg" alt="" />
                        ) : (
                           <img
                              src="/assets/images/newimages/delete-selected-file.svg"
                              alt=""
                              onClick={(e) => removeSelectedFile(file.id)}
                           />
                        )}
                     </div>
                  </div>
               </div>
               <div className="w-100 flex-center justify-content-end">
                  <div className="separator w-85"></div>
               </div>
            </div>
         );
      });
   }
   return (
      <div id="upload-doc-view">
         <div className="upload-documents-view w-3xl h-4xl-large bg-white flex-column round-border-m">
            <div className="header w-100 flex-center mt-3">
               <div className="mt-3 flex-center w-100 px-5 justify-content-between">
                  <div className={`text-xlarge text-center text-bold-500 flex-center w-100 flex-column mt-3`}>
                     Upload Files
                     {props.currentFolder && (
                        <div className="sub-head-upload-files">{`File will be uploaded to "${props.currentFolder.title}" `}</div>
                     )}
                  </div>
                  <div className="pointer text-xlarge" onClick={() => close && close("closeButton")}>
                     &times;
                  </div>
               </div>
            </div>
            {state.filesToUpload.length > 0 ? (
               <div className="w-100 flex-center flex-column h-2xl-medium">
                  <div className="w-75 flex-start text-normal ml-2">
                     {state.filesToUpload.length} {state.filesToUpload.length > 1 ? "Files" : "File"}
                  </div>
                  <div
                     className="w-75 h-75 mt-4 doc-list-view"
                     style={{
                        maxHeight: "75%",
                        overflowY: "auto",
                     }}
                  >
                     {uploadedFilesList}
                  </div>
               </div>
            ) : (
               <div className={`w-100 flex-center height-file-upload-box`}>
                  <div className="content border-dashed flex-center  w-75 h-75 round-border-m">
                     <div className="w-100 h-100">
                        <div className="flex-center flex-column my-4 w-100 h-100">
                           <div className="text-grey3 text-small flex-center flex-column">
                              <img src="assets/images/newimages/lib-upload-cloud.svg" alt="" className="mr-5 " />
                              {/* {"Drag & Drop your files here, or browse"} */}
                              <div className="mt-4">
                                 Drag &#38; Drop your files here, or <span className="text-primary2">browse</span>
                              </div>
                           </div>
                           <input
                              id="files"
                              className="w-100 h-100 opacity-0 position-absolute pointer"
                              type="file"
                              onChange={(e) => getFile(e)}
                              accept="/*"
                              multiple
                           />
                        </div>
                     </div>
                  </div>
               </div>
            )}
            <div className="footer w-100 flex-center my-5">
               <button
                  id={buttonId}
                  className={` ${
                     isDisabled ? "btn-disabled-custom" : "btn-default"
                  } text-small h-xsmall round-border-s w-1xsmall`}
                  onClick={() => uploadDocuments()}
                  disabled={isDisabled}
               >
                  {fileUploading ? "Uploading..." : "Upload"}
               </button>
            </div>
         </div>
      </div>
   );
}
const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser.user,
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(UploadLibraryDocumentView));
