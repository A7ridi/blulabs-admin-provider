import { gql } from "@apollo/client";

export const GET_SINGLE_CONTENT = gql`
   query GetPatientContent(
      $content: ContentInput
      $offset: Int!
      $limit: Int!
      $providerOnly: Boolean
      $user: UserInput
   ) {
      getPatientContent(content: $content, offset: $offset, limit: $limit, providerOnly: $providerOnly, user: $user) {
         totalCount
         contents {
            title
            type
            id
            createdAt
            isPrintable
            provider {
               name {
                  fullName
               }
               contactInformation {
                  email
               }
               id
            }
            patient {
               id
               name {
                  fullName
               }
               contactInformation {
                  email
               }
            }
            views {
               viewedAt
               viewer {
                  id
                  name {
                     fullName
                  }
                  contactInformation {
                     email
                  }
               }
            }
            hasThumbnail
            loves
            mentions
            tags
            hospital {
               id
               name
            }
            description
            healthSystem {
               id
               name
               patientIdentifiers {
                  number
                  type
                  authority
               }
            }
         }
      }
   }
`;
