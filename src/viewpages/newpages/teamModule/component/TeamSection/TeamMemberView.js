import React, { useState } from "react";
import "../../team.css";
import TeamTable from "./TeamTable";
import { ReactComponent as EditIconSvg } from "../../../../../images/edit-icon.svg";
import "../../../profileModule/container/profileSection.css";
import ModalPopup from "../../../../../components/newcomponents/ModalPopup";
import "../../../profile/profileHeader/ProfileHeader.css";
import CreateTeamView from "../CreateTeamView";
import { pendoIds } from "../../../../../Constants/pendoComponentIds/pendoConstants";
import { AddProviderView } from "../../../profile/addToCareTeam";
import { connect } from "react-redux";
import EmptyStateComp from "../../../EmptyStateComp";
import * as i18n from "../../../../../I18n/en.json";
import NoTeams from "../../../../../images/empty-states/no-teams.svg";
import { withRouter } from "react-router-dom";
import LoaderCardAndTable from "../../../../../common/LoaderCardAndTable";
import { checkAttendingMember, checkMemberRole, checkUserRole } from "../../action/teamAction";
import BtnDisableTooltip from "../BtnDisableTooltip";

const TeamMemberView = (props) => {
   const {
      enterPriseDetails,
      eachTeamData,
      loading,
      selectedIndex,
      teamName,
      setTeamName,
      removeTeamMember,
      teamDescription,
      setTeamDescription,
      updateClinicalTeam,
      deleteClinicalTeam,
      addMemberToClinicalTeam,
      selectedTeam,
      searchTeam,
      searchKey,
      updateClinicalType,
      setUpdateClinicalType,
   } = props;
   const [showCreateTeam, setShowCreateTeam] = useState(false);
   const [updateTeam, setUpdateTeam] = useState(false);
   const [showProvider, setShowProvider] = useState(false);

   const noTeamMembers = i18n?.emptyState?.noTeamMembers;

   const addMemberToTeam = (data) => {
      const members = data?.members || [];
      const teamRole = data?.teamRole || "";
      let emails = members?.map((s) => {
         return s?.contactInformation?.email || s?.data?.contactInformation?.email;
      });
      let obj = {
         variables: {
            team: {
               id: selectedTeam?.id,
               members: emails?.map((email) => {
                  return {
                     contactInformation: {
                        email: email,
                     },
                     role: teamRole?.value || "member",
                  };
               }),
            },
            updateMember: true,
         },
      };
      addMemberToClinicalTeam(obj);
      setShowProvider(false);
   };

   const toggleCreateTeamModal = () => setShowCreateTeam(!showCreateTeam);
   const toggleProviderModal = () => setShowProvider(!showProvider);
   const checkRole = checkUserRole() || checkMemberRole(eachTeamData);

   const permissionTxt = i18n?.clinicalTeam.permissionText;

   return (
      <div className={`p-4 w-100`}>
         <div
            className={`ml-0 row w-100 flex-center align-items-center justify-content-between ${
               loading ? "loading-shade" : ""
            }`}
            style={{ marginBottom: "27px" }}
         >
            <div className="flex-column">
               <div className="text-truncate team-name">
                  {eachTeamData?.name}

                  <div
                     id={pendoIds.btnEditClinicalTeam}
                     onClick={() => {
                        const teamType = eachTeamData?.clinicalType;
                        const isInPatient =
                           teamType !== null &&
                           (teamType.toLowerCase() === "inpatients" || teamType.toLowerCase() === "inpatient");
                        const teamAfterFormatting = isInPatient ? "inPatients" : "outPatients";
                        const clinicalTypeLabel = {
                           label: teamType === null ? "Select type" : isInPatient ? "Inpatients" : "Outpatients",
                           value: teamAfterFormatting,
                        };
                        setTeamName(eachTeamData?.name);
                        setTeamDescription(eachTeamData?.description);
                        toggleCreateTeamModal();
                        setUpdateTeam(true);
                        setUpdateClinicalType(teamType === null ? null : clinicalTypeLabel);
                     }}
                  >
                     <EditIconSvg className="edit-icon-team" />
                  </div>

                  {showCreateTeam && (
                     <ModalPopup
                        id={updateTeam ? pendoIds.btnUpdateClinicalTeamModal : pendoIds.btnCreateClinicalTeamModal}
                        onModalTapped={toggleCreateTeamModal}
                     >
                        <CreateTeamView
                           buttonId={
                              updateTeam ? pendoIds.btnUpdateClinicalTeamModal : pendoIds.btnCreateClinicalTeamModal
                           }
                           renameTeam
                           updateClinicalType={updateClinicalType}
                           setUpdateClinicalType={setUpdateClinicalType}
                           permissionTxt={permissionTxt}
                           selectedIndex={selectedIndex}
                           onTeamNameChange={(val) => setTeamName(val)}
                           onTeamDescription={(val) => setTeamDescription(val)}
                           teamName={teamName}
                           teamDescription={teamDescription}
                           eachTeam={eachTeamData}
                           updateClinicalTeam={updateClinicalTeam}
                           deleteClinicalTeam={deleteClinicalTeam}
                           onClose={toggleCreateTeamModal}
                        />
                     </ModalPopup>
                  )}
               </div>

               <div className="info-team-description">{eachTeamData?.description}</div>
            </div>

            <div className="flex-center align-items-start responsive-second ">
               <button
                  id={pendoIds.btnAddMemberToClinicalTeam}
                  className={`add-member-button ${checkRole ? "pointer" : "cursor-events tooltipTeam"}`}
                  disabled={!checkRole}
                  onClick={toggleProviderModal}
               >
                  Add Member
                  <BtnDisableTooltip checkMemberRole={checkRole} />
               </button>
            </div>
         </div>

         {showProvider && (
            <ModalPopup id={pendoIds.btnAddProviderToCareTeamModal} onModalTapped={toggleProviderModal}>
               <AddProviderView
                  teamSection
                  teamMemberRole
                  buttonId={pendoIds.btnAddProviderToCareTeamModal}
                  closeTapped={toggleProviderModal}
                  enterpriseId={enterPriseDetails?.id}
                  teamName={eachTeamData?.name}
                  sendTapped={(data) => addMemberToTeam(data)}
                  placeholder2={"Select Role"}
                  checkAttendingMember={() => checkAttendingMember(selectedTeam)}
               />
            </ModalPopup>
         )}

         {eachTeamData?.members?.length === 0 ? (
            <>
               <hr />
               <div className="no-members-text">
                  <EmptyStateComp teamSection src={NoTeams} headerText={noTeamMembers} />
               </div>
            </>
         ) : loading ? (
            <LoaderCardAndTable view={0} />
         ) : (
            <TeamTable
               eachTeam={eachTeamData}
               selectedIndex={selectedIndex}
               loading={loading}
               searchTeam={searchTeam}
               searchKey={searchKey}
               removeTeamMember={removeTeamMember}
               {...props}
            />
         )}
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      selectedTeam: state.teamList?.selectedTeam,
   };
};

export default withRouter(connect(mapStateToProps, null)(TeamMemberView));
