import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_PATIENT_CONTENT_SEENBY_LIST } from "../actions/profileQueries";
import SeenByView from "../components/SeenByView";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";

function SeenByViewCont(props) {
   const { patientId, contentId, closeSeenBy, isProvTab } = props;
   const [viewsArr, setViewsArr] = useState([]);
   const { loading } = useQuery(GET_PATIENT_CONTENT_SEENBY_LIST, {
      fetchPolicy: "no-cache",
      variables: {
         offset: 0,
         limit: 100,
         content: {
            id: contentId,
         },
         user: {
            id: patientId,
         },
         providerOnly: isProvTab ? true : false,
      },
      onCompleted(res) {
         let viewsList = res.getPatientContent?.contents[0]?.views || [];
         setViewsArr(viewsList);
      },
   });
   return (
      <ModalPopup onModalTapped={closeSeenBy}>
         <SeenByView list={viewsArr} isLoading={loading} {...props} onClose={closeSeenBy} />
      </ModalPopup>
   );
}

export default SeenByViewCont;
