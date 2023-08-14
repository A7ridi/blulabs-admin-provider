import React, { memo, useMemo, useState } from "react";
import Avatar from "../../../components/newcomponents/avatar/Avatar";
import { connect } from "react-redux";
import { isValidMob, formatPhoneNumber } from "../../../helper/CommonFuncs";
import EditNameView from "./EditNameView";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import EditMobileEmailView from "./EditMobileEmailView";
import EditPhotoView from "./EditPhotoView";
import "firebase/auth";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../components/newcomponents/ToastView";
import "react-toastify/dist/ReactToastify.css";
import AlertView from "../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import EditProviderDegree from "./editTitleDegree";
import { bindActionCreators } from "redux";
import * as actions from "../../../redux/actions/auth.action";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import { checkProviderName } from "./actions/editProfileActions";
import { useMutation } from "@apollo/client";
import { UPDATE_PROFILE_IMG } from "../NotificationSettingsModule/actions/notificationSettingsAction";
import { ShowAlert } from "../../../common/alert";
import { errorToDisplay } from "../careTeamModule/action/careTeamAction";

function EditProfile(props) {
   const { auth, loggedInProviderDetails } = props;
   const user = auth?.userCredentials?.user;
   const [deleteProfileImage] = useMutation(UPDATE_PROFILE_IMG, {
      onCompleted(data) {
         ShowAlert(data?.updateProfileImage?.message);
         setTimeout(() => {
            window.location.href = window.location.href;
         }, 1000);
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
      },
   });

   const [state, setState] = useState({
      name: "",
      profilePic: null,
      email: props.userCredentials?.email,
      mobileNumber: props.userCredentials?.mobileNo,
      showEditNameView: false,
      showEditMobileEmailView: false,
      showEditPhotoView: false,
      isEmailView: false,
      showDelete: false,
      picPath: "",
      imageError: false,
   });
   const [isImageAvailable, setIsImageAvailable] = useState(false);
   const [disabledEditButton, setDisabledButton] = useState(true);
   const [showEditDegreeTitle, setShowEditDegreeTitle] = useState(false);
   const [showEditName, setShowEditName] = useState(false);
   const [showDP, setShowDP] = useState(false);

   const initialsApi = loggedInProviderDetails?.initials || false;
   const color = loggedInProviderDetails?.colorCode || window.initialColors[0];
   const firstName = checkProviderName(loggedInProviderDetails?.fullName?.firstName);
   const middleName = checkProviderName(loggedInProviderDetails?.fullName?.middleName);
   const lastName = loggedInProviderDetails?.fullName?.lastName || "";
   const name = firstName + middleName + lastName;
   const degree = loggedInProviderDetails?.degree ? loggedInProviderDetails?.degree : "- -";
   const title = loggedInProviderDetails?.title ? loggedInProviderDetails?.title : "";
   const department = loggedInProviderDetails?.departmentName ? loggedInProviderDetails?.departmentName : "";
   const userSettings = loggedInProviderDetails?.providerInfo;
   const number = loggedInProviderDetails?.mobileNo || "";
   const email = loggedInProviderDetails?.email || "";
   const closeEditNameModal = () => {
      setShowEditName(!showEditName);
   };

   const openEditMobileEmailView = (popupKey) => {
      setState({
         ...state,
         showEditMobileEmailView: true,
         isEmailView: popupKey ? true : false,
      });
   };
   const closeEditMobileEmailView = (messageType) => {
      showAlertMessage(messageType);
      setState({ ...state, showEditMobileEmailView: false });
   };
   const openEditPhotoView = () => {
      setState({ ...state, showEditPhotoView: true });
      setShowDP(true);
   };
   const closeEditPhotoView = (photoPath) => {
      setState({
         ...state,
         showEditPhotoView: false,
         showDelete: isImageAvailable,
      });
   };

   const showAlertMessage = (message) => {
      if (message) {
         if (message === "success") {
            toast(<ToastView text="Provider updated successfully." />, defaultToastProps);
         } else {
            toast(<ToastView text="Something went wrong!" type="error" />, defaultToastProps);
         }
      }
   };

   const imageFetched = () => {
      if (state.imageError) return;
      setDisabledButton(false);
      setIsImageAvailable(true);
   };
   const id = useMemo(() => {
      return `${process.env.REACT_APP_PROFILE_URL}/${props.userCredentials?.id}?ver=${Math.random()}`;
   }, [props.userCredentials?.id]);

   return (
      <div className="w-100 h-100 flex-center overflow-auto ">
         <div style={{ height: "600px", width: "500px" }}>
            <div className="text-large w-100 my-5">Settings</div>
            <div className="flex-center flex-column">
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Name</div>
                  <div className="flex-center">
                     <div className="text-medium font-bold text-grey5 mx-3">{name}</div>
                     <button
                        id={pendoIds.btnEditProviderName}
                        className="text-medium link2 pointer"
                        onClick={closeEditNameModal}
                     >
                        Edit
                     </button>
                  </div>
               </div>
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Photo</div>
                  <div className="flex-center">
                     <div className="text-medium font-bold text-grey5 mx-3">
                        {loggedInProviderDetails?.id && (
                           <Avatar
                              errorImage={() => {
                                 setState({ ...state, imageError: true });
                                 setDisabledButton(false);
                              }}
                              isImageAvailable={isImageAvailable}
                              src={id}
                              className="flex-shrink-0 pointer"
                              bgColor={color}
                              radius={40}
                              name={name}
                              initialsApi={initialsApi}
                              gotImage={imageFetched}
                              isProvider={true}
                           />
                        )}
                     </div>
                     <button
                        id={pendoIds.btnEditProviderPhoto}
                        disabled={disabledEditButton}
                        className={`text-medium link2 ${state.showDelete ? "mr-3" : ""} pointer`}
                        onClick={() => openEditPhotoView()}
                     >
                        Edit
                     </button>
                  </div>
               </div>
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Email</div>
                  <div className="flex-center">
                     <div className="text-medium font-bold text-grey5 mx-3">{email}</div>
                     <button
                        id={pendoIds.btnEditProviderEmailInfo}
                        className="text-medium link2 pointer"
                        onClick={() => openEditMobileEmailView(true)}
                     >
                        Edit
                     </button>
                  </div>
               </div>
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Mobile Number</div>
                  <div className="flex-center">
                     <div className="text-medium font-bold text-grey5 mx-3">
                        {isValidMob(number) ? formatPhoneNumber(number) : "-"}
                     </div>
                     <button
                        id={pendoIds.btnEditProviderPhoneInfo}
                        className="text-medium link2 pointer"
                        onClick={() => openEditMobileEmailView(false)}
                     >
                        Edit
                     </button>
                  </div>
               </div>
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Department</div>
                  <div className="flex-center">
                     <div
                        title={department}
                        style={{ maxWidth: "200px" }}
                        className="text-medium font-bold text-grey5 mx-3 text-truncate "
                     >
                        {department}
                     </div>
                     <button
                        id={pendoIds.btnEditProviderPhoneInfo}
                        className="text-medium link2 pointer"
                        onClick={() => setShowEditDegreeTitle(true)}
                     >
                        Edit
                     </button>
                  </div>
               </div>
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Suffix</div>
                  <div className="flex-center">
                     <div
                        title={title}
                        style={{ maxWidth: "200px" }}
                        className="text-medium font-bold text-grey5 mx-3 text-truncate "
                     >
                        {degree}
                     </div>
                     <button
                        id={pendoIds.btnEditProviderPhoneInfo}
                        className="text-medium link2 pointer"
                        onClick={() => setShowEditDegreeTitle(true)}
                     >
                        Edit
                     </button>
                  </div>
               </div>{" "}
               <div className="separator w-100"></div>
               <div className="w-100 flex-center justify-content-between my-5 ">
                  <div className="text-medium font-bold text-grey5">Title</div>
                  <div className="flex-center">
                     <div
                        title={title}
                        style={{ maxWidth: "200px" }}
                        className="text-medium font-bold text-grey5 mx-3 text-truncate "
                     >
                        {title}
                     </div>
                     <button
                        id={pendoIds.btnEditProviderPhoneInfo}
                        className="text-medium link2 pointer"
                        onClick={() => setShowEditDegreeTitle(true)}
                     >
                        Edit
                     </button>
                  </div>
               </div>
            </div>
         </div>
         {showEditName && (
            <ModalPopup id={pendoIds.btnEditProviderNameModal} onModalTapped={closeEditNameModal}>
               <EditNameView
                  buttonId={pendoIds.btnEditProviderNameModal}
                  providerName={loggedInProviderDetails}
                  onModalTapped={closeEditNameModal}
               />
            </ModalPopup>
         )}
         {state.showEditMobileEmailView ? (
            <ModalPopup
               id={state.isEmailView ? pendoIds.btnUpdateProviderEmailModal : pendoIds.btnUpdateProviderMobileModal}
               onModalTapped={() => closeEditMobileEmailView()}
            >
               <EditMobileEmailView
                  buttonId={
                     state.isEmailView ? pendoIds.btnUpdateProviderEmailModal : pendoIds.btnUpdateProviderMobileModal
                  }
                  close={closeEditMobileEmailView}
                  isEmailTrue={state.isEmailView}
                  email={email}
                  mobile={number}
                  userSettings={userSettings}
               />
            </ModalPopup>
         ) : null}
         {state.showEditPhotoView && (
            <ModalPopup id="edit-provider-photo-view" onModalTapped={() => closeEditPhotoView()}>
               <EditPhotoView
                  close={closeEditPhotoView}
                  imageUrl={`${process.env.REACT_APP_PROFILE_URL}/${props.userCredentials?.id}?ver=${Math.random()}`}
                  isImageAvailable={isImageAvailable}
                  showDP={showDP}
                  setShowDP={setShowDP}
                  deleteProfilePhoto={(id) => {
                     swal(
                        <AlertView
                           showClose={false}
                           confirmText="Delete"
                           titleText="Confirm"
                           contentText={`Are you sure you want to delete your account photo?`}
                           onAction={(btnData) => {
                              swal.close();
                              if (btnData.id === "alert-confirm-button") {
                                 const payload = {
                                    variables: {
                                       updateProfileImageId: id,
                                       operationType: "delete",
                                    },
                                 };
                                 deleteProfileImage(payload);
                              }
                           }}
                        />,
                        { buttons: false }
                     );
                  }}
               />
            </ModalPopup>
         )}
         {showEditDegreeTitle && (
            <EditProviderDegree
               close={() => {
                  setShowEditDegreeTitle(false);
               }}
            />
         )}
      </div>
   );
}
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         savenorthwelluserobj: actions.savenorthwelluserobj,
         saveusercredentials: actions.saveusercredentials,
      },
      dispatch
   );
};

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials.user,
      fbUser: state.auth.northwelluser?.user,
      auth: state.auth,
      loggedInProviderDetails: state.auth.loggedInProviderDetails,
   };
};

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditProfile));
