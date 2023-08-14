import axios from "axios";
import { store } from "../redux/store";
import * as actions from "../redux/actions/auth.action";
import * as firebase from "firebase/app";
import "firebase/auth";

//import swal from 'sweetalert';
//import * as i18n from "../I18n/en.json";
/**
 * axios interceptor to handle exception
 */
axios.interceptors.request.use((config) => {
  return new Promise((resolve, reject) => {
    resolve(config);
  });
});
axios.interceptors.response.use(
  (response) => {
    return Promise.resolve(response);
  },
  (error) => {
    return Promise.reject(error.response);
  }
);
var tokensource = null;
var CancelToken = axios.CancelToken;
const entpId = localStorage.getItem("enterpriseId");
//var cancel
const Common = {
  /**
   * @param {*} endpoint
   * @param {*} methodname
   * @param {*} formBody
   * @param {*} queryparams
   * @param {*} header
   * @param {*} success
   * @param {*} error
   * @param {*} uploaded_callback
   */
  handleConnectionChange() {
    //const condition = navigator.onLine ? 'online' : 'offline';
  },
  async callrestapi(endpoint, methodname, formBody, queryparams, header, success, error, uploaded = undefined, cancelTokenSource) {
    // let maxRetry = 3;
    // let currentCall = 1;
    var baseUrl = endpoint;
    var redux_store = store.getState();
    var northwelluser_store = redux_store.auth.northwelluser;
    // var northwelluser_store = redux_store.auth?.northwelluser;

    //var call1 = CancelToken.source();

    window.addEventListener("online", this.handleConnectionChange);
    // window.addEventListener("offline", (err) => {
    //   axios.isCancel(err);
    //   return error({
    //     status: 500,
    //     data: {
    //       settings: {
    //         message:
    //           i18n && i18n.errorsmessage && i18n.errorsmessage.interneterrormsg,
    //       },
    //     },
    //   });
    //   // cancel
    // });

    var config = {};

    if (queryparams && queryparams.params && queryparams.params === "no") {
      config = {
        method: methodname,
        onUploadProgress: (progressEvent) => {
          if (uploaded) {
            return uploaded(progressEvent.loaded);
          }
        },
        headers: {
          ...Object.assign({ "Content-Type": "application/json", ...header }),
        },

        cancelToken: cancelTokenSource?.token || new CancelToken(function executer(c) {}), //cancel = c
      };
    } else {
      config = {
        method: methodname,
        onUploadProgress: (progressEvent) => {
          if (uploaded) {
            return uploaded(progressEvent.loaded);
          }
        },
        headers: Object.assign({ "Content-Type": "application/json" }),
        params: Object.assign(
          {
            key: process.env.REACT_APP_FIREBASEAPIKEY,
            uuid: window.navigator.userAgent,
            entpId: entpId,
          },
          queryparams
        ),
        cancelToken: cancelTokenSource?.token || new CancelToken(function executer(c) {}), //cancel = c
      };
    }

    if (northwelluser_store && northwelluser_store.user && northwelluser_store.user.stsTokenManager && northwelluser_store.user.stsTokenManager.accessToken) {
      if (queryparams && queryparams.params && queryparams.params === "no") {
      } else {
        config["headers"]["Authorization"] = `Bearer ${northwelluser_store.user.stsTokenManager.accessToken}`;
      }
    }

    if (methodname === "POST" || methodname === "PUT" || methodname === "DELETE") {
      config.data = formBody;

      // if (formBody.v === "north") {
      //   config["headers"]["api-version"] = `1.2`;
      // }
    }

    // if (methodname === "PUT") {
    //   config.data = formBody;
    // }

    // if (currentCall > maxRetry) {
    //   currentCall = 1;
    //   return;
    // } else {
    //   currentCall++;
    // }
    try {
      let response = await axios(baseUrl, config);

      return success(response);
    } catch (err) {
      // return
      if (err && (err.status === 403 || err.data?.message === "Forbidden")) {
        //if(localStorage.getItem("userCheckKeepLogin") === "yes"){
        var refreshToken = northwelluser_store.user.stsTokenManager.refreshToken;
        var bodyFormData = {
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        };
        // const entpId = localStorage.getItem("enterpriseId");
        // if (entpId !== null || entpId !== undefined) {
        //       header = { ...header, enterprizeId: entpId };
        //     }

        axios({
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
            northwelluser_store.user.stsTokenManager = stsTokenManager;
            store.dispatch(actions.savenorthwelluserobj(northwelluser_store));
            header = { Authorization: `Bearer ${response.data.access_token}` };
            this.callrestapi(endpoint, methodname, formBody, queryparams, header, success, error, (uploaded = undefined));
          })
          .catch((errorNew) => {
            sessionStorage.clear();
            // this.firebase.auth().signOut();
            firebase.auth().signOut();
            localStorage.clear();
            indexedDB.deleteDatabase("firebaseLocalStorageDb");
            store.dispatch(actions.logout());
            window.location.replace("/login");
          });
        // }else{
        //   swal("Your current session is expired, if you select 'Keep me signed in for 30 days' then your session will continue for 30 days.", {
        //     button: "Back to login",
        //   }).then((value) => {
        //     sessionStorage.clear();
        //     localStorage.clear();
        //     store.dispatch(actions.logout());
        //     window.location.replace("/login");
        //   });

        // }
      }
      return error(err);
    }
  },
};
const Apimanager = {
  customtoken(accesstoken, success, error) {
    var params = { providerToken: accesstoken };
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/customtoken`;
      Common.callrestapi(
        endpoint,
        "get",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  patientlookup(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/patientlookup`;
      Common.callrestapi(
        endpoint,
        "get",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },
  inviteuser(bodyparams, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user?api-version=1.2`; //+ bodyparams.v;
      Common.callrestapi(
        endpoint,
        "POST",
        bodyparams,
        {},
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },
  reinviteUser(bodyparams, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/reinvite`;
      Common.callrestapi(
        endpoint,
        "POST",
        bodyparams,
        {},
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },
  searchPatientbyname(searchTerm, pagination, success, error) {
    var queryparams = {
      page: pagination.pagenumber,
      pageSize: pagination.itemperpage,
      searchTerm: searchTerm,
    };
    var endpoint = `${process.env.REACT_APP_URL}/user/search`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      async (result) => {
        // result.data && result.data.data && await this.asyncForEach(result.data.data, async (image, index) => {
        //     image.isHaveImage = true;
        //     // image = await this.waitFor(image);

        // });
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  // waitFor(argument) {
  //     return new Promise((resolve, reject) => {
  //         fetch(`https://storage.googleapis.com/${process.env.REACT_APP_STORAGEBUCKET}/${argument.id}`, {
  //             headers: {
  //                 "access-control-allow-origin": "http://localhost:3000"
  //             }
  //         })
  //             .then((data) => {

  //                 if (data.status === 200) {
  //                     argument.isHaveImage = true;
  //                 }
  //                 return resolve(argument);
  //             })
  //             .catch(error => {

  //                 return resolve(argument);
  //                 // return reject(error);
  //             })
  //     })
  // },
  async asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
  },

  getVisits(patientId, pagination, success, error) {
    var queryparams = {
      userid: patientId,
      page: pagination.pagenumber,
      pageSize: pagination.itemperpage,
    };
    var endpoint = `${process.env.REACT_APP_URL}/visits`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getLibraryList(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/library`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  chapterMedia(requestparams, params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/${requestparams.visitId}/chapters/${requestparams.chapterId}/media`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  uploadmedia(baseurl, params, success, error, onUpload) {
    let source = axios.CancelToken.source();
    // header["Access-Control-Allow-Origin"] = process.env.REACT_APP_BASEURL
    Common.callrestapi(
      baseurl,
      "PUT",
      params,
      { params: "no" },
      { "Content-Type": params.type },
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      },
      (onUploadProgress) => {
        return onUpload(onUploadProgress);
      },
      source
    );
    return source;
  },

  uploadnewmedia(baseurl, params, success, error) {
    // header["Access-Control-Allow-Origin"] = process.env.REACT_APP_BASEURL
    Common.callrestapi(
      baseurl,
      "PUT",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  addNewChapter(visitId, params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/${visitId}/chapters`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  visitSearch(visitId, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/visitSearch/${visitId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  getUserInfo(petientId, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user`;
    var params = { userId: petientId };
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      params,
      {},
      async (result) => {
        // result.data.data.isHaveImage = false;
        // await fetch(`https://storage.googleapis.com/${process.env.REACT_APP_STORAGEBUCKET}/${petientId}`)
        //     .then((data) => {
        //         if (data.status === 200) {
        result.data.isHaveImage = true;
        //         }
        return success(result);
        // })
        // .catch(error => {
        // })
      },
      (err) => {
        return error(err);
      }
    );
  },
  updatePatientInfo(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user?api-version=1.2`;
    Common.callrestapi(
      endpoint,
      "PUT",
      queryparams,
      {},
      {},
      async (result) => {
        result.data.isHaveImage = true;
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  activateChapter(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/${params.visitId}/activateChapter/${params.chapterId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        success(result);
      },
      (err) => {
        error(err);
      }
    );
  },

  getFaqs(success, error = () => {}) {
    var endpoint = `${process.env.REACT_APP_URL}/user/faq`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        success(result);
      },
      (err) => {
        error(err);
      }
    );
  },

  newVisit(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/newVisit`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  addUpdateItem(queryparams, params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/${queryparams.visitId}/chapters/${queryparams.chapterId}/item`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postDepartmentList(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/hospitalDepartments`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postMediaFile(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/library`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getHospitalListing(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/hospital/list`;
      Common.callrestapi(
        endpoint,
        "get",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  getDepartmentListing(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/departments/` + params.id;
      Common.callrestapi(
        endpoint,
        "get",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  getEntpDetails(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/enterprise`;
      Common.callrestapi(
        endpoint,
        "get",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  getDoctorList(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/hospitalDepartmentMD`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  updateProviderProfile(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/updateProviderProfile`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postLoginLog(params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/addlogs`;
    Common.callrestapi(
      endpoint,
      "POST",
      params,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getPatientList(queryparams, success, error) {
    let source = axios.CancelToken.source();
    var endpoint = `${process.env.REACT_APP_URL}/user/patient/getPatients`;
    Common.callrestapi(
      endpoint,
      "POST",
      queryparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      },
      null,
      source
    );
    return source;
  },

  getPatientSearchNorth(qm, success, error) {
    let source = axios.CancelToken.source();
    var endpoint = `${process.env.REACT_APP_URL}/user/search`;
    Common.callrestapi(
      endpoint,
      "POST",
      qm,
      qm.quaryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      },
      null,
      source
    );
    return source;
  },

  async getReferralEntpList(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/enterprise/list`;
      await Common.callrestapi(
        endpoint,
        "GET",
        {},
        params,
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  async getReferralPhysList(params, success, error) {
    try {
      var endpoint = `${process.env.REACT_APP_URL}/user/provider/list`;
      await Common.callrestapi(
        endpoint,
        "POST",
        params,
        {},
        {},
        (result) => {
          return success(result);
        },
        (err) => {
          return error(err);
        }
      );
    } catch (err) {
      return error(err);
    }
  },

  async getReferralContentList(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/${queryParam.userId}/activity`;
    await Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  async getReferralDetails(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/patientReferral/${queryParam.referralId}`;
    await Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getPatientDetails(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/patientProfile`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getActivityFeed(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/myactivity`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  updateNotificationStatus(bodyparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/myactivity`;
    Common.callrestapi(
      endpoint,
      "PUT",
      bodyparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  readNotification(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/media/${queryparams.mediaId}?${queryparams.operationType}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  markAllNotificationsRead(bodyparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/myactivity`;
    Common.callrestapi(
      endpoint,
      "PUT",
      bodyparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  putPatientDetails(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/patient/updatePatient`;
    Common.callrestapi(
      endpoint,
      "PUT",
      queryparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  editMediaFileName(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/library`;
    Common.callrestapi(
      endpoint,
      "PUT",
      queryparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  deleteMediaFIle(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/library/${queryparams.id}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      queryparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  removeMediaFile(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/media/library/${queryparams.tag}/document/${queryparams.id}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      queryparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  deleteMediaItem(bodyparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/mediaItem/changeStatus`;
    Common.callrestapi(
      endpoint,
      "POST",
      bodyparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  downloadMediaItem(requestparams, bodyparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/media/${requestparams.mediaId}`;
    Common.callrestapi(
      endpoint,
      "PUT",
      bodyparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  deletePersonalCareTeamMember(queryparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/careteam/${queryparams.careTeamId}?userId=${queryparams.userId}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  deletePatient(id, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/patient/deletePatient/${id}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  deletePatientData(id, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/patient/${id}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getChapterMedia(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/chapterMedia/${requestparams.visitId}/${requestparams.chapterId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getChapterByVisitId(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/getChapterByVisitId/${requestparams.visitId}/chapters/${requestparams.chapterType}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getMediaURL(requestparams, params, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/media/${requestparams.location}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      params,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postUserDevice(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/userDevices`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getTemplate(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/template/${requestparams.type}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  putTemplate(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/template/${requestparams.type}`;
    Common.callrestapi(
      endpoint,
      "PUT",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  customLogin(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/getLoginSystem`;
    Common.callrestapi(
      endpoint,
      "POST",
      // { ...requestparams, isAdmin: true },
      { ...requestparams },
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getVideoCallToken(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  postValidateProvider(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/validateProvider`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  getBillingCode(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/billingCodes`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      { requestparams },
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  updateBillingCode(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/${requestparams.telehealthID}`;
    Common.callrestapi(
      endpoint,
      "PUT",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  rejectBillingCode(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/${requestparams.telehealthID}/reject`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  callerlookup(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/callerlookup`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      requestparams,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  recentProvider(success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/getRecentProivders`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  searchProvider(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/v2/searchprovider/${queryParam.enterpriceId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  inviteMultiple(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/inviteMultiple`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  logout(success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/logout`;
    Common.callrestapi(
      endpoint,
      "POST",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  checkKeepLogin(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/checkKeepLogin`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  careTeam(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/careteam?api-version=` + queryParam.v;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
  postShareing(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/shareWithPatient`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  resentActivity(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/${queryParam.userId}/v2/activity`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  resentActivityProvider(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/${queryParam.userId}/v2/activity?listtype=` + queryParam.listType;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  activityLogs(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/activityLogs`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  mediaViews(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/media/mediaviews/${queryParam.mediaId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getMentionDetails(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/v2/mention/${queryParam.id}/content`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getHashTagDetails(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/v2/tags/${queryParam.id}/content`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  updateProfilePic(queryParams, onupload, error = () => {}) {
    // var endpoint = `${process.env.REACT_APP_URL}/user/signedurl/${queryParams.id}?operationType=${queryParams.operationType}&origin=http://localhost:3000`;
    var endpoint = `${process.env.REACT_APP_URL}/user/signedurl/${queryParams.id}?operationType=${queryParams.operationType}&origin=${process.env.REACT_APP_URL}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        axios
          .put(result.data.data.signedUrl, queryParams.data, {
            headers: { "Content-Type": queryParams.data.type },
          })
          .then((success) => {
            onupload(success);
          })
          .catch((err) => {
            error(err);
          });
        // return success(result.data);
      },
      (err) => {
        // return error(err);
        error(err);
      }
    );
  },

  pullDischargeInstruction(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/chapter/pullDischargeInstruction`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getProviderDetails(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/v2/searchprovider/${queryParam.enterpriceId}`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getLatLong(queryParam, success, error) {
    var endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${queryParam.address}&key=AIzaSyDOUpdwyZ0MleJZpYjBFZsMvbRNSU8q_YA`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      { params: "no" },
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  deleteCareTeamMember(id, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/user/careteam/${id.id}`;
    Common.callrestapi(
      endpoint,
      "DELETE",
      {},
      id,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getPatientVideoCall(success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/active`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getTelehealthToken(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/${queryParam.telehealthId}/join`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postSendTextToPatient(requestparams, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/chapter/pullDischargeInstruction`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getMentionTags(success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/v2/tags`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postAddItem(requestparams, success, error) {
    let source = axios.CancelToken.source();
    var endpoint = `${process.env.REACT_APP_URL}/v2/item`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      },
      null,
      source
    );
    return source;
  },

  getProviderList(success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/getProviderList`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  postAddMedia(requestparams, success, error) {
    let source = axios.CancelToken.source();
    var endpoint = `${process.env.REACT_APP_URL}/v2/media`;
    Common.callrestapi(
      endpoint,
      "POST",
      requestparams,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      },
      null,
      source
    );
    return source;
  },

  getMentionContent(queryParam, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/telehealth/${queryParam.mentionId}/join`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  careteamProviders(queryParam, success, error = () => {}) {
    var endpoint = `${process.env.REACT_APP_URL}/user/careteamProviders`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      queryParam,
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  unfollowPatientCareTeam(body, success = () => {}, error = () => {}) {
    // var endpoint =
    //   `${process.env.REACT_APP_URL}/user/careteam?api-version=` + queryParam.v;
    var endpoint = `${process.env.REACT_APP_URL}/user/unfollow`;
    Common.callrestapi(
      endpoint,
      "PUT",
      body,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  reactionTapped(body, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/visits/mediaItem/activityUpdate`;
    Common.callrestapi(
      endpoint,
      "POST",
      body,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getTagList(uid, success, error = () => {}) {
    var endpoint = `${process.env.REACT_APP_URL}/library/tags`;
    Common.callrestapi(
      endpoint,
      "GET",
      { id: uid },
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  multipleLibrary(body, success, error) {
    var endpoint = `${process.env.REACT_APP_URL}/library/multiple`;
    Common.callrestapi(
      endpoint,
      "POST",
      body,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  getTagDocuments(tagname, success, error = () => {}) {
    var endpoint = `${process.env.REACT_APP_URL}/library/${tagname}/documents`;
    Common.callrestapi(
      endpoint,
      "GET",
      {},
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  assignDocumentsToUserWithTag(body, success, error = () => {}) {
    let endpoint = `${process.env.REACT_APP_URL}/tags/assignDocumentsToUserWithTag`;
    Common.callrestapi(
      endpoint,
      "POST",
      body,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },

  supportMessage(body, success, error = () => {}) {
    let endpoint = `${process.env.REACT_APP_URL}/user/supportMessage?api-version=1.2`;
    Common.callrestapi(
      endpoint,
      "POST",
      body,
      {},
      {},
      (result) => {
        return success(result);
      },
      (err) => {
        return error(err);
      }
    );
  },
};

export default Apimanager;
