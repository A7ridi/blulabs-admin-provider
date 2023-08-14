import React from "react";
import captions from "../../../../../I18n/en.json";
import { getMediaIconNew, calculateDateLabel } from "../../../../../helper/CommonFuncs";
import EmptyState from "../../../../../common/emptyState";
import CustomLoader from "../../../../../shared/components/loaderList/customLoader";

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
};

const tableHeaderStyleEx = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   paddingTop: 10,
};

const TableContent = ({ loading, providerList = [], openModal = () => {} }) => {
   if (providerList.length === 0 && !loading) {
      return <EmptyState text={"content"} />;
   }
   if (loading) return <CustomLoader />;
   return (
      <table className={`w-100 `}>
         <thead className="text-small">
            <tr>
               <th width="40%">
                  <div
                     className="pl-4"
                     style={{
                        ...tableHeaderStyle,
                        borderTopLeftRadius: "8px",
                        borderLeft: "1px solid #ced4da",
                     }}
                  >
                     {captions.providerListing.name}
                  </div>
               </th>
               <th width="30%">
                  <div style={tableHeaderStyleEx}> {captions.providerListing.patient}</div>
               </th>
               <th width="30%">
                  <div
                     style={{
                        ...tableHeaderStyle,
                        borderRight: "1px solid #ced4da",
                        borderTopRightRadius: "8px",
                     }}
                  >
                     {captions.providerListing.Added_On}
                  </div>
               </th>
            </tr>
         </thead>
         <tbody>
            {providerList.map((obj, i) => {
               const name = obj.title;
               return (
                  <tr
                     onClick={() => {
                        openModal(obj);
                     }}
                     key={i}
                     className={`hover-default pointer ${!loading && "table-border-provider-listing"}`}
                  >
                     <td className="p-4 pl-4 name-list">
                        <div className="d-flex align-items-center">
                           <img src={getMediaIconNew(obj.type)} alt="media=icon" className="icon-images-media" />
                           <div title={name}>
                              {name.substring(0, 20)} {name.length > 20 && "..."}
                           </div>
                        </div>
                     </td>
                     <td className="p-0 sub-head-list">{obj?.patient?.name?.fullName || ""}</td>
                     <td className="p-0 sub-head-list">{calculateDateLabel(obj.createdAt)}</td>
                  </tr>
               );
            })}
         </tbody>
      </table>
   );
};

export default TableContent;
