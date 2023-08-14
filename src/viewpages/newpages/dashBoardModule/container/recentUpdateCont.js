import "./dashboard.css";
import React, { useEffect, useState } from "react";
import { GET_RECENT_UPDATES_CONTENT } from "../actions/dashboardAction";
import RecentUpdated from "../../dashBoardModule/component/recentUpdates";
import { fetchQuery } from "../../../../actions/index";
function RecentUpdateCont(props) {
   const [recentUpdates, setRecentUpdates] = useState([]);
   const [page, setPage] = useState(0);
   const [totalCount, setTotalCount] = useState(0);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchRecentUpdates();
   }, []);

   const fetchRecentUpdates = () => {
      fetchQuery(
         GET_RECENT_UPDATES_CONTENT,
         {
            paginationOptions: {
               page: page,
               pageSize: 10,
            },
         },
         (result) => {
            if (loading) {
               setLoading(false);
            }
            let data = result?.data?.recentUpdates || [];
            let totalCount = 0;
            setRecentUpdates([...recentUpdates, ...data]);
            setTotalCount(totalCount);
            setPage(page + 1);
         }
      );
   };
   const hasMore = recentUpdates.length < totalCount;
   return (
      <RecentUpdated
         {...props}
         content={recentUpdates}
         loading={loading}
         hasMore={hasMore}
         fetchRecentUpdates={fetchRecentUpdates}
         recentUpdates={recentUpdates}
         totalCount={totalCount}
      />
   );
}

export default RecentUpdateCont;
