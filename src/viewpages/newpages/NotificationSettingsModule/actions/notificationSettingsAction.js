import { gql } from "@apollo/client";

export const GET_NOTIFICATION_SETTINGS = gql`
   query GetNotificationSettings {
      getProfile {
         notificationSettings {
            sms
            email
            push
         }
      }
   }
`;

export const UPDATE_NOTIFICATION_SETTINGS = gql`
   mutation updateNotificationSettings($user: UserInput) {
      updateProfile(user: $user) {
         status {
            code
            success
            message
         }
         user {
            id
            isFollow
            hasCreatedContent
            colorCode
            dob
            dateOfBirth
            hospitals {
               name
               id
            }
            departments {
               name
               id
            }
            enterpriseInfo {
               id
               name
            }
            name {
               firstName
               lastName
               fullName
               middleName
               initials
            }
            providerInfo {
               degree
               department
               title
               settings
            }
            settings {
               cellToPatient
               cellToProvider
               emailToPatient
               emailToProvider
            }
            contactInformation {
               email
               mobileNumber
               officeNumber
               isCallEnable
            }
            notificationSettings {
               sms
               email
               push
            }
         }
      }
   }
`;

export const UPDATE_PROFILE_IMG = gql`
   mutation Mutation($updateProfileImageId: ID, $operationType: String) {
      updateProfileImage(id: $updateProfileImageId, operationType: $operationType) {
         message
         url
      }
   }
`;
