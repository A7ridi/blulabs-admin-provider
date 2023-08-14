import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import { ShowAlert } from "../../../../common/alert";
import * as actions from "../../../../redux/actions/auth.action";
import { store } from "../../../../redux/store";
import { getAboutYouInfo, getHospitalName } from "../../../../helper/CommonFuncs";

export const providerGetShortDegree = async (callback) => {
   let onboardingParams = {
      action: socketActions.onboarding,
      subAction: socketSubActions.getShortTitle,
      degree: "",
   };
   window.socket.send(onboardingParams, (resultStatus) => {
      if (resultStatus?.settings?.status === 1) {
         const resultDegree = resultStatus?.data || [];
         const data = [];
         let label;
         for (label of resultDegree) {
            if (label && label !== " ") {
               data.push({ label: label, value: label, data: label });
            }
         }
         callback(data);
      } else {
         ShowAlert(resultStatus?.settings?.message, "error");
      }
   });
};
export const getDepartments = (id, callback) => {
   let onboardingParams = {
      action: socketActions.onboarding,
      subAction: socketSubActions.getDepartmentsV2,
      hospitalId: id,
   };
   window.socket.send(onboardingParams, (resultStatus) => {
      if (resultStatus?.settings?.status === 1) {
         let data = resultStatus?.data?.map((o) => {
            return { label: o.name, value: o.id, data: o };
         });
         callback(data);
      } else {
         callback([]);
         ShowAlert(resultStatus?.settings?.message);
      }
   });
};

export const providerGetShortTitle = async (callback) => {
   let onboardingParams = {
      action: socketActions.onboarding,
      subAction: socketSubActions.getTitle,
      title: "",
   };
   window.socket.send(onboardingParams, (resultStatus) => {
      if (resultStatus?.settings?.status === 1) {
         let data = resultStatus?.data?.map((o) => {
            return { label: o, value: o, data: o };
         });
         callback(data);
      } else {
         ShowAlert(resultStatus?.settings?.message, "error");
      }
   });
};

export const updateProviderData = async (providerTitle, shortTitle, department, updateUser) => {
   if (providerTitle === "") {
      ShowAlert("Title cannot be empty !", "error");
      return;
   } else if (!department) {
      ShowAlert("Department cannot be empty !", "error");
      return;
   } else {
      updateUser({
         variables: {
            user: {
               providerInfo: {
                  degree: shortTitle?.label || "",
                  title: providerTitle,
               },
               departments: [{ id: department.value }],
            },
         },
      });
   }
};

export const updateReduxstore = (obj) => {
   const redux_store = store.getState();
   const user = redux_store.auth?.userCredentials;
   const userObject = {
      ...user,
      user: {
         ...user.user,
         name: obj.name,
         degree: obj.degree,
      },
   };

   store.dispatch(actions.saveusercredentials(userObject));
};

export const submitNameInfo = async (validateNames, state, updateUser) => {
   const { firstName, middleName, lastName } = state;
   if (validateNames()) {
      updateUser({
         variables: {
            user: {
               name: {
                  firstName,
                  middleName,
                  lastName,
               },
            },
         },
      });
   }
};

export const updateUserCredStore = (obj) => {
   const redux_store = store.getState();
   const user = redux_store.auth?.userCredentials;
   const userObject = {
      ...user,
      user: {
         ...user.user,
         name: obj.name,
         initials: obj.initials,
      },
   };
   store.dispatch(actions.saveusercredentials(userObject));
};

export const reduxStoreRefreshLocal = (result) => {
   const data = result;
   const name = data?.name?.fullName || "";
   const fullName = data?.name;
   const enterpriseName = data?.enterpriseInfo?.name || "";
   const mobileNo = data.contactInformation.mobileNumber;
   const initials = data?.name?.initials || "";
   const title = data?.providerInfo?.title || "";
   const degree = data?.providerInfo?.degree || "";
   const hasCreatedContent = data?.hasCreatedContent;
   const userSettings = data?.settings;
   const dept = data?.providerInfo?.department;
   const department = dept !== null && dept !== undefined && dept !== "" ? dept : false;
   const providerInfo = data?.providerInfo?.settings;

   var obj = {
      departmentName: dept,
      hospitalName: getHospitalName(data.hospitals),
      name,
      fullName,
      enterpriseName,
      mobileNo,
      initials,
      title,
      hasCreatedContent,
      degree,
      userSettings,
      hospital: getAboutYouInfo(data.hospitals),
      department: department ? getAboutYouInfo(data.departments) : null,
      providerInfo,
   };
   store.dispatch(actions.setProviderDetails(obj));
   updateUserCredStore(obj);
};

export const checkProviderName = (name) => {
   if (name === null || name === undefined) return "";
   else return name + " ";
};

export const getFullNameFromGQL = (provDetails) => {
   const firstName = checkProviderName(provDetails?.firstName);
   const middleName = checkProviderName(provDetails?.middleName);
   const lastName = provDetails?.lastName || "";
   const name = firstName + middleName + lastName;
   return name === "" ? "Provider" : name;
};
