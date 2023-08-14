import { getEntpDetails, getToken, initializeLDClient } from "../Apimanager/Networking";
import * as actions from "../redux/actions/auth.action";
import { socketActions, socketSubActions } from "../helper/Websocket";
import * as firebase from "firebase";
import { store } from "../redux/store";
import { client } from "../wrapper/apolloWrapper";
import { GET_USER_DATA } from "./userQueries";
import { getAboutYouInfo, getHospitalName } from "../helper/CommonFuncs";
import { checkProvider } from "../viewpages/newpages/teamModule/action/teamAction";
import { setProviderAboutModal } from "../redux/actions/profile.action";

export const fetchQuery = async (query, variables = {}, callback = () => {}, error = () => {}, skip = false) => {
   client
      .query({
         fetchPolicy: "no-cache",
         errorPolicy: "all",
         query: query,
         variables: variables,
         skip,
      })
      .then((data) => {
         callback(data);
      })
      .catch((err) => {
         error(err);
      });
};

export const fetchMutation = async (mutation, variables = {}, callback = () => {}, error = () => {}) => {
   client
      .mutate({
         mutation: mutation,
         variables: variables,
      })
      .then((data) => {
         callback(data);
      })
      .catch((err) => {
         error(err);
      });
};

export const refreshReduxStore = async () => {
   const token = await getToken();
   if (token) {
      let str2 = {
         action: socketActions.auth,
         subAction: socketSubActions.exchangeToken,
         firebaseToken: token,
      };
      window.socket.send(str2, (data) => {
         if (data.settings?.status === 1) {
            firebase
               .auth()
               .signInWithCustomToken(data.customToken)
               .then((storeDataRedux) => {
                  let userData = { user: data.userData };
                  getProviderData(userData);
                  store.dispatch(actions.savenorthwelluserobj(JSON.parse(JSON.stringify(storeDataRedux))));
                  store.dispatch(actions.saveusercredentials(userData));
               })
               .catch((error) => {
                  console.log(error);
               });
         }
      });
   }
};

export const getProviderData = (loadApi, loadProviderData = false, callback = (payload) => {}) => {
   fetchQuery(GET_USER_DATA, {}, (result) => {
      const data = result.data.getProfile;
      const name = data?.name?.fullName || "";
      const createdAt = data?.createdAt || "";
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
      const enterpriseInfo = data?.enterpriseInfo;
      const activityNotViewed = data?.activityNotViewed || 0;
      const id = data?.id || "";
      const departmentObj = data?.departments || [];
      const hospitalObj = data?.hospitals || [];
      const email = data?.contactInformation?.email || "";
      const role = data?.role || "";

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
         enterpriseInfo,
         activityNotViewed,
         id,
         createdAt,
         hospitalObj,
         departmentObj,
         email,
         role,
      };
      callback(obj);
      store.dispatch(actions.setProviderDetails(obj));
      if (!loadProviderData) {
         let userObject = {
            ...loadApi,
            user: {
               ...loadApi.user,
               name: obj.name,
               hospitalName: obj.hospitalName,
               enterpriseName: obj.enterpriseName,
               mobileNo: obj.mobileNo,
               initials: obj.initials,
            },
         };
         store.dispatch(actions.saveusercredentials(userObject));
         initializeLDClient(obj);
         initializePendo(obj);
      }
   });
};

export const setActivityNil = (user) => {
   const updatedUser = {
      ...user,
      activityNotViewed: 0,
   };
   store.dispatch(actions.setProviderDetails(updatedUser));
};

export const initializePendo = (user) => {
   const accountId = user.enterpriseName || "";
   const departmentName = user?.department || "";
   const hospitalName = user?.hospital || "";
   const departmentId = user?.departmentObj?.length > 0 ? user?.departmentObj[0].id : "";
   const hospitalId = user?.hospitalObj?.length > 0 ? user?.hospitalObj[0].id : "";
   var obj = {};
   if (process.env.NODE_ENV === "production") {
      obj = {
         visitor: {
            visitorId: user?.id,
            id: user?.id,
            fullName: user?.fullName?.fullName || "",
            isProvider: true,
            email: user?.email,
            department: departmentName,
            hospital: hospitalName,
            departmentId: departmentId,
            hospitalId: hospitalId,
            createdAt: user?.createdAt || "",
         },

         account: {
            accountId: accountId,
            accountid: accountId,
            id: accountId,
         },
      };
   } else {
      obj = {
         visitor: {
            visitorId: "dev-" + user?.id,
            id: "dev-" + user?.id,
            fullName: user?.fullName?.fullName || "",
            isProvider: true,
            email: user?.email,
            department: departmentName,
            hospital: hospitalName,
            departmentId: departmentId,
            hospitalId: hospitalId,
            createdAt: user?.createdAt,
         },

         account: {
            accountId: "dev-" + accountId,
            accountid: "dev-" + accountId,
            id: "dev-" + accountId,
         },
      };
   }
   window.pendo.initialize(obj);
};

export const checkProviderData = (callBack = () => {}) => {
   let reduxStore = store.getState();
   const loggedInProviderDetails = reduxStore.auth.loggedInProviderDetails;
   if (loggedInProviderDetails?.hasCreatedContent) {
      callBack();
   } else if (loggedInProviderDetails !== null) {
      if (checkProvider(loggedInProviderDetails)) {
         callBack();
      } else {
         store.dispatch(setProviderAboutModal(callBack));
      }
   } else {
      store.dispatch(setProviderAboutModal(callBack));
   }
};
