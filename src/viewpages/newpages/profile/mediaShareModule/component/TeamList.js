import React from "react";
import LoaderWithText from "./LoaderWithText";
import MyAndAllTeams from "./MyAndAllTeams";

const TeamList = (props) => {
   const { loading, myTeams, allTeams, teamMails, setTeamMails } = props;

   const newAllTeams = allTeams.filter((filter) => {
      return !filter.isMyTeam;
   });

   return (
      <div className="list flex-grow-1 share-modal-tabs overflow-y all-providers-list overflow-auto scrollbar-share">
         {loading ? (
            <LoaderWithText text="My Teams" className="overflow-loader careteam-skeleton-loader" />
         ) : (
            <>
               {myTeams.length !== 0 && (
                  <MyAndAllTeams
                     loading={loading}
                     teamsList={myTeams}
                     teamMails={teamMails}
                     text="My Teams"
                     setTeamMails={setTeamMails}
                  />
               )}
            </>
         )}

         {loading ? (
            <LoaderWithText text="All Teams" className="overflow-loader careteam-skeleton-loader" />
         ) : (
            <MyAndAllTeams
               loading={loading}
               teamMails={teamMails}
               teamsList={newAllTeams}
               myTeams={myTeams}
               text="All Teams"
               setTeamMails={setTeamMails}
            />
         )}
      </div>
   );
};

export default TeamList;
