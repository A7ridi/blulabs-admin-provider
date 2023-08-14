import React, { useState } from "react";
import TableContent from "./tableContent";
import SearchPagination from "../searchPagination";
import ModalPopup from "../../../../../components/newcomponents/ModalPopup";
import Post from "../../../profile/content-section/postNew";
import { fetchMutation } from "../../../../../actions";
import { UPDATE_ITEM_VIEWED_STATUS } from "../../../profileModule/actions/profileQueries";

function ContentTab({
   loading,
   setOffset,
   offset,
   limit,
   setSearch,
   search,
   providerList,
   totalCount,
   refetch,
   loggedInUserId,
}) {
   const [post, postData] = useState(null);
   const openModal = (obj) => {
      fetchMutation(
         UPDATE_ITEM_VIEWED_STATUS,
         {
            options: {
               eventName: "itemViewed",
               itemId: obj.id,
            },
         },
         (response) => {}
      );
      postData(obj);
   };
   const showModal = post !== null;
   return (
      <div className="w-100 h-100 ">
         <SearchPagination
            totalCount={totalCount}
            data={providerList}
            cls={"padding-search-field-content"}
            setOffset={setOffset}
            offset={offset}
            limit={limit}
            setSearch={setSearch}
            search={search}
         />
         <div id="scroll-parent" className="table-overflow-cont-provider">
            <TableContent openModal={openModal} loading={loading} providerList={providerList} />
         </div>

         {showModal && (
            <ModalPopup
               id="emrConnect-info-modal"
               onModalTapped={() => {
                  postData(null);
               }}
            >
               <Post
                  loggedInUserId={loggedInUserId}
                  refetch={refetch}
                  className={"grid-view-post  p-0 bg-white  w-75 h-85 round-border-5xl"}
                  isPreview={true}
                  postData={post}
                  onModalTapped={() => {
                     postData(null);
                  }}
               />
            </ModalPopup>
         )}
      </div>
   );
}
export default ContentTab;
