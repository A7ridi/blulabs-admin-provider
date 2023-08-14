import React, { useState } from "react";
import Caption from "../../../../I18n/en.json";
import TableProviderListing from "./tableProviderList";
import SearchPagination from "./searchPagination";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import ProviderDetailsModal from "./providerDetailsModal";

function ProviderListing({ providerList, loading, setOffset, offset, limit, setSearch, search, totalCount }) {
   const [showModal, setShowModal] = useState(null);

   const showProviderModal = showModal !== null;
   const closeModal = () => {
      setShowModal(null);
   };
   return (
      <div className="w-100 h-100 table-scroll">
         <div className="provider-list-head">{Caption.providerListing.list}</div>
         <SearchPagination
            totalCount={totalCount}
            cls="padding-search-field"
            data={providerList}
            setOffset={setOffset}
            offset={offset}
            limit={limit}
            setSearch={setSearch}
            search={search}
         />
         <div className="table-container">
            <TableProviderListing providerList={providerList} setShowModal={setShowModal} loading={loading} />
         </div>
         {showProviderModal && (
            <ModalPopup onModalTapped={closeModal} className="overflow-scroll p-5 " id="emrConnect-info-modal">
               <ProviderDetailsModal closeModal={closeModal} showModal={showModal} />
            </ModalPopup>
         )}
      </div>
   );
}
export default ProviderListing;
