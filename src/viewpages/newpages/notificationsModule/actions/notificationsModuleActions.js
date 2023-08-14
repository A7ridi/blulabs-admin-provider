import { gql } from "@apollo/client";

export const GET_PROVIDER_NOTIFICATIONS = gql`
   query RecentUpdates($paginationOptions: PaginationOptions, $options: RecentUpdatesOptions) {
      recentUpdates(paginationOptions: $paginationOptions, options: $options) {
         totalCount
         data {
            id
            type
            content {
               id
               title
               type
               createdAt
               body
               patient {
                  id
               }
            }
            careTeam {
               provider {
                  id
                  createdAt
                  name {
                     firstName
                  }
               }
               patient {
                  id
                  createdAt
                  name {
                     firstName
                  }
               }
            }
            status
            createdAt
         }
      }
   }
`;

export const UPDATE_NOTIFICATIONS = gql`
   mutation Mutation($options: AddActivityOptions) {
      addActivity(options: $options) {
         status {
            success
            message
         }
      }
   }
`;
