import React, { useEffect, useState } from "react";
import "./dashboard.css";
import MissedPatientContent from "../../dashBoardModule/component/widgets/patientMissedContent";
import { GET_MISSED_CONTENT } from "../actions/dashboardAction";
import { fetchQuery } from "../../../../actions/index";

function PatientMissedContent(props) {
   const [missedContent, setMissedContent] = useState([]);
   const [page, setPage] = useState(0);
   const [totalCount, setTotalCount] = useState(0);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchMissedContent();
   }, []);

   const fetchMissedContent = (callBack = () => {}) => {
      fetchQuery(
         GET_MISSED_CONTENT,
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
            let data = result?.data?.patientsMissedContents?.contents || [];
            let totalCount = result?.data?.patientsMissedContents?.totalCount || 0;
            setMissedContent([...missedContent, ...data]);
            setTotalCount(totalCount);
            setPage(page + 1);
         }
      );
   };
   const hasMore = missedContent.length < totalCount;
   return (
      <MissedPatientContent
         {...props}
         hasMore={hasMore}
         fetchMissedContent={fetchMissedContent}
         missedContent={missedContent}
         loading={loading}
         setPage={setPage}
         totalCount={totalCount}
      />
   );
}

export default PatientMissedContent;
