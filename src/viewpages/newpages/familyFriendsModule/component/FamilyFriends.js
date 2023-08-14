import React, { useState } from "react";
import { removeFriendsFamilySection, famFriendsDataLoad } from "../action/famFriendsAction";
import { FamilyFriendsTable } from "./FamilyFriendsTable";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { AddFriendView } from "../../profile/addToCareTeam";
import ContentAndCareTeamSearch from "../../profileModule/components/ContentAndCareTeamSearch";
import * as i18n from "../../../../I18n/en.json";

const FamilyFriends = (props) => {
   const {
      loading,
      loadFamilyFriendsData,
      user,
      AddToFriendsFamily,
      showFamFrindsModal,
      setShowFamFriendsModal,
      loadSubmission,
      setLoadSubmission,
      removeFamilyMember,
      setSelectedPatient,
   } = props;
   const [searchKey, setSearchKey] = useState("");
   const [selected, setSelected] = useState(null);
   return (
      <>
         {loading ? (
            <>
               <ContentAndCareTeamSearch
                  showSearch
                  showbutton
                  familyFriends
                  btnText={i18n?.emptyState?.addMembersBtn}
                  searchKey={searchKey}
                  onClickBtn={() => setShowFamFriendsModal(true)}
                  setSearchKey={setSearchKey}
                  famPendoId={pendoIds.btnFamilyFriendAddMember}
                  pendoId={pendoIds.btnInputSearchFamilyFriends}
               />

               <table className={`w-100 bg-white h-100`}>
                  <tbody>
                     {Array(10)
                        .fill()
                        .map((o, index) => (
                           <tr key={index} className="loading-shade">
                              <td>
                                 <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            </>
         ) : (
            <>
               {loadFamilyFriendsData.length !== 0 && (
                  <ContentAndCareTeamSearch
                     showSearch
                     showbutton
                     familyFriends
                     btnText={i18n?.emptyState?.addMembersBtn}
                     searchKey={searchKey}
                     onClickBtn={() => setShowFamFriendsModal(true)}
                     setSearchKey={setSearchKey}
                     famPendoId={pendoIds.btnFamilyFriendAddMember}
                     pendoId={pendoIds.btnInputSearchFamilyFriends}
                  />
               )}
               <FamilyFriendsTable
                  isLoading={loading}
                  posts={famFriendsDataLoad(loadFamilyFriendsData, searchKey)}
                  removeTapped={(obj) =>
                     removeFriendsFamilySection(obj.careMember, user, removeFamilyMember, setSelectedPatient)
                  }
                  edit={(param) => {
                     setShowFamFriendsModal(true);
                     setSelected(param);
                  }}
                  setShowFamFriendsModal={setShowFamFriendsModal}
               />

               {showFamFrindsModal && (
                  <ModalPopup
                     id={pendoIds.btnInviteFamilyFriendsToCareTeamModal}
                     onModalTapped={() => {
                        setShowFamFriendsModal(false);
                        setSelected(null);
                     }}
                  >
                     <AddFriendView
                        selectedpatient={selected}
                        buttonId={pendoIds.btnInviteFamilyFriendsToCareTeamModal}
                        onCancel={() => {
                           setShowFamFriendsModal(false);
                           setSelected(null);
                        }}
                        loading={loadSubmission}
                        onConfirm={(data) => {
                           setLoadSubmission(true);
                           AddToFriendsFamily(data.email, data.mobileNo, data.name, data.relation);
                           setSelected(null);
                        }}
                     />
                  </ModalPopup>
               )}
            </>
         )}
      </>
   );
};

export default FamilyFriends;
