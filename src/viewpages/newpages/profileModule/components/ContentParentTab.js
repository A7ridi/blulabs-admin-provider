import React, { useState, useEffect } from "react";
import LoaderCardAndTable from "../../../../common/LoaderCardAndTable";
import EveryoneTabGql from "./everyoneTabGql";
import { withRouter } from "react-router-dom";
import "firebase/firestore";

function ContentParentTab(props) {
   const { refectchRecentlyAdded, setRefectchRecentlyAdded, view } = props;
   const [loading, setLoading] = useState(true);
   const [patientId, setPatientId] = useState(props.match.params.id);

   useEffect(() => {
      if (props.match.params.id === null) return;
      let profileSectionDiv = document.getElementById("main-profile-section");
      if (profileSectionDiv) profileSectionDiv.scrollTop = 0;
      setPatientId(props.match.params.id);
      setLoading(true);
   }, [props.match.params.id]);

   useEffect(() => {
      if (loading) {
         setLoading(false);
      }
   }, [patientId]);

   return (
      <div>
         {loading ? (
            <LoaderCardAndTable view={view} />
         ) : (
            <EveryoneTabGql
               refectchRecentlyAdded={refectchRecentlyAdded}
               setRefectchRecentlyAdded={setRefectchRecentlyAdded}
               {...props}
            />
         )}
      </div>
   );
}

export default withRouter(ContentParentTab);
