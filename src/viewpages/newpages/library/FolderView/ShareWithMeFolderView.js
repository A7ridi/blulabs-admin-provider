import React, { memo, useState, useEffect } from "react";
import "./ShareWithMeFolderView.css";
import { getFolderData } from "../../../../Apimanager/Networking";

function ShareWithMeFolderView(props) {
  const {
    data,
    setFolderFiles,
    setCrumbs,
    crumbsArr,
    childCrumbs = [],
    InitialCrumbs = [],
    setFoldersArr,

    loadDataClick,
    setLoadDataClick,
  } = props;
  return (
    <div className="ml-4">
      <ul className="">
        {data &&
          data.length > 0 &&
          // .filter((folder) => {
          //   return Boolean(folder.isDirectory);
          // })
          data.map((tree, index) => (
            <FolderNode
              InitialCrumbs={InitialCrumbs}
              key={tree.id || index}
              node={tree}
              setNodeFiles={setFolderFiles}
              childCrumbs={childCrumbs}
              setCrumbs={setCrumbs}
              crumbsArr={crumbsArr}
              setFoldersArr={setFoldersArr}
              setLoadDataClick={setLoadDataClick}
              loadDataClick={loadDataClick}
            />
          ))}
      </ul>
    </div>
  );
}

const FolderNode = (props) => {
  const {
    node,
    setNodeFiles,
    setCrumbs,
    crumbsArr,
    childCrumbs = [],
    InitialCrumbs = [],
    setFoldersArr,

    loadDataClick,
    setLoadDataClick,
  } = props;

  const [state, setState] = useState({
    hasChild: false,
    directories: [],
    loading: true,
  });

  const [childVisible, setChildVisible] = useState(false);

  const [childArrayCrumbs, setChildArrayCrumbs] = useState(childCrumbs);

  useEffect(() => {
    if (loadDataClick === null) return;

    if (loadDataClick === node.id) {
      getFoldersInfoCrumbs({
        id: node.id,
      });
      setLoadDataClick && setLoadDataClick(null);
    }
  }, [loadDataClick]);

  const getTappedFolderData = async (folder) => {
    let queryParams = {
      id: folder.id,
    };
    getFoldersInfo(queryParams);
  };

  const getFoldersInfo = async (info) => {
    let data = await getFolderData(info);
    if (data) {
      setState({
        ...state,
        hasChild: data?.data?.directories?.length >= 0 ? true : false,
        directories: data?.data?.directories,
        loading: false,
      });
      setNodeFiles(data?.data.files);
      setFoldersArr(data.data.directories);
    }
  };
  const getFoldersInfoCrumbs = async (info) => {
    let data = await getFolderData(info);
    if (data) {
      setState({
        ...state,
        hasChild: data?.data?.directories?.length >= 0 ? true : false,
        directories: data?.data?.directories,
        loading: false,
      });

      let tempArr = childArrayCrumbs.map((s) => s);
      if (tempArr.length === 0) {
        tempArr = [{ id: "library", title: "My Library" }].concat(tempArr);
      }
      if (
        !tempArr.some((some) => {
          return some.id === node.id;
        })
      ) {
        tempArr.push(node);
      }
      setChildArrayCrumbs(tempArr);
      setCrumbs && setCrumbs(tempArr);
      setNodeFiles(data?.data?.files);
      setFoldersArr(data?.data?.directories);
      getTappedFolderData(node);
      setChildVisible(true);
    }
  };

  return (
    <li className="folder-tree-node" id="shared-folders-list">
      <div
        id={node.id}
        onClick={(e) => {
          let treeNodes = document.getElementsByClassName("d-tree-node-row");
          for (let i = 0; i < treeNodes.length; i++) {
            treeNodes[i].classList.remove("bg-selected-dark");
          }
          e.currentTarget.classList.add("bg-selected-dark");
        }}
        className="d-tree-node-row d-flex text-small hover-default pointer"
      >
        <div className="w-100 flex-center justify-content-between my-2">
          <div className="w-100 justify-content-start flex-center text-truncate">
            <div
              onClick={() => {
                setChildVisible(!childVisible);
                getTappedFolderData(node);
              }}
            >
              <img
                src="/assets/images/newimages/right-arrow-white.svg"
                alt=""
                style={{
                  transform: childVisible ? "rotate(90deg)" : "rotate(0deg)",
                }}
              />
            </div>
            <div
              onClick={(e) => {
                let tempArr = childArrayCrumbs.map((s) => s);
                if (tempArr.length === 0) {
                  tempArr = [{ id: "shared", title: "Shared with me" }].concat(tempArr);
                }
                if (
                  !tempArr.some((some) => {
                    return some.id === node.id;
                  })
                ) {
                  tempArr.push(node);
                }

                setChildArrayCrumbs(tempArr);
                setCrumbs(tempArr);
                setChildVisible(true);
                getTappedFolderData(node);
              }}
              className="flex-center"
            >
              <img src="/assets/images/newimages/folder-icon-white.svg" alt="" className="mr-2" />
              <div>{node.title}</div>
            </div>
          </div>
        </div>
      </div>
      {childVisible && (
        <div className="d-tree-content">
          {state.hasChild ? (
            <ul className="d-flex d-tree-container flex-column">
              <ShareWithMeFolderView
                data={state.directories}
                setFolderFiles={setNodeFiles}
                childCrumbs={childArrayCrumbs}
                setCrumbs={setCrumbs}
                crumbsArr={crumbsArr}
                setFoldersArr={setFoldersArr}
              />
            </ul>
          ) : (
            Array(2)
              .fill()
              .map((o, i) => {
                return <div key={i} className="h-2xs m-3 round-border-m loading-shade-dark"></div>;
              })
          )}
        </div>
      )}
    </li>
  );
};

export default memo(ShareWithMeFolderView);
