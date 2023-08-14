import React from "react";
import { GET_PROVIDER_LISTING } from "../../../providerListingModule/containers/providerQueries";
import { useQuery } from "@apollo/client";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ProviderList from "../component/ProviderList";

const ProviderListCont = (props) => {
   const {
      search,
      userCredentials,
      offset,
      limit,
      setProviderList,
      providerList,
      setTotalCount,
      setSharedMails,
      sharedMails,
   } = props;
   const user = userCredentials?.user;
   const enterpriseId = user?.enterpriseId;

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
      <div className="all-providers-list overflow-auto scrollbar-share" id="scroll-parent">
         <ProviderList
            providerList={providerList}
            loading={loading}
            sharedMails={sharedMails}
            setSharedMails={setSharedMails}
         />
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth?.userCredentials,
   };
};

export default withRouter(connect(mapStateToProps, null)(ProviderListCont));
