import React, { memo, useState, useEffect } from "react";
import DropdownToggle from "../../../components/newcomponents/DropdownToggle";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import PatientDetailsView from "../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import FileView from "./FileView";
import AlertView from "../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import PostView from "../profile/content-section/PostView";
import moment from "moment";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../components/newcomponents/ToastView";
import ShareWithTeamView from "./ShareWithTeamView";
import CreateFolderView from "./CreateFolderView";
import { getFolderData, getAllFolderAndFilesData } from "../../../Apimanager/Networking";
import MoveFolderView from "./MoveFolderView";
import breadcrumbs from "../../../images/library/breadcrumbs.svg";
import { tableHeaderStyle, tableHeaderStyleEx } from "../profileModule/components/careTeamView";
import SortableComponent from "./DraggableLayout";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import EmptyStateComp from "../EmptyStateComp";
import NoLibrary from "../../../images/empty-states/no-library.svg";
import * as i18n from "../../../I18n/en.json";

const TableView = memo((props) => {
   const {
      order,
      sortFiles,
      docs,
      openFile,
      sortDate,
      dateOrder,
      folders,
      getFoldersInfo,
      setLoadDataClick,
      sort,
      setSort,
      setSelectedOption,
      openUploadFileView,
      setSelectedNode,
      selectedIndex,
      setDragParent,
      disabled,
      dataList,
      DragParent,
      getUpdatedLibrary,
      searchKey,
      findBreadCrumbs,
   } = props;
   const noContent = i18n?.emptyState?.noContent;
   const yourLib = i18n?.emptyState?.yourLib;
   const addContents = i18n?.emptyState?.addContents;

   const sortDocumentsPersisit = () => {
      let documentsData = docs.map((s) => s);
      let foldersData = folders.map((s) => s);

      if (sort === "name") {
         foldersData.sort((a, b) => {
            let fa = a.title.toLowerCase();
            let fb = b.title.toLowerCase();
            if (!order) {
               if (fa < fb) return -1;
               if (fa > fb) return 1;
               return 0;
            } else {
               if (fa < fb) return 1;
               if (fa > fb) return -1;
               return 0;
            }
         });
         documentsData.sort((a, b) => {
            let fa = a.title.toLowerCase();
            let fb = b.title.toLowerCase();
            if (!order) {
               if (fa < fb) return -1;
               if (fa > fb) return 1;
               return 0;
            } else {
               if (fa < fb) return 1;
               if (fa > fb) return -1;
               return 0;
            }
         });
      } else {
         foldersData.sort((a, b) => {
            if (dateOrder) {
               return moment.utc(b.createdAt) - moment.utc(a.createdAt);
            } else {
               return moment.utc(a.createdAt) - moment.utc(b.createdAt);
            }
         });
         documentsData.sort((a, b) => {
            if (dateOrder) {
               return moment.utc(b.createdAt) - moment.utc(a.createdAt);
            } else {
               return moment.utc(a.createdAt) - moment.utc(b.createdAt);
            }
         });
      }
      return { documentsData, foldersData };
   };

   const sortDocuments = (sortingKey) => {
      let foldersData = DragParent;
      setSort(sortingKey);
      if (sortingKey === "name") {
         foldersData.sort((a, b) => {
            let fa = a.title.toLowerCase();
            let fb = b.title.toLowerCase();
            if (!order) {
               if (fa < fb) return -1;
               if (fa > fb) return 1;
               return 0;
            } else {
               if (fa < fb) return 1;
               if (fa > fb) return -1;
               return 0;
            }
         });
         sortFiles && sortFiles();
         setDragParent(foldersData);
      } else {
         foldersData.sort((a, b) => {
            if (dateOrder) {
               return moment.utc(b.createdAt) - moment.utc(a.createdAt);
            } else {
               return moment.utc(a.createdAt) - moment.utc(b.createdAt);
            }
         });
         sortDate && sortDate();
         setDragParent(foldersData);
      }
   };

   if (DragParent.length === 0)
      return (
         <div style={{ paddingTop: "7rem" }} className="w-100 h-100 text-center text-large text-bold">
            <EmptyStateComp
               src={NoLibrary}
               headerText={noContent}
               description={yourLib}
               btnText={addContents}
               className="margin-viewd-screen"
               onClick={() => openUploadFileView()}
            />
         </div>
      );
   else
      return (
         <div style={{ width: "100%", height: "100vh" }} className="mr-3">
            <SortableComponent
               data={dataList && dataList.length !== 0 ? dataList : []}
               setLoadDataClick={setLoadDataClick}
               setSelectedNode={setSelectedNode}
               openFile={openFile}
               setDragParent={setDragParent}
               DragParent={DragParent}
               order={order}
               sortDocuments={sortDocuments}
               dateOrder={dateOrder}
               getUpdatedLibrary={getUpdatedLibrary}
               disabled={disabled}
               searchKey={searchKey}
               findBreadCrumbs={findBreadCrumbs}
            />
         </div>
      );
});
const GridView = memo((props) => {
   const { openFile, file, userObject, i } = props;
   const gridFileActionMenu = (data) => {
      if (data.option.text.toLowerCase() === "edit") {
      } else if (data.option.text.toLowerCase() === "delete") {
         swal(
            <AlertView
               showClose={false}
               titleText="Confirm"
               contentText={`Are you sure you want to remove this file?`}
               onAction={(btnData) => {
                  swal.close();
                  if (btnData.id === "alert-confirm-button") {
                  }
               }}
            />,
            { buttons: false }
         );
      }
   };
   return (
      <div className="w-large bg-white round-border-s">
         <div className="flex-center px-3">
            <PatientDetailsView
               className="p-3 sfpro-text text-grey5"
               documentName={file.title}
               name={file?.addedByName}
               userBg={window.initialColors[props.i % window.initialColors.length]}
               details={[
                  {
                     title: file?.addedByName,
                  },
               ]}
            />
            <DropdownToggle
               className="h-100 options-view dropleft"
               menuViewCls="w-xsmall shadow no-border round-border-m"
               id="library-document-actions"
               onOptTapped={(obj) => {
                  gridFileActionMenu({ option: obj, props });
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
               ]}
            >
               <img src="/assets/images/newimages/dots-v.svg" alt="" className="pointer" data-toggle="dropdown" />
            </DropdownToggle>
         </div>
         <div className="w-large h-2xl p-4" onClick={() => openFile && openFile(file, i)}>
            <div className="flex-center h-100 round-border-m pointer">
               <PostView
                  data={file}
                  accessToken={userObject?.stsTokenManager?.accessToken}
                  isPreview={false}
                  isLibraryFile={true}
               />
            </div>
         </div>
      </div>
   );
});

function DocumentsView(props) {
   const {
      folderFiles,
      userObject,
      userCredentials,
      crumbsArr,
      InitialCrumbs,
      setFiles,
      setFolders,
      setDragFileUpload,
      folderInfo,
      foldersArr,
      getUpdatedLibrary,
      libraryData,
      setLoadDataClick,
      sort,
      setSort,
      setFolderInfo,
      setSelectedOption,
      setSelectedNode,
      openUploadFileView,
      disabled,
      loadRoot,
      treeToRender,
      getSameStateData,
      selectedIndex,
      setDragParent,
      DragParent,
      getUpdatedTree,
      dataList,
      loading,
      libraryFolderData,
      searchKey,
      setSearchKey,
      findBreadCrumbs,
      setExpandedArr,
      setLoading,
      loadSearchData,
   } = props;
   const [state, setState] = useState({
      viewType: 0,
      dummyDocs: Array(10).fill(),
      viewFile: false,
      selectedFile: {
         item: null,
         index: null,
      },
      fileSortOrder: true,
      dateSortOrder: true,
      openShareWithTeamView: false,
      currentFile: null,
      openFileEditView: false,
      openMoveFileView: false,
      openSelectedFileData: null,
   });

   const sortFilesOrder = () => {
      setState({ ...state, fileSortOrder: !state.fileSortOrder });
   };

   const sortFilesDateOrder = () => {
      setState({ ...state, dateSortOrder: !state.dateSortOrder });
   };

   const openContentFile = (fileData, indx) => {
      setState({
         ...state,
         viewFile: true,
         selectedFile: { item: fileData, index: indx },
      });
   };

   const openShareTeamView = (fileData) => {
      setState({
         ...state,
         openShareWithTeamView: true,
         currentFile: fileData,
         viewFile: false,
      });
   };

   const closeShareTeamView = (closeKey, sharedTeamsArr) => {
      if (closeKey === "success") {
         getSameStateData();
      }
      setState({ ...state, openShareWithTeamView: false });
   };

   const openFileEdit = (fileData) => {
      setState({
         ...state,
         openFileEditView: true,
         currentFile: fileData,
         viewFile: false,
      });
   };
   const closeFileEdit = (closeKey) => {
      if (closeKey === "success") {
         getSameStateData();
      }

      setState({ ...state, openFileEditView: false, currentFile: null });
   };

   const showResponseMessage = (message, type) => {
      toast(<ToastView text={message} type={type} />, defaultToastProps);
   };

   const getFoldersInfo = async (info) => {
      let data = await getFolderData(info);
      if (data) {
         setFiles(data?.data?.files);
         setFolders(data?.data?.directories);
      }
   };

   const openMoveFileView = (fileData) => {
      setState({
         ...state,
         openMoveFileView: true,
         openSelectedFileData: fileData,
         viewFile: false,
      });
   };

   const closeMoveFileView = (closeKey, fileData) => {
      if (closeKey === "success") {
         getSameStateData();
      }
      setState({ ...state, openMoveFileView: false });
   };

   return (
      <div
         className="w-100 d-flex flex-column"
         style={{ overflowY: "auto", marginLeft: "0", overflowX: "hidden", paddingLeft: 0 }}
      >
         {/* <ReactTableDnd /> */}
         <div>
            <div className="flex-center justify-content-between p-3 position-sticky">
               <div style={{ paddingTop: 10, paddingBottom: 10 }} className="text-bold text-normal ">
                  {crumbsArr?.length === 0 &&
                     InitialCrumbs?.map((crumb, i) => {
                        return (
                           <div className="div-breadcrumbs-library" key={i}>
                              {crumb.title} <img src={breadcrumbs} className="breadcrumbs-image" alt="bread-crumbs" />
                           </div>
                        );
                     })}
                  {crumbsArr?.map((crumb, i) => {
                     let symbol = i === crumbsArr.length - 1 ? false : true;
                     const crumbLoad = i === 0 ? { id: null, name: crumb.title } : crumb;
                     return (
                        <div
                           onClick={() => {
                              if (i === 0) {
                                 loadRoot(true);
                                 setExpandedArr(null);
                                 setLoading(true);
                              } else {
                                 document.getElementById(crumb.id) && document.getElementById(crumb.id).click();
                              }
                              setFolderInfo(crumb);
                              setSelectedNode(crumbLoad);
                              setSelectedOption(crumbLoad.id);
                              setSearchKey("");
                           }}
                           className="div-breadcrumbs-library pointer"
                           key={i}
                        >
                           {crumb.title}
                           {symbol && <img src={breadcrumbs} className="breadcrumbs-image" alt="bread-crumbs" />}
                        </div>
                     );
                  })}
               </div>
               <div className="search-input-library">
                  <input
                     type="text"
                     placeholder="Search Library"
                     className="search-input-share"
                     value={searchKey}
                     onChange={(e) => {
                        setSearchKey(e.target.value);
                        setSelectedOption(null);
                        loadSearchData(e.target.value);
                        setSelectedNode(null);
                     }}
                  />
               </div>
            </div>
         </div>

         {state.viewType === 0 ? (
            <div
               className="row grid-view hide-scroll"
               style={{ overflowY: "auto", height: "100%", marginRight: "0", marginLeft: "0 " }}
            >
               {loading ? (
                  <div className="spinner-lib w-100 h-100 d-flex justify-content-center align-items-center">
                     <img width={30} height={30} src="/assets/gif/newgifs/spinner.gif" alt="" />
                  </div>
               ) : (
                  <TableView
                     selectedIndex={selectedIndex}
                     setSelectedNode={setSelectedNode}
                     openUploadFileView={openUploadFileView}
                     setSelectedOption={setSelectedOption}
                     sort={sort}
                     setSort={setSort}
                     order={state.fileSortOrder}
                     dateOrder={state.dateSortOrder}
                     sortFiles={sortFilesOrder}
                     docs={folderFiles}
                     openFile={openContentFile}
                     sortDate={sortFilesDateOrder}
                     folders={foldersArr}
                     getFoldersInfo={getFoldersInfo}
                     setLoadDataClick={setLoadDataClick}
                     dataList={dataList}
                     setDragParent={setDragParent}
                     DragParent={DragParent}
                     getUpdatedLibrary={getUpdatedLibrary}
                     disabled={disabled}
                     searchKey={searchKey}
                     findBreadCrumbs={findBreadCrumbs}
                  />
               )}
            </div>
         ) : (
            <div id="doc-grid-view" className="display-grid round-border-s p-4 bg-background">
               {folderFiles.map((o, i) => {
                  return (
                     <GridView
                        key={o?.id || i}
                        i={i}
                        randomText="Hello World"
                        openFile={openContentFile}
                        file={o}
                        userObject={userObject}
                     />
                  );
               })}
            </div>
         )}
         {state.viewFile && (
            <ModalPopup id="file-view-modal" onModalTapped={() => setState({ ...state, viewFile: false })}>
               <FileView
                  selectedIndex={selectedIndex}
                  close={(deleteMessage, messageKey) => {
                     if (deleteMessage) {
                        toast(
                           <ToastView text={deleteMessage} type={messageKey ? "success" : "error"} />,
                           defaultToastProps
                        );
                     }

                     setState({ ...state, viewFile: false });
                  }}
                  data={state.selectedFile}
                  accessToken={userObject?.stsTokenManager?.accessToken}
                  user={userCredentials?.user}
                  openShare={openShareTeamView}
                  openEdit={openFileEdit}
                  setFiles={setFiles}
                  folderFiles={folderFiles}
                  openMoveFileModal={openMoveFileView}
                  getSameStateData={getSameStateData}
               />
            </ModalPopup>
         )}
         {state.openShareWithTeamView && (
            <ModalPopup
               id={pendoIds.btnShareWithTeamModal}
               onModalTapped={() => setState({ ...state, openShareWithTeamView: false })}
            >
               <ShareWithTeamView
                  buttonId={pendoIds.btnShareWithTeamModal}
                  close={closeShareTeamView}
                  selectedFile={state.currentFile}
                  showResponseAlert={showResponseMessage}
               />
            </ModalPopup>
         )}
         {state.openFileEditView && (
            <ModalPopup
               id={pendoIds.btnCreateFolderModal}
               onModalTapped={() => setState({ ...state, openFileEditView: false })}
            >
               <CreateFolderView
                  buttonId={pendoIds.btnCreateFolderModal}
                  close={closeFileEdit}
                  viewTitle={"Rename"}
                  confirmText={"Rename"}
                  currentFile={state.currentFile}
                  showResponseAlert={showResponseMessage}
                  setFiles={setFiles}
                  folderFiles={folderFiles}
                  DragParent={DragParent}
                  setDragParent={setDragParent}
               />
            </ModalPopup>
         )}
         {state.openMoveFileView && (
            <ModalPopup
               withdrawAction={false}
               id="file-move-view-modal"
               onModalTapped={() => setState({ ...state, openMoveFileView: false })}
            >
               <MoveFolderView
                  getUpdatedTree={getUpdatedTree}
                  selectedIndex={selectedIndex}
                  close={closeMoveFileView}
                  currentFile={state.openSelectedFileData}
                  libraryData={libraryData}
                  showResponseAlert={showResponseMessage}
               />
            </ModalPopup>
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser?.user,
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(DocumentsView));
