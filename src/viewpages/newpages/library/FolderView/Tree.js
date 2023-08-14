import React, { useState, useEffect } from "react";
import "./Tree.css";
import DropdownToggle, {
  Option,
} from "../../../../components/newcomponents/DropdownToggle";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import MoveFolderView from "../MoveFolderView";

const folderOpts = [
  {
    id: 1,
    text: "File Upload",
    leftImg: "/assets/images/newimages/dark-upload-icon.svg",
    cls: "",
  },
  {
    id: 2,
    text: "Move",
    leftImg: "/assets/images/newimages/folder-move-icon.svg",
    cls: "",
  },
  {
    id: 3,
    text: "Share",
    leftImg: "/assets/images/newimages/folder-share-icon.svg",
    cls: "",
  },
  {
    id: 4,
    text: "Rename",
    leftImg: "/assets/images/newimages/edit-info-black-icon.svg",
    cls: "",
  },
  {
    id: 5,
    text: "Delete",
    leftImg: "/assets/images/newimages/delete-icon.svg",
    cls: "",
  },
];

const subOptions = [
  {
    text: "Share",
    leftImg: "/assets/images/newimages/dark-upload-icon.svg",
    cls: "mb-2",
  },
  {
    text: "Rename",
    leftImg: "/assets/images/newimages/folder-move-icon.svg",
    cls: "",
  },
  {
    text: "Delete",
    leftImg: "/assets/images/newimages/folder-share-icon.svg",
    cls: "mb-2",
  },
];

const Tree = (props) => {
  const {
    data = [],
    openShareView,
    openFileUploadView,
    openCreateFolder,
    noActionMenus = false,
    getSelectedFolder,
    openMoveFolderModal,
    getFolder = null,
  } = props;
  return (
    <div className="d-tree">
      <ul className="d-flex flex-column">
        {data &&
          data.length > 0 &&
          // .filter((folder) => {
          //   return Boolean(folder.isDirectory);
          // })
          data.map((tree) => (
            <TreeNode
              key={tree.id}
              node={tree}
              openShareTeam={openShareView}
              openFileUploadView={openFileUploadView}
              openCreateFolder={openCreateFolder}
              noActionMenus={noActionMenus}
              getSelectedFolderData={getSelectedFolder}
              openMoveFolder={openMoveFolderModal}
              getFolderTapped={getFolder}
            />
          ))}
      </ul>
    </div>
  );
};

const TreeNode = (props) => {
  const {
    node,
    openShareTeam,
    openFileUploadView,
    openCreateFolder,
    noActionMenus,
    getSelectedFolderData,
    openMoveFolder,
    getFolderTapped,
  } = props;
  const [childVisible, setChildVisiblity] = useState(false);

  const defOptState = {
    selectedOpt: null,
    show: false,
    optToShow: folderOpts,
  };

  const [options, setOptions] = useState({ ...defOptState });

  const hasChild = node.children || node.type === "directory" ? true : false;
  // const hasChild = node.items ? true : false;

  useEffect(() => {
    if (!options.show) return;
    let dropdown = document.getElementById("custom-file-dropdown");
    if (!dropdown) return;
    document.onclick = (e) => {
      if (
        !e.target.closest(".dropdown-item") &&
        e.target.id !== "file-dots-option"
      ) {
        setOptions(defOptState);
      }
    };
  }, [options.show]);

  const folderActionMenu = (obj) => {
    if (obj.id === 1) {
      // openShareTeam && openShareTeam(node);
      openFileUploadView && openFileUploadView(node);
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
            }
            // changeFollowStatus(-1, obj);
          }}
        />,
        { buttons: false }
      );
    }
    options.show = !options.show;
    setOptions({ ...options });
  };
  return (
    <li className="d-tree-node border-0">
      <div
        onClick={(e) => {
          let treeNodes = document.getElementsByClassName("d-tree-node-row");
          for (let i = 0; i < treeNodes.length; i++) {
            treeNodes[i].classList.remove("bg-selected");
          }
          e.currentTarget.classList.add("bg-selected");
          setChildVisiblity(!childVisible);
          // getSelectedFolderData && getSelectedFolderData(node);
          if (noActionMenus === true) {
            getSelectedFolderData && getSelectedFolderData(node);
          } else {
            getFolderTapped && getFolderTapped(node);
          }
        }}
        className="d-tree-node-row d-flex text-normal hover-default pointer"
      >
        {hasChild && (
          <div className="w-100 flex-center justify-content-between my-2">
            <div className="w-100 justify-content-start flex-center text-truncate">
              <div className={`d-tree-toggler ${childVisible ? "active" : ""}`}>
                {/* <FontAwesomeIcon icon="caret-right" /> */}
                <img src="/assets/images/newimages/right-arrow.svg" alt="" />
              </div>
              <div className="flex-center text-truncate">
                {/* <i className={`mr-1 ${node.icon}`}> </i> */}
                {(node.children || node.type === "directory") && (
                  // {node.isDirectory && node.items && (
                  <img
                    src="/assets/images/newimages/folder-icon.svg"
                    alt=""
                    className="mr-2"
                  />
                )}
                <div className="text-small text-truncate w-100 h-100">
                  {node.title}
                  {/* {node.name} */}
                </div>
              </div>
            </div>
            {!noActionMenus && (
              <img
                id="file-dots-option"
                src="/assets/images/newimages/dots-h.svg"
                alt=""
                className="pointer mr-4"
                // data-toggle="dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  options.show = !options.show;
                  setOptions({ ...options });
                }}
              />
            )}
            {options.show && (
              <div
                id="custom-file-dropdown"
                style={{ right: "10px", top: "100%", zIndex: "3" }}
                className="position-absolute bg-white shadow round-border-s py-3"
                onClick={(e) => e.stopPropagation()}
              >
                {options.optToShow.map((opt, i) => (
                  <Option
                    key={i}
                    className={`dropdown-item py-2 hover-default ${opt.cls}`}
                    obj={opt}
                    onClick={() => {
                      folderActionMenu(opt);
                      // if (opt.text.toLowerCase() === "move") {
                      //   options.optToShow = subOptions;
                      //   setOptions({ ...options });
                      // }
                    }}
                  />
                ))}
              </div>
            )}
            {/* <div>
              {noActionMenus ? null : (
                <DropdownToggle
                  className="h-100 options-view dropleft"
                  menuViewCls="w-1xsmall shadow no-border round-border-m"
                  id="library-document-actions"
                  onOptTapped={(obj) => {
                    folderActionMenu({ option: obj, props });
                  }}
                  options={[
                    {
                      text: "File Upload",
                      leftImg: "/assets/images/newimages/dark-upload-icon.svg",
                      cls: "mb-2",
                    },
                    {
                      text: "Move",
                      leftImg: "/assets/images/newimages/folder-move-icon.svg",
                      cls: "",
                    },
                    {
                      text: "Share",
                      leftImg: "/assets/images/newimages/folder-share-icon.svg",
                      cls: "mb-2",
                    },
                    {
                      text: "Rename",
                      leftImg:
                        "/assets/images/newimages/edit-info-black-icon.svg",
                      cls: "mb-2",
                    },
                    {
                      text: "Delete",
                      leftImg: "/assets/images/newimages/delete-icon.svg",
                      cls: "",
                    },
                  ]}
                >
                  <img
                    src="/assets/images/newimages/dots-h.svg"
                    alt=""
                    className="pointer mr-4"
                    data-toggle="dropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </DropdownToggle>
              )}
            </div> */}
          </div>
        )}
      </div>

      {hasChild && childVisible && (
        // {hasChild && childVisible && node.isDirectory && (
        <div className="d-tree-content">
          <ul className="d-flex d-tree-container flex-column">
            <Tree
              data={node.children}
              openShareView={openShareTeam}
              openFileUploadView={openFileUploadView}
              openCreateFolder={openCreateFolder}
              noActionMenus={noActionMenus}
              getSelectedFolder={getSelectedFolderData}
              openMoveFolderModal={openMoveFolder}
              getFolder={getFolderTapped}
            />
          </ul>
        </div>
      )}
    </li>
  );
};

export default Tree;
