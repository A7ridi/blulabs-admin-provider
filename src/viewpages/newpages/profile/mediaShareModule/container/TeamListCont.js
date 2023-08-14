import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { withRouter } from "react-router-dom";
import { fetchQuery } from "../../../../../actions";
import { ShowAlert } from "../../../../../common/alert";
import { errorToDisplay } from "../../../../../helper/CommonFuncs";
import { SEARCH_TEAM } from "../../../teamModule/action/teamAction";
import TeamList from "../component/TeamList";

const TeamListCont = (props) => {
   const { teamsList, search, sharedMails, setTeamMails, teamMails, allTeams, setAllTeams } = props;
   const [loading, setLoading] = useState(true);
   const [myTeams, setMyTeams] = useState([]);

   useEffect(() => {
      getTeamListData(true);
      getTeamListData(false);
   }, [search]);

   const getTeamListData = (myTeam) => {
      const payload = {
         search,
         myTeam,
         teamWithMembers: true,
      };
      setLoading(true);
      fetchQuery(
         SEARCH_TEAM,
         payload,
         (data) => {
            const result = data?.data?.getTeams;
            const response = result?.map((eachTeam) => {
               return eachTeam;
            });
            setLoading(false);
            if (myTeam) setMyTeams(response);
            else setAllTeams(response);
         },
         (err) => {
            let errMsg = errorToDisplay(err);
            ShowAlert(errMsg, "error");
            setLoading(false);
         }
      );
   };
   return (
      <TeamList
         loading={loading}
         myTeams={myTeams}
         allTeams={allTeams}
         teamsList={teamsList}
         sharedMails={sharedMails}
         setTeamMails={setTeamMails}
         teamMails={teamMails}
      />
   );
};

export default withRouter(TeamListCont);
