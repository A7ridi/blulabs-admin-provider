import axios from "axios";
import { store } from "../redux/store";
import * as actions from "../redux/actions/auth.action";
import * as launchdarkly from "../redux/actions/launchdarkly.action";
import * as LDClient from "launchdarkly-js-client-sdk";

import * as firebase from "firebase/app";
import jwt_decode from "jwt-decode";
import { v4 as uuid } from "uuid";

let redux_store = store.getState();
let northwelluser = redux_store.auth?.northwelluser;
let stsTokens = northwelluser?.user?.stsTokenManager;
async function callApi(url, method, headers, queryparams, body, isMediaUpload = false, uploadProgress, tokenSource) {
   let accessToken = await getToken();
   let config;

   if (isMediaUpload) {
      config = {
         method: method,
         onUploadProgress: (progressEvent) => uploadProgress && uploadProgress(progressEvent.loaded),
         data: body,
         headers: {
            "Content-Type": "application/json",
            ...headers,
         },
      };
   } else {
      config = {
         method: method,
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            ...headers,
         },
         data: body,
         params: {
            key: process.env.REACT_APP_FIREBASEAPIKEY,
            uuid: window.navigator.userAgent,
            "api-version": 1.2,
            ...queryparams,
         },
      };
   }
   if (tokenSource) {
      config["cancelToken"] = tokenSource?.token;
   }
   return axios(url, config).catch(async (error) => {
      if (
         error?.status === 403 &&
         error.data?.message &&
         error.data?.message?.toLowerCase() === "forbidden" &&
         (!localStorage.getItem("forbidden") ||
            (localStorage.getItem("forbidden") && localStorage.getItem("forbidden") !== 3))
      ) {
         let count = localStorage.getItem("forbidden");
         if (count) {
            localStorage.setItem("forbidden", parseInt(count) + 1);
         } else {
            localStorage.setItem("forbidden", 1);
         }
         if (parseInt(count) !== 2) {
            let newStsTokens = await renewToken();
            stsTokens = newStsTokens;
            northwelluser.user.stsTokenManager = newStsTokens;
            store.dispatch(actions.savenorthwelluserobj(northwelluser));
            callApi(url, method, headers, queryparams, body, isMediaUpload, uploadProgress, tokenSource);
         } else {
            localStorage.removeItem("forbidden");
         }
      }
      return Promise.reject(error);
   });
}

export async function getProviderData(params) {
   let url = `${process.env.REACT_APP_URL}/user`;
   return callApi(url, "get", null, params, null, false, null);
}

export async function searchLibraryData(params, token) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/search`;
   return callApi(url, "get", null, params, null, false, null, token);
}

export async function fetchInActivePatients(params) {
   let url = `${process.env.REACT_APP_URL}/user/patientList?active=false`;
   return callApi(url, "get", null, params, null, false, null);
}

export async function shareFolder(params) {
   var url = `${process.env.REACT_APP_URL}/visits/v2/library/patient/share/directory`;
   return callApi(url, "post", null, null, params);
}
export async function shareFile(params) {
   var url = `${process.env.REACT_APP_URL}/v2/media`;
   return callApi(url, "post", null, null, params);
}
export async function resendInvitePatient(params) {
   let url = `${process.env.REACT_APP_URL}/user/reinvite`;
   return callApi(url, "post", null, null, params, false, null);
}

export async function getPatientProfileData(params, token) {
   let url = `${process.env.REACT_APP_URL}/user/patientProfile`;
   return callApi(url, "get", null, params, null, false, null, token);
}

export async function getPatientList(params) {
   var url = `${process.env.REACT_APP_URL}/user/patient/getPatients`;
   return callApi(url, "post", null, null, params);
}
export async function getViewedPatients(params) {
   let url = `${process.env.REACT_APP_URL}/logs/get`;
   return callApi(url, "post", null, null, params);
}
export async function getTeamsList(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams?filter=myteams`;
   return callApi(url, "get", null, null, params);
}
export async function getAllTeamsList(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams?filter=myenterprise`;
   return callApi(url, "get", null, null, params);
}
export async function removeMembers(params, token) {
   let url = `${process.env.REACT_APP_URL}/user/teams/${params.id}`;
   return callApi(url, "put", null, null, params, null, false, null, token);
}
export async function updateTeamName(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams/${params.id}`;
   return callApi(url, "put", null, null, params);
}
export async function addTeamMember(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams/${params.id}`;
   return callApi(url, "put", null, null, params);
}
export async function deleteTeam(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams/${params.id}`;
   return callApi(url, "put", null, null, params);
}
export async function createTeam(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams`;
   return callApi(url, "post", null, null, params);
}
export async function getTeamProviderList(params) {
   var url = `${process.env.REACT_APP_URL}/user/v2/searchprovider/${params.entpId}?`;
   return callApi(url, "get", null, params);
}
export async function updateViewedList(params, token) {
   let url = `${process.env.REACT_APP_URL}/logs?key=${params.accessedUserId}`;
   return callApi(url, "post", null, null, params, false, null, token);
}
export async function getNewPatients(queryParams) {
   let url = `${process.env.REACT_APP_URL}/user/getNewPatients`;
   return callApi(url, "get", null, queryParams);
}
export async function getCareteamProviders(queryParams, token) {
   let url = `${process.env.REACT_APP_URL}/user/careteamProviders`;
   return callApi(url, "get", null, queryParams, null, false, null, token);
}
export async function getCareteam(queryParams, token) {
   let url = `${process.env.REACT_APP_URL}/user/careteam`;
   return callApi(url, "get", null, queryParams, null, false, null, token);
}
export async function unfollow(bodyParams) {
   let url = `${process.env.REACT_APP_URL}/user/unfollow`;
   return callApi(url, "put", null, null, bodyParams);
}
export async function getContentList(queryParams, token) {
   let url = `${process.env.REACT_APP_URL}/user/${queryParams.userId}/v2/activity`;
   return callApi(url, "get", null, queryParams, null, false, null, token);
}
export async function getProviderAnalyticsData(queryParams) {
   let url = `${process.env.REACT_APP_URL}/user/provider/analytics`;
   return callApi(url, "get", null, queryParams);
}
export async function addProviderToCareaTeam(body) {
   let url = `${process.env.REACT_APP_URL}/user`;
   return callApi(url, "post", null, null, body);
}
export async function removeFromCareaTeam(params) {
   let url = `${process.env.REACT_APP_URL}/user/careteam/${params.careTeamId}?userId=${params.userId}`;
   return callApi(url, "delete");
}
export async function getHashTags(params, token) {
   var url = `${process.env.REACT_APP_URL}/v2/tags`;
   return callApi(url, "get", null, params, null, false, null, token);
}
export async function getMentionTags(params, token) {
   var url = `${process.env.REACT_APP_URL}/user/getProviderList`;
   return callApi(url, "get", null, params, null, false, null, token);
}
export async function postAddItem(body) {
   var url = `${process.env.REACT_APP_URL}/v2/item`;
   return callApi(url, "post", null, null, body);
}
export async function giveReaction(body) {
   let url = `${process.env.REACT_APP_URL}/visits/mediaItem/activityUpdate`;
   return callApi(url, "post", null, null, body);
}
export async function searchProvider(params, token) {
   let url = `${process.env.REACT_APP_URL}/user/v2/searchprovider/${params.entpId}?`;
   return callApi(url, "get", null, params, null, false, null, token);
}
export async function addFriendToCareTeam(body) {
   let url = `${process.env.REACT_APP_URL}/user/shareWithPatient`;
   return callApi(url, "post", null, null, body);
}
export async function getReferralEntpList(body) {
   let url = `${process.env.REACT_APP_URL}/user/enterprise/list`;
   return callApi(url, "get", null, body, null);
}
export async function getReferralContentList(params) {
   let url = `${process.env.REACT_APP_URL}/user/${params.userId}/activity`;
   return callApi(url, "get", null, params, null);
}
export async function getReferralPhysList(body, token) {
   let url = `${process.env.REACT_APP_URL}/user/provider/list`;
   return callApi(url, "post", null, null, body, false, null, token);
}
export async function getHospitalListing(params) {
   let url = `${process.env.REACT_APP_URL}/user/hospital/list`;
   return callApi(url, "get", null, params, null);
}
export async function getDepartmentListing(params) {
   let url = `${process.env.REACT_APP_URL}/user/departments/${params.id}`;
   return callApi(url, "get", null, params, null);
}
export async function getDoctorList(body) {
   let url = `${process.env.REACT_APP_URL}/user/hospitalDepartmentMD`;
   return callApi(url, "post", null, null, body);
}
export async function getTagList(params) {
   let url = `${process.env.REACT_APP_URL}/library/tags`;
   return callApi(url, "get", null, params, null);
}
export async function invitePatient(body) {
   let url = `${process.env.REACT_APP_URL}/user`;
   return callApi(url, "post", null, null, body);
}
export async function uploadmediaDetails(body, tokenSource) {
   var url = `${process.env.REACT_APP_URL}/v2/media`;
   return callApi(url, "post", null, null, body, false, null, tokenSource);
}
export async function uploadmedia(url, body, tokenSource, uploadProgress) {
   return callApi(url, "put", { "Content-Type": body.type }, null, body, true, uploadProgress, tokenSource);
}
export async function getActivityFeed(params) {
   let url = `${process.env.REACT_APP_URL}/user/myactivity`;
   return callApi(url, "get", null, params, null);
}
export async function markAllNotificationsRead(body) {
   let url = `${process.env.REACT_APP_URL}/user/myactivity`;
   return callApi(url, "put", null, null, body);
}
export async function getBillingCode(params) {
   let url = `${process.env.REACT_APP_URL}/telehealth/billingCodes`;
   return callApi(url, "get", null, params, null);
}
export async function getTelehealthToken(params) {
   let url = `${process.env.REACT_APP_URL}/telehealth/${params.telehealthId}/join`;
   return callApi(url, "get", null, params, null);
}
export async function getVideoCallToken(body) {
   let url = `${process.env.REACT_APP_URL}/telehealth`;
   return callApi(url, "post", null, null, body);
}
export async function rejectBillingCode(body) {
   let url = `${process.env.REACT_APP_URL}/telehealth/${body.telehealthID}/reject`;
   return callApi(url, "post", null, null, body);
}
export async function updateBillingCode(body) {
   let url = `${process.env.REACT_APP_URL}/telehealth/${body.telehealthID}`;
   return callApi(url, "put", null, null, body);
}
export async function updateNotificationStatus(body) {
   let url = `${process.env.REACT_APP_URL}/user/myactivity`;
   return callApi(url, "put", null, null, body);
}
export async function getReferralDetails(params) {
   let url = `${process.env.REACT_APP_URL}/user/patientReferral/${params.referralId}`;
   return callApi(url, "get", null, params, null);
}
export async function readNotification(params) {
   let url = `${process.env.REACT_APP_URL}/media/${params.mediaId}?${params.operationType}`;
   return callApi(url, "get", null, params, null);
}
export async function getEntpDetails(params) {
   let url = `${process.env.REACT_APP_URL}/user/enterprise`;
   return callApi(url, "get", null, params, null);
}

export async function getMediaSignedURL(params) {
   let url = `${process.env.REACT_APP_URL}/media/${params.location}`;
   return callApi(url, "get", null, params, null);
}
export async function allowDownloadContent(params, body) {
   let url = `${process.env.REACT_APP_URL}/media/${params.mediaId}`;
   return callApi(url, "put", null, null, body);
}

export async function deleteMediaItem(body) {
   let url = `${process.env.REACT_APP_URL}/visits/mediaItem/changeStatus`;
   return callApi(url, "post", null, null, body);
}

export async function patientSearch(body, params, tokenSource) {
   let url = `${process.env.REACT_APP_URL}/user/search`;
   return callApi(url, "post", null, params, body, false, null, tokenSource);
}

export async function mediaViews(params) {
   let url = `${process.env.REACT_APP_URL}/media/mediaviews/${params.mediaId}`;
   return callApi(url, "get", null, params);
}

export async function postViewed(params) {
   let url = `${process.env.REACT_APP_URL}/user/${params.userId}/activity?listtype=${params.listType}`;
   return callApi(url, "get", null, params);
}
export async function multipleLibrary(body) {
   let url = `${process.env.REACT_APP_URL}/library/multiple`;
   return callApi(url, "post", null, null, body);
}
export async function getMyLibrary(params) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/directory/root?filter=all`;
   return callApi(url, "get", null, params, null);
}

export async function getAllFolderAndFilesData(params) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/directory/root?filter=all&returnType=all`;
   return callApi(url, "get", null, params, null);
}

export async function getChildrenLibrary(params, token) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/directory/${params.id}?returnType=all&filter=all`;
   return callApi(url, "get", null, params, null, false, null, token);
}

export async function PostMyLibrarySorted(body) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/sort`;
   return callApi(url, "post", null, null, body);
}

export async function getLibraryFolders(params) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library?filter=${params.filter}`;
   return callApi(url, "get", null, null, null);
}

export async function createOrRenameFolder(body) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/directory`;
   return callApi(url, "post", null, null, body);
}
export async function supportMessage(body) {
   let url = `${process.env.REACT_APP_URL}/user/supportMessage?api-version=1.2`;
   return callApi(url, "post", null, null, body);
}
export async function uploadProfilePhoto(params) {
   let url = `${process.env.REACT_APP_URL}/user/signedurl/${params.loggedInUserId}?operationType=${params.operationType}`;
   return callApi(url, "get", null, null, null);
}
export async function updateItemStatus(body) {
   let url = `${process.env.REACT_APP_URL}/user/activityLogs`;
   return callApi(url, "post", null, null, body);
}
export async function getShareWithMe(params) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/shared`;
   return callApi(url, "get", null, params, null);
}
export async function getShareTeams(params) {
   let url = `${process.env.REACT_APP_URL}/user/teams?filter=myenterprise&includeMember=false`;
   return callApi(url, "get", null, null, params);
}
export async function addShareWithTeams(body) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/sharing`;
   return callApi(url, "post", null, null, body);
}
export async function getFolderData(params, token) {
   let url = `${process.env.REACT_APP_URL}/media/v2/library/directory/${params.id}?filter=all`;
   // return callApi(url, "get", null, params, null);
   return callApi(url, "get", null, params, null, false, null, token);
}
export async function deleteDocumentFile(body) {
   let url = `${process.env.REACT_APP_URL}/library/${body.id}`;
   return callApi(url, "delete", null, null, body);
}
export async function updateDocumentFile(body) {
   let url = `${process.env.REACT_APP_URL}/library`;
   return callApi(url, "put", null, null, body);
}

export async function logout() {
   let url = `${process.env.REACT_APP_URL}/user/logout`;
   callApi(url, "post");
   sessionStorage.clear();
   sessionStorage.setItem(btoa("userEmail"), btoa(northwelluser?.user?.email));
   firebase.auth().signOut();

   const email = localStorage.getItem("providerEmail") || false;
   if (!email) {
      localStorage.clear();
   }
   indexedDB.deleteDatabase("firebaseLocalStorageDb");
   // indexedDB.deleteDatabase("localforage");
   window.location.replace("/login");
}

export async function renewToken() {
   let redux_store = store.getState();
   let northwelluser = redux_store.auth?.northwelluser;
   let stsTokens = northwelluser?.user?.stsTokenManager;
   var refreshToken = stsTokens?.refreshToken || "";
   var bodyFormData = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
   };
   return axios({
      method: "post",
      url: `https://securetoken.googleapis.com/v1/token?key=${process.env.REACT_APP_FIREBASEAPIKEY}`,
      data: bodyFormData,
      config: { headers: { "Content-Type": "multipart/form-data" } },
   })
      .then((response) => {
         var stsTokenManager = {
            apiKey: process.env.REACT_APP_FIREBASEAPIKEY,
            refreshToken: response.data.refresh_token,
            accessToken: response.data.access_token,
            expirationTime: response.data.expires_in,
         };
         return stsTokenManager;
      })
      .catch((errorNew) => {
         console.log("refresh token error " + errorNew);
         sessionStorage.clear();
         localStorage.clear();
         // store.dispatch(actions.logout());
         window.location.replace("/login");
      });
}

export async function getToken() {
   let redux_store = store.getState();
   let northwelluser = redux_store.auth?.northwelluser;
   let stsTokens = northwelluser?.user?.stsTokenManager;
   if (stsTokens) {
      const accessTokenExpTime = jwt_decode(stsTokens.accessToken).exp;
      // const accessTokenExpTime = JSON.parse(atob(stsTokens.accessToken.split(".")[1])).exp;
      //const accessTokenExpTime = JSON.parse(atob(stsTokens.accessToken.split(".")[1])).exp;      const now = parseInt(Date.now() / 1000);
      const now = parseInt(Date.now() / 1000);
      if (now >= accessTokenExpTime) {
         let newStsTokens = await renewToken();
         stsTokens = newStsTokens;
         northwelluser.user.stsTokenManager = newStsTokens;
         store.dispatch(actions.savenorthwelluserobj(northwelluser));
         return newStsTokens.accessToken;
      }
      return stsTokens.accessToken;
   } else if (stsTokens !== null && stsTokens !== undefined) {
      logout();
   }
}

export async function onBoardProvider(token) {
   if (token) {
      // const accessTokenExpTime = JSON.parse(atob(token.split(".")[1])).exp;
      const accessTokenExpTime = jwt_decode(stsTokens.accessToken).exp;
      //const accessTokenExpTime = JSON.parse(atob(token.split(".")[1])).exp;
      const now = parseInt(Date.now() / 1000);
      if (now >= accessTokenExpTime) {
         let newStsTokens = await renewToken();
         stsTokens = newStsTokens;
         // northwelluser.user.stsTokenManager = newStsTokens;
         // store.dispatch(actions.savenorthwelluserobj(northwelluser));
         return newStsTokens.accessToken;
      }
      return stsTokens.accessToken;
   } else {
      logout();
   }
}

export async function initializeLDClient(user) {
   let email = user?.email || "";
   const userInfo = {
      key: uuid(),
      custom: {
         hospitalName: user?.hospitalName,
         enterpriseName: user?.enterpriseName,
         departmentName: user?.department,
         emailDomain: email?.substring(email?.indexOf("@") + 1),
         role: user?.role,
         deviceType: "web",
      },
   };

   const client = LDClient.initialize(`${process.env.REACT_APP_LAUNCH_DARKLY_CLIENT_ID}`, userInfo);
   // will fetch status of flags once the client is initialized and ready to serve.
   client.on("ready", () => {
      const flags = client.allFlags(); // get the flags
      store.dispatch(launchdarkly.setLdFeatureFlags(flags)); // store them in redux
   });
   // Will Fetch updated status of flags whenever a flag is changed.
   client.on("change", () => {
      const flags = client.allFlags(); // get the flags
      store.dispatch(launchdarkly.setLdFeatureFlags(flags)); // store them in redux
   });
}
