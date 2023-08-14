import React from "react";
import { useQuery } from "@apollo/client";
import { GET_SINGLE_CONTENT } from "../actions/contentViewerActions";
import { useState } from "react";
import ContentViewerPopup from "../../profile/content-section/contentViewer/contentViewerPopup";
import { connect } from "react-redux";
function ContentViewerCont({ contentId, patientId, loggedInProviderDetails, user }) {
   const providerId = loggedInProviderDetails.id;
   const [singlePost, setSinglePost] = useState(null);
   const { loading, refetch } = useQuery(GET_SINGLE_CONTENT, {
      fetchPolicy: "no-cache",
      variables: {
         content: {
            id: contentId,
         },
         offset: 0,
         limit: 10,
         providerOnly: false,
         user: {
            id: patientId,
         },
      },
      onCompleted(result) {
         let data = result?.getPatientContent?.contents || [];
         setSinglePost(data.length > 0 ? data[0] : null);
      },
   });

   return (
      <div className={` ${loading && "loading-shade-custom"} bg-white grid-view-post p-0  w-75 h-85 round-border-5xl`}>
         {singlePost && (
            <ContentViewerPopup
               refetch={refetch}
               patientId={patientId}
               isLoading={loading}
               postData={singlePost}
               providerId={providerId}
               isPreview={false}
               user={user}
            />
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      loggedInProviderDetails: state.auth.loggedInProviderDetails,
      user: state.auth.userCredentials?.user,
   };
};

export default connect(mapStateToProps, null)(ContentViewerCont);
