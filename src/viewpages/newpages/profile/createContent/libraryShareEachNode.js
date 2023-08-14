import React, { useState } from "react";
import openKey from "../../../../images/library/upKey.svg";
import closeKey from "../../../../images/library/downKey.svg";
import shareIcon from "../../../../images/library/shareIcon.svg";
import line from "../../../../images/library/line.svg";
import shareBlue from "../../../../images/library/shareBlue.svg";
import { getMediaIconNew } from "../../../../helper/CommonFuncs";
import { getFolderData } from "../../../../Apimanager/Networking";
import { calculateDateLabel } from "../../../../helper/CommonFuncs";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

export function LibraryEachNode({ node, child = false, share, selectedId, setSelectedId, openView }) {
   const [visible, setVisible] = useState(false);
   const [childData, setChildData] = useState([]);

   const getFoldersInfo = async (info) => {
      let data = await getFolderData(info);
      if (data) {
         setChildData([...data?.data?.directories, ...data?.data?.files]);
      }
   };
   const isDirectory = node.type === "directory";
   const isSelected = node.id === selectedId;
   const dateLabel = calculateDateLabel(node.createdAt);
   return (
      <>
         <div className={`d-flex pointer ${child ? "each-node-library-child" : "each-node-library-share"} `}>
            {isDirectory && (
               <div
                  onClick={() => {
                     if (isDirectory) {
                        setVisible(!visible);
                        setSelectedId(node.id);
                        if (!visible) {
                           getFoldersInfo({ id: node.id });
                        }
                     }
                  }}
               >
                  <img
                     src={visible ? closeKey : openKey}
                     alt="navigating-key"
                     className={`${isSelected && "selected-shared-file"}`}
                  />
               </div>
            )}
            <div className="d-flex flex-grow-1 pl-2 align-items-center">
               <div
                  onClick={(e) => {
                     if (isDirectory) {
                        if (!visible) {
                           getFoldersInfo({ id: node.id });
                           setSelectedId(node.id);
                        }
                        setVisible(!visible);
                     } else {
                        openView(node);
                     }
                  }}
                  className="d-flex flex-grow-1 "
               >
                  {isDirectory ? (
                     <img
                        src={
                           node.shareWithTeams.length > 0
                              ? "/assets/images/newimages/sharewithme-icon.svg"
                              : "/assets/images/newimages/folder-icon.svg"
                        }
                        alt="folder-share"
                        className={`image-visible-button`}
                     />
                  ) : (
                     <img src={getMediaIconNew(node.type)} alt="folder-share" className="image-invisble-button" />
                  )}
                  <div
                     className={` ${isSelected && "selected-shared-file"} ${
                        isDirectory ? "text-node-title-directory" : "text-node-title"
                     }`}
                  >
                     {node.title}
                     <div className={`${isSelected && "selected-shared-file"} faded-words`}>{dateLabel}</div>
                  </div>
               </div>
               <div
                  id={pendoIds.btnShareContentLibraryArrowId}
                  onClick={() => {
                     share(node);
                  }}
               >
                  <img src={isSelected ? shareBlue : shareIcon} alt="share-key" />
               </div>
            </div>
         </div>
         <div className="child-bottom-border">
            {childData.length > 0 &&
               visible &&
               childData.map((s) => (
                  <div className="ml-5 pt-2 pb-2">
                     <MainLibrary
                        node={s}
                        child={true}
                        share={share}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        openView={openView}
                     />
                  </div>
               ))}
         </div>
         {!child && <img className="line-image" src={line} alt="line" />}
      </>
   );
}

export default function MainLibrary({ node, child, share, selectedId, setSelectedId, openView }) {
   return (
      <LibraryEachNode
         node={node}
         child={child}
         share={share}
         selectedId={selectedId}
         setSelectedId={setSelectedId}
         openView={openView}
      />
   );
}
