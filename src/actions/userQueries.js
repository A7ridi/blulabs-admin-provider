import { gql } from "@apollo/client";
import { fetchQuery } from ".";
import { store } from "../redux/store";
import * as actions from "../redux/actions/profile.action";

export const GET_USER_DATA = gql`
   query getProfile($options: GetUserProfileOptions) {
      getProfile(options: $options) {
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
            domain
            loginSystem
            showReferral
            appIntegration
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
         activityNotViewed
         createdAt
         role
         status
      }
   }
`;

export const getSelectedPatientProfile = (patientId, initialLoad = false) => {
   const payload = {
      options: {
         id: patientId,
      },
   };
   let selectedPatient = {};
   if (initialLoad) {
      selectedPatient = {
         list: null,
         loading: true,
      };
      store.dispatch(actions.setSelectedPatient(selectedPatient));
   }
   fetchQuery(GET_USER_DATA, payload, (data) => {
      let patientProfile = data?.data?.getProfile;
      selectedPatient = {
         list: patientProfile,
         loading: false,
      };
      store.dispatch(actions.setSelectedPatient(selectedPatient));
   });
};
