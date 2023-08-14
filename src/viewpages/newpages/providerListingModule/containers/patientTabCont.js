import React, { useState } from "react";
import "./providerListing.css";
import PatientTab from "../components/tabComponets/patientTab";
import { GET_PROVIDERS_PATIENT } from "./providerQueries";
import { useQuery } from "@apollo/client";

function ProvidersPatientsListingContainer(props) {
   const { showModal } = props;
   const userId = showModal?.id;
   const [providersPatientsList, setProviderPatientsList] = useState([]);
   const [offset, setOffset] = useState(0);
   const [limit, setLimit] = useState(10);
   const [search, setSearch] = useState("");
   const [totalCount, setTotalCount] = useState(0);

   const { loading } = useQuery(GET_PROVIDERS_PATIENT, {
      fetchPolicy: "no-cache",
      variables: {
         userId,
         offset: offset,
         limit: limit,
         searchTerm: search,
      },
      onCompleted(result) {
         const data = result?.getPatients;
         const list = data?.users || [];
         const totValue = data?.totalCount || 0;
         setProviderPatientsList(list);
         setTotalCount(totValue);
      },
   });
   return (
      <PatientTab
         {...props}
         totalCount={totalCount}
         search={search}
         setSearch={setSearch}
         providerList={providersPatientsList}
         loading={loading}
         setOffset={setOffset}
         offset={offset}
         limit={limit}
      />
   );
}

export default ProvidersPatientsListingContainer;
