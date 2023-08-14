import React from "react";
import { getMediaIconNew, getDateFormatFromTimeStamp } from "../../../../../helper/CommonFuncs";
import LoaderList from "../../../../../common/loaderList";
import InfiniteScroll from "../../../../../shared/components/infiniteScroll/infiniteScroll";
import EmptyStateComp from "../../../EmptyStateComp";
import caption from "../../../../../I18n/en.json";
import NoContent from "../../../../../images/empty-states/no-content.svg";

const RowContentmissed = ({ showRemind, data }) => {
   return (
      <div className="d-flex align-items-center justify-content-between each-card-patient-missed">
         <div className="d-flex align-items-center">
            <img src={getMediaIconNew(data.type)} alt="file-type" className="ml-2" />
            <div className="d-flex flex-column ml-4">
               <div className="title-api">{data.patient.name.fullName}</div>
               <div className="subtitle-api">{data.type}</div>
               <div className="child-title-api">{getDateFormatFromTimeStamp(data?.createdAt) || ""}</div>
            </div>
         </div>

         {showRemind && <div className="remind-div">Remind</div>}
      </div>
   );
};

export default function MissedPatientContent({ specs, title, missedContent, loading, hasMore, fetchMissedContent }) {
   const showResendInviteAll = specs.data.actions.some((some) => {
      return some.type === "send";
   });
   const showRemind = specs.data.actions.some((some) => {
      return some.type === "remind";
   });
   return (
      <div>
         <div className="d-flex align-items-center justify-content-between ">
            <div className="div-cards-title-api">{title}</div>
            {showResendInviteAll && <div className="send-all-dash">{"Remind all"}</div>}
         </div>
         <div className="main-div-cards-listing-missedContent">
            {loading ? (
               <LoaderList />
            ) : missedContent.length === 0 ? (
               <EmptyStateComp
                  src={NoContent}
                  headerText={caption.emptyState.noContent}
                  description={caption.emptyState.noIvites}
               />
            ) : (
               <InfiniteScroll showLoader={hasMore} callBack={fetchMissedContent}>
                  <div>
                     {missedContent.map((s, index) => (
                        <RowContentmissed key={index} data={s} showRemind={showRemind} />
                     ))}
                  </div>
               </InfiniteScroll>
            )}
         </div>
      </div>
   );
}
