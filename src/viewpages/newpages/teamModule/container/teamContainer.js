import React, { useEffect, useState } from "react";
import Team from "../component/Team";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setTeamsList, setSelectedTeam, resetTeamList } from "../../../../redux/actions/teamList.action";
import { fetchQuery } from "../../../../actions";
import {
   ADD_MEMBER_TO_TEAM,
   CREATE_NEW_TEAM,
   DELETE_TEAM,
   GET_SELECTED_TEAM,
   GET_TEAMLIST_DATA,
   REMOVE_MEMBER,
   SEARCH_TEAM,
   teamListUpdateOnAction,
   updateTeamDetails,
   UPDATE_TEAM,
} from "../action/teamAction";
import { ShowAlert } from "../../../../common/alert";
import { useMutation } from "@apollo/client";
import { errorToDisplay } from "../../../../helper/CommonFuncs";
import useDebounce from "../../../../shared/components/customHooks/useDebounce";

const TeamContainer = (props) => {
   const {
      setTeamsList,
      teamsList,
      setSelectedTeam,
      enterPriseDetails,
      clinicalTeamName,
      clinicalTeamDescription,
      userCredentials,
      resetTeamList,
   } = props;
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [showCreateTeam, setShowCreateTeam] = useState(false);
   const [teamName, setTeamName] = useState("");
   const [teamDescription, setTeamDescription] = useState("");
   const [searchKey, setSearchKey] = useState("");

   const teamType = teamsList?.selectedTeam?.clinicalType;
   const clinicalTypeLabel = {
      label: teamType === null ? "Select type" : teamType === "inpatients" ? "Inpatients" : "Outpatients",
      value: teamType,
   };
   const [updateClinicalType, setUpdateClinicalType] = useState(clinicalTypeLabel);

   const myTeams = selectedIndex === 0 ? true : false;
   const allTeamList = teamsList?.allTeams?.list;
   const myTeamList = teamsList?.myTeams?.list;
   const currentTeam = teamsList?.selectedTeam;

   useEffect(() => {
      getTeamListData(1);
      return () => resetTeamList();
   }, []);

   const getTeamListData = (selectedId, initialList = false) => {
      const myTeams = selectedId === 0 ? true : false;
      if (!initialList) {
         setTeamsList(
            {
               list: [],
               loading: true,
            },
            myTeams
         );
      }
      const obj = {
         myTeam: myTeams,
      };
      fetchQuery(GET_TEAMLIST_DATA, obj, (data) => {
         const response = data?.data?.getTeams?.map((eachTeam) => {
            return eachTeam;
         });
         const teamsList = {
            list: response,
            loading: false,
         };
         setTeamsList(teamsList, myTeams);
      });
   };

   const [createClinicalTeam] = useMutation(CREATE_NEW_TEAM, {
      variables: {
         team: {
            name: clinicalTeamName,
            description: clinicalTeamDescription,
         },
         addTeam: true,
      },
      onCompleted(result) {
         let newlyCreatedTeam = result?.team?.team;
         props.history.push(`/team/${newlyCreatedTeam?.id}`);
         if (!myTeams) {
            const newTeamList = {
               list: [newlyCreatedTeam, ...teamsList?.allTeams?.list],
               loading: false,
            };
            setTeamsList(newTeamList, myTeams);
         }
         setSelectedTeam(newlyCreatedTeam);
         setShowCreateTeam(false);
         ShowAlert(result?.team?.status?.message, "success");
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });

   const [updateClinicalTeam] = useMutation(UPDATE_TEAM, {
      variables: {
         team: {
            name: teamName,
            description: teamDescription,
            id: currentTeam?.id,
            clinicalType: updateClinicalType?.value,
         },
         updateTeam: true,
      },
      onCompleted(result) {
         const selectedTeam = result?.team?.team;
         const selectedTeamObj = {
            ...selectedTeam,
            members: currentTeam?.members,
            clinicalType: updateClinicalType?.value,
         };
         updateTeamDetails(allTeamList, myTeamList, selectedTeamObj, selectedIndex, myTeams);
         setSelectedTeam(selectedTeamObj);
         ShowAlert(result?.team?.status?.message, "success");
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });

   const [deleteClinicalTeam] = useMutation(DELETE_TEAM, {
      variables: {
         team: {
            id: currentTeam?.id,
         },
         removeTeam: true,
      },
      onCompleted(result) {
         const findAllTeam = allTeamList?.filter((team) => team.id !== currentTeam?.id);
         const findMyTeam = myTeamList?.filter((team) => team.id !== currentTeam?.id);
         const teamList = myTeams ? findMyTeam : findAllTeam;
         const newTeamList = {
            list: teamList,
            loading: false,
         };
         setTeamsList(newTeamList, myTeams);
         setSelectedTeam(null);
         ShowAlert(result?.team?.status?.message, "success");
         props.history.push("/team");
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });

   const [addMemberToClinicalTeam] = useMutation(ADD_MEMBER_TO_TEAM, {
      onCompleted(result) {
         let selectedTeam = result?.team?.team;
         teamListUpdateOnAction(userCredentials, selectedTeam, allTeamList, myTeamList, myTeams);
         setSelectedTeam(selectedTeam);
         ShowAlert(result?.team?.status?.message, `${selectedTeam === null ? "error" : "success"}`);
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });

   const [removeTeamMember] = useMutation(REMOVE_MEMBER, {
      onCompleted(result) {
         let selectedTeam = result?.team?.team;
         teamListUpdateOnAction(userCredentials, selectedTeam, allTeamList, myTeamList, myTeams);
         setSelectedTeam(selectedTeam);
         ShowAlert(result?.team?.status?.message, `${selectedTeam === null ? "error" : "success"}`);
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });

   const debounceSearch = useDebounce(searchKey, 500);

   useEffect(() => {
      searchTeam(debounceSearch, selectedIndex, teamsList);
   }, [debounceSearch]);

   const searchTeam = (debounceSearch, selectedTabId, filterTeam) => {
      const myTeams = selectedTabId === 0 ? true : false;
      let initialPayload = {
         list: [],
         loading: true,
      };
      setTeamsList(initialPayload, myTeams);
      const searchPayload = {
         search: debounceSearch,
         myTeam: myTeams,
         hospitalId: filterTeam?.hospitalId?.value,
         departmentId: filterTeam?.departmentId?.value,
      };
      fetchQuery(GET_TEAMLIST_DATA, searchPayload, (data) => {
         const response = data?.data?.getTeams?.map((eachTeam) => {
            return eachTeam;
         });
         const teamsList = {
            list: response,
            loading: false,
         };
         setTeamsList(teamsList, myTeams);
      });
   };

   return (
      <Team
         {...props}
         selectedIndex={selectedIndex}
         getTeamListData={getTeamListData}
         teamsList={teamsList}
         createClinicalTeam={createClinicalTeam}
         setSelectedIndex={setSelectedIndex}
         enterPriseDetails={enterPriseDetails}
         showCreateTeam={showCreateTeam}
         setShowCreateTeam={setShowCreateTeam}
         teamName={teamName}
         searchTeam={searchTeam}
         searchKey={searchKey}
         setSearchKey={setSearchKey}
         setTeamName={setTeamName}
         updateClinicalType={updateClinicalType}
         setUpdateClinicalType={setUpdateClinicalType}
         removeTeamMember={removeTeamMember}
         teamDescription={teamDescription}
         setTeamDescription={setTeamDescription}
         updateClinicalTeam={updateClinicalTeam}
         deleteClinicalTeam={deleteClinicalTeam}
         addMemberToClinicalTeam={addMemberToClinicalTeam}
      />
   );
};

const mapStateToProps = (state) => {
   return {
      teamsList: state.teamList,
      clinicalTeamName: state?.teamList?.teamName,
      clinicalTeamDescription: state?.teamList?.teamDescription,
      enterPriseDetails: state.dashboardStates?.enterPriseDetails,
      userCredentials: state.auth?.userCredentials,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setTeamsList: setTeamsList,
         setSelectedTeam: setSelectedTeam,
         resetTeamList: resetTeamList,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TeamContainer));
