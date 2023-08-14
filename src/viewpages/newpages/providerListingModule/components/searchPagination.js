import React, { useState, useCallback, useEffect } from "react";
import backArrow from "../../../../images/providerListing/Back (1).svg";
import forwardArrow from "../../../../images/providerListing/Back.svg";
import disableArrow from "../../../../images/providerListing/disableFor.svg";
import { debounce } from "lodash";
function SearchPagination({
   cls = "",
   inputCls = "",
   offset = 0,
   limit = 10,
   setOffset = () => {},
   setSearch = () => {},
   data = [],
   totalCount = 0,
   tab = 0,
   showPagination = true,
}) {
   const [searchKey, setSearchKey] = useState("");
   const disableForward = offset + limit >= totalCount;
   const firstValue = totalCount === 0 ? offset : offset + 1;

   useEffect(() => {
      if (inputCls) setSearchKey("");
   }, [tab]);

   const deb = useCallback(
      debounce((text) => {
         setSearch(text);
         if (inputCls) scrollOnAction();
      }, 500),
      []
   );
   const scrollOnAction = () => {
      document.getElementById("scroll-parent") && document.getElementById("scroll-parent").scrollTo(0, 0);
   };
   return (
      <div className={` ${cls} search-list-cont`}>
         <input
            type="text"
            placeholder="Search"
            value={searchKey}
            className={`search-input-profile ${inputCls}`}
            onChange={(e) => {
               deb(e.target.value);
               setSearchKey(e.target.value);
               setOffset(0);
            }}
         />
         {showPagination && (
            <div className="pagination-list">
               <div style={{ marginTop: "3px" }}>
                  {firstValue}
                  {" - "}
                  {disableForward ? offset + Math.abs(offset - totalCount) : offset + data.length}
                  {" of "} {totalCount}
               </div>
               &nbsp;
               <img
                  style={{ marginTop: "2px" }}
                  className={`${offset > 0 && "pointer rotateimg180"} `}
                  onClick={() => {
                     if (offset > 0) {
                        setOffset(offset - limit);
                        scrollOnAction();
                     }
                  }}
                  src={offset > 0 ? backArrow : forwardArrow}
                  alt="back-arrow"
               />
               &nbsp;
               <img
                  className={` ${disableForward ? "" : "pointer"}  `}
                  onClick={() => {
                     if (!disableForward) {
                        setOffset(offset + limit);
                        scrollOnAction();
                     }
                  }}
                  src={disableForward ? disableArrow : backArrow}
                  alt="forward-arrow"
               />
            </div>
         )}
      </div>
   );
}
export default SearchPagination;
