import React, { useState, useCallback, Fragment } from "react";
import getCroppedImg from "./actions/cropImageAction";
import Cropper from "react-easy-crop";

const CropPhotoView = (props) => {
   const {
      profilePicPath = "",
      fileName = "",
      isPhotoSelected,
      croppedImage,
      initialState,
      setImagePersist,
      userId,
      deleteProfilePhoto,
      updateProfilePhoto,
      setShowDP,
   } = props;
   const initialCropSize = {
      x: 0,
      y: 0,
      width: 75,
      height: 100,
   };
   const [crop, setCrop] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

   const [cropSize, setCropSize] = useState(initialCropSize);

   const onCropComplete = (croppedArea, croppedAreaPixels, e) => {
      setCropSize(e);
      setCroppedAreaPixels(croppedAreaPixels);
   };

   const showCroppedImage = useCallback(async () => {
      try {
         const croppedImage = await getCroppedImg(
            profilePicPath,
            croppedAreaPixels,
            null,
            { horizontal: false, vertical: false },
            fileName
         );
         return croppedImage;
      } catch (e) {
         console.error(e);
      }
   }, [croppedAreaPixels]);
   return (
      <Fragment className={`${isPhotoSelected && "d-flex flex-column"}`}>
         {isPhotoSelected && (
            <>
               <div className="cropContainer">
                  <Cropper
                     image={croppedImage || profilePicPath}
                     crop={crop}
                     zoom={zoom}
                     aspect={1}
                     cropShape="round"
                     onCropChange={setCrop}
                     onCropComplete={onCropComplete}
                     onZoomChange={setZoom}
                  />
               </div>
               <div
                  className="cropControls d-flex align-items-center gap-3"
                  style={{ width: "67%", bottom: "92px", gap: "15px", position: "absolute" }}
               >
                  <h4 className="zoom-text">Zoom</h4>
                  <input
                     type="range"
                     min={1}
                     max={20}
                     value={zoom}
                     class="slider"
                     id="myRange"
                     aria-labelledby="Zoom"
                     onChange={(e) => setZoom(parseInt(e.target.value, 10))}
                  />
               </div>
            </>
         )}
         <div className="mb-4 flex-center position-absolute" style={{ bottom: "20px" }}>
            <button
               onClick={() => {
                  if (!isPhotoSelected) {
                     deleteProfilePhoto(userId);
                  } else {
                     setImagePersist(false);
                     initialState();
                  }
               }}
               for="exampleInput"
               className="mx-3  btn-default-capture bg-disabled text-black round-border-s text-normal text-grey5 text-bold"
            >
               {!isPhotoSelected ? "Remove" : "Change photo"}
            </button>

            <button
               className={`mx-3 flex-center btn-default-capture round-border-s text-normal`}
               onClick={async () => {
                  if (!isPhotoSelected) {
                     setImagePersist(false);
                     initialState();
                  } else {
                     if (cropSize !== initialCropSize) {
                        await showCroppedImage().then((res) => {
                           updateProfilePhoto(res);
                           setShowDP(true);
                        });
                     } else updateProfilePhoto();
                  }
               }}
            >
               {!isPhotoSelected ? "Change Photo" : "Save"}
            </button>
         </div>
      </Fragment>
   );
};

export default CropPhotoView;
