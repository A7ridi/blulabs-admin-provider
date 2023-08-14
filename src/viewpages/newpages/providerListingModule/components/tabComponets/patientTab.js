import React from "react";
import TablePatient from "./tablePatient";

import SearchPagination from "../searchPagination";

function PatientTab({ setOffset, offset, limit, setSearch, search, loading, providerList, totalCount }) {
   return (
      <div className="w-100 h-100 ">
         <SearchPagination
            totalCount={totalCount}
            loading={loading}
            data={providerList}
            cls={"padding-search-field-content"}
            setOffset={setOffset}
            offset={offset}
            limit={limit}
            setSearch={setSearch}
            search={search}
         />
         <div id="scroll-parent" className="table-overflow-cont-provider">
            <TablePatient loading={loading} providerList={providerList} />
         </div>
      </div>
   );
}
export default PatientTab;
