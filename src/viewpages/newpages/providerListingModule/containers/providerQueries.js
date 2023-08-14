import { gql } from "@apollo/client";

export const GET_PROVIDER_LISTING = gql`
   query SearchAllUsers($offset: Int!, $limit: Int!, $searchData: SearchUserInput) {
      searchAllUsers(offset: $offset, limit: $limit, searchData: $searchData) {
         status {
            code
         }
         totalCount
         users {
            id
            name {
               firstName
               middleName
               lastName
               initials
               fullName
            }
            colorCode
            providerInfo {
               department
               degree
               title
            }
            hospitals {
               name
               id
            }
            contactInformation {
               email
               mobileNumber
               officeNumber
               isCallEnable
            }
         }
      }
   }
`;

export const getHospital = (hospital) => {
   if (hospital === null || hospital === undefined) return "-";
   else if (hospital.length > 0) return hospital[0].name;
   else return "-";
};
export const GET_PROVIDERS_CONTENT = gql`
   query GetPatientContent(
      $user: UserInput
      $offset: Int!
      $limit: Int!
      $search: String
      $createdByUser: Boolean
      $patientOnly: Boolean
      $providerOnly: Boolean
      $content: ContentInput
      $contentFilter: String
   ) {
      getPatientContent(
         user: $user
         offset: $offset
         limit: $limit
         search: $search
         createdByUser: $createdByUser
         patientOnly: $patientOnly
         providerOnly: $providerOnly
         content: $content
         contentFilter: $contentFilter
      ) {
         totalCount
         contents {
            createdAt
            type
            title
            id
            location
            description
            isThumbnail
            hasThumbnail
            loves
            mentions
            tags
            views {
               viewer {
                  id
               }
               viewedAt
            }
            hospital {
               id
            }
            provider {
               id
               name {
                  fullName
               }
               hospitals {
                  id
               }
            }
            patient {
               id
               name {
                  initials
                  fullName
               }
               dob
               id
               colorCode
            }
         }
      }
   }
`;

export const GET_PROVIDERS_PATIENT = gql`
   query GetPatients($userId: String!, $offset: Int!, $limit: Int!, $searchTerm: String) {
      getPatients(userId: $userId, offset: $offset, limit: $limit, searchTerm: $searchTerm) {
         status {
            code
            message
         }
         totalCount
         users {
            id
            name {
               fullName
               initials
            }
            colorCode
            dob
            dateOfBirth
            createdAt
         }
      }
   }
`;
