import React, { useState, useEffect, useRef } from "react";
import CreateOrUploadView from "./CreateOrUploadView";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import CreateFolderView from "./CreateFolderView";
import UploadLibraryDocumentView from "./UploadLibraryDocumentView/UploadLibraryDocumentView";
import ShareWithTeamView from "./ShareWithTeamView";
import MoveFolderView from "./MoveFolderView";
import MyLibraryFolderView from "./FolderView/MyLibraryFolderView";
import { RefetchApi } from "../../../helper/CommonFuncs";
import SegmentView from "../../../components/newcomponents/SegmentView/SegmentView";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import EmptyStateComp from "../EmptyStateComp";
import NoLibrary from "../../../images/empty-states/no-library.svg";
import * as i18n from "../../../I18n/en.json";

const segmentOptions = [
   {
      text: "My Library",
      id: 1,
      pendoId: pendoIds.tabMyLibrary,
   },
   {
      text: "Shared with me",
      id: 2,
      pendoId: pendoIds.tabSharedWithMe,
   },
];

function LibraryList(props) {
   const {
      getFolderNodeData,
      libraryData,
      getUpdatedLibrary,
      getUpdatedShareWithMe,
      setFiles,
      setCrumbs,
      crumbsArr,
      setInitialBreadCrumbs,
      isLoadingShared,
      isLoadingMyLibrary,
      InitialCrumbs,
      showResponseMessage,
      files,
      fileInfo,
      cancelDragUploading,
      setFolderInfo,
      setFoldersArr,
      libFilesArr,
      loadDataClick,
      setLoadDataClick,
      setSort,
      selectedOption,
      setSelectedOption,
      selectedOptionDrop,
      setSelectedOptionDrop,
      selectedNode,
      setSelectedNode,
      state,
      setState,
      treeToRender,
      selectedIndex,
      setSelectedIndex,
      getSameStateData,
      loadRoot,
      getLibrayDetails,
      getUpdatedTree,
      setExpansion,
      expanded,
      generateBreadcrumbs,
      breadCrumbsId,
      setBreadCrumbsId,
      generateBreadcrumbsFolder,
      setLoading,
      setSearchKey,
      searchKey,
      expandedArr,
      setExpandedArr,
      libraryLoad,
      sharedLoad,
   } = props;
   const [openCreateRenameFolder, setOpenCreateRenameFolder] = useState(false);
   const [refreshFolders, setRefreshFolders] = useState(null);
   const [refreshDirect, setRefreshDirect] = useState(null);
   const [openMyLib, setOpenMyLib] = useState(false);
   const [openShareWithMe, setOpenShareWithMe] = useState(false);
   const [moved, setMoved] = useState(null);
   const [loadinglibrary, setLoadingLibrary] = useState(true);

   const noContent = i18n?.emptyState?.noContent;
   const yourLib = i18n?.emptyState?.yourLib;
   const addContents = i18n?.emptyState?.addContents;

   useEffect(() => {
      if (files === null) return;
      setState({
         ...state,
         openFileUploadView: true,
         draggedFile: files,
         draggedFileInfo: fileInfo,
         currentFolder: selectedNode,
      });

      cancelDragUploading();
   }, [files]);

   useEffect(() => {
      localStorage.removeItem("stopUploading");
      localStorage.removeItem("libraryUploading");
   }, []);

   const closeCreateUploadView = () => {
      setState({ ...state, openCreateUploadView: false });
   };
   const closeCreateFolderView = (closeValue, data = false) => {
      setSelectedNode(selectedNode);
      if (closeValue === "cancel" || closeValue === "error") {
         setOpenCreateRenameFolder(false);
         setState({
            ...state,
            openCreateFolderView: false,
            currentFolder: selectedNode,
            renameFolder: null,
         });
      } else {
         getSameStateData();
         setOpenCreateRenameFolder(false);
         setState({
            ...state,
            openCreateFolderView: false,
            currentFolder: selectedNode,
            renameFolder: null,
         });
      }
   };

   const closeShareWithTeamView = () => {
      getSameStateData();
      setState({ ...state, openShareWithTeamView: false });
   };
   const openCreateFolderView = (renameKey = false, folderData) => {
      setOpenCreateRenameFolder(true);
      // setSelectedNode(folderData);
      setState({
         ...state,
         openCreateFolderView: true,
         openCreateUploadView: false,
         renameFolder: renameKey,
         currentFolder: folderData,
      });
   };
   const openFileUploadView = (folderData) => {
      setSelectedNode(folderData);
      setState({
         ...state,
         openFileUploadView: true,
         openCreateUploadView: false,
         currentFolder: folderData,
      });
   };
   const openShareTeamView = (folderData) => {
      setSelectedNode(folderData);
      setState({
         ...state,
         openShareWithTeamView: true,
         currentFolder: folderData,
      });
   };

   const openMoveFolderView = (folderData) => {
      setState({
         ...state,
         openMoveToFolderView: true,
         openSelectedFolderData: folderData,
      });
   };

   const closeMoveFolderView = (closeKey, sourceId) => {
      if (closeKey === "success") {
         getSameStateData();
      }
      setState({ ...state, openMoveToFolderView: false });
   };
   const closeDocumentUploadView = (res = "success", state) => {
      if (res === "response") {
         showResponseMessage("Documents uploaded successfully.", "success");
         if (selectedNode === null) {
            RefetchApi(() => {
               getLibrayDetails();
            });
         } else {
            RefetchApi(() => {
               getFolderNodeData();
            });
         }
      } else {
      }
      setState({
         ...state,
         openFileUploadView: false,
         draggedFile: null,
         draggedFileInfo: null,
      });
   };

   const closeOnDeleteFolder = (type, message, node) => {
      if (node.id === selectedOption) {
         setSelectedOption(null);
         loadRoot();
      } else {
         getSameStateData();
      }
      setSelectedNode(null);
      showResponseMessage(message, type);
   };

   const getfolderSelection = (folderInfo) => {
      setFolderInfo(folderInfo);
      setState({ ...state, folderSelection: folderInfo });
   };

   const libraryMainFunction = (param = true, second = true, close = true) => {
      setState({
         ...state,
         folderSelection: null,
         openCreateFolderView: false,
         currentFolder: null,
      });
      if (param && second) {
         setInitialBreadCrumbs([{ id: "library", title: "My Library" }]);
         setCrumbs([]);
      }
      getUpdatedLibrary && getUpdatedLibrary(param, close);
      if (param && second) {
         setOpenMyLib(!openMyLib);
      }
   };

   useEffect(() => {
      if (selectedIndex === 0) {
         setLoading(true);
         setSelectedOptionDrop(null);
         setSelectedOption(null);
         setSelectedNode(null);
         setState({ ...state, currentFolder: null });
         loadRoot(true);
         let stopUploadDoc = localStorage.getItem("libraryUploading");
         if (stopUploadDoc && stopUploadDoc === "true") {
            localStorage.setItem("stopUploading", true);
         }
      } else {
         setLoading(true);
         setSelectedOptionDrop(null);
         setSelectedOption(null);
         setSelectedNode(null);
         setState({ ...state, currentFolder: null });
         loadRoot(true);
         setOpenShareWithMe(true);
         let stopUploadDoc = localStorage.getItem("libraryUploading");
         if (stopUploadDoc && stopUploadDoc === "true") {
            localStorage.setItem("stopUploading", true);
         }
      }
   }, [loadinglibrary]);
   const showCreateButton = selectedIndex === 0 || (selectedIndex === 1 && selectedOption !== null);
   return (
      <div id="library-list" className="h-100 flex-center flex-column relative ">
         <SegmentView
            library
            profile
            className="text-small m-3"
            teamClass="p-1 unselected-color"
            teamClassName="round-border-s"
            name="profile-list-radio"
            selectedIndex={selectedIndex}
            options={segmentOptions}
            onSelect={(opt, index) => {
               setLoadingLibrary(!loadinglibrary);
               setSelectedIndex(index);
               setExpandedArr(null);
            }}
         />

         <div
            className="bundle-list w-100 flex-grow-1"
            style={{
               overflowX: "hidden",
            }}
         >
            {!libraryLoad && !sharedLoad && treeToRender?.length === 0 && (
               <div style={{ paddingTop: "7.4rem" }}>
                  <EmptyStateComp
                     src={NoLibrary}
                     headerText={noContent}
                     description={yourLib}
                     className="margin-viewd-screen"
                  />
               </div>
            )}
            {selectedIndex === 0 && treeToRender?.length > 0 && !libraryLoad ? (
               <MyLibraryFolderView
                  setLoading={setLoading}
                  breadCrumbsId={breadCrumbsId}
                  setBreadCrumbsId={setBreadCrumbsId}
                  expanded={expanded}
                  setExpansion={setExpansion}
                  selectedNodeData={selectedNode}
                  setSelectedNodeData={setSelectedNode}
                  refreshDirect={refreshDirect}
                  setRefreshDirect={setRefreshDirect}
                  setSort={setSort}
                  selectedOptionDrop={selectedOptionDrop}
                  setSelectedOptionDrop={setSelectedOptionDrop}
                  libraryMainFunction={libraryMainFunction}
                  moved={moved}
                  setMoved={setMoved}
                  data={treeToRender}
                  openShareView={openShareTeamView}
                  openFileUploadView={openFileUploadView}
                  openCreateFolder={openCreateFolderView}
                  openMoveFolderModal={openMoveFolderView}
                  getFolder={getfolderSelection}
                  refresh={refreshFolders}
                  setRefresh={setRefreshFolders}
                  setFolderFiles={setFiles}
                  setCrumbs={setCrumbs}
                  crumbsArr={crumbsArr}
                  closeDelete={closeOnDeleteFolder}
                  InitialCrumbs={InitialCrumbs}
                  setFoldersArr={setFoldersArr}
                  files={libFilesArr}
                  setLoadDataClick={setLoadDataClick}
                  loadDataClick={loadDataClick}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  setSearchKey={setSearchKey}
                  searchKey={searchKey}
                  expandedArr={expandedArr}
               />
            ) : libraryLoad ? (
               Array(2)
                  .fill()
                  .map((o, i) => {
                     return <div key={i} className="h-2xs m-3 round-border-m loading-shade-dark"></div>;
                  })
            ) : null}

            {selectedIndex === 1 && treeToRender?.length > 0 && !sharedLoad ? (
               <MyLibraryFolderView
                  setLoading={setLoading}
                  breadCrumbsId={breadCrumbsId}
                  setBreadCrumbsId={setBreadCrumbsId}
                  expanded={expanded}
                  setExpansion={setExpansion}
                  selectedNodeData={selectedNode}
                  setSelectedNodeData={setSelectedNode}
                  refreshDirect={refreshDirect}
                  setRefreshDirect={setRefreshDirect}
                  setSort={setSort}
                  shared={true}
                  selectedOptionDrop={selectedOptionDrop}
                  setSelectedOptionDrop={setSelectedOptionDrop}
                  libraryMainFunction={libraryMainFunction}
                  moved={moved}
                  setMoved={setMoved}
                  data={treeToRender}
                  openShareView={openShareTeamView}
                  openFileUploadView={openFileUploadView}
                  openCreateFolder={openCreateFolderView}
                  openMoveFolderModal={openMoveFolderView}
                  getFolder={getfolderSelection}
                  refresh={refreshFolders}
                  setRefresh={setRefreshFolders}
                  setFolderFiles={setFiles}
                  setCrumbs={setCrumbs}
                  crumbsArr={crumbsArr}
                  closeDelete={closeOnDeleteFolder}
                  InitialCrumbs={InitialCrumbs}
                  setFoldersArr={setFoldersArr}
                  files={libFilesArr}
                  setLoadDataClick={setLoadDataClick}
                  loadDataClick={loadDataClick}
                  selectedOption={selectedOption}
                  setSelectedOption={setSelectedOption}
                  setSearchKey={setSearchKey}
                  searchKey={searchKey}
                  expandedArr={expandedArr}
               />
            ) : sharedLoad ? (
               Array(2)
                  .fill()
                  .map((o, i) => {
                     return <div key={i} className="h-2xs m-3 round-border-m loading-shade-dark"></div>;
                  })
            ) : null}
         </div>

         {showCreateButton && (
            <div className="create-div w-100 position flex-center flex-shrink-0">
               <button
                  id={pendoIds.btnCreateLibraryContent}
                  onClick={() => setState({ ...state, openCreateUploadView: true })}
                  style={{ width: "135px", height: "44px" }}
                  className="btn-default text-small h-small round-border-s w-xsmall"
               >
                  Create
               </button>
            </div>
         )}

         {state.openCreateUploadView && (
            <ModalPopup
               id="create-upload-view-modal"
               onModalTapped={() => setState({ ...state, openCreateUploadView: false })}
            >
               <CreateOrUploadView
                  close={closeCreateUploadView}
                  openCreateFolder={() => {
                     setOpenCreateRenameFolder(true);
                     setState({
                        ...state,
                        openCreateUploadView: false,
                        currentFolder: selectedNode,
                     });
                  }}
                  openFileUpload={openFileUploadView}
                  folderChosen={selectedNode}
               />
            </ModalPopup>
         )}
         {openCreateRenameFolder && (
            <ModalPopup
               id={pendoIds.btnCreateFolderModal}
               onModalTapped={() => {
                  setOpenCreateRenameFolder(false);
                  closeCreateFolderView("cancel");
               }}
            >
               <CreateFolderView
                  buttonId={pendoIds.btnCreateFolderModal}
                  generateBreadcrumbs={generateBreadcrumbs}
                  setSelectedOption={setSelectedOption}
                  crumbsArr={crumbsArr}
                  selectedOption={selectedOption}
                  close={closeCreateFolderView}
                  selectedNode={selectedNode}
                  closeNewFlder={(id, data, crumbsArr) => {
                     setOpenCreateRenameFolder(false);
                     setSelectedNode(data);
                     setState({ ...state, openCreateFolderView: false, currentFolder: selectedNode });
                     if (state.currentFolder !== null) {
                        setExpansion(id.id);
                     }
                     generateBreadcrumbsFolder(id, data, crumbsArr);
                  }}
                  viewTitle={state.renameFolder ? "Rename" : "New Folder"}
                  confirmText={state.renameFolder ? "Rename" : "Create"}
                  currentFolder={state.currentFolder}
                  showResponseAlert={showResponseMessage}
               />
            </ModalPopup>
         )}
         {state.openFileUploadView && (
            <ModalPopup onModalTapped={closeDocumentUploadView} id={pendoIds.btnUploadLibraryDocumentModal}>
               <UploadLibraryDocumentView
                  buttonId={pendoIds.btnUploadLibraryDocumentModal}
                  getFolderNodeData={getFolderNodeData}
                  close={closeDocumentUploadView}
                  upload={(obj) => props.uploadDocuments(obj)}
                  currentFolder={state.currentFolder}
                  stateInfo={state}
               />
            </ModalPopup>
         )}
         {state.openShareWithTeamView && (
            <ModalPopup id={pendoIds.btnShareWithTeamModal} onModalTapped={() => closeShareWithTeamView()}>
               <ShareWithTeamView
                  buttonId={pendoIds.btnShareWithTeamModal}
                  close={closeShareWithTeamView}
                  currentFolder={state.currentFolder}
                  showResponseAlert={showResponseMessage}
                  getUpdatedLibrary={getUpdatedLibrary}
               />
            </ModalPopup>
         )}

         {state.openMoveToFolderView && (
            <ModalPopup
               withdrawAction={false}
               id="move-folder-view-modal"
               onModalTapped={() => setState({ ...state, openMoveToFolderView: false })}
            >
               <MoveFolderView
                  getUpdatedTree={() => {
                     getSameStateData();
                  }}
                  selectedIndex={selectedIndex}
                  selectedOptionDrop={selectedOptionDrop}
                  setSelectedOptionDrop={setSelectedOptionDrop}
                  selectedNodeData={selectedNode}
                  setSelectedNodeData={setSelectedNode}
                  refreshDirect={refreshDirect}
                  setRefreshDirect={setRefreshDirect}
                  setSort={setSort}
                  close={closeMoveFolderView}
                  currentFolder={state.openSelectedFolderData}
                  libraryData={treeToRender}
                  showResponseAlert={showResponseMessage}
                  closeCreateFolder={closeCreateFolderView}
               />
            </ModalPopup>
         )}
      </div>
   );
}

export default LibraryList;
