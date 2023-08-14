import React from "react";
import { Switch, Route, withRouter } from "react-router-dom";
import "../../profile/Profile.css";
import TeamList from "./TeamList";
import "react-toastify/dist/ReactToastify.css";
import "../team.css";
import EmptyStateComp from "../../EmptyStateComp";
import * as i18n from "../../../../I18n/en.json";
import NoTeams from "../../../../images/empty-states/no-teams.svg";
import { checkProviderData } from "../../../../actions";
import { checkUserRole } from "../action/teamAction";
import TeamDetailsCont from "../container/teamDetailsCont";

function Team(props) {
   const {
      selectedIndex,
      setSelectedIndex,
      teamsList,
      getTeamListData,
      setSelectedTeam,
      createClinicalTeam,
      showCreateTeam,
      setShowCreateTeam,
      searchTeam,
      searchKey,
      setSearchKey,
      setUpdateClinicalType,
   } = props;

   let teamsData = [];
   let loading = true;
   let teamDataLength = [];
   if (selectedIndex === 0) {
      teamsData = teamsList?.myTeams?.list;
      loading = teamsList?.myTeams?.loading;
      teamDataLength = teamsList?.myTeams?.list?.length;
   } else {
      teamsData = teamsList?.allTeams?.list;
      loading = teamsList?.allTeams?.loading;
      teamDataLength = teamsList?.allTeams?.list?.length;
   }

   const noTeamSelected = i18n?.emptyState?.noTeamSelected;
   const createTeamBtn = i18n?.emptyState?.createTeamBtn;

   const checkProviderDataCallback = () => {
      setShowCreateTeam(true);
   };
   const checkMemberRole = checkUserRole();

   return (
      <div id="profile" className="d-flex w-100 h-100">
         <section className="list-section flex-shrink-0  h-100 overflow-hidden margin-profile-top ">
            <TeamList
               selectedIndex={selectedIndex}
               setSelectedIndex={setSelectedIndex}
               teamsData={teamsData}
               teamsList={teamsList}
               loading={loading}
               searchTeam={searchTeam}
               getTeamListData={getTeamListData}
               selectedTeam={teamsList?.selectedTeam}
               teamDataLength={teamDataLength}
               createClinicalTeam={createClinicalTeam}
               showCreateTeam={showCreateTeam}
               checkProviderData={() => checkProviderData(checkProviderDataCallback)}
               setShowCreateTeam={setShowCreateTeam}
               setSearchKey={setSearchKey}
               searchKey={searchKey}
               onTeamTap={(obj) => {
                  props.history.push(`/team/${obj.id}`);
                  setSelectedTeam(obj);
               }}
               {...props}
            />
         </section>

         <Switch>
            <Route exact path="/team/:id">
               <section className="pl-4 pr-3 py-4 profile-section flex-grow-1">
                  <TeamDetailsCont
                     selectedIndex={selectedIndex}
                     setUpdateClinicalType={setUpdateClinicalType}
                     {...props}
                  />
               </section>
            </Route>
            <Route exact path="/team">
               <section className="flex-center w-100 h-100">
                  <div className="text-bold text-large text-grey5">
                     {teamDataLength === 0 ? (
                        <div className="clinical-team">
                           <EmptyStateComp
                              teamSection
                              src={NoTeams}
                              headerText={noTeamSelected}
                              btnText={!loading && createTeamBtn}
                              onClick={() => checkProviderData(checkProviderDataCallback)}
                              disabled={!checkMemberRole}
                              checkMemberRole={checkMemberRole}
                              btnClassName={`${checkMemberRole ? "pointer tooltipTeam" : "cursor-events tooltipTeam"}`}
                           />
                        </div>
                     ) : (
                        teamsList?.selectedTeam === null && (
                           <EmptyStateComp teamSection src={NoTeams} headerText={noTeamSelected} />
                        )
                     )}
                  </div>
               </section>
            </Route>
         </Switch>
      </div>
   );
}

export default withRouter(Team);
