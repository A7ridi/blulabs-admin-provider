import { useEffect } from "react";
import { fetchQuery } from "../../../../actions";
import { GET_PATIENT_CONTENT } from "../actions/profileQueries";

const PollComponent = (props) => {
   const { patientId, isProvTab, callBack = () => {}, setRefectchRecentlyAdded, totalCount } = props;
   var counting = 0;
   useEffect(() => {
      startPolling(counting);
   }, []);
   var startPolling = (count) => {
      fetchQuery(
         GET_PATIENT_CONTENT,
         {
            limit: 10,
            offset: 0,
            user_id: patientId,
            patientOnly: isProvTab ? false : true,
            providerOnly: isProvTab,
            search: "",
         },
         (res) => {
            const data = res?.data?.getPatientContent.contents.map((s) => s) || [];
            const totalCountNew = res?.data?.getPatientContent?.totalCount || 0;
            if (totalCount !== totalCountNew || count === 15) {
               callBack(data, totalCountNew);
               setRefectchRecentlyAdded(null);
            } else {
               setTimeout(() => {
                  let newCount = count + 1;
                  startPolling(newCount);
               }, 5000);
            }
         }
      );
   };

   return null;
};
export default PollComponent;
