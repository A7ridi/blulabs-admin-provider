import React, { memo, useState } from "react";
import { connect } from "react-redux";
import axios from "axios";
import WebCam from "../../../components/webCam/webCam";
import { useMutation } from "@apollo/client";
import { UPDATE_PROFILE_IMG } from "../NotificationSettingsModule/actions/notificationSettingsAction";
import { errorToDisplay } from "../../../helper/CommonFuncs";
import { ShowAlert } from "../../../common/alert";
import CropPhotoView from "./CropPhotoView";
import ShowImage from "./ShowImage";
import LoadingIndicator from "../../../common/LoadingIndicator";

function EditPhotoView(props) {
   const { close, isImageAvailable, imageUrl, deleteProfilePhoto, showDP, setShowDP, loggedInProviderDetails } = props;
   const [state, setState] = useState({
      profilePic: null,
      uploading: false,
   });
   const [croppedImage, setCroppedImage] = useState(null);
   const [imagePersist, setImagePersist] = useState(isImageAvailable);

   const [updateProfileImage] = useMutation(UPDATE_PROFILE_IMG, {
      onCompleted(data) {
         const signedUrl = data?.updateProfileImage?.url;
         axios
            .put(signedUrl, croppedImage?.file, {
               headers: { "Content-Type": state.profilePic.file.type || "image/jpeg" },
            })
            .then((res) => {
               ShowAlert("Profile image updated successfully");
               setTimeout(() => {
                  window.location.href = window.location.href;
               }, 500);
            })
            .catch((err) => {
               setState({
                  ...state,
                  uploading: false,
               });
               ShowAlert("Error uploading profile picture", "error");
            });
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
      },
   });

   const getImage = (e) => {
      if (e && e.target.files && e.target.files[0]) {
         let reader = new FileReader();
         let file = e.target.files[0];
         let url = URL.createObjectURL(file);
         reader.onload = (fileres) => {
            setState({
               ...state,
               profilePic: {
                  file: file,
                  path: url,
               },
            });
            setImagePersist(true);
         };
         reader.readAsDataURL(e.target.files[0]);
      } else {
         setState({ ...state, profilePic: null });
      }
   };

   const getImageCamera = (e) => {
      if (e) {
         let reader = new FileReader();
         let file = e;
         let url = URL.createObjectURL(file);

         reader.onload = (fileres) => {
            setState({
               ...state,
               profilePic: {
                  file: file,
                  path: url,
               },
            });
            setImagePersist(true);
         };
         reader.readAsDataURL(e);
      } else {
         setState({ ...state, profilePic: null });
      }
   };

   const updateProfilePhoto = async (profileImg = null) => {
      if (profileImg !== null) {
         setCroppedImage(profileImg);
         setState({
            ...state,
            uploading: true,
         });
      }
      let queryParams = {
         updateProfileImageId: loggedInProviderDetails?.id,
         operationType: "write",
      };
      updateProfileImage({ variables: queryParams });
   };
   const styleMainDiv = () => {
      if (state.profilePic?.path) {
         return { height: "449px", width: "475px" };
      } else if (imagePersist) return { height: "355px", width: "520px" };
      else return { width: "600px", height: "560px", overflowY: "hidden" };
   };
   const isPhotoSelected = state.profilePic?.path;
   const textToShow = !isPhotoSelected ? "Edit" : "Looking good!";
   return (
      <div>
         <div className="bg-white flex-center flex-column round-border-m " style={styleMainDiv()}>
            {imagePersist && (
               <>
                  <div className="flex-center w-xlarge title-degree-text mb-5">
                     <div className="text-grey5 text-medium text-bold">{textToShow}</div>
                  </div>
                  <div
                     className="text-grey5 pointer close-btn-title"
                     style={{ fontSize: "30px" }}
                     onClick={() => close && close()}
                  >
                     &times;
                  </div>
               </>
            )}
            {imagePersist ? (
               <div
                  className="w-100 h-100 flex-center flex-column"
                  style={{ width: "70% !important", marginTop: "-29px" }}
               >
                  {showDP && <ShowImage srcImg={croppedImage?.path || imageUrl} isPhotoSelected={isPhotoSelected} />}
                  {state.uploading ? (
                     <LoadingIndicator />
                  ) : (
                     <CropPhotoView
                        profilePicPath={state.profilePic?.path || imageUrl}
                        croppedImage={croppedImage}
                        fileName={state.profilePic?.file?.name}
                        isPhotoSelected={isPhotoSelected}
                        initialState={() =>
                           setState({
                              ...state,
                              profilePic: {
                                 file: null,
                                 path: null,
                              },
                           })
                        }
                        setImagePersist={() => setImagePersist(false)}
                        userId={loggedInProviderDetails?.id}
                        deleteProfilePhoto={deleteProfilePhoto}
                        updateProfilePhoto={updateProfilePhoto}
                        setShowDP={setShowDP}
                     />
                  )}
               </div>
            ) : (
               <WebCam
                  close={close}
                  clickImage={(file) => {
                     setShowDP(false);
                     getImageCamera(file);
                  }}
                  getImage={getImage}
                  setShowDP={setShowDP}
               />
            )}
         </div>
      </div>
   );
}
const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials.user,
      loggedInProviderDetails: state.auth.loggedInProviderDetails,
   };
};

export default connect(mapStateToProps)(memo(EditPhotoView));
