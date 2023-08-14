import "./dashboard.css";
import Library from "../../dashBoardModule/component/widgets/library";
import React, { useEffect, useState } from "react";
import { GET_LIBRARY_MOST_VIEWED_DATA } from "../actions/dashboardAction";
import { fetchQuery } from "../../../../actions/index";
function LibraryCont(props) {
   const [librayMostViewed, setLibrayMostViewed] = useState([]);
   const [page, setPage] = useState(0);
   const [totalCount, setTotalCount] = useState(0);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchMostViewedContent();
   }, []);

   const fetchMostViewedContent = (callBack = () => {}) => {
      fetchQuery(
         GET_LIBRARY_MOST_VIEWED_DATA,
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
            callBack();
            let data = result?.data?.mostViewedContents?.contents || [];
            let totalCount = result?.data?.mostViewedContents?.totalCount || 0;
            setLibrayMostViewed([...librayMostViewed, ...data]);
            setTotalCount(totalCount);
            setPage(page + 1);
         }
      );
   };
   const hasMore = librayMostViewed.length < totalCount;
   return (
      <Library
         {...props}
         content={librayMostViewed}
         loading={loading}
         hasMore={hasMore}
         fetchMostViewedContent={fetchMostViewedContent}
         librayMostViewed={librayMostViewed}
         totalCount={totalCount}
      />
   );
}

export default LibraryCont;
