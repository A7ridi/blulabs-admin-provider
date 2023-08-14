import React from "react";
import { getMediaIconNew, calculateDateLabel } from "../../../../../helper/CommonFuncs";
import LoaderList from "../../../../../common/loaderList";
import InfiniteScroll from "../../../../../shared/components/infiniteScroll/infiniteScroll";
import noContent from "../../../../../images/empty-states/no-content.svg";
import EmptyStateComp from "../../../EmptyStateComp";
import caption from "../../../../../I18n/en.json";
const RowLibrary = ({ data }) => {
   return (
      <div className="d-flex align-items-center justify-content-between each-card-patient-missed">
         <div className="d-flex align-items-center">
            <img src={getMediaIconNew(data.type)} alt="file-type" className="ml-2" />
            <div className="d-flex flex-column ml-4">
               <div className="title-api">{data.title}</div>
               <div className="child-title-api">{calculateDateLabel(data.createdAt)}</div>
            </div>
         </div>
      </div>
   );
};

export default function Library({ content, title, loading, librayMostViewed, hasMore, fetchMostViewedContent }) {
   return (
      <div>
         <div className="d-flex align-items-center justify-content-between ">
            <div className="div-cards-title-api">{title}</div>
         </div>
         <div className="main-div-cards-listing-missedContent">
            {loading ? (
               <LoaderList />
            ) : content.length === 0 ? (
               <EmptyStateComp
                  src={noContent}
                  headerText={caption.emptyState.yourLib}
                  description={caption.emptyState.yourLib}
                  btnText={caption.emptyState.addContents}
               />
            ) : (
               <InfiniteScroll showLoader={hasMore} callBack={fetchMostViewedContent}>
                  <div>
                     {librayMostViewed.map((s, index) => (
                        <RowLibrary key={index} data={s} />
                     ))}
                  </div>
               </InfiniteScroll>
            )}
         </div>
      </div>
   );
}
