import React, { useState, memo } from "react";
import { getReferralDetails } from "../../../../Apimanager/Networking";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import "../../profileModule/container/profileSection.css";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import "./tooltip.css";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import ContentParentTab from "../../profileModule/components/ContentParentTab";
import CreateContent from "../../../../viewpages/newpages/profile/createContent/CreateContent";
import CareTeamCont from "../../careTeamModule/container/CareTeamCont";
import FamFriendsCont from "../../familyFriendsModule/container/famFriendsCont";
import { checkProviderData } from "../../../../actions/index";

function ContentSection(props) {
   const {
      content,
      sendContent,
      loggedInUserId,
      getCreateContentTextData,
      user,
      headerData,
      createContentTapped,
      patientId,
      state,
      setstate,
      media,
      setIsProvider,
      setMediaUpload,
      createContentData,
   } = props;
   const [showReferral, setShowReferral] = useState(false);
   const [dragDiv, setDragDiv] = useState(null);
   const [referralInfo, setReferralInfo] = useState({});
   const [searchKey, setSearchKey] = useState("");
   const [showCreateContent, setShowCreateContent] = useState(false);
   const [refectchRecentlyAdded, setRefectchRecentlyAdded] = useState(null);
   const [createButtonViewId, setCreateButtonViewId] = useState(pendoIds.btnCreateMediaId);

   const getReferralInformation = async (obj) => {
      let res = await getReferralDetails({ referralId: obj.id });
      setReferralInfo(res?.data?.data);
      setShowReferral(true);
   };

   const handleDragFiles = (event) => {
      event.preventDefault();
      if (event.target.files && event.target.files[0]) {
         getCreateContentTextData(event.target.files[0], state.isProvOnly ? true : false);
         setShowCreateContent(true);
         createContentTapped();
         setDragDiv(null);
      }
   };

   const dragFile = (e, type) => {
      setDragDiv("drag-drop-overlay file-input open-div");
   };

   const dragLeave = () => {
      if (dragDiv === null) {
         return;
      }
      setDragDiv(null);
   };

   const checkProviderDataCallback = () => {
      setShowCreateContent(true);
      createContentTapped();
   };

   const careTeamPatientId = patientId;

   const showDragLayout = dragDiv !== null;

   const setCreateButtonIndex = (selectedIndex) => {
      if (selectedIndex === 0) setCreateButtonViewId(pendoIds.btnCreateMediaId);
      else if (selectedIndex === 1) setCreateButtonViewId("textMessage");
      else if (selectedIndex === 2) setCreateButtonViewId(pendoIds.btnCreateScreenRecordId);
      else if (selectedIndex === 3) setCreateButtonViewId(pendoIds.btnCreateAudioRecordId);
      else if (selectedIndex === 4) setCreateButtonViewId(pendoIds.btnCreateVideoRecordId);
   };

   return (
      <div onMouseMove={() => dragLeave()} className="overflow-x-hidden">
         <div className=" d-flex flex-center justify-content-start my-3  tabs-div-container">
            <div
               id={pendoIds.tabEveryoneProfileContent}
               className={`recent pointer ${
                  state.isProvOnly === false ? "selected-tab-profile" : "unselected-tab-profile"
               } `}
               onClick={() => {
                  setSearchKey("");
                  setstate({ ...state, isProvOnly: false });
               }}
            >
               Everyone
            </div>
            <div
               id={pendoIds.tabProviderOnlyProfileContent}
               className={`provider pointer tab-margin ${
                  state.isProvOnly === true ? "selected-tab-profile" : "unselected-tab-profile"
               }`}
               onClick={() => {
                  setSearchKey("");
                  setstate({ ...state, isProvOnly: true });
               }}
            >
               Provider Only
            </div>
            <div
               id={pendoIds.tabCareTeamProfileContent}
               className={`provider pointer tab-margin ${
                  state.isProvOnly === "care" ? "selected-tab-profile" : "unselected-tab-profile"
               }`}
               onClick={() => {
                  setSearchKey("");
                  setstate({ ...state, isProvOnly: "care" });
               }}
            >
               Care Team
            </div>
            <div
               id={pendoIds.tabFamilyFriendsProfileContent}
               className={`provider pointer tab-margin ${
                  state.isProvOnly === "friends" ? "selected-tab-profile" : "unselected-tab-profile"
               }`}
               onClick={() => {
                  setSearchKey("");
                  setstate({ ...state, isProvOnly: "friends" });
               }}
            >
               Family/Friends
            </div>
         </div>

         {state.loadingSearch ? (
            <div className="loader-container-profile">
               <LoadingIndicator />
            </div>
         ) : state.isProvOnly === "care" && careTeamPatientId !== null ? (
            <CareTeamCont patientId={careTeamPatientId} />
         ) : state.isProvOnly === "friends" ? (
            <FamFriendsCont patientId={careTeamPatientId} />
         ) : (
            <div
               onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dragFile(state.isProvOnly ? "provOnly" : "recent");
               }}
               style={{ maxWidth: "98.1%", marginLeft: "11px" }}
            >
               {showDragLayout && (
                  <div className={dragDiv}>
                     <input
                        type="file"
                        onChange={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleDragFiles(e);
                        }}
                        accept="/*"
                        value=""
                        style={{ zIndex: "100" }}
                     />
                     <span className="drag-content">Drop Files to instantly upload them to:Activity</span>
                  </div>
               )}
               <div className={` ${showDragLayout && "hide-content-tab"}`}>
                  {!state.isProvOnly && (
                     <ContentParentTab
                        checkProviderData={checkProviderData}
                        view={state.viewType}
                        user={user}
                        loggedInUserId={loggedInUserId}
                        sendContent={sendContent}
                        getReferralInformation={getReferralInformation}
                        searchKey={searchKey}
                        isProvTab={state.isProvOnly}
                        setSearchKey={setSearchKey}
                        isLoading={content.isloading || state.isloading}
                        referralInfo={referralInfo}
                        showReferral={showReferral}
                        setShowReferral={setShowReferral}
                        patientId={patientId}
                        headerLoading={headerData.isloading}
                        refectchRecentlyAdded={refectchRecentlyAdded}
                        setRefectchRecentlyAdded={setRefectchRecentlyAdded}
                        createContentTapped={createContentTapped}
                        setShowCreateContent={() => checkProviderData(checkProviderDataCallback)}
                     />
                  )}
                  {state.isProvOnly && (
                     <ContentParentTab
                        checkProviderData={checkProviderData}
                        view={state.viewType}
                        user={user}
                        loggedInUserId={loggedInUserId}
                        sendContent={sendContent}
                        getReferralInformation={getReferralInformation}
                        searchKey={searchKey}
                        isProvTab={state.isProvOnly}
                        setSearchKey={setSearchKey}
                        isLoading={content.isloading || state.isloading}
                        referralInfo={referralInfo}
                        showReferral={showReferral}
                        setShowReferral={setShowReferral}
                        patientId={patientId}
                        headerLoading={headerData.isloading}
                        refectchRecentlyAdded={refectchRecentlyAdded}
                        setRefectchRecentlyAdded={setRefectchRecentlyAdded}
                        createContentTapped={createContentTapped}
                        setShowCreateContent={() => checkProviderData(checkProviderDataCallback)}
                     />
                  )}
               </div>
            </div>
         )}

         {showCreateContent && (
            <ModalPopup
               id={createButtonViewId}
               onModalTapped={() => {
                  setShowCreateContent(false);
               }}
            >
               <CreateContent
                  buttonId={createButtonViewId}
                  setCreateButtonIndex={setCreateButtonIndex}
                  refetch={() => {
                     setRefectchRecentlyAdded(true);
                  }}
                  media={media}
                  isProvider={state.isProvOnly}
                  setIsProvider={setIsProvider}
                  setMediaUpload={setMediaUpload}
                  onClose={() => {
                     setShowCreateContent(false);
                  }}
                  createContentData={createContentData}
                  userCredentials={props.userCredentials}
                  patientId={patientId}
                  // {...props}
               />
            </ModalPopup>
         )}
      </div>
   );
}

export default memo(ContentSection);
