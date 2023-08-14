import React, { memo, useState, useMemo, useRef, useCallback, useEffect } from "react";
import SegmentView from "../../../../components/newcomponents/SegmentView/SegmentView";
import TitleTextView from "../../../../components/newcomponents/TitleTextView";
import CheckboxToggle from "../../../../components/newcomponents/CheckboxToggle/CheckboxToggle";
import { uploadmedia } from "../../../../Apimanager/Networking";
import { blueBtnCls, errorToDisplay } from "../../../../helper/CommonFuncs";
import axios from "axios";
import AlertView from "../../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import { MediaView, MessageView, ScreenRecordView, VideoRecordView, AudioRecordView } from "./subviews";
import "firebase/auth";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import LibraryShareView from "./shareLibrary";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import CreateContentDropdown from "./CreateContentDropdown";
import { ShowAlert } from "../../../../common/alert";
import { connect } from "react-redux";
import { CREATE_CONTENT } from "../../profileModule/actions/profileQueries";
import { useMutation } from "@apollo/client";

const segmentOptions = [
   {
      text: "Media",
      id: 1,
      pendoId: pendoIds.tabCreateMedia,
   },
   {
      text: "Message",
      id: 2,
      pendoId: pendoIds.tabCreateItem,
   },
   {
      text: "Screen Record",
      id: 3,
      pendoId: pendoIds.tabCreateScreenRecord,
   },
   {
      text: "Record Audio",
      id: 4,
      pendoId: pendoIds.tabCreateAudio,
   },
   {
      text: "Record Video",
      id: 5,
      pendoId: pendoIds.tabCreateVideo,
   },
   {
      text: "Library",
      id: 6,
      pendoId: pendoIds.tabLibrary,
   },
];

function CreateContent(props) {
   const {
      selectedPatient,
      createContentData,
      onClose,
      refetch,
      media,
      setMediaUpload,
      isProvider,
      userCredentials,
      buttonId,
      providerData,
      patientId,
      setCreateButtonIndex,
   } = props;
   const mediaUploadToken = useRef(null);
   const defMedia = {
      file: null,
      mediaUrl: null,
   };
   const [state, setstate] = useState({
      selectedSection: 0,
      media: defMedia,
      screenRec: defMedia,
      message: { value: "", mentions: [], originalDescription: "" },
      title: null,
      isProvOnly: isProvider,
      allowDownload: false,
      showAudioRecorder: false,
      showVidRecorder: false,
      isUploading: false,
   });

   const [searchProviderName, setSearchProviderName] = useState("");
   const [department, setDepartment] = useState(null);
   const [hospitalId, setHospitalId] = useState(null);

   const [createContent] = useMutation(CREATE_CONTENT, {
      onCompleted(res) {
         if (res.createContent?.signedUrl?.url) {
            uploadmediaProgress(res.createContent.signedUrl.url);
         } else {
            ShowAlert("Content shared successfully");
            onClose && onClose();
            refetch && refetch();
         }
      },
      onError(err) {
         setstate({ ...state, isUploading: false });
         ShowAlert(errorToDisplay(err), "error");
      },
   });

   useEffect(() => {
      if (media === null) return;
      setMedia(media, isProvider);
      setMediaUpload(null);
   }, [media]);

   const uploadmediaProgress = async (url) => {
      let file =
         state[
            state.selectedSection === 0 || state.selectedSection === 3 || state.selectedSection === 4
               ? "media"
               : "screenRec"
         ]?.file;
      mediaUploadToken.current = axios.CancelToken.source();
      let progBar = document.getElementById("create-content-progress-div");

      uploadmedia(url, file, mediaUploadToken.current, (progress) => {
         let prog = parseInt((progress / file.size) * 100);
         let text = prog.toFixed(2);
         if (progBar) {
            progBar.value = text;
         }
      })
         .then(() => {
            refetch && refetch();
            setstate({ ...state, isUploading: false });
            ShowAlert("Content shared successfully");
            onClose && onClose();
         })
         .catch((error) => {
            setstate({ ...state, isUploading: false });
            ShowAlert("Error sharing content", "error");
         });

      // if
   };

   const onChange = (e, _, __, list) => {
      const mentionTagsArray = list.filter((item) => item.display.startsWith("@"));
      state.message.value = e.target.value;
      state.message.mentions = mentionTagsArray;
      setstate({ ...state });
   };

   const setMedia = (file, isproviderOnly = false) => {
      document.getElementById("patient-list").style.opacity = "1";

      if (!file) {
         setstate((prev) => ({
            ...prev,
            isProvOnly: isproviderOnly ? isproviderOnly : state.isProvOnly,
            media: { ...prev.media, file: null, mediaUrl: null },
         }));
         return;
      }
      const reader = new FileReader();
      let mType = [state.selectedSection === 2 ? "screenRec" : "media"];
      reader.onload = function (evt) {
         state[mType].file = file;
         state[mType].mediaUrl = evt.target.result;
         setstate((prev) => ({
            ...prev,
            title:
               prev.selectedSection === 2 ? `Screen recording update from ${userCredentials.user.name} ` : file.name,
            isProvOnly: isproviderOnly ? isproviderOnly : prev.isProvOnly,
         }));

         document.getElementById("input-title-update").focus();
      };
      reader.readAsDataURL(file);
   };

   const onRecTapped = useCallback(
      (type) => {
         const set = () => {
            setstate({
               ...state,
               showAudioRecorder: false,
               showVidRecorder: false,
               media: { file: null, mediaUrl: null },
               [type === 0 ? "showAudioRecorder" : "showVidRecorder"]: true,
            });
         };
         if (state.media.file) {
            swal(
               <AlertView
                  titleText="Warning!"
                  contentText="Current media will be discarded"
                  onAction={(btn) => {
                     swal.close();
                     if (btn.id === "alert-confirm-button") set();
                  }}
               />,
               { buttons: false }
            );
         } else set();
      },
      [state]
   );

   const getSectionView = () => {
      switch (state.selectedSection) {
         case 0:
            return (
               <MediaView
                  shareAgain={() => {
                     setstate({
                        ...state,
                        media: { file: null, mediaUrl: null },
                        title: "",
                     });
                  }}
                  media={state.media}
                  onRecordTap={onRecTapped}
                  onMediaChange={(e) => setMedia(e.target.files[0])}
                  showProgress={state.isUploading}
                  onCancel={cancelUpload}
               />
            );
         case 1:
            const { fetched } = createContentData;
            return (
               <div className={`${!fetched ? "loading-shade" : ""} h-100`}>
                  <MessageView
                     {...createContentData}
                     onChange={onChange}
                     value={state.message.value}
                     onSelect={(e) => {
                        state.message.originalDescription = e.target.value;
                        setstate(state);
                     }}
                  />
               </div>
            );
         case 2:
            return (
               <ScreenRecordView
                  shareAgain={() => {
                     setstate({
                        ...state,
                        screenRec: { file: null, mediaUrl: null },
                        title: "",
                     });
                  }}
                  media={state.screenRec}
                  recordingStop={setMedia}
                  showProgress={state.isUploading}
                  onCancel={cancelUpload}
               />
            );
         case 3:
            return (
               <div className={`${state.media.file === null ? "margin-audio-video" : ""}`}>
                  {state.media.file === null ? (
                     <AudioRecordView
                        onSave={(media) => {
                           setstate((prev) => ({
                              ...prev,
                              showAudioRecorder: false,
                              title: `Audio update from ${userCredentials.user.name} `,
                              media: { ...media },
                           }));
                           document.getElementById("input-title-update").focus();
                        }}
                     />
                  ) : (
                     <MediaView
                        shareAgain={() => {
                           setstate({
                              ...state,
                              media: { file: null, mediaUrl: null },
                              title: "",
                           });
                        }}
                        media={state.media}
                        onRecordTap={onRecTapped}
                        onMediaChange={(e) => setMedia(e.target.files[0])}
                        showProgress={state.isUploading}
                        onCancel={cancelUpload}
                     />
                  )}
               </div>
            );
         case 4:
            return (
               <div className={`${state.media.file === null ? "margin-audio-video" : ""}`}>
                  {state.media.file === null ? (
                     <VideoRecordView
                        media={state.media}
                        onSave={(media) => {
                           setstate((prev) => ({
                              ...prev,
                              showVidRecorder: false,
                              title: `Video update from ${userCredentials.user.name}`,
                              media: { ...media },
                           }));
                           document.getElementById("input-title-update").focus();
                        }}
                     />
                  ) : (
                     <MediaView
                        shareAgain={() => {
                           setstate({
                              ...state,
                              media: { file: null, mediaUrl: null },
                              title: "",
                           });
                        }}
                        media={state.media}
                        onRecordTap={onRecTapped}
                        onMediaChange={(e) => setMedia(e.target.files[0])}
                        showProgress={state.isUploading}
                        onCancel={cancelUpload}
                     />
                  )}
               </div>
            );

         default:
            return (
               <LibraryShareView
                  allowDownload={state.allowDownload}
                  isProvider={state.isProvOnly}
                  userId={patientId}
                  refetch={() => {
                     onClose && onClose();
                     refetch && refetch();
                  }}
                  providerUserId={searchProviderName?.value}
               />
            );
      }
   };

   const getSwitchRow = useCallback(
      ({ isProv }, param = false) => {
         let type = isProv ? "isProvOnly" : "allowDownload";
         return (
            <div className={`${param && "ml-5"} d-inline-flex  align-items-center h-xsmall mb-3`}>
               <div className="text-bleck text-medium">{isProv ? "Provider Only" : "Allow Download"}</div>
               <CheckboxToggle
                  content
                  value={isProv ? state.isProvOnly : state.allowDownload}
                  width="40px"
                  height="21px"
                  toggled={(value) => setstate({ ...state, [type]: !value })}
               />
            </div>
         );
      },
      [state]
   );

   const showView = useMemo(() => {
      let condtn =
         state.selectedSection === 0 ||
         state.selectedSection === 2 ||
         state.selectedSection === 3 ||
         state.selectedSection === 4 ||
         state.selectedSection === 5;
      return {
         showTitle: condtn,
         showDnldSettings: condtn,
      };
   }, [state.selectedSection]);

   const sendMessage = () => {
      if (state.message.originalDescription.length === 0) {
         swal(
            <AlertView
               titleText="No description!"
               contentText="Please enter a description"
               showClose={false}
               onAction={() => swal.close()}
               buttons={[{ className: blueBtnCls, text: "OK" }]}
            />,
            { buttons: false }
         );
         return;
      }
      var lines = state.message.originalDescription.split("\n"); // split all lines into array
      var firstline = lines.shift(); // read and remove first line
      var rest = lines.join("\n");
      let newMentionsArray = state.message.mentions.map((record) => {
         let isForTitle = record.plainTextIndex <= firstline.length;
         let start = isForTitle ? record.plainTextIndex : record.plainTextIndex - (firstline.length - 1);
         return {
            name: record.display.replace("@", ""),
            start,
            id: record.id,
            isForTitle,
         };
      });
      const title = state.message.originalDescription.replaceAll("\n", " \n");

      createContent({
         variables: {
            media: {
               title: title,
               description: "",
               provider: {
                  userId: searchProviderName?.value,
               },
               patient: {
                  userId: patientId,
               },
               type: "text",
               isDoctorsOnly: state.isProvOnly,
               // mentions: [],
            },
         },
      });
      setstate({ ...state, isUploading: true });
   };

   const cancelUpload = () => {
      mediaUploadToken.current.cancel();
      setstate({ ...state, isUploading: false });
   };

   const upload = async () => {
      let file =
         state[
            state.selectedSection === 0 || state.selectedSection === 3 || state.selectedSection === 4
               ? "media"
               : "screenRec"
         ]?.file;

      const showSwal = (titleText, contentText) =>
         swal(
            <AlertView
               titleText={titleText}
               contentText={contentText}
               showClose={false}
               onAction={() => swal.close()}
               buttons={[{ className: blueBtnCls, text: "OK" }]}
            />,
            {
               buttons: false,
            }
         );

      if (!file && state.selectedSection !== 1) {
         showSwal("No file selected!", "Please add a file");
         return;
      } else if (!state.title || state.title?.length === 0) {
         showSwal("No title added!", "Please enter a title");
         return;
      }
      mediaUploadToken.current = axios.CancelToken.source();

      setstate({ ...state, isUploading: true });
      createContent({
         variables: {
            media: {
               isConvert: file.type.includes("quicktime") || file.type.includes("mov") || file.type.includes("webm"),
               title: state.title,
               provider: {
                  userId: searchProviderName?.value,
               },
               patient: {
                  userId: patientId,
               },
               // isConvert: file.type.includes("quicktime") || file.type.includes("mov") || file.type.includes("webm"),
               type: file.type,
               isDoctorsOnly: state.isProvOnly,
               isPrintable: state.selectedSection !== 1 ? state.allowDownload : false,
               location: file.name || `mpeg`,
            },
         },
      });
   };

   const providerRole =
      userCredentials?.user?.role?.includes("admin") || userCredentials?.user?.role?.includes("superadmin");
   const patientName = selectedPatient?.list?.name?.fullName || "Patient";
   return (
      <div className="CreateContent w-2xl bg-white round-border-l p-5 d-flex flex-column justify-content-start overflow-modal">
         <div className="flex-center justify-content-end mb-5">
            <div className="w-100 text-large text-center font-weight-bold">{patientName}</div>
            <button className="cross-button-modal-content" onClick={() => onClose && onClose()}>
               &times;
            </button>
         </div>
         <SegmentView
            className={` ${state.selectedSection === 5 ? "mb-4" : "mb-5"} text-small flex-grow-0`}
            name="create-content"
            selectedIndex={state.selectedSection}
            options={segmentOptions}
            onSelect={(_, index) => {
               setCreateButtonIndex(index);
               setstate({
                  ...state,
                  media: { file: null, mediaUrl: null },
                  screenRec: { file: null, mediaUrl: null },
                  selectedSection: index,
                  title: "",
               });
            }}
         />
         <div>{getSectionView()}</div>
         <div className="footer-div">
            <div className="switches-div w-100 my-5">
               {showView.showTitle ? (
                  <TitleTextView
                     containerclass="mb-4"
                     placeholder="e.g. Your test result review"
                     defaultValue={state.title}
                     onChange={(e) => setstate({ ...state, title: e.target.value })}
                  />
               ) : null}
            </div>

            {providerRole && (
               <CreateContentDropdown
                  providerData={providerData}
                  searchProviderName={searchProviderName}
                  setSearchProviderName={setSearchProviderName}
                  department={department}
                  setDepartment={setDepartment}
                  hospitalId={hospitalId}
                  setHospitalId={setHospitalId}
               />
            )}

            <div className="provider-download-switch">
               {getSwitchRow({ isProv: true })}
               {showView.showDnldSettings ? getSwitchRow({ isProv: false }, true) : null}
            </div>

            <div className="action-div flex-center h-small content content-confirm-cancel-btn">
               {!state.isUploading && (
                  <button
                     className="w-xsmall h-90 text-black font-weight-bold text-small round-border-m flex-center mx-3 cancel-btn-colr"
                     onClick={() => onClose && onClose()}
                  >
                     Cancel
                  </button>
               )}
               {!state.isUploading && state.selectedSection !== 5 ? (
                  <>
                     <button
                        id={state.selectedSection === 1 ? "btnCreateMessageId" : buttonId}
                        className="w-xsmall h-90 btn-default text-white font-weight-bold text-small round-border-m flex-center mx-3"
                        onClick={() => (state.selectedSection === 1 ? sendMessage() : upload())}
                     >
                        Confirm
                     </button>
                  </>
               ) : null}
               {state.isUploading && state.selectedSection === 1 && <LoadingIndicator />}
            </div>
         </div>
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      selectedPatient: state?.patientProfile?.selectedPatient,
   };
};

export default connect(mapStateToProps, null)(memo(CreateContent));
