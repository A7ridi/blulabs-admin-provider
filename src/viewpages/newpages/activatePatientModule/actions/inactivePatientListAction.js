import { gql } from "@apollo/client";

export const GET_INACTIVE_PATIENT_LIST = gql`
   query GetInactivePatientList(
      $offset: Int!
      $limit: Int!
      $inactive: Boolean
      $enterpriseId: String
      $searchTerm: String
   ) {
      getPatients(
         offset: $offset
         limit: $limit
         inactive: $inactive
         enterpriseId: $enterpriseId
         searchTerm: $searchTerm
      ) {
         totalCount
         users {
            id
            name {
               firstName
               lastName
               fullName
               initials
            }
            contactInformation {
               email
               mobileNumber
            }
            createdAt
            healthSystems {
               id
               name
            }

            dob
            hospitals {
               id
               name
            }
            colorCode
         }
      }
   }
`;
