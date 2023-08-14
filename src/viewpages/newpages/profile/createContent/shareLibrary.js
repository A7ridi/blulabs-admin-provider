import React, { useEffect, useState, useRef } from "react";
import SegmentView from "../../../../components/newcomponents/SegmentView/SegmentView";
import {
   getMyLibrary,
   getShareWithMe,
   shareFolder,
   shareFile,
   searchLibraryData,
} from "../../../../Apimanager/Networking";
import LibraryEachNode from "./libraryShareEachNode";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import axios from "axios";
import { showSwal, ShowAlert } from "../../../../common/alert";
import LibraryPreviewView from "../content-section/librarySharePostView";
import LoadingIndicator from "../../../../common/LoadingIndicator";

import folderBlue from "../../../../images/library/rename.svg";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { useMutation } from "@apollo/client";
import { CREATE_CONTENT } from "../../profileModule/actions/profileQueries";
import { errorToDisplay } from "../../../../helper/CommonFuncs";

const segmentOptions = [
   {
      text: "Shared with me",
      id: 1,
      pendoId: pendoIds.tabSharedWithMeContLibrary,
   },
   {
      text: "My library",
      id: 2,
      pendoId: pendoIds.tabMyLibraryContLibrary,
   },
];

export const LibraryLayer = ({ data, share, selectedId, setSelectedId, openView }) => {
   return (
      <>
         {data.length === 0 ? (
            <div style={{ paddingTop: "0%" }} className="w-100 h-100 flex-center text-large text-bold">
               No files.
            </div>
         ) : (
            data.map((s, i) => (
               <LibraryEachNode
                  key={i}
                  node={s}
                  share={share}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  openView={openView}
               />
            ))
         )}
      </>
   );
};

export default function LibraryShareView({ isProvider, userId, refetch, providerUserId, allowDownload }) {
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [searchKey, setSearchKey] = useState("");
   const [libraryData, setLibraryData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [loadedOnce, setLoadedOnce] = useState(false);
   const [uploadData, setUploadDate] = useState(false);
   const [sorted, setSorted] = useState(true);
   const [selectedId, setSelectedId] = useState(null);
   const [showContent, setShowContent] = useState({
      show: false,
      data: null,
   });
   const searchToken = useRef(null);
   const [shareLibContent] = useMutation(CREATE_CONTENT, {
      onCompleted(res) {
         ShowAlert("Content shared successfully.");
         refetch();
         setUploadDate(false);
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
         setUploadDate(false);
      },
   });

   const Card = (item, classname, showPreview) => {
      return (
         <LibraryPreviewView
            isPreview={showPreview}
            postData={item.data}
            key={item.id}
            isLoading={false}
            className={classname}
         />
      );
   };

   useEffect(() => {
      if (searchKey.length === 0) {
         getData(selectedIndex);
      }
      setSorted(true);
   }, [selectedIndex, searchKey]);

   useEffect(() => {
      if (searchKey.length < 2) return;
      getSearchData(selectedIndex);
   }, [searchKey]);

   const shareDocument = (node) => {
      const isDirectory = node.type === "directory";
      showSwal(
         `Are you sure you want to share this ${isDirectory ? "folder" : "file"} ?`,
         "",
         () => {
            setUploadDate(true);
            if (isDirectory) {
               shareLibContent({
                  variables: {
                     media: {
                        patient: {
                           id: userId,
                        },
                        isDoctorsOnly: isProvider,
                        isShared: true,
                        directoryId: node.id,
                        isPrintable: allowDownload,
                        provider: {
                           userId: providerUserId,
                        },
                     },
                  },
               });
            } else {
               shareLibContent({
                  variables: {
                     media: {
                        patient: {
                           id: userId,
                        },
                        isDoctorsOnly: isProvider,
                        isShared: true,
                        fileId: node.id,
                        isPrintable: allowDownload,
                        provider: {
                           userId: providerUserId,
                        },
                     },
                  },
               });
            }
         },
         true,
         false,
         pendoIds.btnShareContentLibraryId
      );
   };

   const getData = async (tab = 0) => {
      setLoading(true);
      setSelectedId(null);
      try {
         let data = [];
         if (tab === 1) {
            data = await getMyLibrary({});
         } else {
            data = await getShareWithMe({});
         }
         if (data) {
            setLibraryData([...data?.data?.directories, ...data?.data?.files]);
            setLoading(false);
         }
      } catch (error) {
         console.log("Error fetching library info --> ", error);
      }
   };
   const getSearchData = async (tab = 0) => {
      setLoading(true);
      setSelectedId(null);
      if (loadedOnce) {
         searchToken.current.cancel();
      }
      searchToken.current = axios.CancelToken.source();
      try {
         let data = await searchLibraryData(
            tab === 1 ? { query: searchKey, filter: "mylibrary" } : { query: searchKey, filter: "sharedwithme" },
            searchToken.current
         );
         if (data) {
            setLibraryData([...data?.data?.directories, ...data?.data?.files]);
            setLoading(false);
            if (!loadedOnce) {
               setLoadedOnce(true);
            }
         }
      } catch (error) {
         console.log("Error fetching library info --> ", error);
      }
   };
   return (
      <div className="w-100 flex-center flex-column">
         <div className="search-input-container">
            <input
               id={pendoIds.inputSearchContLibrary}
               type="text"
               placeholder="Search"
               className="search-input-share"
               value={searchKey}
               onChange={(e) => {
                  setSearchKey(e.target.value);
               }}
            />
         </div>
         <div className="segment-view-cont-library relative">
            <SegmentView
               className="mb-4 text-small flex-grow-1"
               name="create-content"
               selectedIndex={selectedIndex}
               options={segmentOptions}
               onSelect={(opt, index) => {
                  setSelectedIndex(index);
                  setSearchKey("");
               }}
            />
            <div
               onClick={() => {
                  var directory = libraryData.map((s) => s);
                  directory = directory.filter((filter) => {
                     return filter.type === "directory";
                  });
                  var files = libraryData.map((s) => s);
                  files = files.filter((filter) => {
                     return filter.type !== "directory";
                  });

                  directory.sort(function (a, b) {
                     if (!sorted) {
                        if (a.title.toLowerCase() < b.title.toLowerCase()) {
                           return -1;
                        }
                        if (a.title.toLowerCase() > b.title.toLowerCase()) {
                           return 1;
                        }
                     } else {
                        if (a.title.toLowerCase() < b.title.toLowerCase()) {
                           return 1;
                        }
                        if (a.title.toLowerCase() > b.title.toLowerCase()) {
                           return -1;
                        }
                     }

                     return 0;
                  });
                  files.sort(function (a, b) {
                     if (!sorted) {
                        if (a.title.toLowerCase() < b.title.toLowerCase()) {
                           return -1;
                        }
                        if (a.title.toLowerCase() > b.title.toLowerCase()) {
                           return 1;
                        }
                     } else {
                        if (a.title.toLowerCase() < b.title.toLowerCase()) {
                           return 1;
                        }
                        if (a.title.toLowerCase() > b.title.toLowerCase()) {
                           return -1;
                        }
                     }
                     return 0;
                  });
                  setLibraryData([...directory, ...files]);
                  setSorted(!sorted);
               }}
               style={{
                  transform: !sorted ? "rotate(180deg)" : "rotate(0deg)",
               }}
               className="sort-button-container"
            >
               <img src={folderBlue} alt="sort" className="sort-button" />
            </div>
         </div>
         <div className={`${loading ? "div-cont-library-load" : "div-cont-library-share"}`}>
            <div
               className={`${
                  loading
                     ? "loading-shade div-fixed-height"
                     : !loading && libraryData.length === 0
                     ? "div-child-library-empty"
                     : "div-child-library-share"
               } `}
            >
               {!loading && !sorted && (
                  <LibraryLayer
                     data={libraryData}
                     share={shareDocument}
                     selectedId={selectedId}
                     setSelectedId={setSelectedId}
                     openView={(node) => {
                        setShowContent({
                           show: true,
                           data: node,
                        });
                     }}
                  />
               )}
               {sorted && !loading && (
                  <LibraryLayer
                     data={libraryData}
                     share={shareDocument}
                     selectedId={selectedId}
                     setSelectedId={setSelectedId}
                     openView={(node) => {
                        setShowContent({
                           show: true,
                           data: node,
                        });
                     }}
                  />
               )}
            </div>
         </div>
         {showContent.show && (
            <ModalPopup
               onModalTapped={() => {
                  setShowContent({ show: false, data: null });
               }}
            >
               {Card(
                  {
                     data: showContent.data,
                     index: showContent.data,
                     id: showContent.data.id,
                  },
                  "grid-view-post px-5 py-3 bg-white w-75 h-85 round-border-l",
                  true
               )}
            </ModalPopup>
         )}
         {uploadData && (
            <ModalPopup onModalTapped={() => {}}>
               <LoadingIndicator />
            </ModalPopup>
         )}
      </div>
   );
}
