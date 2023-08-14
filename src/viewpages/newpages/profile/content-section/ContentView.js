import React, { memo, useCallback } from "react";
import PostOptions from "./PostOptions";
import { getMediaIconNew, calculateDateLabel } from "../../../../helper/CommonFuncs";
import EmptyStateComp from "../../EmptyStateComp";
import * as i18n from "../../../../I18n/en.json";

import NoContent from "../../../../images/empty-states/no-content.svg";

import referral from "../../../../images/media-icons/media-icon-referral.svg";

const tableHeaderStyle = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   paddingLeft: 10,
   fontSize: "14px",
};

const tableHeaderStyleEx = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
};

export const TableView = memo(
   ({ posts = [], isLoading, onclick, optTapped, setPatientContent, sendContent, onCreateContent, searchTerm }) => {
      const noContent = i18n.emptyState.noContent;
      const noContentDesc = i18n.emptyState.noContentDesc;
      const addContentBtn = i18n.emptyState.addContent;
      const getIconSrc = useCallback(
         (indx) => {
            if (posts[indx]?.type === "referral") {
               return referral;
            } else {
               return getMediaIconNew(posts[indx]?.type);
            }
         },
         [posts]
      );

      if (isLoading)
         return (
            <table className={`w-100 bg-white h-100`}>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((o, index) => (
                        <tr key={index} className="loading-shade">
                           <td>
                              <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         );
      else if (posts.length === 0)
         return (
            <div className="w-100 h-100">
               <EmptyStateComp
                  src={NoContent}
                  patientContent={true}
                  headerText={noContent}
                  description={noContentDesc}
                  btnText={!posts?.length > 0 && searchTerm.length > 0 ? false : addContentBtn}
                  className="margin-viewd-screen"
                  onClick={onCreateContent}
               />
            </div>
         );
      else
         return (
            <table
               className="w-100"
               //  style={{ maxWidth: "98.1%", marginLeft: "11px" }}
            >
               <thead className="text-small">
                  <tr>
                     <th width="25%">
                        <div
                           className="table-head-custom"
                           style={{
                              ...tableHeaderStyle,
                              borderTopLeftRadius: "8px",
                              borderLeft: "1px solid #ced4da",
                              paddingLeft: 15,
                           }}
                        >
                           Name
                        </div>
                     </th>
                     <th width="20%">
                        <div className="table-head-custom" style={{ ...tableHeaderStyleEx }}>
                           Updated by
                        </div>
                     </th>
                     <th width="20%">
                        <div className="table-head-custom" style={{ ...tableHeaderStyleEx }}>
                           Added On
                        </div>
                     </th>
                     <th width="10%">
                        <div className="table-head-custom" style={tableHeaderStyleEx}>
                           Reactions
                        </div>
                     </th>
                     <th width="7%">
                        <div className="table-head-custom" style={tableHeaderStyleEx}>
                           Views
                        </div>
                     </th>
                     <th width="7%">
                        <div
                           className="table-head-custom"
                           style={{
                              ...tableHeaderStyleEx,
                              borderRight: "1px solid #ced4da",
                              borderTopRightRadius: "8px",
                              justifyContent: "center",
                              paddingLeft: "5px",
                           }}
                        >
                           More
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {posts.map((o, i) => {
                     let count = o?.loves?.length || "-";
                     return (
                        <>
                           <tr key={o?.id || i} className={`hover-default ${isLoading ? " loading-shade" : ""}`}>
                              <td onClick={() => onclick(o, i)} className="p-0 pointer">
                                 <div
                                    className="flex-center h-100 justify-content-start ml-4"
                                    style={{ padding: "8px 0" }}
                                 >
                                    <img
                                       alt=""
                                       className={` ${posts[i]?.type === "referral" ? "mr-2" : "mr-3"}`}
                                       src={getIconSrc(i)}
                                       style={{
                                          maxWidth: "30px",
                                          maxHeight: "30px",
                                          minHeight: "30px",
                                          minWidth: "30px",
                                       }}
                                    />
                                    {o?.title.length > 29 ? (
                                       <>
                                          {/* className="text-truncate table-title-custom" */}
                                          <div className="tooltipExtra">
                                             {o?.title.substring(0, 26) + "..."}
                                             <span className="tooltipText"> {o?.title.substring(0, 46) + "..."}</span>
                                          </div>
                                       </>
                                    ) : (
                                       <div
                                          title={o?.title.substring(0, 46)}
                                          className="text-truncate table-title-custom"
                                       >
                                          {o?.title}
                                       </div>
                                    )}
                                 </div>
                              </td>
                              <td onClick={() => onclick(o, i)} className="text-truncate pointer table-title-custom">
                                 {o?.provider?.name?.fullName}
                              </td>

                              <td onClick={() => onclick(o, i)} className="pointer">
                                 <div>
                                    <div
                                       title={calculateDateLabel(o?.createdAt)}
                                       className="text-truncate table-title-custom"
                                    >
                                       {calculateDateLabel(o?.createdAt)}
                                    </div>
                                 </div>
                              </td>
                              <td onClick={() => onclick(o, i)} className="pointer table-title-custom">
                                 {count}
                              </td>
                              <td onClick={() => onclick(o, i)} className="pointer table-title-custom ">
                                 {o?.views && o?.views.length > 0 ? o?.views.length : "-"}
                              </td>
                              <td className="p-4 text-center flex-center">
                                 <PostOptions
                                    data={o}
                                    optionTapped={(_, obj) =>
                                       optTapped && optTapped(obj, i, posts, setPatientContent, sendContent)
                                    }
                                 />
                              </td>
                           </tr>
                        </>
                     );
                  })}
               </tbody>
            </table>
         );
   }
);

function ContentView(props) {
   const { onclick, isPreview, posts, isLoading, optTapped, viewType, Card, getListContent, searchTerm } = props;

   return (
      <div
         style={{
            maxWidth: "98.1%",
            marginLeft: "11px",
            display: viewType === 0 ? "contents" : "flex",
            flexWrap: viewType === 0 ? "" : "wrap",
         }}
      >
         {viewType === 0 ? (
            <TableView
               searchTerm={searchTerm}
               isPreview={isPreview}
               onclick={onclick}
               posts={posts}
               isLoading={isLoading}
               optTapped={optTapped}
            />
         ) : getListContent?.list && getListContent?.list?.length > 0 ? (
            getListContent.list.map((o, i) => (
               <div
                  key={o?.id || i}
                  className="grid-view-col col-lg-4 col-md-6 col-sm-12 p-0 mb-3 px-2 "
                  style={{ maxHeight: "325px" }}
               >
                  {Card &&
                     Card(
                        { data: o, index: i, id: o?.id || i },
                        "grid-view-post  round-border-xl border-light-grey",
                        false
                     )}
               </div>
            ))
         ) : (
            <div className="flex-center w-100 h-100 text-bold text-large text-grey5 no-content-available my-extra">
               No content available.
            </div>
         )}
      </div>
   );
}

export default ContentView;
