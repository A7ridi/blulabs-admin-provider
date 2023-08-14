import React, { memo, useEffect, useState, useRef, useCallback } from "react";
import "./Library.css";
import LibraryList from "./LibraryList";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import DocumentsView from "./DocumentsView";
import {
   getFolderData,
   getMyLibrary,
   getShareWithMe,
   getLibraryFolders,
   getChildrenLibrary,
   getAllFolderAndFilesData,
   searchLibraryData,
} from "../../../Apimanager/Networking";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../components/newcomponents/ToastView";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import { debounce } from "lodash";

function Library(props) {
   const [state, setState] = useState({
      libraryfolders: [],
      shareWithMeArray: [],
      isLoadingShared: false,
      isLoadingMyLibrary: false,
      combinedLibraryArr: [],
   });

   const [libraryLoad, setLibraryLoad] = useState(true);
   const [sharedLoad, setSharedLoad] = useState(false);

   const [stateProp, setStateProp] = useState({
      openCreateUploadView: false,
      openCreateFolderView: false,
      openFileUploadView: false,
      openShareWithTeamView: false,
      renameFolder: false,
      openMoveToFolderView: false,
      openSelectedFolderData: null,
      folderSelection: null,
      currentFolder: null,
      draggedFile: null,
      draggedFileInfo: null,
   });

   const [filesArr, setFilesArr] = useState([]);
   const [foldersArr, setFoldersArr] = useState([]);
   const [breadcrumbs, setBreadcrumbs] = useState([]);
   const [InitialCrumbs, setInitialBreadCrumbs] = useState([]);
   const [fileInfo, setFileInfo] = useState(null);
   const [files, setFiles] = useState(null);
   const [folderInfo, setFolderInfo] = useState(null);
   const [dragDiv, setDragDiv] = useState(null);
   const [loadDataClick, setLoadDataClick] = useState(null);
   const [selectedOption, setSelectedOption] = useState(null);
   const [selectedOptionDrop, setSelectedOptionDrop] = useState(null);
   const [sort, setSort] = useState(false);
   const [selectedNode, setSelectedNode] = useState(null);
   const [treeToRender, setTreeToRender] = useState([]);
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [loadedOnce, setLoadedOnce] = useState(false);
   const [expanded, setExpansion] = useState(null);
   const [breadCrumbsId, setBreadCrumbsId] = useState(null);
   const [dataList, setDataList] = useState([]);
   const [DragParent, setDragParent] = useState([]);
   const [loading, setLoading] = useState(true);
   const searchToken = useRef(null);
   const [disabled, setdisabled] = useState(true);

   const [searchKey, setSearchKey] = useState("");
   const [expandedArr, setExpandedArr] = useState(null);

   const deb = useCallback(
      debounce((text) => {
         if (text.length > 0) {
            getSearchData(selectedIndex, text);
            setBreadcrumbs([]);
         } else if (text.length === 0) {
            getData(selectedIndex);
         }
      }, 500),
      [selectedIndex]
   );

   const loadSearchData = (key) => {
      deb(key);
   };

   const getData = async (tab = 0) => {
      setLoading(true);
      if (loadedOnce) {
         searchToken.current.cancel();
      }
      try {
         let data = [];
         if (tab === 0) {
            data = await getMyLibrary({});
         } else {
            data = await getShareWithMe({});
         }
         if (data) {
            setDragParent([...data?.data?.files, ...data?.data?.directories]);
            setLoading(false);
         }
      } catch (error) {
         console.log("Error fetching library info --> ", error);
      }
   };

   const getSearchData = async (tab = 0, key) => {
      setLoading(true);
      if (loadedOnce) {
         searchToken.current.cancel();
      }
      searchToken.current = axios.CancelToken.source();

      try {
         if (!loadedOnce) {
            setLoadedOnce(true);
         }
         let data = await searchLibraryData(
            tab === 0 ? { query: key, filter: "mylibrary" } : { query: key, filter: "sharedwithme" },
            searchToken.current
         );

         if (data) {
            setDragParent([...data?.data?.directories, ...data?.data?.files]);
            setLoading(false);
         }
      } catch (error) {
         console.log("Library search info --> ", error);
      }
   };

   // Find Breadcumbs after searching
   const findBreadCrumbs = (node) => {
      const id = node.id;
      setSelectedOption(node);
      setSort(false);
      setSelectedNode(node);
      setSelectedOption && setSelectedOption(node.id);

      const isNodeAvailable = document.getElementById(id) || false;
      if (isNodeAvailable) {
         document.getElementById(id).click();
         getFoldersInfo({
            id: id,
         });
         return;
      }
      setLoading(true);

      function findTree(treeToRender, searchKey) {
         const nodes = {};
         for (const branch of treeToRender) {
            let checkFolder = treeToRender?.some((item) => {
               if (item.id === id) {
                  nodes.item = item;
               }
            });

            if (branch.children) {
               const result = findTree(branch.children, searchKey);
               if (result.item) {
                  nodes.item = branch;
                  nodes.child = result;
                  break;
               }
            }
         }
         return nodes;
      }

      function createBreadCrumbArr(treeToRender, searchKey) {
         let result = [],
            tree = findTree(treeToRender, searchKey);

         while (tree) {
            result.push(tree.item);
            tree = tree.child;
         }

         result = [
            selectedIndex === 1 ? { id: "shared", title: "Shared with me" } : { id: "library", title: "My Library" },
         ].concat(result);

         setBreadcrumbs(result);
         setExpandedArr(result);

         return result;
      }

      createBreadCrumbArr(treeToRender, searchKey);
   };

   useEffect(() => {
      let currentUser = props.userCredentials || "{}";
      if (!currentUser.user?.role.includes("admin")) {
         props.history.push("/");
      }
      const getData = async () => {
         await getAllFolderAndFilesData()
            .then((data) => {
               // setDataList(data.data)
               setDragParent(data.data);
            })
            .catch((error) => {});
      };
      getData().catch(console.error);
   }, []);

   // FOR POPULATING RIGHT SIDE CONTENT
   useEffect(() => {
      if (selectedOption === null) return;
      else {
         getFolderNodeData();
      }
   }, [selectedOption]);

   const getFolderNodeData = () => {
      getFoldersInfo({
         id: selectedOption,
      });
   };

   const getFoldersInfo = async (info) => {
      if (loadedOnce) {
         searchToken.current.cancel();
      }
      searchToken.current = axios.CancelToken.source();
      let data = await getFolderData(info, searchToken.current);
      let allData = await getChildrenLibrary(info, searchToken.current);
      if (data) {
         if (
            localStorage.getItem("libraryUploading") &&
            localStorage.getItem("libraryUploading") === "true" &&
            filesArr?.length !== data?.data?.files?.length
         ) {
            localStorage.setItem("stopUploading", true);
            localStorage.removeItem("libraryUploading");
         }
         setFilesArr(data?.data?.files);
         setFoldersArr(data?.data?.directories);
         // setDataList(allData?.data)
         setDragParent(allData?.data);
         setLoading(false);

         //  document.getElementById(info?.id) && document.getElementById(info?.id).click();
         if (!loadedOnce) {
            setLoadedOnce(true);
         }
      }
   };

   const getLibrayDetails = async () => {
      let data;
      if (selectedIndex === 0) {
         data = await getMyLibrary({});
      } else {
         data = await getShareWithMe({});
      }
      if (
         localStorage.getItem("libraryUploading") &&
         localStorage.getItem("libraryUploading") === "true" &&
         filesArr?.length !== data?.data?.files?.length
      ) {
         localStorage.setItem("stopUploading", true);
         localStorage.removeItem("libraryUploading");
      }

      setFilesArr(data.data.files);
      setFoldersArr(data.data.directories);
   };

   // FOR THE TREE STRUCTURE

   const getUpdatedTree = (reload = false, isNew = false) => {
      if (selectedIndex === 0) {
         getMyLibraryData(reload, isNew);
         setdisabled(true);
      } else {
         getShareWithMeData(reload, isNew);
         setdisabled(false);
      }
   };

   // //  FOR OPENING THE NEWLY CREATED FOLDER
   // const openNewlyCreatedFolder(id)=>{

   // }

   const getMyLibraryData = async (reload, isNew = false) => {
      try {
         if (reload) {
            setState({ ...state, isLoadingMyLibrary: true });
            setLibraryLoad(true);
            setSharedLoad(false);
         }

         let data = await getLibraryFolders({ filter: "mylibrary" });
         let allData = await getAllFolderAndFilesData();
         if (data) {
            setTreeToRender(data.data);
            // setDataList(allData?.data)
            if (!isNew) {
               setDragParent(allData?.data);
            }
            setLibraryLoad(false);
            setState({
               ...state,
               isLoadingMyLibrary: false,
            });
            setLoading(false);
            if (
               localStorage.getItem("libraryUploading") &&
               localStorage.getItem("libraryUploading") === "true" &&
               filesArr?.length !== data?.data?.files?.length
            ) {
               localStorage.setItem("stopUploading", true);
               localStorage.removeItem("libraryUploading");
            }
         }
      } catch (error) {
         console.log("Error fetching library info --> ", error);
      }
   };

   const getShareWithMeData = async (reload, isNew = false) => {
      try {
         if (reload) {
            setState({ ...state, isLoadingShared: true });
            setSharedLoad(true);
            setLibraryLoad(false);
         }

         let data = await getLibraryFolders({ filter: "sharedwithme" });
         let allData = await getShareWithMe({});
         if (data) {
            setTreeToRender(data.data);
            setState({ ...state, isLoadingShared: false });

            let newdata = allData.data.directories.concat(allData.data.files);
            if (!isNew) {
               setDragParent(newdata);
            }
            setSharedLoad(false);
            setLoading(false);
            if (
               localStorage.getItem("libraryUploading") &&
               localStorage.getItem("libraryUploading") === "true" &&
               filesArr?.length !== data?.data?.files?.length
            ) {
               localStorage.setItem("stopUploading", true);
               localStorage.removeItem("libraryUploading");
            }
         }
      } catch (error) {
         console.log("Error fetching share with me info --> ", error);
      }
   };

   // LOADING DATA TOGETHER

   const loadRoot = (reload = false) => {
      if (selectedIndex === 0) {
         setInitialBreadCrumbs([{ id: "library", title: "My Library" }]);
      } else {
         setInitialBreadCrumbs([{ id: "shared", title: "Shared with me" }]);
      }
      setBreadcrumbs([]);
      getUpdatedTree(reload);
      getLibrayDetails();
      setSearchKey("");
   };

   // LOADING DATA WHEN INSIDE A FOLDER

   const getSameStateData = () => {
      getUpdatedTree(false, true);
      if (selectedOption === null) {
         getLibrayDetails();
      } else {
         getFolderNodeData();
      }
   };

   const showResponseMessage = (message, type) => {
      toast(<ToastView text={message} type={type} />, defaultToastProps);
   };

   const handleDragFiles = (event) => {
      // console.log('dragDiv', event.target.files)
      if (event.target.files && event.target.files[0]) {
         setFiles(event.target.files);
         setFileInfo(folderInfo);
         setDragDiv(null);
      }
   };

   const dragFile = (e, type) => {
      setDragDiv("drag-drop-overlay file-input open-div");
   };

   const dragLeave = () => {
      if (dragDiv === null) {
         return;
      }
      setDragDiv(null);
   };

   const generateBreadcrumbs = (id, name, arr) => {
      let breadcrumbsTemp = arr.map((s) => s);
      let index = breadcrumbsTemp.findIndex((find) => {
         return find.id === id;
      });
      breadcrumbsTemp[index].title = name;
      setBreadcrumbs(breadcrumbsTemp);
   };

   const generateBreadcrumbsFolder = (currentFolder, data, arr) => {
      getUpdatedTree(false, true);
      setBreadCrumbsId(data.id);
   };

   return (
      <div id="library" style={{ height: "100vh" }} className="d-flex w-100 ">
         <section className="library-list-section flex-shrink-0 h-100 overflow-hidden">
            <LibraryList
               libraryLoad={libraryLoad}
               sharedLoad={sharedLoad}
               setLoading={setLoading}
               generateBreadcrumbsFolder={generateBreadcrumbsFolder}
               breadCrumbsId={breadCrumbsId}
               setBreadCrumbsId={setBreadCrumbsId}
               generateBreadcrumbs={generateBreadcrumbs}
               expanded={expanded}
               setExpansion={setExpansion}
               getSameStateData={getSameStateData}
               loadRoot={loadRoot}
               getFolderNodeData={getFolderNodeData}
               getUpdatedTree={getUpdatedTree}
               selectedIndex={selectedIndex}
               setSelectedIndex={setSelectedIndex}
               getLibrayDetails={getLibrayDetails}
               treeToRender={treeToRender}
               state={stateProp}
               setState={setStateProp}
               selectedNode={selectedNode}
               setSelectedNode={setSelectedNode}
               setSort={setSort}
               selectedOptionDrop={selectedOptionDrop}
               selectedOption={selectedOption}
               setSelectedOption={setSelectedOption}
               setSelectedOptionDrop={setSelectedOptionDrop}
               loadDataClick={loadDataClick}
               setLoadDataClick={setLoadDataClick}
               uploadDocuments={(o) => props.uploadDocs(o)}
               libraryData={state.libraryfolders}
               sharedWithMeData={state.shareWithMeArray}
               getUpdatedLibrary={getMyLibraryData}
               getUpdatedShareWithMe={getShareWithMeData}
               setFiles={setFilesArr}
               setCrumbs={setBreadcrumbs}
               crumbsArr={breadcrumbs}
               InitialCrumbs={InitialCrumbs}
               setInitialBreadCrumbs={setInitialBreadCrumbs}
               isLoadingShared={state.isLoadingShared}
               isLoadingMyLibrary={state.isLoadingMyLibrary}
               showResponseMessage={showResponseMessage}
               files={files}
               fileInfo={fileInfo}
               setFolderInfo={setFolderInfo}
               cancelDragUploading={() => {
                  setFiles(null);
                  setFileInfo(null);
               }}
               setFoldersArr={setFoldersArr}
               libFilesArr={filesArr}
               searchKey={searchKey}
               setSearchKey={setSearchKey}
               loading={loading}
               expandedArr={expandedArr}
               setExpandedArr={setExpandedArr}
            />
         </section>
         <div
            onDragOver={(e) => {
               dragFile();
            }}
            onMouseMove={() => {
               dragLeave();
            }}
            style={{ height: "90vh", width: "100%" }}
         >
            <div
               className="row grid-view hide-scroll "
               style={{ overflowY: "auto", height: "100%", marginLeft: "0", marginRight: "0" }}
            >
               {dragDiv !== null ? (
                  <div className={`${dragDiv}`} style={{ height: "100vh" }}>
                     <input type="file" onChange={(e) => handleDragFiles(e)} accept="/*" multiple />
                     <div
                        className="text-grey3 text-small flex-center flex-column"
                        style={{
                           position: "absolute",
                           padding: "15px",
                           textAlign: "center",
                           borderRadius: "5px",
                           boxShadow: "0 0px 7px rgb(0 0 0 / 30%)",
                           left: "50%",
                           bottom: "45%",
                           transform: "translateX(-50%)",
                           // zIndex: "11",
                        }}
                     >
                        <img src="assets/images/newimages/lib-upload-cloud.svg" alt="" className="mr-5 " />
                        <div className="mt-4">
                           Drag &#38; Drop your files here, or <span className="text-primary2">browse</span>
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="w-100">
                     <section className={`w-100 flex-center `}>
                        <DocumentsView
                           loadSearchData={loadSearchData}
                           loading={loading}
                           setLoading={setLoading}
                           getUpdatedTree={getSameStateData}
                           selectedIndex={selectedIndex}
                           getSameStateData={getSameStateData}
                           loadRoot={loadRoot}
                           openUploadFileView={() => {
                              setStateProp({ ...stateProp, openFileUploadView: true, currentFolder: selectedNode });
                           }}
                           setSelectedNode={(node) => {
                              setSelectedOption(node);
                              setSelectedNode(node);
                           }}
                           libraryData={treeToRender}
                           setSelectedOption={setSelectedOption}
                           setFolderInfo={setFolderInfo}
                           sort={sort}
                           setSort={setSort}
                           setLoadDataClick={setLoadDataClick}
                           dataList={dataList || []}
                           folderFiles={filesArr}
                           foldersArr={foldersArr}
                           setFiles={setFilesArr}
                           setFolders={setFoldersArr}
                           crumbsArr={breadcrumbs}
                           InitialCrumbs={InitialCrumbs}
                           setDragParent={setDragParent}
                           setDragFileUpload={(files, folderInfo) => {
                              setFiles(files);
                              setFileInfo(folderInfo);
                           }}
                           DragParent={DragParent}
                           findBreadCrumbs={findBreadCrumbs}
                           combinedLibraryArr={state.combinedLibraryArr}
                           folderInfo={folderInfo}
                           getUpdatedLibrary={getMyLibraryData}
                           searchKey={searchKey}
                           setSearchKey={setSearchKey}
                           disabled={disabled}
                           setExpandedArr={setExpandedArr}
                        />
                     </section>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth.northwelluser.user.stsTokenManager.accessToken,
   };
};

export default connect(mapStateToProps)(withRouter(memo(Library)));
