import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { ADD_REMOVE_FAMILY_FRIENDS, GET_FAMILY_FRIENDS_DATA } from "../action/famFriendsAction";
import FamilyFriends from "../component/FamilyFriends";
import { connect } from "react-redux";
import { INVITE_PATIENT } from "../../InvitePatientModdule/invitePatientAction";
import { ShowAlert } from "../../../../common/alert";
import { errorToDisplay } from "../../../../helper/CommonFuncs";
import "./friends.css";

const FamFriendsCont = (props) => {
   const { patientId, user } = props;
   const [loadFamilyFriendsData, setFamilyFriendsData] = useState([]);
   const [showFamFrindsModal, setShowFamFriendsModal] = useState(false);
   const [loadSubmission, setLoadSubmission] = useState(false);
   const [selectedPatient, setSelectedPatient] = useState(null);

   const { loading, refetch } = useQuery(GET_FAMILY_FRIENDS_DATA, {
      fetchPolicy: "no-cache",
      variables: {
         user: {
            id: patientId,
         },
         type: {
            isActive: true,
            type: "family",
         },
      },
      onCompleted(result) {
         let data = result.getCareTeam || [];
         setFamilyFriendsData(data);
      },
   });

   const [addFriendsFamily] = useMutation(INVITE_PATIENT, {
      onCompleted(res) {
         ShowAlert(res.addPatient.status.message);
         setShowFamFriendsModal(false);
         setLoadSubmission(false);
         refetch();
      },
      onError(err) {
         let msg = errorToDisplay(err);
         ShowAlert(msg, "error");
         setLoadSubmission(false);
         setShowFamFriendsModal(false);
      },
   });

   const [removeFriendsFamily] = useMutation(ADD_REMOVE_FAMILY_FRIENDS, {
      onCompleted(res) {
         ShowAlert(res.addCareMember.message);
         var filteredFamilyMember = loadFamilyFriendsData.filter((filter) => {
            return filter.careMember.id !== selectedPatient;
         });
         setFamilyFriendsData(filteredFamilyMember);
         setSelectedPatient(null);
      },
      onError(err) {
         const errMessage =
            (err?.networkError?.result?.errors &&
               err?.networkError?.result?.errors.length > 0 &&
               err?.networkError?.result?.errors[0]?.message) ||
            "Something went wrong!!!";
         ShowAlert(errMessage, "error");
      },
   });

   const AddToFriendsFamily = (email = null, mobileNumber = null, name, relationship) => {
      addFriendsFamily({
         variables: {
            patient: {
               contactInformation: {
                  email: email,
                  mobileNumber: mobileNumber,
               },
               name: {
                  fullName: name,
               },
            },
            familyInvite: true,
            selectedPatientId: patientId,
            relationship: relationship,
         },
      });
   };

   const removeFamilyMember = (family) => {
      removeFriendsFamily({
         variables: {
            careTeam: {
               userId: patientId,
            },
            queryType: "delete",
            careMemberId: family.id,
         },
      });
   };
   return (
      <FamilyFriends
         setSelectedPatient={setSelectedPatient}
         loadFamilyFriendsData={loadFamilyFriendsData}
         user={user}
         removeFamilyMember={removeFamilyMember}
         setShowFamFriendsModal={setShowFamFriendsModal}
         loading={loading}
         loadSubmission={loadSubmission}
         setLoadSubmission={setLoadSubmission}
         refetch={refetch}
         AddToFriendsFamily={AddToFriendsFamily}
         showFamFrindsModal={showFamFrindsModal}
         {...props}
      />
   );
};

const mapStateToProps = (state) => {
   return {
      user: state?.auth?.userCredentials?.user,
   };
};

export default connect(mapStateToProps, null)(FamFriendsCont);
