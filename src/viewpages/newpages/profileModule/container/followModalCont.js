import React, { useEffect, useState } from "react";
import "./profileSection.css";
import FollowView from "../../profile/profileHeader/FollowView";
import { useMutation } from "@apollo/client";
import { ADD_TO_CARETEAM } from "../actions/profileActions";
import { connect } from "react-redux";
import { ShowAlert } from "../../../../common/alert";
import { getSelectedPatientProfile } from "../../../../actions/userQueries";
import { errorToDisplay, fetchCareList, FOLLOW_UNFOLLOW_PATIENT } from "../../careTeamModule/action/careTeamAction";

function FollowCont(props) {
   const {
      userCredentials,
      userId,
      careTeam = false,
      careMemberEmail = "",
      refetch = () => {},
      closeModal = () => {},
      state,
      isFollow,
   } = props;
   const providerEmail = userCredentials?.user?.email;
   const email = careTeam ? careMemberEmail : providerEmail;
   const [careTeamOptions, setCareTeamOptions] = useState([]);
   const [selected, setSelected] = useState(null);
   const [loading, setLoading] = useState(true);
   const [confirmBtnLoading, setConfirmBtnLoading] = useState(false);
   const [followLoading, setFollowLoading] = useState(false);
   const [showFollowModal, setShowFollowModal] = useState(careTeam);

   const careTeamPayload = {
      user: {
         id: userId,
      },
      type: {
         isActive: true,
         type: "provider",
      },
   };

   const [addCareTeam] = useMutation(ADD_TO_CARETEAM, {
      variables: {
         careTeam: {
            email: email,
            userId: userId,
            type: "provider",
            subscription: selected?.hour,
         },
         queryType: "create",
      },
      onCompleted(data) {
         setShowFollowModal(false);
         setFollowLoading(false);
         refetch();
         if (providerEmail === email) getSelectedPatientProfile(userId, false);
         if (state?.isProvOnly === "care" || careTeam) fetchCareList(careTeamPayload);
         ShowAlert(data?.addCareMember?.message, "success");
         closeModal();
      },
      onError(err) {
         let error = errorToDisplay(err);
         ShowAlert(error, "error");
         closeModal();
      },
   });

   const [followUnfollowPatient] = useMutation(FOLLOW_UNFOLLOW_PATIENT, {
      variables: {
         careTeam: {
            userId: userId,
            subscription: selected?.hour,
         },
         follow: isFollow ? false : true,
         queryType: "update",
      },
      onCompleted(data) {
         setFollowLoading(false);
         setShowFollowModal(false);
         refetch();
         if (!isFollow && (state?.isProvOnly === "care" || careTeam)) fetchCareList(careTeamPayload);
         ShowAlert(data?.addCareMember?.message, "success");
      },
      onError(err) {
         let error = errorToDisplay(err);
         ShowAlert(error, "error");
      },
   });

   useEffect(() => {
      if (!careTeam) return;
      getCareTeamOption();
   }, []);

   const getCareTeamOption = async () => {
      setLoading(true);
      setConfirmBtnLoading(true);
      setCareTeamOptions([]);
      setShowFollowModal(true);
      let firebaseSS = await window.firestore.collection("AppText").doc("CareTeam").get();
      let opts = firebaseSS.data().subscription || [];
      setCareTeamOptions(opts);
      setLoading(false);
      setConfirmBtnLoading(false);
   };

   const addToCareTeam = (e) => {
      e.stopPropagation();
      setFollowLoading(true);
      addCareTeam();
   };
   const onCancel = (e) => {
      e.stopPropagation();
      setShowFollowModal(false);
   };
   const confirmFollowDialog = (e) => {
      e.stopPropagation();
      setConfirmBtnLoading(true);
      if (careTeam) addToCareTeam(e);
      else followUnfollowPatient();
   };
   return (
      <FollowView
         onCancel={onCancel}
         {...props}
         isFollow={isFollow}
         followLoading={followLoading}
         showFollowModal={showFollowModal}
         setFollowLoading={setFollowLoading}
         setShowFollowModal={setShowFollowModal}
         loading={loading}
         confirmBtnLoading={confirmBtnLoading}
         options={careTeamOptions}
         selected={selected}
         setSelected={setSelected}
         getCareTeamOption={getCareTeamOption}
         followUnfollowPatient={followUnfollowPatient}
         confirmFollowDialog={confirmFollowDialog}
      />
   );
}
const mapStateToProps = (state) => {
   return {
      userCredentials: state?.auth?.userCredentials,
   };
};

export default connect(mapStateToProps, null)(FollowCont);
