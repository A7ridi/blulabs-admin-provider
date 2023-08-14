import React, { memo, useState, useEffect } from "react";
import "./MyLibraryFolderView.css";
import { deleteDocumentFile } from "../../../../Apimanager/Networking";
import { Option } from "../../../../components/newcomponents/DropdownToggle";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import "react-toastify/dist/ReactToastify.css";
import shareFolder from "../../../../images/library/new (1).svg";
import whiteRightArrow from "../../../../images/library/new (3).svg";
import blackArrow from "../../../../images/library/new (4).svg";
import five from "../../../../images/library/new (5).svg";

import fileUpload from "../../../../images/library/uploadFolder.svg";
import newFolders from "../../../../images/library/newFolder.svg";
import moveFolder from "../../../../images/library/moveFolder.svg";
import share from "../../../../images/library/shareFolder.svg";
import rename from "../../../../images/library/renameFolder.svg";
import deleteFolder from "../../../../images/library/deleteFolder.svg";
import blackDots from "../../../../images/library/whiteDots.svg";
import whiteDots from "../../../../images/library/blackDots.svg";
import upDownArrow from "../../../../images/library/upDownArrow.svg";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const folderOpts = [
   {
      id: 1,
      text: "File Upload",
      leftImg: fileUpload,
      cls: "",
      margin: true,
   },
   {
      id: 6,
      text: "New folder",
      leftImg: newFolders,
      cls: "",
      margin: true,
   },
   {
      id: 2,
      text: "Move",
      leftImg: moveFolder,
      cls: "",
      margin: true,
   },
   {
      id: 3,
      text: "Share",
      leftImg: share,
      cls: "",
      margin: true,
   },
   {
      id: 4,
      text: "Rename",
      leftImg: rename,
      cls: "",
      margin: true,
   },
   {
      id: 5,
      text: "Delete",
      leftImg: deleteFolder,
      cls: "",
      margin: true,
   },
];

function MyLibraryFolderView(props) {
   const {
      data,
      openShareView,
      openFileUploadView,
      openCreateFolder,
      noActionMenus = false,
      getSelectedFolder,
      openMoveFolderModal,
      getFolder = null,
      setFolderFiles,
      setCrumbs,
      crumbsArr,
      childCrumbs = [],
      closeDelete,
      InitialCrumbs = [],
      currentFolderToMove = null,
      setFoldersArr,
      currentFileToMove = null,
      files,
      loadDataClick,
      setLoadDataClick,
      selectedOption,
      setSelectedOption,
      moved,
      setMoved,
      shared = false,
      selectedOptionDrop,
      setSelectedOptionDrop,
      setSort,
      refreshDirect,
      setRefreshDirect,
      selectedNodeData,
      setSelectedNodeData,
      setExpansion,
      expanded,
      breadCrumbsId,
      setBreadCrumbsId,
      refresh,
      setRefresh,
      setLoading,
      setSearchKey,
      searchKey,
      expandedArr,
   } = props;
   let uniqueArr = null;
   if (currentFolderToMove) {
      uniqueArr = data.filter((folder) => {
         return folder.id !== currentFolderToMove.id;
      });
   } else {
      uniqueArr = data;
   }
   const [items, setItems] = useState(uniqueArr);
   const onDragEnd = (result) => {
      if (!result.destination) {
         return;
      }
      const reorderedItems = reorder(items, result.source.index, result.destination.index);
      setItems(reorderedItems);
   };
   const getItemStyle = (isDragging, draggableStyle, snapshot) => ({
      marginRight: "3%",
      ...draggableStyle,
   });

   const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
   };

   return (
      <div className="ml-4">
         <ul className="">
            {uniqueArr &&
               uniqueArr.length > 0 &&
               uniqueArr.map((tree, index) => {
                  return (
                     <FolderNode
                        setLoading={setLoading}
                        breadCrumbsId={breadCrumbsId}
                        setBreadCrumbsId={setBreadCrumbsId}
                        expanded={expanded}
                        setExpansion={setExpansion}
                        selectedNodeData={selectedNodeData}
                        setSelectedNodeData={setSelectedNodeData}
                        refreshDirect={refreshDirect}
                        setRefreshDirect={setRefreshDirect}
                        InitialCrumbs={InitialCrumbs}
                        childCrumbs={childCrumbs}
                        key={tree.id || index}
                        node={tree}
                        openShareTeam={openShareView}
                        openFileUploadView={openFileUploadView}
                        openCreateFolder={openCreateFolder}
                        noActionMenus={noActionMenus}
                        getSelectedFolderData={getSelectedFolder}
                        openMoveFolder={openMoveFolderModal}
                        getFolderTapped={getFolder}
                        refresh={props.refresh}
                        setRefresh={props.setRefresh}
                        setNodeFiles={setFolderFiles}
                        setCrumbs={setCrumbs}
                        crumbsArr={crumbsArr}
                        closeDelete={closeDelete}
                        currentFolderToMove={currentFolderToMove}
                        setFoldersArr={setFoldersArr}
                        currentFileToMove={currentFileToMove}
                        files={files}
                        setLoadDataClick={setLoadDataClick}
                        loadDataClick={loadDataClick}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        moved={moved}
                        setMoved={setMoved}
                        shared={shared}
                        selectedOptionDrop={selectedOptionDrop}
                        setSelectedOptionDrop={setSelectedOptionDrop}
                        setSort={setSort}
                        setSearchKey={setSearchKey}
                        searchKey={searchKey}
                        expandedArr={expandedArr}
                     />
                  );
               })}
         </ul>
      </div>
   );
}

const FolderNode = (props) => {
   const {
      node,
      openShareTeam,
      openFileUploadView,
      openCreateFolder,
      noActionMenus,
      getSelectedFolderData,
      openMoveFolder,
      getFolderTapped,
      setNodeFiles,
      setCrumbs,
      crumbsArr,
      childCrumbs = [],
      closeDelete,
      currentFolderToMove,
      setFoldersArr,
      currentFileToMove,
      files,
      loadDataClick,
      setLoadDataClick,
      selectedOption,
      setSelectedOption,
      moved,
      setMoved,
      shared,
      selectedOptionDrop,
      setSelectedOptionDrop,
      setSort,
      refreshDirect,
      setRefreshDirect,
      selectedNodeData,
      setSelectedNodeData,
      setExpansion,
      expanded,
      breadCrumbsId,
      setBreadCrumbsId,
      setLoading,
      setSearchKey,
      searchKey,
      expandedArr,
   } = props;
   const [state, setState] = useState({
      hasChild: false,
      directories: [],
      loading: true,
      docFiles: [],
      docFolders: [],
   });

   const [childVisible, setChildVisible] = useState(false);
   const [childArrayCrumbs, setChildArrayCrumbs] = useState(childCrumbs);

   const defOptState = {
      selectedOpt: null,
      show: false,
      optToShow: folderOpts,
   };

   const [options, setOptions] = useState({ ...defOptState });

   useEffect(() => {
      if (expanded === null) return;
      if (expanded === node.id) {
         setChildVisible(true);
         generateBreadCrumbs();
         setExpansion(null);
      }
   }, [expanded]);

   useEffect(() => {
      if (expandedArr === null) return;
      let checkExpanded = expandedArr?.some((item) => {
         return item.id === node.id;
      });
      if (checkExpanded) {
         generateBreadCrumbs();
         setChildVisible(true);
      }
   }, [expandedArr]);

   useEffect(() => {
      if (breadCrumbsId === null) return;
      if (breadCrumbsId === node.id) {
         generateBreadCrumbs();
         setBreadCrumbsId(null);
      }
   }, [breadCrumbsId]);

   useEffect(() => {
      if (!options.show) return;
      let dropdown = document.getElementById("custom-file-dropdown");
      if (!dropdown) return;
      document.onclick = (e) => {
         if (!e.target.closest(".dropdown-item") && e.target.id !== "file-dots-option") {
            setOptions(defOptState);
         }
      };
   }, [options.show]);

   const folderActionMenu = (obj) => {
      if (obj.id === 1) {
         openFileUploadView && openFileUploadView(node);
      } else if (obj.id === 6) {
         openCreateFolder && openCreateFolder(false, node);
      } else if (obj.id === 2) {
         openMoveFolder && openMoveFolder(node);
      } else if (obj.id === 3) {
         openShareTeam && openShareTeam(node);
      } else if (obj.id === 4) {
         openCreateFolder && openCreateFolder(true, node);
      } else if (obj.id === 5) {
         swal(
            <AlertView
               showClose={false}
               titleText="Confirm"
               contentText={`Are you sure you want to remove this folder and its content?`}
               onAction={(btnData) => {
                  swal.close();
                  if (btnData.id === "alert-confirm-button") {
                     deleteDocumentFile({ id: node.id })
                        .then((success) => {
                           closeDelete && closeDelete("success", success?.data?.message, node);
                        })
                        .catch((err) => {
                           closeDelete && closeDelete("error", err.data.settings.message, node?.parentId);
                        });
                  }
               }}
            />,
            { buttons: false }
         );
      }
      options.show = !options.show;
      setOptions({ ...options });
   };

   const generateBreadCrumbs = () => {
      let tempArr = childArrayCrumbs.map((s) => s);
      if (tempArr.length === 0) {
         tempArr = [shared ? { id: "shared", title: "Shared with me" } : { id: "library", title: "My Library" }].concat(
            tempArr
         );
      }
      if (
         !tempArr.some((some) => {
            return some.id === node.id;
         })
      ) {
         tempArr.push(node);
      }
      if (selectedOption !== node.id) {
         setLoading(true);
      }
      setChildArrayCrumbs(tempArr);
      setCrumbs && setCrumbs(tempArr);
      setSearchKey("");
   };

   const isSelected = selectedOption === node.id;
   return (
      <li className="folder-tree-node" id="folders-list">
         <div
            id={node.id}
            onClick={(e) => {
               e.stopPropagation();
               if (noActionMenus) {
                  getSelectedFolderData(node, childArrayCrumbs);
               } else {
                  setSelectedOption(node);
                  setSort(false);
                  setSelectedNodeData(node);
                  setSelectedOption && setSelectedOption(node.id);
                  let stopUploadDoc = localStorage.getItem("libraryUploading");
                  if (stopUploadDoc && stopUploadDoc === "true") {
                     localStorage.setItem("stopUploading", true);
                  }
               }
               generateBreadCrumbs();
               setChildVisible(true);
               e.stopPropagation();
            }}
            className={` d-tree-node-row d-flex text-small   ${
               isSelected ? "bg-selected-dark" : "hover-custom"
            }  pointer`}
         >
            <div className="w-100 flex-center justify-content-between my-2">
               <div className="w-100 justify-content-start flex-center text-truncate">
                  <div
                     onClick={(e) => {
                        e.stopPropagation();
                        if (noActionMenus) {
                           getSelectedFolderData(node);
                        } else {
                           setSelectedNodeData(node);
                           setSort(false);
                           setSelectedOption && setSelectedOption(node.id);
                        }
                        e.stopPropagation();
                        generateBreadCrumbs();
                        setChildVisible(!childVisible);
                     }}
                  >
                     &nbsp;{" "}
                     <img
                        src={`${isSelected ? whiteRightArrow : blackArrow}`}
                        alt=""
                        style={{
                           transform: childVisible ? "rotate(90deg)" : "rotate(0deg)",
                           visibility:
                              childVisible && state.docFiles?.length === 0 && state.docFolders?.length === 0
                                 ? "hidden"
                                 : "visible",
                        }}
                     />
                     &nbsp;
                  </div>
                  <div
                     onClick={(e) => {
                        e.stopPropagation();
                        if (noActionMenus) {
                           getSelectedFolderData(node);
                        } else {
                           setSort(false);
                           setSelectedNodeData(node);
                           setSelectedOption && setSelectedOption(node.id);
                           let stopUploadDoc = localStorage.getItem("libraryUploading");
                           if (stopUploadDoc && stopUploadDoc === "true") {
                              localStorage.setItem("stopUploading", true);
                           }
                           generateBreadCrumbs();
                        }

                        setChildVisible(true);
                     }}
                     className="d-flex flex-grow-1"
                  >
                     <img
                        src={
                           node.shareWithTeams.length > 0
                              ? isSelected
                                 ? "/assets/images/newimages/sharewithme-icon-white.svg"
                                 : shareFolder
                              : isSelected
                              ? "/assets/images/newimages/folder-icon-white.svg"
                              : five
                        }
                        alt=""
                        className={`mr-2 ${node.shareWithTeams.length > 0 ? "ml-1" : noActionMenus ? "" : "ml-1"}`}
                     />
                     <div style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>{node.title}</div>
                  </div>
               </div>
            </div>
            {!noActionMenus && (
               <>
                  <img
                     id={"file-dots-option" + node.id}
                     src={isSelected ? whiteDots : blackDots}
                     alt=""
                     className="pointer mr-4"
                     // data-toggle="dropdown"
                     onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOptionDrop(node.id);
                        options.show = !options.show;
                        setOptions({ ...options });
                     }}
                  />
               </>
            )}
            {options.show && selectedOptionDrop === node.id && (
               <div
                  id="custom-file-dropdown"
                  style={
                     document.getElementById("file-dots-option" + node.id).getBoundingClientRect().x /
                        document.getElementById("file-dots-option" + node.id).getBoundingClientRect().bottom <
                     0.68
                        ? { right: "10px", bottom: "100%", zIndex: 1 }
                        : { right: "10px", top: "100%", zIndex: 1 }
                  }
                  className="position-absolute bg-white shadow round-border-s text-dark bg-background-dark dropdown-overlay-option"
                  onClick={(e) => e.stopPropagation()}
               >
                  {options.optToShow.map((opt, i) => (
                     <Option
                        id={i + opt.text}
                        key={i}
                        className={`dropdown-item py-2 hover-default ${opt.cls}`}
                        obj={opt}
                        onClick={() => {
                           setSelectedNodeData(node);
                           folderActionMenu(opt);
                        }}
                     />
                  ))}
               </div>
            )}
         </div>
         {childVisible && (
            <div className="d-tree-content">
               {node.children.length > 0 ? (
                  <ul className="d-flex d-tree-container flex-column">
                     <MyLibraryFolderView
                        breadCrumbsId={breadCrumbsId}
                        setBreadCrumbsId={setBreadCrumbsId}
                        expanded={expanded}
                        setExpansion={setExpansion}
                        selectedNodeData={selectedNodeData}
                        setSelectedNodeData={setSelectedNodeData}
                        refreshDirect={refreshDirect}
                        setRefreshDirect={setRefreshDirect}
                        setSort={setSort}
                        childCrumbs={childArrayCrumbs}
                        data={node.children}
                        openShareView={openShareTeam}
                        openFileUploadView={openFileUploadView}
                        openCreateFolder={openCreateFolder}
                        noActionMenus={noActionMenus}
                        getSelectedFolder={getSelectedFolderData}
                        openMoveFolderModal={openMoveFolder}
                        getFolder={getFolderTapped}
                        refresh={props.refresh}
                        setRefresh={props.setRefresh}
                        setFolderFiles={setNodeFiles}
                        setCrumbs={setCrumbs}
                        crumbsArr={crumbsArr}
                        closeDelete={closeDelete}
                        currentFolderToMove={currentFolderToMove}
                        setFoldersArr={setFoldersArr}
                        currentFileToMove={currentFileToMove}
                        files={files}
                        loadDataClick={loadDataClick}
                        setLoadDataClick={setLoadDataClick}
                        selectedOption={selectedOption}
                        setSelectedOption={setSelectedOption}
                        moved={moved}
                        setMoved={setMoved}
                        shared={shared}
                        selectedOptionDrop={selectedOptionDrop}
                        setSelectedOptionDrop={setSelectedOptionDrop}
                        setLoading={setLoading}
                        setSearchKey={setSearchKey}
                        expandedArr={expandedArr}
                     />
                  </ul>
               ) : null}
            </div>
         )}
      </li>
   );
};

export default memo(MyLibraryFolderView);
