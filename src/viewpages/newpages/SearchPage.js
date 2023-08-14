import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import PatientTableView from "../../components/newcomponents/PatientTableView";
import { patientSearch } from "../../Apimanager/Networking";
import { withRouter } from "react-router";
import { getFormattedDate, checkEmptyParams, calculateDateLabel, formatUrl, ageForDob } from "../../helper/CommonFuncs";
import { addProviderToCareaTeam, unfollow, removeFromCareaTeam } from "../../Apimanager/Networking";

import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../components/newcomponents/ToastView";

import { connect } from "react-redux";
import axios from "axios";

import ModalPopup from "../../components/newcomponents/ModalPopup";
import FollowView from "./profile/profileHeader/FollowView";
import "../newpages/profile/profileHeader/ProfileHeader.css";
import { pendoIds } from "../../Constants/pendoComponentIds/pendoConstants";
import { ShowAlert } from "../../common/alert";

export const getQueryParams = (props) => {
   const searchParams = new URLSearchParams(props.location.search);

   const playBackSearch = searchParams.get("playback") === "false" ? false : true;
   return {
      playbackSearch: playBackSearch,
      data: {
         query: formatUrl(checkEmptyParams(searchParams.get("query"))),
         dob: checkEmptyParams(searchParams.get("dob")),
         firstName: checkEmptyParams(searchParams.get("firstName")),
         lastName: checkEmptyParams(searchParams.get("lastName")),
         middleName: checkEmptyParams(searchParams.get("middleName")),
         mrn: checkEmptyParams(searchParams.get("mrn")),
         hospitalId: checkEmptyParams(searchParams.get("hospitalId")),
      },
      disabled: false,
   };
};

const checkparams = (props) => {
   if (
      props.data.query === null &&
      props.data.dob === null &&
      props.data.firstName === null &&
      props.data.lastName === null &&
      props.data.middleName === null &&
      props.data.mrn === null &&
      props.data.hospitalId === null
   ) {
      return true;
   } else return false;
};

function SearchPage(props) {
   const defState = {
      page: 1,
      pageSize: 20,
      results: [],
      loading: true,
      loadNext: false,
      hasMorePatients: true,
      followView: {
         show: false,
         opts: Array(6).fill(),
         selectedOpt: null,
         isloading: true,
         selectedProv: null,
         loadSubmission: false,
      },
      careTeamView: {
         show: false,
         removingId: "",
         isFamily: false,
         providerInfo: null,
      },
      showAddProvView: false,
      addFriendView: {
         show: false,
         data: null,
         loadSubmission: false,
      },
      follow: {
         followStatus: false,
         loading: true,
      },
   };

   const [state, setstate] = useState({ ...defState });
   const [isLoading, setIsLoading] = React.useState(false);
   const spinnerObserver = useRef(null);
   const searchCancel = useRef(null);
   const playbackSearchKey = new URLSearchParams(props.location.search);
   const playbackSearchKeyValue = playbackSearchKey.get("playback");
   const [selectedUserID, setSelectedUserId] = useState("");
   const [selectedUserIndex, setSelectedUserIndex] = useState(-1);
   const { accessToken, userCredentials } = props;
   const { user } = userCredentials;

   const isReqTokenCancelled = useMemo(
      () => searchCancel.current?.token.reason.toString() === "cancel",
      [searchCancel]
   );

   const fetchPatients = (params, searchChanged = false) => {
      if (checkparams(params)) return;
      searchCancel.current = axios.CancelToken.source();

      patientSearch(
         params,
         {
            page: searchChanged ? 1 : state.page,
            pageSize: state.pageSize,
         },
         searchCancel.current
      )
         .then((res) => {
            let arr = res.data.patients.map((obj) => {
               obj["pObj"] = {
                  name: params.playbackSearch ? obj.name : obj.firstName + " " + obj.lastName,
                  color: params.playbackSearch ? obj?.colorCode : "#808080",
                  age: ageForDob(obj.dob),
                  dob: getFormattedDate(obj.dob) === "" ? "-" : getFormattedDate(obj.dob),
                  lastVisit: obj.updatedAt ? calculateDateLabel(obj.updatedAt) : "-",
                  patientId: obj.id,
                  isProviderInCareTeam: false,
               };
               return obj;
            });
            let array = searchChanged ? arr : [...state.results, ...arr];

            setstate({
               ...state,
               results: array,
               loading: false,
               page: searchChanged ? defState.page + 1 : state.page + 1,
               hasMorePatients: array.length < res.data.totalRecords,
               loadNext: false,
            });
         })
         .catch((err) => {
            let errMsg = err.data?.settings?.message || "Something went wrong.";
            ShowAlert(errMsg, "error");
            setstate({ ...state, loading: false, results: [], hasMorePatients: false, loadNext: false });
         });
   };

   useEffect(() => {
      if (searchCancel.current) {
         searchCancel.current.cancel();
         setstate({ ...defState });
      }
      fetchPatients(getQueryParams(props), true);
   }, [props.location.search]);

   useEffect(() => {
      if (!state.loadNext) return;

      if (searchCancel.current) {
         searchCancel.current.cancel();
      }
      fetchPatients(getQueryParams(props));
   }, [state.loadNext]);

   const loadMore = useCallback(
      (node) => {
         if (state.loadNext && state.loading) return;
         spinnerObserver.current = new IntersectionObserver((view) => {
            if (view[0].isIntersecting && state.hasMorePatients && !state.loading) {
               setstate({ ...state, loadNext: true });
            }
         });
         if (node) spinnerObserver.current.observe(node);
      },
      [state.loadNext, state.loading, state.hasMorePatients, state.queryParams]
   );

   const followTapped = (obj, i) => {
      obj.isFollow ? changeFollowStatus(-1, user, obj, i) : setInnerState("followView", { show: true });
   };

   const setInnerState = (key, vals) => {
      setstate({
         ...state,
         [key]: { ...state[key], ...vals },
      });
   };

   const changeFollowStatus = async (type, provider, user, index = null) => {
      //-1 => remove, 0 => add, 1 => add & follow
      let st = { ...state };
      if (index !== null) {
         st.results[index].loading = true;
      } else {
         st.results[selectedUserIndex].loading = true;
      }
      setstate({ ...st });

      try {
         switch (type) {
            case -1:
               let params = {
                  careTeamId: provider.id,
                  userId: user.id,
               };
               st.careTeamView.removingId = provider.id;
               setstate(st);
               await removeFromCareaTeam(params);
               st.careTeamView.removingId = "";
               if (provider.id !== user.id) {
                  toast(<ToastView text={`Removed you from the patient's care team.`} />, defaultToastProps);
               }
               break;
            case 0:
               setstate(st);
               await unfollow({ userId: state.patientData.id });
               break;
            default:
               let obj = {
                  isAddToCareTeam: true,
                  userId: selectedUserID.id,
                  slug: provider?.slug || "",
                  type: "provider",
                  email: provider.email,
                  enterpriseId: provider.enterpriseId,
                  subscription: state.followView.selectedOpt.hour,
               };
               await addProviderToCareaTeam(obj);
               st.followView.show = false;
               st.follow.loading = false;
               st.followView.selectedProv = null;
               setstate(st);

               toast(<ToastView text={`Added you to the patient's care team.`} />, defaultToastProps);
               break;
         }
         fetchPatients(getQueryParams(props), true);
      } catch (error) {
         setstate(state);
      }
   };

   useEffect(() => {
      (async () => {
         if (!state.followView.show || !state.followView.isloading) return;
         let firebaseSS = await window.firestore.collection("AppText").doc("CareTeam").get();
         let opts = firebaseSS.data().subscription || [];
         setInnerState("followView", { opts: opts, isloading: false });
      })();
   }, [state.followView.show]);
   return (
      <div className="SearchPage w-100 h-100 p-4 d-flex flex-column">
         <div className="text-xlarge font-weight-bold text-start w-100">
            {playbackSearchKeyValue === "true" ? "Invited Search Results" : "EMR Search Results"}
         </div>

         {state.loading ? (
            <table className={`w-100 bg-white h-100`}>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((o, index) => (
                        <tr key={index}>
                           <td>
                              <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         ) : state.results.length === 0 ? (
            <div className="flex-center ">
               <h3 className="text-grey5 text-large text-bold-500">No search results.</h3>
            </div>
         ) : (
            <div className="results-div w-100 overflow-auto">
               <PatientTableView
                  ChangeFollow={(obj, i) => {
                     followTapped(obj, i);
                     setSelectedUserId(obj);
                     setSelectedUserIndex(i);
                  }}
                  user={userCredentials?.user}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  accessToken={accessToken}
                  className="h-100"
                  stateLoading={state.loading}
                  patients={state.results}
                  state={state}
                  setstate={setstate}
                  isPLBSearch={playbackSearchKeyValue}
               />
               {state.hasMorePatients && !state.loading ? (
                  <div ref={loadMore} className="flex-center my-3">
                     <img width={30} height={30} src="/assets/gif/newgifs/spinner.gif" alt="" />
                  </div>
               ) : null}
            </div>
         )}

         {state.followView.show ? (
            <ModalPopup
               id={pendoIds.btnUpdateFollowStatusModal}
               onModalTapped={() => setInnerState("followView", { show: false })}
            >
               <FollowView
                  buttonId={pendoIds.btnUpdateFollowStatusModal}
                  onCancel={() => setInnerState("followView", { show: false })}
                  followViewData={state.followView}
                  onConfirm={() => {
                     changeFollowStatus(1, user);
                     setstate({
                        ...state,
                        showAddProvView: false,
                        patientData: { ...state.patientData, followLoading: true },
                     });
                  }}
                  onOptSelect={(o) => setInnerState("followView", { selectedOpt: o })}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
   };
};

export default withRouter(connect(mapStateToProps, null)(SearchPage));
