import { gql } from "@apollo/client";
import { fetchQuery } from "../../../../actions";
import { ShowAlert, showSwal2 } from "../../../../common/alert";
import { store } from "../../../../redux/store";
import * as actions from "../../../../redux/actions/careteam.action";

export const GET_CARETEAM_DATA = gql`
   query GetCareTeam($user: UserInput, $type: UserListOptions) {
      getCareTeam(user: $user, type: $type) {
         isSubscribed
         careMember {
            name {
               fullName
               firstName
               lastName
               initials
            }
            colorCode
            profileImage
            providerInfo {
               degree
               title
               settings
               department
            }
            contactInformation {
               email
               mobileNumber
               isCallEnable
               officeNumber
               address
            }
            createdAt
            updatedAt
            id
         }
         createdAt
         lastUpdate
      }
   }
`;

export const GET_SEARCHPROVIDER_DATA = gql`
   query Users($searchData: SearchUserInput, $limit: Int) {
      searchAllUsers(searchData: $searchData, limit: $limit) {
         users {
            id
            userId
            name {
               fullName
            }
            contactInformation {
               email
            }
         }
      }
   }
`;

export const GET_SEARCH_ALL_PROVIDERS_DATA = gql`
   query SearchAllUsers($limit: Int, $offset: Int, $searchData: SearchUserInput) {
      searchAllUsers(limit: $limit, offset: $offset, searchData: $searchData) {
         totalCount
         users {
            id
            userId
            name {
               fullName
            }
            contactInformation {
               email
            }
         }
      }
   }
`;

export const FOLLOW_UNFOLLOW_PATIENT = gql`
   mutation Mutation($careTeam: AddCareTeamInput!, $follow: Boolean, $queryType: String) {
      addCareMember(careTeam: $careTeam, follow: $follow, queryType: $queryType) {
         message
         response
      }
   }
`;

export const showRemovePopup = (careMember, user, removeCareMember) => {
   const titleText = "Confirm";
   let showClose;
   const contentText = `Are you sure you want to remove ${
      careMember?.id === user.id ? "yourself" : careMember?.name?.fullName
   } from this care team?`;
   if (careMember === null) ShowAlert("Something went wrong", "error");
   else showSwal2(titleText, contentText, () => removeCareMember(), showClose);
};

export const getCareTeamList = (careTeam, searchKey) => {
   const data = careTeam?.filter((filter) => {
      const name = filter?.careMember?.name?.fullName;
      return name ? name.toLowerCase().includes(searchKey.toLowerCase()) : true;
   });
   return data || [];
};

export const fetchCareList = (obj, setLoading = () => {}) => {
   if (obj !== undefined) {
      fetchQuery(
         GET_CARETEAM_DATA,
         obj,
         (data) => {
            setLoading(false);
            store.dispatch(actions.setCareteamList(data?.data?.getCareTeam));
         },
         (err) => {
            setLoading(false);
            ShowAlert(errorToDisplay(err), "error");
         }
      );
   }
};

export const errorToDisplay = (err) => {
   let error = err?.networkError?.result?.errors;
   if (Array.isArray(error) && error?.length > 0) {
      let errMessage = error[0]?.message;
      return errMessage;
   } else {
      return "Something went wrong!";
   }
};

export const isDirectionGql = (info) => {
   const address = info?.address;
   const checkAddress = address && address?.streetAddress !== "" && address?.zip !== "" && address?.city !== "";
   if (checkAddress) return true;
   else return false;
};
