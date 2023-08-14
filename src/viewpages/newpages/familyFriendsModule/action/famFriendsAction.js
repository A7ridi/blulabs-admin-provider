import { gql } from "@apollo/client";
import { addFriendToCareTeam } from "../../../../Apimanager/Networking";
import { ShowAlert, showSwal2 } from "../../../../common/alert";

export const GET_FAMILY_FRIENDS_DATA = gql`
   query Query($user: UserInput, $type: UserListOptions) {
      getCareTeam(user: $user, type: $type) {
         careMember {
            id
            name {
               fullName
            }
            colorCode
            contactInformation {
               email
               mobileNumber
               isCallEnable
               officeNumber
            }
            profileImage
         }
         relationship
      }
   }
`;

export const REMOVE_FAMILY_MEMBER = gql`
   mutation RemoveCareMember($careMemberId: String, $patientId: String) {
      removeCareMember(careMemberId: $careMemberId, patientId: $patientId) {
         id
      }
   }
`;
export const ADD_REMOVE_FAMILY_FRIENDS = gql`
   mutation AddCareMember($careTeam: AddCareTeamInput!, $queryType: String, $careMemberId: String) {
      addCareMember(careTeam: $careTeam, queryType: $queryType, careMemberId: $careMemberId) {
         message
         response
      }
   }
`;

export const removeFriendsFamilySection = (careMember, user, remove, setSelectedPatient) => {
   const titleText = "Confirm";
   let showClose;
   const contentText = `Are you sure you want to remove ${
      careMember?.id === user.id ? "yourself" : careMember?.name?.fullName
   } from this care team?`;
   setSelectedPatient(careMember.id);
   showSwal2(
      titleText,
      contentText,
      () => {
         remove(careMember);
      },
      showClose
   );
};

export const famFriendsDataLoad = (loadFamilyFriendsData, searchKey) => {
   const data = loadFamilyFriendsData?.filter((filter) => {
      const name = filter?.careMember?.name?.fullName || "";
      return name ? name.toLowerCase().includes(searchKey.toLowerCase()) : true;
   });
   return data || [];
};

export const addToFamilyFriends = (data, refetch, patientId, setShowProvider, setLoadSubmission) => {
   let body = {
      name: data.name,
      email: data.email,
      mobileNo: data.mobileNo,
      userId: patientId,
      fromAddressBook: false,
   };
   addFriendToCareTeam(body)
      .then(async () => {
         refetch();
         ShowAlert(`Added ${body.name} to the care team.`);
         setShowProvider(false);
         setLoadSubmission(false);
      })
      .catch((error) => {
         let err = error.data.settings.message || "Something went wrong.";
         ShowAlert(err, "error");
         setLoadSubmission(false);
      });
};
