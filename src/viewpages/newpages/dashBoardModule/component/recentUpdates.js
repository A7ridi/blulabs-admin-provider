import React, { useState } from "react";
import SinglePost from "../../profile/content-section/singlePost";
import { connect } from "react-redux";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import LoaderDashBoard from "./widgets/loaderDashboard";
import arrow from "../../../../images/dashboard-action-icons/arrow.svg";
import EmptyStateCompRecent from "./widgets/emptyStateRecentUpdates";

function RecentUpdated({ title, recentUpdates = [], accessToken, actions = [], loading, fetchRecentUpdates }) {
   const [selectedPost, setSelectedPost] = useState(null);
   const close = () => {
      setSelectedPost(null);
   };
   const showContent = recentUpdates.length > 0;
   return (
      <>
         <div className="main-title-dashboard">{title}</div>
         {showContent && (
            <div className="absolute-arrow-right">
               <img src={arrow} alt="arroww-icon" className="img-arrow-recent" onClick={fetchRecentUpdates} />
            </div>
         )}
         <div className={`${showContent || loading ? "d-flex div-cards-scroll-recent" : "h-100"}`}>
            {loading ? (
               <LoaderDashBoard />
            ) : recentUpdates.length === 0 ? (
               <EmptyStateCompRecent />
            ) : (
               recentUpdates.map((s, i) => (
                  <div
                     key={s?.id || i}
                     className={`mb-3 px-2   ${i !== 0 && "ml-4"}`}
                     style={{ maxHeight: "275px", maxWidth: "400px", width: "400px", borderRadius: "30px" }}
                  >
                     <SinglePost
                        actions={actions}
                        accessToken={accessToken}
                        isPreview={false}
                        postData={s}
                        key={s.id}
                        onClickPost={(data) => {
                           setSelectedPost(data);
                        }}
                        isLoading={false}
                        optionTapped={(_, obj) => {}}
                        onTextClick={(key) => {}}
                        onPreview={() => {}}
                     />
                  </div>
               ))
            )}
         </div>

         {selectedPost !== null && (
            <ModalPopup onModalTapped={close}>
               <div className={`mb-3 px-2 flex-center  `} style={{ borderRadius: "30px" }}>
                  <SinglePost
                     modal={true}
                     actions={actions}
                     accessToken={accessToken}
                     isPreview={true}
                     postData={selectedPost}
                     key={selectedPost.id}
                     isLoading={false}
                     optionTapped={(_, obj) => {}}
                     onTextClick={(key) => {}}
                     onPreview={() => {}}
                  />
               </div>
            </ModalPopup>
         )}
      </>
   );
}
const mapStateToProps = (state) => {
   return {
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
   };
};

export default connect(mapStateToProps)(RecentUpdated);
