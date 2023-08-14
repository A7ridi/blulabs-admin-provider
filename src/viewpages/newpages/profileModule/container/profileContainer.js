import React from "react";
import "./profileSection.css";
import ProfileComponent from "../../profileModule/components/profileComponent";
import { getSelectedPatientProfile } from "../../../../actions/userQueries";
import { connect } from "react-redux";
import { useEffect } from "react";
import { ShowAlert } from "../../../../common/alert";
import { useMutation } from "@apollo/client";
import { INVITE_PATIENT } from "../../InvitePatientModdule/invitePatientAction";

function ProfileSectionContainer(props) {
   const { patientId, selectedPatient, state, getMyPatients } = props;
   const [resendInvitation] = useMutation(INVITE_PATIENT, {
      onCompleted(res) {
         ShowAlert(res.addPatient.status.message);
      },
      onError() {
         ShowAlert("Something went wrong!", "error");
      },
   });

   const invitePatient = (id, email, mobileNumber) => {
      if (email || mobileNumber) {
         let payload = {
            patient: {
               contactInformation: {
                  email,
                  mobileNumber,
               },
            },
            reInvite: true,
         };
         resendInvitation({
            variables: payload,
         });
      } else {
         ShowAlert("Patient doesnt have a phoneNumber or an email !!!", "error");
      }
   };

   useEffect(() => {
      getSelectedPatientProfile(patientId, true);
   }, [patientId]);

   return (
      <ProfileComponent
         {...props}
         loading={selectedPatient?.loading}
         patientData={selectedPatient?.list}
         state={state}
         resendInvitation={invitePatient}
         refetch={() => {
            getSelectedPatientProfile(patientId, false);
            getMyPatients();
         }}
      />
   );
}

const mapStateToProps = (state) => {
   return {
      selectedPatient: state?.patientProfile?.selectedPatient,
   };
};

export default connect(mapStateToProps, null)(ProfileSectionContainer);
