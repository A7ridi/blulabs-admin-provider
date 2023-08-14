import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import DropdownToggle from "../../../../components/newcomponents/DropdownToggle";
import { getFormattedDate, formatPhoneNumber, isValidEmail, isValidMob } from "../../../../helper/CommonFuncs";
import {
   addProviderToCareaTeam,
   unfollow,
   removeFromCareaTeam,
   addFriendToCareTeam,
   addTeamMember,
} from "../../../../Apimanager/Networking";
import { getCareteamProviders, getCareteam } from "../../../../Apimanager/Networking";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import "react-toastify/dist/ReactToastify.css";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import FollowView from "../../profile/profileHeader/FollowView";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../../components/newcomponents/ToastView";
import { AddProviderView, AddFriendView } from "../../profile/addToCareTeam";
import ProviderInfoView from "../../profile/profileHeader/ProviderInfoView";
import { TableView } from "./careTeamView";
import axios from "axios";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

function ProfileHeader(props) {
   const {
      className,
      notif,
      onOptTapped,
      headerData,
      user,
      createContentTapped,
      accessToken,
      patientId,
      care = false,
      searchKey,
      teamSection = false,
      eachTeam,
      getTeamList,
      reloadPatientCareTeam,
      setReloadPatientCareTeam,
      fetchPatientData,
   } = props;
   const initHeaderState = useRef(null);
   const [state, setstate] = useState({
      //state includes profile state's headerData values
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
      showAddTeamView: false,
      addFriendView: {
         show: false,
         data: null,
         loadSubmission: false,
      },
      careTeam: {
         listToShow: [],
         isLoading: true,
      },
      loadfollowbutton: false,
      familyFriends: {
         listToShow: [],
         isLoading: true,
      },
   });

   const requestToken = useRef(null);
   useEffect(() => {
      if (teamSection) return;
      getTeamInfo();
   }, [props.care]);

   useEffect(() => {
      if (reloadPatientCareTeam === null || !props.care || teamSection) return;
      getTeamInfo();
      setReloadPatientCareTeam(null);
   }, [reloadPatientCareTeam]);

   const getTeamInfo = async () => {
      let headerParams = { userId: patientId };
      try {
         let data = {};
         if (care) {
            data = await getCareteamData(true, headerParams);
            state.careTeam = data;
            state.showAddProvView = false;
            state.showAddTeamView = false;
            setstate({ ...state });
         } else {
            data = await getCareteamData(false, headerParams);
            state.familyFriends = data;
            state.showAddProvView = false;
            state.showAddTeamView = false;
            state.addFriendView = {
               data: null,
               show: false,
               loadSubmission: false,
            };
            state.careTeamView = { show: false };
            setstate({ ...state });
         }
      } catch (err) {
         return;
      }
   };

   const getCareteamData = async (provider = true, patientObject) => {
      requestToken.current = axios.CancelToken.source();
      let obj = {};
      let headerParams = {
         userId: patientId,
         v: 1.2,
      };

      if (provider) {
         let provTeamData = await getCareteamProviders(headerParams, requestToken.current);
         let provTeamList = provTeamData?.data || [];
         let provStatus = provTeamList.find((o) => o.id === state.provId);
         obj = {
            listToShow: provTeamList,
            followStatus: !provStatus ? -1 : provStatus.isSubscribed ? 1 : 0,
            isLoading: false,
         };
      } else {
         let famCareTeamData = await getCareteam(headerParams, requestToken.current);
         obj = {
            listToShow: famCareTeamData.data || [],
            isLoading: false,
         };
      }
      return obj;
   };

   useEffect(() => {
      (async () => {
         if (!state.followView.show || !state.followView.isloading) return;
         let firebaseSS = await window.firestore.collection("AppText").doc("CareTeam").get();
         let opts = firebaseSS.data().subscription || [];
         setInnerState("followView", { opts: opts, isloading: false });
      })();
   }, [state.followView.show]);

   const setInnerState = (key, vals) => {
      setstate({
         ...state,
         [key]: { ...state[key], ...vals },
      });
   };

   const ctProvInfo = useMemo(() => state.careTeamView.providerInfo, [state.careTeamView.providerInfo]);

   useEffect(() => {
      if (!props.showProvider) return;
      if (props.showProvider) {
         let st = { ...state };
         if (care) {
            st.showAddProvView = true;
            st.showAddTeamView = true;
            setstate(st);
         } else {
            st.addFriendView.show = true;
            st.careTeamView.show = false;
         }

         props.setShowProvider(false);
      }
   }, [props.showProvider]);

   const changeFollowStatus = async (type, provider) => {
      //-1 => remove, 0 => add, 1 => add & follow
      let st = { ...state };
      st.careTeamView.show = false;
      st.careTeamView.providerInfo = null;
      st.loadfollowbutton = provider.id === user.id;
      try {
         switch (type) {
            case -1:
               let params = {
                  careTeamId: provider.id,
                  userId: headerData.patientData?.id,
               };
               st.careTeamView.removingId = provider.id;
               setstate(st);
               await removeFromCareaTeam(params);
               getTeamInfo();
               st.careTeamView.removingId = "";
               if (provider.id !== user.id) {
                  toast(<ToastView text={`Removed ${provider?.name} from the care team.`} />, defaultToastProps);
               }
               break;
            case 0:
               setstate(st);
               await unfollow({ userId: headerData.patientData?.id });
               break;
            default:
               st.followView.show = provider.id !== user.id;
               st.followView.loadSubmission = provider.id !== user.id;
               st.careTeam.show = false;
               st.showAddProvView = false;
               st.showAddTeamView = false;
               setstate(st);
               let prov = st.followView.selectedProv || user;
               let obj = {
                  isAddToCareTeam: true,
                  userId: headerData.patientData?.id,
                  slug: provider?.slug || "",
                  type: "provider",
                  email: prov.email,
                  enterpriseId: prov.enterpriseId,
                  subscription: state.followView.selectedOpt.hour,
               };
               await addProviderToCareaTeam(obj);
               st.followView.show = false;
               st.followView.loadSubmission = false;
               st.followView.selectedProv = null;
               st.careTeamView.show = false;
               st.showAddProvView = false;
               st.showAddTeamView = false;
               setstate(st);
               if (provider.id !== user.id) {
                  toast(<ToastView text={`Added ${provider?.name} to the care team.`} />, defaultToastProps);
               }
               break;
         }
         fetchPatientData(true);
         getTeamInfo();
         setstate({
            ...st,
            loadfollowbutton: false,
            showAddProvView: false,
            showAddTeamView: false,
         });
      } catch (error) {
         setstate(state);
      }
   };

   const showRemovePopup = (obj) => {
      swal(
         <AlertView
            showClose={false}
            titleText="Confirm"
            contentText={`Are you sure you want to remove ${obj.id === user.id ? "yourself" : obj.name} from this ${
               care ? "care team" : "Family/Friends"
            }?`}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") changeFollowStatus(-1, obj);
            }}
         />,
         { buttons: false }
      );
   };

   const addToCareTeam = (data) => {
      setInnerState("addFriendView", { data: data, loadSubmission: true });
      let body = {
         name: data.name,
         email: data.email,
         mobileNo: data.mobileNo,
         userId: headerData.patientData?.id,
         fromAddressBook: false,
      };
      addFriendToCareTeam(body)
         .then(async () => {
            getTeamInfo();
            setstate({
               ...state,
               addFriendView: { data: null, show: false, loadSubmission: false },
               careTeamView: { show: false },
            });
            toast(<ToastView text={`Added ${body.name} to the care team.`} />, defaultToastProps);
         })
         .catch((error) => {
            setstate({
               ...state,
               addFriendView: { data: null, show: false, loadSubmission: false },
               careTeamView: { show: false },
            });
            let err = error.data.settings.message || "Something went wrong.";
            toast(<ToastView type="error" text={err} />, defaultToastProps);
         });
   };

   const addMemberToTeam = async (data) => {
      const id = eachTeam?.id;

      addTeamMember({
         id,
         addmembers: data?.map((s) => {
            return s?.data?.contactInformation?.email;
         }),
      })
         .then(() => {
            toast(<ToastView text={`Added to the ${eachTeam?.name}'s team.`} />, defaultToastProps);
            setstate({ ...state, showAddProvView: false });
            getTeamList(1);
         })
         .catch((error) => {
            let err = error?.data?.settings?.message || "Something went wrong.";
            toast(<ToastView type="error" text={err} />, defaultToastProps);
            setstate({ ...state, showAddProvView: false });
         });
   };
   return (
      <div className={` ${className} ${state.isloading ? "loading-shade" : ""}`}>
         {teamSection ? (
            <TableView
               teamSection={teamSection}
               state={state}
               isLoading={care ? state.careTeam.isLoading : state.familyFriends.isLoading}
               removeTapped={showRemovePopup}
            />
         ) : (
            <TableView
               showProviderDetails={(val) => {
                  setInnerState("careTeamView", {
                     show: false,
                     providerInfo: val,
                  });
               }}
               state={state}
               care={care}
               isLoading={care ? state.careTeam.isLoading : state.familyFriends.isLoading}
               posts={
                  care
                     ? state.careTeam.listToShow.filter((filter) => {
                          return filter.name ? filter.name.toLowerCase().includes(searchKey.toLowerCase()) : true;
                       })
                     : state.familyFriends.listToShow.filter((filter) => {
                          return filter.name ? filter.name.toLowerCase().includes(searchKey.toLowerCase()) : true;
                       })
               }
               removeTapped={showRemovePopup}
               // removingId={state.careTeamView.removingId}
               // removeTapped={showRemovePopup}
               // onClick={(obj) => {
               //   if (!state.careTeamView.isFamily) {
               //     setInnerState("careTeamView", {
               //       show: false,
               //       providerInfo: obj,
               //     });
               //   }
               // }}
               // addNewTapped={() => {
               //   let st = { ...state };
               //   if (st.careTeamView.isFamily) {
               //     st.addFriendView.show = true;
               //     st.careTeamView.show = false;
               //   } else {
               //     st.showAddProvView = true;
               //     st.showAddTeamView = true;
               //   }
               //   // setInnerState("careTeamView", { show: false });
               //   setstate(st);
               // }}
            />
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
                     changeFollowStatus(1, state.followView.selectedProv || user);
                     setstate({
                        ...state,
                        showAddProvView: false,
                        showAddTeamView: false,
                     });
                  }}
                  onOptSelect={(o) => setInnerState("followView", { selectedOpt: o })}
               />
            </ModalPopup>
         ) : null}

         {state.careTeamView?.providerInfo ? (
            <ModalPopup onModalTapped={() => setInnerState("careTeamView", { show: false, providerInfo: null })}>
               <ProviderInfoView
                  ctProvInfo={ctProvInfo}
                  onRemove={() => showRemovePopup(ctProvInfo)}
                  onCancel={() =>
                     setInnerState("careTeamView", {
                        show: false,
                        providerInfo: null,
                     })
                  }
               />
            </ModalPopup>
         ) : null}

         {state.showAddProvView ? (
            <ModalPopup
               id={teamSection ? pendoIds.btnAddProviderToClinicalTeamModal : pendoIds.btnAddProviderToCareTeamModal}
               onModalTapped={() => setstate({ ...state, showAddProvView: false })}
            >
               <AddProviderView
                  buttonId={
                     teamSection ? pendoIds.btnAddProviderToClinicalTeamModal : pendoIds.btnAddProviderToCareTeamModal
                  }
                  closeTapped={() => setstate({ ...state, showAddProvView: false })}
                  enterpriseId={user.enterpriseId}
                  teamSection={teamSection}
                  teamName={eachTeam?.name}
                  sendTapped={(prov) =>
                     teamSection
                        ? addMemberToTeam(prov)
                        : setInnerState("followView", {
                             selectedProv: prov,
                             show: true,
                          })
                  }
               />
            </ModalPopup>
         ) : null}

         {state.addFriendView.show ? (
            <ModalPopup
               id={pendoIds.btnInviteFamilyFriendsToCareTeamModal}
               onModalTapped={() => {
                  setInnerState("addFriendView", { data: null, show: false });
               }}
            >
               <AddFriendView
                  buttonId={pendoIds.btnInviteFamilyFriendsToCareTeamModal}
                  onCancel={() => setInnerState("addFriendView", { data: null, show: false })}
                  loading={state.addFriendView.loadSubmission}
                  onConfirm={(data) => addToCareTeam(data)}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}
export default memo(ProfileHeader);
