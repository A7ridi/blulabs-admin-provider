import React, { memo, useState } from "react";
import TeamDetailsView from "./TeamDetailsView";
import SegmentView from "../../../../components/newcomponents/SegmentView/SegmentView";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import CreateTeamView from "./CreateTeamView";
import "../team.css";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import EmptyStateComp from "../../EmptyStateComp";
import * as i18n from "../../../../I18n/en.json";
import NoTeams from "../../../../images/empty-states/no-teams.svg";
import FilterOff from "../../../../images/team/filterOff.svg";
import FilteredOn from "../../../../images/team/filterRed.svg";
import GroupImage from "./GroupImage";
import FilterModal from "./FilterModal";
import { bindActionCreators } from "redux";
import { setDepartmentId, setHospitalId } from "../../../../redux/actions/teamList.action";
import { connect } from "react-redux";
import { checkUserRole, segmentOptions } from "../action/teamAction";
import BtnDisableTooltip from "./BtnDisableTooltip";

function TeamList(props) {
   const {
      onTeamTap,
      selectedIndex,
      setSelectedIndex,
      teamsData,
      loading,
      teamDataLength,
      getTeamListData,
      selectedTeam,
      createClinicalTeam,
      showCreateTeam,
      setShowCreateTeam,
      searchTeam,
      checkProviderData,
      enterPriseDetails,
      searchKey,
      setSearchKey,
      setHospitalName,
      setDepartmentName,
   } = props;
   const noTeam = i18n?.emptyState?.noTeam;

   const [showFilter, setShowFilter] = useState(false);
   const [filteredOn, setFilteredOn] = useState(false);

   const toggleFilter = () => setShowFilter(!showFilter);
   const checkMemberRole = checkUserRole();

   return (
      <div className="h-100 d-flex flex-column ">
         <div className="segment-filter">
            <SegmentView
               teamProfile
               className="text-small m-3 team-segment"
               teamClass="p-1 unselected-color"
               teamClassName="round-border-m"
               name="profile-list-radio"
               selectedIndex={selectedIndex}
               options={segmentOptions}
               onSelect={(opt, index) => {
                  searchTeam("", index, null);
                  setSelectedIndex(index);
                  setSearchKey("");
                  setFilteredOn(false);
                  setHospitalName(null);
                  setDepartmentName(null);
               }}
            />

            <div className="team-filter">
               <img src={FilterOff} alt="clinical-team-filter" onClick={toggleFilter} />
               <div className="filter-red">
                  {filteredOn && <img src={FilteredOn} alt="clinical-team-filter" className="filtered-on" />}
               </div>
            </div>
         </div>

         {showFilter && (
            <FilterModal
               closeModal={toggleFilter}
               searchTeam={searchTeam}
               selectedIndex={selectedIndex}
               enterpriseId={enterPriseDetails?.id}
               setFilteredOn={setFilteredOn}
               getTeamListData={getTeamListData}
               searchKey={searchKey}
            />
         )}

         <div className="search-input-team">
            <input
               type="text"
               placeholder="Search"
               className="search-input-share"
               onChange={(e) => setSearchKey(e.target.value)}
               value={searchKey}
            />
         </div>

         <div style={{ height: "100vh" }} className="list flex-grow-1">
            {loading ? (
               Array(10)
                  .fill()
                  .map((o, index) => <div key={index} className="loading-shade-list demo-view" />)
            ) : teamDataLength === 0 ? (
               <div style={{ marginTop: "15rem" }}>
                  <EmptyStateComp teamSection src={NoTeams} headerText={noTeam} className="margin-viewd-screen" />
               </div>
            ) : (
               teamsData?.map((obj, i) => {
                  return (
                     <div
                        className={`${obj.id === selectedTeam?.id ? "bg-selected-new" : "bg-unselected-new"} `}
                        key={i}
                        onClick={() => onTeamTap && onTeamTap(obj)}
                     >
                        <div className="team-name-initials d-flex hover-default pointer" style={{ paddingLeft: "0" }}>
                           <TeamDetailsView
                              profile
                              className="pt-3 pb-3 pr-3 ml-0"
                              name={obj?.name}
                              colorCode={obj.members?.map((member) => member.colorCode)}
                              initials={obj.members?.map((initial) => initial.name.initials)}
                           />
                        </div>
                     </div>
                  );
               })
            )}
         </div>

         <div className="invite-div w-100 flex-center flex-shrink-0">
            <button
               id={pendoIds.btnCreateClinicalTeam}
               onClick={() => checkProviderData()}
               className={`btn-default text-small h-small round-border-s ${
                  checkMemberRole ? "pointer" : "cursor-events tooltipTeam"
               }`}
               disabled={!checkMemberRole}
            >
               Create
               <BtnDisableTooltip checkMemberRole={checkMemberRole} className="tooltiptext2" />
            </button>
         </div>

         {showCreateTeam ? (
            <ModalPopup id={pendoIds.btnCreateClinicalTeamModal} onModalTapped={() => setShowCreateTeam(false)}>
               <CreateTeamView
                  buttonId={pendoIds.btnCreateClinicalTeamModal}
                  getTeamListData={getTeamListData}
                  selectedIndex={selectedIndex}
                  selectedTeam={selectedTeam}
                  createClinicalTeam={createClinicalTeam}
                  onClose={() => setShowCreateTeam(false)}
                  enterpriseId={enterPriseDetails?.id}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setHospitalName: setHospitalId,
         setDepartmentName: setDepartmentId,
      },
      dispatch
   );
};

export default memo(connect(null, mapDispatchToProps)(TeamList));
