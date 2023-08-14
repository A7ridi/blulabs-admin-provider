import React, { memo, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import { AddProviderView } from "../../profile/addToCareTeam";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { CareTeamTable } from "./CareTeamTable";
import { getCareTeamList, showRemovePopup } from "../action/careTeamAction";
import ProviderInfo from "./ProviderInfo";
import FollowModalCont from "../../profileModule/container/followModalCont";
import * as i18n from "../../../../I18n/en.json";
import ContentAndCareTeamSearch from "../../profileModule/components/ContentAndCareTeamSearch";

function CareTeam(props) {
   const { user, careTeam, loading, patientId, removeCareMember, setCareMember, refetch } = props;
   const [searchKey, setSearchKey] = useState("");
   const [state, setstate] = useState({
      followView: {
         show: false,
         opts: Array(6).fill(),
         selectedOpt: null,
         isloading: true,
         selectedProv: null,
         loadSubmission: false,
      },
      careTeamView: {
         show: false,
         providerInfo: null,
      },
   });
   const [showCareteam, setShowCareteam] = useState(false);

   const setInnerState = (key, vals) => {
      setstate({
         ...state,
         [key]: { ...state[key], ...vals },
      });
   };

   const ctProvInfo = state.careTeamView.providerInfo;
   return (
      <>
         {loading ? (
            <>
               <ContentAndCareTeamSearch
                  showSearch
                  showbutton
                  btnText={i18n?.emptyState?.addMembersBtn}
                  setSearchKey={setSearchKey}
                  searchKey={searchKey}
                  careTeam
                  onClickBtn={() => setShowCareteam(true)}
                  addBtnPendoId={pendoIds.btnCareTeamAddMember}
                  pendoId={pendoIds.btnInputSearchCareTeam}
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
               {careTeam?.length !== 0 && (
                  <ContentAndCareTeamSearch
                     showSearch
                     showbutton
                     btnText={i18n?.emptyState?.addMembersBtn}
                     setSearchKey={setSearchKey}
                     searchKey={searchKey}
                     careTeam
                     onClickBtn={() => setShowCareteam(true)}
                     addBtnPendoId={pendoIds.btnCareTeamAddMember}
                     pendoId={pendoIds.btnInputSearchCareTeam}
                  />
               )}
               <CareTeamTable
                  showProviderDetails={(val) => {
                     setInnerState("careTeamView", {
                        show: false,
                        providerInfo: val,
                     });
                  }}
                  setShowCareteam={setShowCareteam}
                  state={state}
                  isLoading={loading}
                  posts={getCareTeamList(careTeam, searchKey)}
                  removeTapped={(obj) => {
                     setCareMember(obj);
                     showRemovePopup(obj.careMember, user, removeCareMember);
                  }}
               />

               {state.followView.show && (
                  <FollowModalCont
                     refetch={refetch}
                     careMemberEmail={state.followView.selectedProv?.data?.contactInformation.email || ""}
                     userId={patientId}
                     careTeam={true}
                     closeModal={() => {
                        setInnerState("followView", {
                           selectedProv: null,
                           show: false,
                        });
                     }}
                  />
               )}

               {state.careTeamView?.providerInfo ? (
                  <ModalPopup onModalTapped={() => setInnerState("careTeamView", { show: false, providerInfo: null })}>
                     <ProviderInfo
                        ctProvInfo={ctProvInfo}
                        onRemove={() => {
                           setCareMember(ctProvInfo);
                           showRemovePopup(ctProvInfo.careMember, user, removeCareMember);
                           setInnerState("careTeamView", {
                              show: false,
                              providerInfo: null,
                           });
                        }}
                        onCancel={() =>
                           setInnerState("careTeamView", {
                              show: false,
                              providerInfo: null,
                           })
                        }
                     />
                  </ModalPopup>
               ) : null}

               {showCareteam ? (
                  <ModalPopup id={pendoIds.btnAddProviderToCareTeamModal} onModalTapped={() => setShowCareteam(false)}>
                     <AddProviderView
                        buttonId={pendoIds.btnAddProviderToCareTeamModal}
                        closeTapped={() => setShowCareteam(false)}
                        enterpriseId={user.enterpriseId}
                        sendTapped={(prov) => {
                           setInnerState("followView", {
                              selectedProv: prov,
                              show: true,
                           });
                           setShowCareteam(false);
                        }}
                     />
                  </ModalPopup>
               ) : null}
            </>
         )}
      </>
   );
}
export default memo(CareTeam);
