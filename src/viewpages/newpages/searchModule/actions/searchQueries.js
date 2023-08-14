import { gql } from "@apollo/client";
import { fetchQuery } from "../../../../actions/index";
import { store } from "../../../../redux/store";
import {
   setCheckForRefresh,
   setInitialState,
   setSearchPatientList,
} from "../../../../redux/actions/searchPatient.action";
import moment from "moment";
import { firstLastNameRegex, removeExtraSpace } from "../../../../helper/CommonFuncs";
import { errorToDisplay } from "../../careTeamModule/action/careTeamAction";
import { ShowAlert } from "../../../../common/alert";

export const GET_PATIENT_SEARCH_RESULTS = gql`
   query searchAllUsers($searchData: SearchUserInput, $offset: Int, $limit: Int) {
      searchAllUsers(searchData: $searchData, offset: $offset, limit: $limit) {
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
               address
            }
            updatedAt
            lastLoginTime
            name {
               initials
               fullName
               firstName
               middleName
               lastName
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

export const fetchSearchPatientResults = (
   callBack = () => {},
   text = "",
   changeOffset = false,
   searchObject = false,
   forQuery = false
) => {
   const searchStore = store.getState();
   const { searchpatientlist, auth } = searchStore;
   const { userCredentials } = auth;
   if (searchpatientlist.playbackSearchFlag && text.trim() === "") return;
   if (!changeOffset) {
      store.dispatch(
         setSearchPatientList({
            ...searchpatientlist.searchPatients,
            list: [],
            loading: true,
            offset: 0,
            totalCount: 0,
         })
      );
   }
   let searchObj = {};
   if (searchObject) {
      searchObj = searchObject;
   } else {
      searchObj = {
         searchData: {
            search:
               searchpatientlist.playbackSearchFlag && forQuery
                  ? text === null
                     ? searchpatientlist.searchQuery
                     : text
                  : "",
            userType: searchpatientlist?.userType,
            enterpriseId: userCredentials?.user?.enterpriseId || "",
            mrn: searchpatientlist.playbackSearchFlag ? "" : searchpatientlist?.mrn,
            name: searchpatientlist.playbackSearchFlag && forQuery ? "" : removeExtraSpace(searchpatientlist.name),
            dob: searchpatientlist?.dob == null ? null : moment(searchpatientlist?.dob).format("YYYYMMDD"),
            emrSearch: searchpatientlist.playbackSearchFlag ? false : true,
            hospitalId: searchpatientlist?.hospitalId?.value,
         },
         offset: changeOffset ? searchpatientlist?.searchPatients?.offset : 0,
         limit: 10,
      };
   }
   fetchQuery(
      GET_PATIENT_SEARCH_RESULTS,
      searchObj,
      (result) => {
         const searchedPatients = result?.data?.searchAllUsers?.users?.map((patientObj, index) => patientObj) || [];
         const total = result?.data?.searchAllUsers?.totalCount;
         store.dispatch(setCheckForRefresh());
         callBack();
         const totalResults = changeOffset
            ? [...searchpatientlist.searchPatients.list, ...searchedPatients]
            : searchedPatients;
         store.dispatch(
            setSearchPatientList({
               ...searchpatientlist.searchPatients,
               loading: false,
               list: changeOffset ? totalResults : searchedPatients,
               offset: changeOffset
                  ? searchpatientlist.searchPatients.offset + searchpatientlist.searchPatients.limit
                  : searchpatientlist.searchPatients.limit,
               totalCount: total,
               hasMore: totalResults.length < total,
            })
         );
      },
      (error) => {
         const errMsg = errorToDisplay(error);
         ShowAlert(errMsg, "error");
         store.dispatch(setInitialState());
      }
   );
};
