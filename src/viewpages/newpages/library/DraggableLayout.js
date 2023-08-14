import React, { Component } from "react";
import { render } from "react-dom";
import { SortableContainer, SortableElement, sortableHandle } from "react-sortable-hoc";
import { PostMyLibrarySorted } from "../../../Apimanager/Networking";
import upDownArrow from "../../../images/library/upDownArrow.svg";
import { getMediaIconNew } from "../../../helper/CommonFuncs";
import moment from "moment";
import { tableHeaderStyle, tableHeaderStyleEx } from "../profileModule/components/careTeamView";

const DragHandle = sortableHandle(() => (
   <div
      className={"dragging"}
      style={{
         width: "7%",
         textAlign: "right",
         paddingInline: " 2%",
      }}
      onMouseEnter={() => {}}
      onMouseLeave={() => {}}
   >
      <img src={upDownArrow} alt="up-down-arrow" />
   </div>
));

const SortableItem = SortableElement(({ value }) => (
   <div className="sortableItem">
      <div className="sortableItem-handle" />
      {value}
   </div>
));

const SortableList = SortableContainer(({ items }) => {
   return (
      <div className="p-3">
         {items?.map((value, index) => (
            <SortableItem key={`item-${index}`} index={index} value={value} />
         ))}
      </div>
   );
});

class SortableComponent extends Component {
   constructor(props) {
      super(props);
      this.state = {
         items: [],
      };
   }

   componentDidMount = () => {
      this.setState({
         items: this.generateData(this.props.DragParent),
      });
   };

   componentDidUpdate(prevProps) {
      if (
         prevProps.DragParent !== this.props.DragParent ||
         prevProps.order !== this.props.order ||
         prevProps.dateOrder !== this.props.dateOrder
      ) {
         this.setState({
            items: this.generateData(this.props.DragParent),
         });
      }
   }

   generateData = (data) => {
      return data?.map((o, i) => {
         const folderIconSize = o?.shareWithTeams?.length > 0 ? "28px" : "31px";
         return (
            <>
               {!data.length ? (
                  "No files"
               ) : (
                  <div
                     key={i}
                     id={this.props.searchKey.length > 0 ? "new" + o.id : o.id}
                     className={`hover-default-without-border  border-0 pointer text-bold text-xsmall pr-2  d-flex align-items-center`}
                     style={{
                        borderRadius: "0px !important",
                     }}
                     onClick={() => {
                        if (o?.type !== "directory") {
                           this.props.openFile(o, i, true);
                        } else {
                           this.props.setLoadDataClick(o.id);
                           this.props.setSelectedNode(o.id);
                           document.getElementById(o.id) && document.getElementById(o.id).click();
                           this.props.findBreadCrumbs(o);
                        }
                     }}
                  >
                     <div style={{ width: "55%" }} className="d-flex align-items-center ml-2">
                        <div className="d-flex justify-content-center ml-2 " style={{ width: "5%" }}>
                           {o?.type === "directory" ? (
                              <img
                                 className="ml-2"
                                 src={`${
                                    o?.shareWithTeams?.length > 0
                                       ? "/assets/images/newimages/sharewithme-icon.svg"
                                       : "/assets/images/newimages/folder-icon.svg"
                                 }`}
                                 alt=""
                                 style={{ height: folderIconSize, width: folderIconSize, maxWidth: "none" }}
                              />
                           ) : (
                              <img
                                 className=" ml-2 h-xsmall w-xs"
                                 src={getMediaIconNew(o?.type)}
                                 alt=""
                                 style={{ maxWidth: "30px", maxHeight: "30px", minHeight: "30px", minWidth: "30px" }}
                              />
                           )}
                        </div>
                        <td className="text-small text-truncate font-title-lib title-align ml-4">{o?.title}</td>
                        <td>
                           {o?.type !== "directory" && o?.shareWithTeams?.length > 0 && (
                              <img
                                 className="ml-3"
                                 src="/assets/images/newimages/shared-file-icon.svg"
                                 alt=""
                                 style={{ minHeight: "16px", minWidth: "16px" }}
                              />
                           )}
                        </td>
                     </div>
                     <div
                        title={o?.addedByName}
                        className="text-truncate text-small text-grey6 pl-4 font-title-lib-else"
                        style={{ width: "22%" }}
                     >
                        {o?.addedByName}
                     </div>
                     <div className="p-4 text-grey6 font-title-lib-else" style={{ width: "15%" }}>
                        {moment(o.createdAt, "YYYYMMDD").format("MM/DD/YYYY")}
                     </div>
                     {this.props.searchKey.length === 0 && this.props.disabled && <DragHandle />}
                  </div>
               )}
            </>
         );
      });
   };

   move(collection, fromIndex, toIndex) {
      const result = [];
      const shift = toIndex - fromIndex > 0 ? 1 : -1;
      const start = toIndex < fromIndex ? toIndex : fromIndex;
      const end = start < toIndex ? toIndex : fromIndex;
      for (let index = 0; index < collection.length; index++) {
         var offset = index >= start && index <= end ? shift : 0;
         result[index] = collection[index + offset];
      }
      result[toIndex] = collection[fromIndex];
      return result;
   }

   handleSortEnd = async ({ oldIndex, newIndex }) => {
      let newData = this.move(this.state.items, oldIndex, newIndex);
      this.setState({ items: newData });
      let updatedData = newData.map((data, i) => {
         let c = this.props.DragParent.filter((val) => val.id == data.props.children.props.id)[0];
         return { id: c.id, order: i + 1 };
      });
      let stateData = [];
      updatedData.map((val, i) => {
         stateData[i] = this.props.DragParent.filter((data) => data.id == val.id)[0];
      });
      this.props.setDragParent(stateData);

      await PostMyLibrarySorted({ documents: updatedData })
         .then((data) => {})
         .catch((err) => {});
   };

   render() {
      return (
         <>
            <div>
               <table className="w-100">
                  <div className="position-sticky">
                     <div
                        className="text-grey6 text-bold text-small d-flex align-items-center"
                        style={{
                           transform: "translate(10px, 10px)",
                           width: "100%",
                           marginBlock: "0",
                        }}
                     >
                        <div style={{ width: "55%" }}>
                           <div
                              style={{
                                 ...tableHeaderStyle,
                                 borderTopLeftRadius: "8px",
                                 borderLeft: "1px solid #ced4da",
                              }}
                              className="p-4 font-title-lib-head"
                           >
                              Name
                              <img
                                 src={`/assets/images/newimages/${
                                    this.props.order ? "order-atoz.svg" : "order-ztoa.svg"
                                 }`}
                                 className="mb-2 ml-2 pointer arrow-sort"
                                 height="15px"
                                 width="15px"
                                 alt=""
                                 onClick={() => this.props.sortDocuments("name")}
                              />
                           </div>
                        </div>
                        <div style={{ width: "22%" }}>
                           <div className="font-title-lib-head pl-3" style={tableHeaderStyleEx}>
                              Owner
                           </div>
                        </div>
                        <div style={{ width: "15%" }}>
                           <div
                              className="pr-4 pt-4 pb-4  font-title-lib-head pl-0"
                              style={{
                                 ...tableHeaderStyle,
                                 paddingLeft: "1 !important",
                              }}
                           >
                              Last modified
                              <img
                                 src={`/assets/images/newimages/${
                                    this.props.dateOrder ? "order-atoz.svg" : "order-ztoa.svg"
                                 }`}
                                 className="mb-2 ml-2 pointer arrow-sort"
                                 height="15px"
                                 width="15px"
                                 alt=""
                                 onClick={() => this.props.sortDocuments("date")}
                              />
                           </div>
                        </div>
                        <div style={{ width: "7%" }}>
                           <div
                              className="p-4 font-title-lib-head pl-0"
                              style={{
                                 ...tableHeaderStyle,
                                 borderRight: "1px solid #ced4da",
                                 borderTopRightRadius: "8px",
                              }}
                           ></div>
                        </div>
                     </div>
                  </div>
                  {this.state.items === 0 ? (
                     <div>
                        <h3>No files</h3>
                     </div>
                  ) : (
                     <SortableList items={this.state.items} lockAxis="y" onSortEnd={this.handleSortEnd} useDragHandle />
                  )}
               </table>
            </div>
         </>
      );
   }
}

export default SortableComponent;
