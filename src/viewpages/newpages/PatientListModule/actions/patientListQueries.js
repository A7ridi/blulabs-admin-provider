import { gql } from "@apollo/client";

export const GET_PATIENT_LIST = gql`
   query getPatientList($offset: Int!, $limit: Int!, $myPatients: Boolean, $viewed: Boolean, $subType: String) {
      getPatients(offset: $offset, limit: $limit, myPatients: $myPatients, viewed: $viewed, subType: $subType) {
         totalCount
         users {
            colorCode
            isFollow
            id
            createdAt
            dob
            dateOfBirth
            contactInformation {
               email
               mobileNumber
               isCallEnable
            }
            updatedAt
            lastLoginTime
            name {
               initials
               fullName
            }
            healthSystems {
               id
               name
               patientIdentifiers {
                  number
                  type
                  authority
               }
            }
            lastAccessed
         }
      }
   }
`;
