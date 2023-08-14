import React, { useState, useEffect, useRef, useMemo } from "react";
import ProfileSectionContainer from "../profileModule/container/profileContainer";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getHashTags, getMentionTags, updateViewedList } from "../../../Apimanager/Networking";
import { Switch, Route, withRouter } from "react-router-dom";
import "./Profile.css";
import PatientList from "./PatientList";
import ContentSection from "./content-section/ContentSection";
import { socketActions, socketSubActions } from "../../../helper/Websocket";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../components/newcomponents/ToastView";
import "react-toastify/dist/ReactToastify.css";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import ContentShareView from "../../../components/newcomponents/ContentShareView/ContentShareView";
import swal from "@sweetalert/with-react";
import AlertView from "../../../components/newcomponents/AlertView";
import EMRConnectView from "../../../components/newcomponents/EMRConnectView";
import MergePatientView from "../../../components/newcomponents/MergePatientView";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import { fetchQuery } from "../../../actions/index";
import { GET_PATIENT_LIST } from "../PatientListModule/actions/patientListQueries";
import { checkForUrlParams, formatPhoneNumber } from "../../../helper/CommonFuncs";
import { fetchViewedPatient } from "../../../redux/actions/patientList.action";
import { useLayoutEffect } from "react";

const initialState = () => ({
   isInitialLoading: true,
   headerData: {
      isFollow: false,
      followLoading: true,
      loadfollowbutton: false,
      isloading: true,
      patientData: null,
      careTeam: [],
      familyFriends: [],
      followStatus: -1,
      roomDetails: null,
      onboardingStatus: null,
      notif: null,
      infoEdited: false,
   },
   content: {
      isloading: true,
      recentdata: [],
      providerId: "",
   },
   createContent: {
      show: false,
      fetched: false,
      shortcuts: null,
      hashTags: null,
      mentions: null,
   },
   pbConnect: {
      show: false,
      data: null,
   },
   mergePatient: {
      show: false,
      data: null,
   },
   emrConnect: {
      show: false,
      data: null,
   },
   editPatient: {
      show: false,
      data: null,
   },
   contentShare: {
      show: false,
      data: null,
   },
   showInvite: false,
});

function Profile(props) {
   const { patientList, fetchPatients, history } = props;
   const [state, setstate] = useState({
      ...initialState(),
      provId: props.userCredentials?.user?.id,
   });

   const defState = {
      isProvOnly: false,
   };
   const [providerOnly, setProviderOnly] = useState(defState);

   const [loading, setLoading] = useState(true);

   const [refetchList, setRefetchList] = useState(null);
   const [reloadContentData, setReload] = useState(null);
   const [media, setMedia] = useState(null);
   const [isProvider, setIsProvider] = useState(false);

   const [showCreateContent, setShowCreateContent] = useState(false);
   const [reloadPatientCareTeam, setReloadPatientCareTeam] = useState(null);
   const [providerData, setProviderData] = useState(null);
   const [providerLoading, setProviderLoading] = useState(false);
   const [hasMore, setHasMore] = useState(false);
   const [selectedIndex, setSelectedIndex] = useState(0);
   const [showMessaage, setShowMessage] = useState(false);

   const setState = (values) => setstate({ ...state, ...values });

   const requestToken = useRef(null);

   const isReqTokenCancelled = useMemo(
      () => requestToken.current?.token.reason.toString() === "cancel",
      [requestToken]
   );

   const userId = props.match.params.id;
   const fetchViewed = userId === null || userId === undefined;
   const fetchViewedData = localStorage.getItem("persistState") || false;

   const isProviderTab = checkForUrlParams("tab", 2);
   const isCareTab = checkForUrlParams("tab", 3);
   const isFamilyTab = checkForUrlParams("tab", 4);

   useEffect(() => {
      if (fetchViewedData) {
         getViewedPatientsData(() => {}, true);
         setTimeout(() => {
            localStorage.removeItem("persistState");
         }, 5000);
      }
   }, [fetchViewedData]);

   useEffect(() => {
      getMyPatientsData(() => {}, true);
      if (fetchViewed) {
         getViewedPatientsData(() => {}, true);
      }
   }, []);

   useLayoutEffect(() => {
      if (isCareTab) {
         setProviderOnly({
            ...state,
            isProvOnly: "care",
         });
      }
      if (isFamilyTab) {
         setProviderOnly({
            ...state,
            isProvOnly: "friends",
         });
      }
      if (isProviderTab) {
         setProviderOnly({
            ...state,
            isProvOnly: true,
         });
      }
   }, []);

   useEffect(() => {
      if (fetchViewed) return;
      updateViewList(userId);
   }, []);

   const updateAfterEdit = () => {
      if (selectedIndex === 0) {
         getMyPatientsData(() => {}, true);
      } else {
         getViewedPatientsData(() => {}, true);
      }
   };

   const updateViewList = (userId, reload = false) => {
      updateViewedList({
         subType: "view",
         accessedUserId: userId,
         type: "visit",
      })
         .then(() => {
            if (selectedIndex === 0 || reload) {
               getViewedPatientsData(() => {}, true);
            }
         })
         .catch(() => {
            getViewedPatientsData(() => {}, true);
            setShowMessage(true);
            history.push(`../patient`);
         });
   };

   const getViewedPatientsData = (callBack = () => {}, changeOffset = false) => {
      var obj = {};
      if (changeOffset) {
         obj = {
            offset: 0,
            limit: 10,
            viewed: true,
            subType: "view",
         };
      } else {
         obj = {
            offset: patientList.viewed.offset + patientList.viewed.limit,
            limit: patientList.viewed.limit,
            viewed: true,
            subType: "view",
         };
      }
      fetchQuery(GET_PATIENT_LIST, obj, (data) => {
         const result = data.data.getPatients;
         if (result !== null && result?.users?.length > 0) {
            const res =
               data?.data?.getPatients?.users?.map((obj, i) => {
                  obj["pObj"] = {};
                  obj.pObj["colorCode"] = obj.colorCode;
                  obj.pObj["name"] =
                     obj.name?.fullName ||
                     obj.contactInformation?.email ||
                     formatPhoneNumber(obj.contactInformation?.mobileNumber) ||
                     "Patient";
                  obj.pObj["dob"] = obj?.dob || "-";
                  obj.pObj["patientId"] = obj?.id || "";
                  obj.pObj["mobileNo"] = obj?.contactInformation?.mobileNumber || "";
                  obj.pObj["email"] = obj.contactInformation?.email || "";
                  obj.loading = false;
                  return obj;
               }) || [];
            const allData = changeOffset ? res : [...patientList.viewed.list, ...res];
            const hasMoreFlag = allData.length < data.data.getPatients.totalCount;
            setHasMore(hasMoreFlag);
            setLoading(false);
            callBack();

            let objRedux = {};
            if (changeOffset) {
               objRedux = {
                  list: res,
                  loading: false,
                  offset: 0,
                  limit: 10,
                  totalCount: data?.data?.getPatients?.totalCount || 0,
               };
            } else {
               objRedux = {
                  list:
                     patientList.viewed.offset + patientList.viewed.limit >= patientList.viewed.limit
                        ? [...patientList.viewed.list, ...res]
                        : res,
                  loading: false,
                  limit: 10,
                  offset: patientList.viewed.offset + patientList.viewed.limit,
                  totalCount: data?.data?.getPatients?.totalCount || 0,
               };
            }
            fetchPatients(objRedux, false);
         } else {
            setHasMore(false);
            setLoading(false);
            fetchPatients(
               {
                  list: [],
                  loading: false,
                  limit: 10,
                  offset: 0,
                  totalCount: 0,
               },
               false
            );
         }
      });
   };

   const getMyPatientsData = (callBack = () => {}, changeOffset = false) => {
      var obj = {};
      if (changeOffset) {
         obj = {
            offset: 0,
            limit: 10,
            myPatients: true,
         };
      } else {
         obj = {
            offset: patientList.myPatients.offset + patientList.myPatients.limit,
            limit: patientList.myPatients.limit,
            myPatients: true,
         };
      }

      fetchQuery(GET_PATIENT_LIST, obj, (data) => {
         const result = data.data.getPatients;
         if (result !== null && result?.users?.length > 0) {
            const res =
               data?.data?.getPatients?.users?.map((obj, i) => {
                  obj["pObj"] = {};
                  obj.pObj["colorCode"] = obj.colorCode;
                  obj.pObj["name"] =
                     obj.name?.fullName ||
                     obj.contactInformation?.email ||
                     formatPhoneNumber(obj.contactInformation?.mobileNumber) ||
                     "Patient";
                  obj.pObj["dob"] = obj?.dob || "-";
                  obj.pObj["patientId"] = obj?.id || "";
                  obj.pObj["mobileNo"] = obj?.contactInformation?.mobileNumber || "";
                  obj.pObj["email"] = obj.contactInformation?.email || "";
                  obj.loading = false;
                  return obj;
               }) || [];

            const allData = changeOffset ? res : [...patientList.myPatients.list, ...res];
            const hasMoreFlag = allData.length < data.data.getPatients.totalCount;
            setHasMore(hasMoreFlag);
            callBack();
            setLoading(false);
            let objRedux = {};
            if (changeOffset) {
               objRedux = {
                  list: res,
                  loading: false,
                  offset: 0,
                  limit: 10,
                  totalCount: data?.data?.getPatients?.totalCount || 0,
               };
            } else {
               objRedux = {
                  list:
                     patientList.myPatients.offset + patientList.myPatients.limit >= patientList.myPatients.limit
                        ? [...patientList.myPatients.list, ...res]
                        : res,
                  loading: false,
                  limit: 10,
                  offset: patientList.myPatients.offset + patientList.myPatients.limit,
                  totalCount: data?.data?.getPatients?.totalCount || 0,
               };
            }

            fetchPatients(objRedux, true);
         } else {
            setHasMore(false);
            callBack();
            setLoading(false);
            // setstate({
            //    ...state,
            //    headerData: {
            //       ...state.headerData,
            //       isloading: false,
            //    },
            // });
         }
      });
   };

   const getShortcutsList = async () => {
      const deptID = props.userCredentials.user.departmentId;
      let data = await window.firestore.collection("AppText").doc("TextShortcuts").get();
      let sc = data.data()[deptID] || [];
      let list = sc.map((list) => ({
         // id: list.id,
         // display: `${list.phrase} (${list.shortcut})`,
         id: list.shortcut,
         display: `${list.phrase}`,
      }));
      return list;
   };

   const getTextCompletionData = async () => {
      let obj = { ...state.createContent };
      obj.fetched = true;
      return obj;
   };

   const getCreateContentTextData = async () => {
      let obj = { ...state };
      // obj.createContent.show = true;
      setShowCreateContent(true);
      try {
         let createContent = await getTextCompletionData();
         obj.createContent = { ...createContent };
         if (!isReqTokenCancelled) setstate({ ...obj });
      } catch (err) {
         console.log(err);
      }
   };

   const connectToEMR = (data) => {
      swal(
         <AlertView
            titleText="Confirm"
            contentText={`Are you sure you want to Link this patient to EMR?`}
            showClose={false}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  let patientParams = {
                     loggedInUserId: props?.userCredentials?.user?.id,
                     Authorization: `Bearer ${props.fbUser.user.stsTokenManager.accessToken}`,
                     patientId: data.id,
                     action: socketActions.referral,
                     subAction: socketSubActions.connectEMR,
                  };
                  window.socket.send(patientParams, (result) => {
                     if (result.settings?.status === 1) {
                        setstate({ ...state, emrConnect: { show: false } });
                        showToast("Linked to EMR successfully.", "success");
                     } else {
                        setstate({ ...state, emrConnect: { show: false } });
                        showToast("Cannot link to EMR.", "error");
                     }
                  });
               }
            }}
         />,
         { buttons: false }
      );
   };

   const mergeWithPatient = (data) => {
      swal(
         <AlertView
            titleText="Confirm"
            contentText={`Are you sure you want to merge the patient?`}
            showClose={false}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  let patientParams = {
                     loggedInUserId: props?.userCredentials?.user?.id,
                     Authorization: `Bearer ${props.fbUser.user.stsTokenManager.accessToken}`,
                     patientId: data.id,
                     action: socketActions.referral,
                     subAction: socketSubActions.connectEMR,
                  };
                  window.socket.send(patientParams, (result) => {
                     if (result.settings?.status === 1) {
                        setstate({ ...state, mergePatient: { show: false } });
                        showToast("Merged this patient successfully.", "success");
                     } else {
                        setstate({ ...state, mergePatient: { show: false } });
                        showToast("Cannot merge this patient.", "error");
                     }
                  });
               }
            }}
         />,
         { buttons: false }
      );
   };

   const showToast = (text, type) => toast(<ToastView text={text} type={type} />, defaultToastProps);
   const messageToShow = showMessaage ? "User not Found" : "Please select a patient on the left";
   return (
      <div id="profile" className="d-flex w-100 h-100">
         <section className="list-section flex-shrink-0  h-100 overflow-hidden margin-profile-top ">
            <PatientList
               selectedIndex={selectedIndex}
               setSelectedIndex={setSelectedIndex}
               loading={loading}
               setLoading={setLoading}
               hasMore={hasMore}
               setHasMore={setHasMore}
               getViewedPatients={getViewedPatientsData}
               getMyPatients={getMyPatientsData}
               refetchList={refetchList}
               setRefetchList={setRefetchList}
               selectedId={props.match.params.id}
               onInvite={() => {
                  state.showInvite = true;
                  setstate({ ...state });
               }}
               onPatientTap={(obj, param = false) => {
                  let id = "";
                  if (param) {
                     id = obj;
                  } else {
                     id = obj.pObj.patientId;
                  }
                  if (id === props.match.params.id) return;
                  requestToken.current && requestToken.current.cancel();
                  props.history.push(`../patient/${id}`);
                  if (selectedIndex === 0 && !param) {
                     updateViewList(id);
                  }
                  if (param) {
                     getMyPatientsData(() => {}, true);
                     updateViewList(id, true);
                  }
                  const def = { ...initialState(), provId: props.userCredentials?.user?.id };
                  setstate({ ...def });
                  setShowMessage(false);
                  document.getElementById("tabEveryoneProfileContent") &&
                     document.getElementById("tabEveryoneProfileContent").click();
               }}
               {...props}
            />
         </section>

         <Switch>
            <Route exact path="/patient/:id">
               <section id="main-profile-section" className="pl-4 pr-3 py-4 profile-section flex-grow-1">
                  <ProfileSectionContainer
                     getMyPatients={() => {
                        if (selectedIndex === 0) {
                           getMyPatientsData(() => {}, true);
                        }
                     }}
                     updateAfterEdit={updateAfterEdit}
                     loggedInUserId={props?.userCredentials?.user?.id}
                     accessToken={props.accessToken}
                     headerData={state.headerData}
                     patientId={props.match.params.id || null}
                     user={props.userCredentials?.user}
                     state={providerOnly}
                     createContentTapped={() => {
                        getCreateContentTextData();
                        setstate({ ...state });
                     }}
                     {...props}
                  />
                  <ContentSection
                     reloadPatientCareTeam={reloadPatientCareTeam}
                     setReloadPatientCareTeam={setReloadPatientCareTeam}
                     reloadContentData={reloadContentData}
                     setReload={setReload}
                     headerData={state.headerData}
                     createContentTapped={(bool) => {
                        setIsProvider(bool ? bool : null);
                        getCreateContentTextData();
                     }}
                     getCreateContentTextData={(media, isProvider) => {
                        setMedia(media);
                        setIsProvider(isProvider);
                        setShowCreateContent(true);
                     }}
                     patientId={props.match.params.id || null}
                     content={state.content}
                     sendContent={(content) => {
                        state.contentShare.data = content;
                        state.contentShare.show = true;
                        setstate({ ...state });
                     }}
                     state={providerOnly}
                     setstate={setProviderOnly}
                     loggedInUserId={props?.userCredentials?.user?.id}
                     user={props.userCredentials?.user}
                     providerData={providerData}
                     providerLoading={providerLoading}
                     setProviderLoading={setProviderLoading}
                     media={media}
                     isProvider={isProvider}
                     setIsProvider={setIsProvider}
                     setMediaUpload={setMedia}
                     createContentData={state.createContent}
                     userCredentials={props.userCredentials}
                  />
               </section>
            </Route>
            <Route exact path="/patient">
               <section className="flex-center w-100 h-100">
                  <div className="text-bold text-large text-grey5">{messageToShow}</div>
               </section>
            </Route>
         </Switch>

         {state.contentShare.show ? (
            <ModalPopup
               id={pendoIds.btnContentShareModal}
               className="overflow-scroll p-5 align-items-start"
               styles={{ overflow: "scroll", overflowX: "hidden" }}
               onModalTapped={() => {
                  state.contentShare.show = false;
                  setstate({ ...state });
               }}
            >
               <ContentShareView
                  buttonId={pendoIds.btnContentShareModal}
                  closeContentShareView={() => {
                     state.contentShare.show = false;
                     setstate({ ...state });
                  }}
                  contentObject={state.contentShare.data}
                  patientDetailsObject={{
                     patientEmail: state.headerData?.patientData?.email,
                     patientID: props.match?.params?.patientid,
                     patientName: state.headerData?.patientData?.name,
                     patientMobile: state.headerData?.patientData?.mobileNo,
                  }}
               />
            </ModalPopup>
         ) : null}
         {state.mergePatient.show ? (
            <ModalPopup
               id="emrConnect-info-modal"
               onModalTapped={() => {
                  state.mergePatient.show = false;
                  setState({ ...state });
               }}
            >
               <MergePatientView
                  patientData={state.mergePatient.data}
                  connectEMR={mergeWithPatient}
                  close={() => {
                     state.mergePatient.show = false;
                     setState({ ...state });
                  }}
               />
            </ModalPopup>
         ) : null}
         {state.emrConnect.show ? (
            <ModalPopup
               id="emrConnect-info-modal"
               onModalTapped={() => {
                  state.emrConnect.show = false;
                  setState({ ...state });
               }}
            >
               <EMRConnectView
                  patientData={state.emrConnect.data}
                  connectEMR={connectToEMR}
                  close={() => {
                     state.emrConnect.show = false;
                     setState({ ...state });
                  }}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      fbUser: state.auth?.northwelluser,
      userCredentials: state.auth?.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      enterPriseDetails: state.dashboardStates?.enterPriseDetails,
      patientList: state.patientlist,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         fetchPatients: fetchViewedPatient,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Profile));
