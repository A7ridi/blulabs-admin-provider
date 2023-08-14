import React, { Fragment } from "react";
import NoTeamText from "../../../../../I18n/en.json";
import NoTeams from "../../../../../images/empty-states/no-teams.svg";
import CheckBox from "../../../../../shared/components/CheckBox";
import EmptyStateComp from "../../../EmptyStateComp";
import GroupImage from "../../../teamModule/component/GroupImage";
import TeamDetailsView from "../../../teamModule/component/TeamDetailsView";
import { getMailsArr } from "../action/shareAction";

const MyAndAllTeams = ({ teamsList, teamMails = [], text = "", myTeams = [], setTeamMails = () => {} }) => {
   const teamDataLength = teamsList?.length;
   const noTeam = NoTeamText?.emptyState?.noTeam;
   return (
      <Fragment>
         {teamDataLength === 0 && myTeams.length === 0 ? (
            <EmptyStateComp teamSection src={NoTeams} headerText={noTeam} />
         ) : (
            <div className="share-modal-tabs">
               {teamsList.map((obj, i) => {
                  const name = obj?.name || "Member";
                  const emails = obj?.members?.map((mail) => {
                     return mail.contactInformation.email;
                  });
                  const teamId = obj?.id || "";
                  let isChecked = teamMails.includes(teamId);
                  return (
                     <>
                        {i === 0 && <h3 className="providers-text">{text}</h3>}
                        <CheckBox
                           i={teamId}
                           checked={isChecked}
                           value={teamId}
                           selected={isChecked}
                           onClick={() => {
                              getMailsArr(teamMails, teamId, (data) => setTeamMails(data));
                           }}
                           clsName="overflow-share-modal form-check d-flex align-items-center checkbox-warning-filled hover-default"
                        >
                           <div className="team-name-initials d-flex pointer">
                              <div className="team-selected">
                                 <GroupImage members={obj?.members} index={i} />
                              </div>
                              <TeamDetailsView
                                 sharedContent
                                 className="pt-3 pb-3 pr-3"
                                 name={name.length > 20 ? name.slice(0, 22) : name}
                                 colorCode={obj.members?.map((member) => member.colorCode)}
                                 initials={obj.members?.map((initial) => initial.name.initials)}
                              />
                           </div>
                        </CheckBox>
                     </>
                  );
               })}
            </div>
         )}
      </Fragment>
   );
};

export default MyAndAllTeams;
