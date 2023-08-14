import { gql } from "@apollo/client";

export const GET_DASHBOARD_WIDGETS = gql`
   query getWidgets {
      getWidgets {
         id
         type
         data
         layout {
            type
            itemSize
            size
         }
         subsitutions
         actions
      }
   }
`;

export const GET_RECENT_UPDATES_CONTENT = gql`
   query RecentUpdates($paginationOptions: PaginationOptions) {
      recentUpdates(paginationOptions: $paginationOptions) {
         type
         content {
            id
            title
            location
            totalCount
            createdAt
            type
            patient {
               id
               name {
                  fullName
               }
            }
            provider {
               name {
                  fullName
               }
               id
               hospitals {
                  id
               }
            }
            hasThumbnail
            loves
         }
      }
   }
`;

export const GET_MY_TEAMS = gql`
   query GetTeams($offset: Int!, $limit: Int!, $myTeam: Boolean) {
      getTeams(offset: $offset, limit: $limit, myTeam: $myTeam) {
         id
         name
         description
         members {
            id
            name {
               fullName
            }
         }
      }
   }
`;

export const GET_MISSED_CONTENT = gql`
   query PatientsMissedContents($paginationOptions: PaginationOptions) {
      patientsMissedContents(paginationOptions: $paginationOptions) {
         totalCount
         contents {
            id
            patient {
               id
               name {
                  fullName
               }
            }
            provider {
               id
               name {
                  fullName
               }
            }
            type
            createdAt
         }
      }
   }
`;

export const GET_PENDING_INVITES = gql`
   query PendingInvites {
      pendingInvites {
         id
         name
         dob
         initials
         colorCode
      }
   }
`;

export const GET_LIBRARY_MOST_VIEWED_DATA = gql`
   query MostViewedContents($paginationOptions: PaginationOptions) {
      mostViewedContents(paginationOptions: $paginationOptions) {
         totalCount
         contents {
            id
            title
            type
            createdAt
         }
      }
   }
`;
