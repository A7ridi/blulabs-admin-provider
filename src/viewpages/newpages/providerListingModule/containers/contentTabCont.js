import React, { useState } from "react";
import "./providerListing.css";
import ContentTab from "../components/tabComponets/contentTab";
import { GET_PROVIDERS_CONTENT } from "./providerQueries";
import { useQuery } from "@apollo/client";
import { connect } from "react-redux";

function ProviderContentListingContainer(props) {
   const { showModal, userCredentials } = props;
   const userId = showModal?.id;
   const loggedInUserId = userCredentials?.user?.id || "";
   const [providerContentList, setProviderContentList] = useState([]);

   const [offset, setOffset] = useState(0);
   const [limit, setLimit] = useState(10);
   const [search, setSearch] = useState("");

   const [totalCount, setTotalCount] = useState(0);

   const { loading, refetch } = useQuery(GET_PROVIDERS_CONTENT, {
      fetchPolicy: "no-cache",
      variables: {
         user: {
            id: userId,
         },
         offset,
         limit,
         search,
         createdByUser: true,
         contentFilter: null,
         content: null,
         providerOnly: true,
         patientOnly: true,
      },
      onCompleted(result) {
         const data = result?.getPatientContent;
         const list = data?.contents || [];
         const totValue = data?.totalCount || 0;
         setProviderContentList(list);
         setTotalCount(totValue);
      },
   });
   return (
      <ContentTab
         {...props}
         loggedInUserId={loggedInUserId}
         refetch={refetch}
         totalCount={totalCount}
         search={search}
         setSearch={setSearch}
         providerList={providerContentList}
         loading={loading}
         setOffset={setOffset}
         offset={offset}
         limit={limit}
      />
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth?.userCredentials,
   };
};

export default connect(mapStateToProps, null)(ProviderContentListingContainer);
