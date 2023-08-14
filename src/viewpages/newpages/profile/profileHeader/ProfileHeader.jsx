import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import DropdownToggle from "../../../../components/newcomponents/DropdownToggle";
import { getFormattedDate, formatPhoneNumber, isValidEmail, isValidMob } from "../../../../helper/CommonFuncs";
import {
   addProviderToCareaTeam,
   unfollow,
   removeFromCareaTeam,
   addFriendToCareTeam,
} from "../../../../Apimanager/Networking";
import "./ProfileHeader.css";
import Avatar from "../../../../components/newcomponents/avatar/Avatar";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import "react-toastify/dist/ReactToastify.css";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import FollowView from "../profileHeader/FollowView";
import ContactView from "../../../../components/newcomponents/ContactView";
import CareTeamView from "./CareTeamView";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../../components/newcomponents/ToastView";
import { AddProviderView, AddFriendView } from "../addToCareTeam";
import ProviderInfoView from "./ProviderInfoView";
import editIcon from "../../../../images/dashboard-action-icons/edit-grey-icon.svg";
import videoIcon from "../../../../images/dashboard-action-icons/video-grey-icon.svg";
import referIcon from "../../../../images/dashboard-action-icons/pbconnect-grey-icon.svg";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";

let profileUrl = process.env.REACT_APP_PROFILE_URL;

const getStatusAndNorthwellData = (pData, accessToken, callback) => {
   if (!pData) {
      callback();
      return;
   }
   let onboardingStatusParams = {
      Authorization: `Bearer ${accessToken}`,
      action: socketActions.referral,
      subAction: socketSubActions.onBoardingStatus,
      patientId: pData.id,
   };
   window.socket.send(onboardingStatusParams, (resultStatus) => {
      let states = {};
      states = {
         onboardingStatus: resultStatus.data?.status?.toLowerCase(),
      };
      if (pData.healthSystemData?.Northwell) {
         window.socket.send(
            {
               action: socketActions.northwell,
               subAction: socketSubActions.getPatientLocationNorthwell,
               Authorization: `Bearer ${accessToken}`,
               mrn: pData.mrnData.mrn,
               IdentifierSource: pData.mrnData.authority,
            },
            (result) => {
               states = {
                  ...states,
                  roomDetails: result.data,
                  loadingRoomData: false,
               };
               callback(states);
            }
         );
      } else callback(states);
   });
};

function ProfileHeader(props) {
   const { className, notif, onOptTapped, headerData, user, getCareteamData, createContentTapped, accessToken } = props;
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
      addFriendView: {
         show: false,
         data: null,
         loadSubmission: false,
      },
      // showCreateContent: false,
      loadfollowbutton: false,
      ...headerData,
   });

   useEffect(() => {
      if (!state.patientData) return;
      getStatusAndNorthwellData(headerData.patientData, accessToken, (states) => {
         if (headerData.patientData && headerData.patientData?.id === state.patientData?.id && !state.isloading)
            setstate({ ...state, ...states });
      });
   }, [state?.patientData]);

   useEffect(() => {
      if (JSON.stringify(headerData?.patientData) !== JSON.stringify(state?.patientData)) {
         setstate({ ...state, ...headerData });
      }
   });

   useEffect(() => {
      if (headerData?.isloading) {
         setstate({ ...state, ...headerData });
         return;
      }
      initHeaderState.current = { ...headerData };
      let st = { ...state, ...headerData };
      setstate(st);
      if (notif && notif.patientUser?.id === props.match.params?.id) {
         st.careTeamView.show = true;
         st.careTeamView.isFamily = notif.type === "care";
         setstate({ ...st });
      }
   }, [headerData.patientData?.id]);

   useEffect(() => {
      if (state.careTeam.length === 0) return;
      let provStatus = state.careTeam?.find((o) => o.id === user.id);
      setstate({
         ...state,
         followStatus: !provStatus ? -1 : provStatus.isSubscribed ? 1 : 0,
      });
   }, [state.careTeam]);

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

   const getName = useMemo(
      () =>
         state.patientData?.name ||
         state.patientData?.email ||
         formatPhoneNumber(state.patientData?.mobileNo) ||
         "Patient",
      [state.patientData]
   );

   const ctProvInfo = useMemo(() => state.careTeamView.providerInfo, [state.careTeamView.providerInfo]);

   const followTapped = () => {
      state.followStatus === 1
         ? changeFollowStatus(0, user)
         : setInnerState("followView", { show: !state.followView.show });
      runCareTeam();
   };

   const runCareTeam = async (param = true) => {
      let obj = await getCareteamData(param);

      return {
         careTeam: obj.careTeam,
         followStatus: obj.followStatus,
         loadfollowbutton: false,
      };
   };

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
                  userId: headerData.patientData.id,
               };
               st.careTeamView.removingId = provider.id;
               setstate(st);
               await removeFromCareaTeam(params);
               st.careTeamView.removingId = "";
               if (provider.id !== user.id) {
                  toast(<ToastView text={`Removed ${provider?.name} from the care team.`} />, defaultToastProps);
               }
               break;
            case 0:
               setstate(st);
               await unfollow({ userId: state.patientData.id });
               break;
            default:
               st.followView.show = provider.id !== user.id;
               st.followView.loadSubmission = provider.id !== user.id;
               st.careTeam.show = false;
               st.showAddProvView = false;
               setstate(st);
               let prov = st.followView.selectedProv || user;
               let obj = {
                  isAddToCareTeam: true,
                  userId: state.patientData.id,
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
               setstate(st);
               if (provider.id !== user.id) {
                  toast(<ToastView text={`Added ${provider?.name} to the care team.`} />, defaultToastProps);
               }
               break;
         }
         let careTeam = await runCareTeam();
         setstate({ ...st, ...careTeam, loadfollowbutton: false });
      } catch (error) {
         setstate(state);
      }
   };

   const getFollowData = useMemo(() => {
      switch (state.followStatus) {
         case 0:
            return { cls: "follow bg-light-grey-100", text: "Follow" };
         case 1:
            return { cls: "unfollow btn-bordered", text: "Unfollow" };
         default:
            //-1
            return { cls: "add bg-light-grey-100", text: "Add yourself" };
      }
   }, [state.followStatus]);

   const showRemovePopup = (obj) => {
      swal(
         <AlertView
            showClose={false}
            titleText="Confirm"
            contentText={`Are you sure you want to remove ${
               obj.id === user.id ? "yourself" : obj.name
            } from this care team?`}
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
         userId: headerData.patientData.id,
         fromAddressBook: false,
      };
      addFriendToCareTeam(body)
         .then(async () => {
            let obj = await getCareteamData(false);
            setstate({
               ...state,
               familyFriends: obj.familyFriends,
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

   return (
      <div
         className={`ProfileHeader pt-4 pb-4 shadow round-border-m ${className} ${
            state.isloading ? "loading-shade" : ""
         }`}
      >
         <div
            className={`${
               !state.patientData && !state.isloading ? "d-none" : ""
            } flex-center flex-column align-items-start justify-content-between`}
         >
            <div className="row w-100 flex-center align-items-start">
               <div className="row col-md-12 col-lg-9 flex-center align-items-start">
                  <div className="d-flex details-div col-xl-6 col-lg-9 col-md-12 p-0 pl-2 align-items-start">
                     <Avatar
                        className="flex-shrink-0"
                        radius={84}
                        name={getName}
                        status={state.onboardingStatus}
                        bgColor={window.initialColors[0]}
                        src={state.patientData?.id ? `${profileUrl}/${state.patientData?.id}` : null}
                     />
                     <div className="ml-4 overflow-hidden">
                        <div className="patient-name-div text-truncate">{getName}</div>
                        <div className="detail">
                           <span>DOB: </span>
                           {state.patientData?.dob ? getFormattedDate(state.patientData?.dob) : "--/--/----"}
                        </div>
                        <div className="detail">
                           <span>MRN: </span>
                           {state.patientData?.mrnData.mrn || "-"}
                        </div>
                     </div>
                  </div>
                  <div className="col-xl-6 col-lg-9 col-md-12 mb-3">
                     <div className="actions-div w-100 d-flex justify-content-around p-0 flex-shrink-0">
                        <button
                           className="h-100 content flex-center round-border-s text-small btn-default d-block py-2 text-truncate"
                           onClick={createContentTapped}
                        >
                           Create Content
                        </button>
                        <button
                           disabled={state.loadfollowbutton}
                           className={`px-3 py-2 ${state.loadfollowbutton ? "loader" : ""} ${
                              getFollowData.cls
                           } mx-3 flex-center text-small h-100 round-border-s`}
                           onClick={followTapped}
                        >
                           {getFollowData.text}
                        </button>
                        <DropdownToggle
                           className="h-100 options-view"
                           menuViewCls="shadow no-border round-border-m py-4"
                           id="profile-header-actions"
                           onOptTapped={onOptTapped}
                           options={[
                              {
                                 text: "Video Call",
                                 leftImg: videoIcon,
                                 cls: "mb-2",
                              },
                              {
                                 text: "Playback Connect",
                                 leftImg: referIcon,
                                 cls: "mb-2",
                              },
                              {
                                 text: "Edit",
                                 leftImg: editIcon,
                                 cls: "mb-2",
                              },
                              // {
                              //   text: "Link to EMR",
                              //   leftImg: "/assets/images/newimages/emr-connect-icon.svg",
                              // },
                           ]}
                        >
                           <img
                              className="h-100 menu ml-2 flex-grow-1 flex-shrink-0 bg-light-grey-100 round-border-s pointer"
                              data-toggle="dropdown"
                              src="/assets/images/newimages/dots-h.svg"
                              alt="Profile Actions"
                           />
                        </DropdownToggle>
                        <div className="flex-grow-1" />
                     </div>
                     <div className="d-flex mt-4">
                        <button
                           className="text-normal mr-5 link"
                           onClick={() =>
                              setInnerState("careTeamView", {
                                 show: true,
                                 isFamily: false,
                              })
                           }
                        >
                           <span className="h4">{state.careTeam?.length || 0} </span>
                           Care Team
                        </button>
                        <button
                           className="text-normal link"
                           onClick={() =>
                              setInnerState("careTeamView", {
                                 show: true,
                                 isFamily: true,
                              })
                           }
                        >
                           <span className="h4">{state.familyFriends?.length} </span>
                           Family/Friends
                        </button>
                     </div>
                  </div>
               </div>
               <div className="contact-div w-100 d-flex flex-shrink-0 flex-column col-md-12 col-lg-3">
                  <ContactView
                     src="/assets/images/newimages/mail.svg"
                     title="Email"
                     valueView={() => {
                        if (state.patientData?.email) {
                           return (
                              <div
                                 className={`${state.patientData?.email.length > 0 ? "link pointer" : ""}`}
                                 onClick={() => {
                                    if (state.patientData?.email.length > 0) {
                                       window.location.href = `mailto:${state.patientData?.email}`;
                                    }
                                 }}
                              >
                                 {state.patientData?.email !== null &&
                                 state.patientData?.email !== undefined &&
                                 state.patientData?.email.length > 0 &&
                                 isValidEmail(state.patientData?.email)
                                    ? state.patientData.email
                                    : "-"}
                              </div>
                           );
                        } else return <div>{"-"}</div>;
                     }}
                  />
                  <ContactView
                     src="/assets/images/newimages/phone.svg"
                     title="Phone"
                     valueView={() => {
                        if (state.patientData?.mobileNo) {
                           return (
                              <div
                                 className="link pointer"
                                 onClick={() => (window.location.href = `tel:${state.patientData?.mobileNo}`)}
                              >
                                 {isValidMob(state.patientData?.mobileNo)
                                    ? formatPhoneNumber(state.patientData.mobileNo)
                                    : "-"}
                              </div>
                           );
                        }
                     }}
                     // value={
                     //   isValidMob(state.patientData?.mobileNo)
                     //     ? formatPhoneNumber(state.patientData.mobileNo)
                     //     : "-"
                     // }
                  />
               </div>
            </div>
            {state.patientData?.mrnData.isNorthwellUser && state.roomDetails ? (
               <div
                  className={`text-small round-border-m location-div p-3 flex-center ${
                     state.isloading ? "loading-shade" : ""
                  }`}
               >
                  <div className="text-grey mx-4">{state.roomDetails?.assignedWard}</div>
                  <div className="text-grey mx-4">Room No {state.roomDetails?.room}</div>
                  <div className="text-grey mx-4">Bed No {state.roomDetails?.bedNumber}</div>
               </div>
            ) : null}
         </div>
         {state.followView.show ? (
            <ModalPopup
               id={pendoIds.btnUpdateFollowStatusModal}
               onModalTapped={() => setInnerState("followView", { show: false })}
            >
               <FollowView
                  buttonId={pendoIds.btnUpdateFollowStatusModal}
                  onCancel={() => setInnerState("followView", { show: false })}
                  followViewData={state.followView}
                  onConfirm={() => changeFollowStatus(1, state.followView.selectedProv || user)}
                  onOptSelect={(o) => setInnerState("followView", { selectedOpt: o })}
               />
            </ModalPopup>
         ) : null}
         {state.careTeamView.show ? (
            <ModalPopup onModalTapped={() => setInnerState("careTeamView", { show: false })}>
               <CareTeamView
                  onClose={() => setInnerState("careTeamView", { show: false })}
                  careTeamData={state.careTeamView}
                  list={state.careTeamView.isFamily ? state.familyFriends : state.careTeam}
                  removingId={state.careTeamView.removingId}
                  removeTapped={showRemovePopup}
                  onClick={(obj) => {
                     if (!state.careTeamView.isFamily) {
                        setInnerState("careTeamView", {
                           show: false,
                           providerInfo: obj,
                        });
                     }
                  }}
                  addNewTapped={() => {
                     let st = { ...state };
                     if (st.careTeamView.isFamily) {
                        st.addFriendView.show = true;
                        st.careTeamView.show = false;
                     } else {
                        st.showAddProvView = true;
                     }
                     // setInnerState("careTeamView", { show: false });
                     setstate(st);
                  }}
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
               id={pendoIds.btnAddProviderToCareTeamModal}
               onModalTapped={() => setstate({ ...state, showAddProvView: false })}
            >
               <AddProviderView
                  buttonId={pendoIds.btnAddProviderToCareTeamModal}
                  closeTapped={() => setstate({ ...state, showAddProvView: false })}
                  enterpriseId={user.enterpriseId}
                  sendTapped={(prov) => setInnerState("followView", { selectedProv: prov, show: true })}
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
