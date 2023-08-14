import React from "react";
import caption from "../../../../../I18n/en.json";
import recentEmpty from "../../../../../images/empty-states/no-recent.svg";

const EmptyStateCompRecent = () => {
   return (
      <div className="h-100">
         <div className={`  div-empty-main-recent`}>
            <img src={recentEmpty} alt="dsg" className="pb-3" />

            <div className="sub-head-empty-recent">{caption.emptyState.recentUpdates}</div>
            <div className="sub-head-empty-recent">{caption.emptyState.newCards}</div>
            <div className="start-over">{caption.emptyState.startOver}</div>
         </div>
      </div>
   );
};

export default EmptyStateCompRecent;
