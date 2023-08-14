import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getSelectedPatientProfile } from "../../../../actions/userQueries";
import { ShowAlert } from "../../../../common/alert";
import { setCareteamList } from "../../../../redux/actions/careteam.action";
import { ADD_TO_CARETEAM } from "../../profileModule/actions/profileActions";
import { errorToDisplay, fetchCareList } from "../action/careTeamAction";
import CareTeam from "../component/CareTeam";

const CareTeamCont = (props) => {
   const { patientId, user, setCareteamList, careteamList } = props;
   const [careMember, setCareMember] = useState([]);
   const [loading, setLoading] = useState(true);

   const careTeamPayload = {
      user: {
         id: patientId,
      },
      type: {
         isActive: true,
         type: "provider",
      },
   };

   useEffect(() => {
      fetchCareList(careTeamPayload, setLoading);
   }, []);

   const [removeCareMember] = useMutation(ADD_TO_CARETEAM, {
      variables: {
         careTeam: {
            userId: patientId,
         },
         careMemberId: careMember?.careMember?.id,
         queryType: "delete",
      },
      onCompleted(data) {
         const careMemberList = careteamList?.filter((s) => s.careMember.id !== careMember?.careMember?.id);
         setCareteamList(careMemberList);
         if (user?.id === careMember?.careMember?.id) getSelectedPatientProfile(patientId, false);
         ShowAlert(data?.addCareMember?.message);
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
      },
   });
   return (
      <CareTeam
         careTeam={careteamList}
         removeCareMember={removeCareMember}
         setCareMember={setCareMember}
         user={user}
         loading={loading}
         refetch={fetchCareList}
         {...props}
      />
   );
};

const mapStateToProps = (state) => {
   return {
      user: state?.auth?.userCredentials?.user,
      careteamList: state?.careteamList?.careteam,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setCareteamList: setCareteamList,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(CareTeamCont);
