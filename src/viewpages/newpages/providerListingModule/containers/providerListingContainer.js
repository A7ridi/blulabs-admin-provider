import React, { useState } from "react";
import "./providerListing.css";
import ProviderListing from "../components/providerListingComp";
import { GET_PROVIDER_LISTING } from "./providerQueries";
import { useQuery } from "@apollo/client";
import { connect } from "react-redux";

function ProviderListingContainer(props) {
   const { userCredentials } = props;
   const enterpriseId = userCredentials?.user?.enterpriseId || "";
   const [providerList, setProviderList] = useState([]);
   const [offset, setOffset] = useState(0);
   const [limit, setLimit] = useState(10);
   const [search, setSearch] = useState("");
   const [totalCount, setTotalCount] = useState(0);

   const { loading } = useQuery(GET_PROVIDER_LISTING, {
      fetchPolicy: "no-cache",
      variables: {
         offset,
         limit,
         searchData: {
            search,
            userType: "provider",
            enterpriseId,
         },
      },
      onCompleted(result) {
         const data = result?.searchAllUsers;
         const list = data?.users || [];
         const totValue = data?.totalCount || 0;
         setProviderList(list);
         setTotalCount(totValue);
      },
   });
   return (
      <ProviderListing
         {...props}
         totalCount={totalCount}
         search={search}
         setSearch={setSearch}
         providerList={providerList}
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

export default connect(mapStateToProps, null)(ProviderListingContainer);
