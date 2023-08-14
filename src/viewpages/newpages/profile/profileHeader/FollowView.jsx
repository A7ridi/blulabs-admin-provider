import React, { memo } from "react";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import selectedStar from "../../../../images/search-icons/selectedStar.svg";
import unSelectedStar from "../../../../images/search-icons/unselectedStar.svg";

function FollowView(props) {
   const {
      options,
      loading,
      confirmFollowDialog,
      addToCareTeam,
      onCancel,
      buttonId = "",
      selected,
      setSelected,
      isFollow = false,
      showFollowModal,
      setShowFollowModal,
      getCareTeamOption,
      followUnfollowPatient,
      removeFromCareTeam,
      followLoading,
      profile = false,
      patientDetails = false,
      setFollowLoading,
      confirmBtnLoading,
   } = props;

   return (
      <>
         {profile && (
            <div
               onClick={(e) => {
                  e.stopPropagation();
                  if (isFollow) {
                     setFollowLoading(true);
                     followUnfollowPatient();
                  } else {
                     getCareTeamOption();
                  }
               }}
               style={{ paddingLeft: 5, minWidth: "22px" }}
            >
               <img
                  title={isFollow ? "Remove yourself from Care Team" : "Add yourself to Care Team"}
                  className={`action-icon loader-search-page pointer`}
                  src={followLoading ? "../assets/gif/newgifs/spinner.gif" : isFollow ? selectedStar : unSelectedStar}
                  alt="start"
               />
            </div>
         )}
         {patientDetails && (
            <button
               id={pendoIds.btnFollowUnfollowPatient}
               disabled={followLoading}
               className={`px-3 py-2 ${followLoading ? "loader" : ""} follow-button-profile `}
               onClick={() => {
                  if (isFollow) {
                     setFollowLoading(true);
                     followUnfollowPatient();
                  } else {
                     getCareTeamOption();
                  }
               }}
            >
               <img
                  src={followLoading ? "/assets/gif/newgifs/spinner.gif" : isFollow ? selectedStar : unSelectedStar}
                  alt="star"
                  className="star-icon-profile"
               />

               {isFollow ? "Unfollow" : "Follow"}
            </button>
         )}
         {showFollowModal ? (
            <ModalPopup id={pendoIds.btnUpdateFollowStatusModal} onModalTapped={() => setShowFollowModal(false)}>
               <div className="follow-div bg-white round-border-s flex-center flex-column justify-content-start">
                  <div className="follow-header flex-center justify-content-end w-100 my-4">
                     <div className="text-large text-black font-weight-bold w-100 text-center">Follow</div>
                     <button className="close-button-follow-view" onClick={onCancel}>
                        &times;
                     </button>
                  </div>
                  <div className="text-medium text-black mb-5 text-center">
                     How long do you wish to receive notifications for this patient?
                  </div>
                  <div className="follow-options"></div>
                  <ul>
                     {loading &&
                        Array(6)
                           .fill()
                           .map((o, index) => (
                              <li
                                 key={index}
                                 className={`loading-shade bg-disabled round-border-m mb-4 text-small flex-center justify-content-start`}
                              >
                                 {""}
                              </li>
                           ))}
                     {options.map((o, index) => (
                        <li
                           key={index}
                           onClick={(e) => {
                              e.stopPropagation();
                              setSelected(o);
                           }}
                           className={`pointer ${
                              loading ? "loading-shade" : ""
                           } bg-disabled round-border-m mb-4 text-small flex-center justify-content-start`}
                        >
                           <div>
                              {" "}
                              <img
                                 className="mx-4"
                                 src={
                                    selected?.title === o?.title
                                       ? "/assets/images/newimages/radio-selected.svg"
                                       : "/assets/images/newimages/radio-unselected.svg"
                                 }
                                 alt=""
                              />{" "}
                              {o?.title || "AAAA"}
                           </div>
                        </li>
                     ))}
                  </ul>
                  <div className="w-100 m-5 flex-center footer h-xsmall">
                     {confirmBtnLoading ? (
                        <img width="40px" height="40px" src="/assets/gif/newgifs/loader.gif" alt="" />
                     ) : (
                        <>
                           <button
                              onClick={onCancel}
                              className="w-xsmall h-100 bg-disabled text-black font-weight-bold text-small round-border-s flex-center mx-3"
                           >
                              Cancel
                           </button>
                           <button
                              id={buttonId}
                              disabled={selected === null}
                              onClick={confirmFollowDialog}
                              className="w-xsmall h-100 btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3"
                           >
                              Confirm
                           </button>
                        </>
                     )}
                  </div>
               </div>
            </ModalPopup>
         ) : null}
      </>
   );
}

export default memo(FollowView);
