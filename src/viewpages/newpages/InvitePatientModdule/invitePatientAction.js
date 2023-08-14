import { gql } from "@apollo/client";

export const INVITE_PATIENT = gql`
   mutation Mutation(
      $patient: UserInput
      $familyInvite: Boolean
      $selectedPatientId: ID
      $reInvite: Boolean
      $relationship: String
   ) {
      addPatient(
         patient: $patient
         familyInvite: $familyInvite
         selectedPatientId: $selectedPatientId
         reInvite: $reInvite
         relationship: $relationship
      ) {
         status {
            code
            message
         }
         user {
            id
         }
      }
   }
`;
