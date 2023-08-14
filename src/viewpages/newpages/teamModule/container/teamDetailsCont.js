import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";
import { fetchQuery } from "../../../../actions";
import { ShowAlert } from "../../../../common/alert";
import { errorToDisplay } from "../../../../helper/CommonFuncs";
import { setSelectedTeam } from "../../../../redux/actions/teamList.action";
import { GET_SELECTED_TEAM } from "../action/teamAction";
import TeamMemberView from "../component/TeamSection/TeamMemberView";

const TeamDetailsCont = (props) => {
   const { selectedIndex, teamsList, setSelectedTeam, match, history } = props;

   const teamIdx = match.params.id;
   const [selectedTeamLoading, setSelectedTeamLoading] = useState(true);

   const myTeams = selectedIndex === 0 ? true : false;

   useEffect(() => {
      getSelectedTeamData(teamIdx);
   }, [teamIdx]);

   const getSelectedTeamData = (teamId) => {
      const obj = {
         myTeam: myTeams,
         teamId,
      };
      setSelectedTeamLoading(true);
      fetchQuery(
         GET_SELECTED_TEAM,
         obj,
         (data) => {
            const response =
               data?.data?.getTeams?.map((eachTeam) => {
                  return eachTeam;
               }) || [];
            setSelectedTeamLoading(false);
            if (response.length > 0) {
               setSelectedTeam(response[0]);
            }
         },
         (error) => {
            setSelectedTeamLoading(false);
            const errMsg = errorToDisplay(error);
            ShowAlert(errMsg, "error");
            history.push("/team");
         }
      );
   };

   return <TeamMemberView loading={selectedTeamLoading} eachTeamData={teamsList?.selectedTeam} {...props} />;
};
const mapStateToProps = (state) => {
   return {
      teamsList: state.teamList,
      enterPriseDetails: state.dashboardStates?.enterPriseDetails,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setSelectedTeam: setSelectedTeam,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamDetailsCont));
