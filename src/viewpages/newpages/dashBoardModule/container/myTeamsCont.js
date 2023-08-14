import React, { useState } from "react";
import "./dashboard.css";
import Teams from "../../dashBoardModule/component/widgets/teams";
import { useQuery } from "@apollo/client";
import { GET_MY_TEAMS } from "../actions/dashboardAction";
function TeamsCont(props) {
   const [teams, setTeams] = useState([]);
   const { loading } = useQuery(GET_MY_TEAMS, {
      fetchPolicy: "no-cache",
      variables: { offset: 0, limit: 10, myTeam: true },
      onCompleted(result) {
         let data = result?.getTeams || [];
         setTeams(data);
      },
   });
   return <Teams {...props} teams={teams} loading={loading} />;
}

export default TeamsCont;
