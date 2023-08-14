import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PATIENT_CONTENT, UPDATE_ITEM_VIEWED_STATUS } from "../actions/profileQueries";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PostGql from "../../profile/content-section/PostGql";
import { TableView } from "../../profile/content-section/ContentView";
import { postOptTapped } from "../actions/profileQueries";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import ReferralDetailsView from "../../../../components/newcomponents/ReferralDetailsView/ReferralDetailsView";
import LoaderCardAndTable from "../../../../common/LoaderCardAndTable";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import InfiniteScroll from "../../../../shared/components/infiniteScroll/infiniteScroll";
import { fetchMutation, fetchQuery } from "../../../../actions";
import ContentAndCareTeamSearch from "./ContentAndCareTeamSearch";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { debounce } from "lodash";
import EmptyStateComp from "../../EmptyStateComp";
import * as i18n from "../../../../I18n/en.json";

import NoContent from "../../../../images/empty-states/no-content.svg";
import PollComponent from "./pollComp";

const EveryoneTabGql = (props) => {
   const {
      user,
      loggedInUserId,
      userCredentials,
      accessToken,
      sendContent,
      getReferralInformation,
      searchKey,
      isProvTab,
      referralInfo,
      setShowCreateContent,
      createContentTapped,
      dataArray,
      showReferral,
      setShowReferral,
      refectchRecentlyAdded,
      setRefectchRecentlyAdded,
   } = props;
   const noContent = i18n.emptyState.noContent;
   const noContentDesc = i18n.emptyState.noContentDesc;
   const addContentBtn = i18n.emptyState.addContent;
   const localValue = localStorage.getItem("tableLayout");
   const defLayout = localValue !== null && localValue !== undefined ? parseInt(localValue) : 1;
   const [patientId, setPatientId] = useState(props.match.params.id);
   const [patientContent, setPatientContent] = useState([]);
   // const [showReferral, setShowReferral] = useState(false);
   const [showContent, setShowContent] = useState(false);
   const [preview, setPreview] = useState(false);
   const [selectedPost, setSelectedPost] = useState({
      item: null,
      index: null,
   });
   const [deleteLoading, setDeleteLoading] = useState(false);
   const [loadedOnce, setLoadedOnce] = useState(false);
   const [hasMore, setHasMore] = useState(true);
   const [limit, setLimit] = useState(10);
   const [initialLoader, setInitialLoader] = useState(true);
   const [searchTerm, setSearchTerm] = useState(searchKey);
   const [searchLoading, setSearchLoading] = useState(false);
   const [contentError, setContentError] = useState(false);
   const [offset, setOffset] = useState(0);
   const [viewType, setViewType] = useState(defLayout);
   const [totalCount, setTotalCount] = useState(0);

   useEffect(() => {
      getPatientContentData();
   }, []);

   const getPatientContentData = (callBack = () => {}, textVal = "") => {
      let obj = {};
      obj = {
         limit: limit,
         offset: offset,
         user_id: patientId,
         patientOnly: isProvTab ? false : true,
         providerOnly: isProvTab,
         search: textVal ? textVal : searchTerm || "",
      };
      fetchQuery(
         GET_PATIENT_CONTENT,
         obj,
         (res) => {
            let data = res?.data?.getPatientContent?.contents || [];
            const totalCount = res?.data?.getPatientContent?.totalCount || 0;
            if (offset > 0) {
               setPatientContent([...patientContent, ...data]);
            } else {
               setPatientContent(data);
            }
            setLoadedOnce(true);
            setHasMore(!(data.length < limit));
            setInitialLoader(false);
            setSearchLoading(false);
            setOffset(offset + limit);
            callBack();
            setTotalCount(totalCount);
         },
         (error) => {
            setContentError(true);
         }
      );
   };

   const toggleDeleteLoader = () => {
      setDeleteLoading(false);
      setTotalCount(totalCount - 1);
   };
   const toggleDeleteLoaders = () => {
      setDeleteLoading(true);
   };

   const Card = useMemo(
      () =>
         ({ item, classname, showPreview, content }) => {
            return (
               <PostGql
                  isProvTab={isProvTab}
                  itemIndex={item.index}
                  user={user}
                  content={patientContent}
                  isPreview={showPreview}
                  loggedInUserId={loggedInUserId}
                  providerId={userCredentials?.user?.id}
                  accessToken={accessToken.current}
                  postData={item.data}
                  key={item.id}
                  className={classname}
                  setPatientContent={setPatientContent}
                  optionTapped={(_, obj) => {
                     postOptTapped(
                        obj,
                        item.index,
                        patientContent,
                        setPatientContent,
                        sendContent,
                        toggleDeleteLoaders,
                        toggleDeleteLoader
                     );
                     setShowContent(false);
                  }}
                  onTextClick={(key) => {
                     if (showPreview) {
                        let profileSectionDiv = document.getElementById("main-profile-section");
                        if (profileSectionDiv) profileSectionDiv.scrollTop = 0;
                        setShowContent(false);
                        handleText(key);
                     }
                  }}
                  onPreview={() => {
                     updateViewedItem(item, item.data.id);
                     if (item.data?.type?.includes("referral")) {
                        getReferralInformation && getReferralInformation(item.data);
                     } else {
                        setSelectedPost({ item: item.data, index: item.index });
                        setPreview(true);
                        setShowContent(true);
                     }
                  }}
               />
            );
         },
      [patientContent.length, refectchRecentlyAdded]
   );

   const getSearchResults = (text) => {
      setInitialLoader(true);
      getPatientContentData(() => {}, text);
   };

   const updateToggleImage = () => {
      const tableLayout = viewType === 1 ? 0 : 1;
      localStorage.setItem("tableLayout", tableLayout);
      setViewType(tableLayout);
   };

   const deb = useCallback(
      debounce((text) => {
         getSearchResults(text);
      }, 500),
      []
   );
   const handleText = (text) => {
      setSearchTerm(text);
      deb(text);
   };

   const updateViewedItem = async (obj, id) => {
      const objId = id;
      fetchMutation(
         UPDATE_ITEM_VIEWED_STATUS,
         {
            options: {
               eventName: "itemViewed",
               itemId: id,
            },
         },
         (response) => {
            if (response.data?.addActivity?.status?.success) {
               let tempArr = patientContent.map((o) => o);
               let viewArr = [];
               let idx = tempArr.findIndex((o) => o.id === objId);
               let viewedIdx = obj.data?.views ? obj.data?.views.findIndex((o) => o.viewer?.id === loggedInUserId) : -1;
               if (obj.data?.views === null || (obj.data?.views?.length > 0 && viewedIdx === -1)) {
                  const date = new Date();
                  const timestampInMs = date.getTime();
                  const unixTimestamp = Math.floor(timestampInMs);
                  viewArr.push({
                     viewedAt: unixTimestamp,
                     viewer: {
                        id: loggedInUserId,
                        name: {
                           fullName: userCredentials?.user?.name,
                           __typename: "Name",
                        },
                        contactInformation: {
                           email: userCredentials?.user?.email,
                           mobileNumber: userCredentials?.user?.mobileNo,
                           __typename: "ContactInformation",
                        },
                        __typename: "User",
                     },
                     __typename: "ContentView",
                  });
                  tempArr[idx].views = obj.data?.views?.length > 0 ? [...tempArr[idx].views, ...viewArr] : viewArr;
                  setPatientContent(tempArr);
               } else {
                  return;
               }
            } else {
               console.log("Error in updating views count");
            }
         }
      );
   };
   const startPoll = refectchRecentlyAdded !== null;
   return (
      <div>
         {startPoll && (
            <PollComponent
               patientId={patientId}
               isProvTab={isProvTab}
               setRefectchRecentlyAdded={setRefectchRecentlyAdded}
               callBack={(data, totalCountNew) => {
                  setPatientContent(data);
                  setLoadedOnce(true);
                  setHasMore(data.length < totalCountNew);
                  setTotalCount(totalCountNew);
                  setInitialLoader(false);
                  setSearchLoading(false);
                  setOffset(0);
                  setSearchTerm("");
                  setRefectchRecentlyAdded(null);
               }}
               totalCount={totalCount}
            />
         )}
         {deleteLoading && (
            <ModalPopup onModalTapped={() => {}}>
               <LoadingIndicator />
            </ModalPopup>
         )}
         {!patientContent?.length > 0 && searchTerm.length === 0 ? null : (
            <ContentAndCareTeamSearch
               debounceSearch={true}
               createContentTapped={createContentTapped}
               showSearch={true}
               showbutton={true}
               showLayout={true}
               btnText={"Create Content"}
               layoutChange={updateToggleImage}
               layoutImg={`/assets/images/newimages/${viewType === 0 ? "grid" : "list"}.svg`}
               contentBtnPendoId={pendoIds.btnProviderCreateContent}
               pendoId={isProvTab ? pendoIds.btnInputSearchProviderOnly : pendoIds.btnInputSearchEveryone}
               layoutPendoId={pendoIds.btnContentViewToggle}
               onClickBtn={setShowCreateContent}
               searchKey={searchTerm}
               setSearchKey={handleText}
            />
         )}
         {contentError ? (
            <div className="w-100 text-large flex-center" style={{ height: "42vh" }}>
               {"Something went wrong."}
            </div>
         ) : (
            <div>
               {initialLoader ? (
                  <LoaderCardAndTable view={viewType} />
               ) : (
                  <InfiniteScroll callBack={getPatientContentData} showLoader={hasMore}>
                     <div>
                        <div
                           style={{
                              maxWidth: "98.1%",
                              marginLeft: "11px",
                              display: "flex",
                              flexWrap: "wrap",
                           }}
                        >
                           {viewType === 0 ? (
                              <TableView
                                 onCreateContent={setShowCreateContent}
                                 isPreview={false}
                                 onclick={(o, i) => {
                                    updateViewedItem(o, o.id);
                                    if (o.type.includes("referral")) {
                                       getReferralInformation && getReferralInformation(o);
                                    } else {
                                       setPreview(true);
                                       setSelectedPost({ item: o, index: i });
                                       setShowContent(true);
                                    }
                                 }}
                                 posts={patientContent}
                                 // isLoading={isLoading}
                                 optTapped={(obj, i, posts, setPatientContent, sendContent) => {
                                    postOptTapped(
                                       obj,
                                       i,
                                       posts,
                                       setPatientContent,
                                       sendContent,
                                       toggleDeleteLoaders,
                                       toggleDeleteLoader
                                    );
                                 }}
                                 setPatientContent={setPatientContent}
                                 sendContent={sendContent}
                                 searchTerm={searchTerm}
                              />
                           ) : patientContent?.length > 0 ? (
                              patientContent.map((contObj, i) => {
                                 const showBg =
                                    contObj?.type?.includes("text") ||
                                    contObj?.type?.includes("referral") ||
                                    contObj?.type?.includes("item");
                                 return (
                                    <div
                                       key={contObj?.id || i}
                                       className={`grid-view-col responsive-content p-0 mb-3 px-2 ${
                                          !showBg && "post-gql-main-bg"
                                       }`}
                                       style={{ maxHeight: "325px", minWidth: "275px" }}
                                    >
                                       <Card
                                          item={{ data: contObj, index: i, id: contObj?.id || i }}
                                          classname="grid-view-post  round-border-xl border-light-grey"
                                          showPreview={false}
                                          content={patientContent}
                                       />
                                    </div>
                                 );
                              })
                           ) : (
                              <div className="w-100 h-100">
                                 <EmptyStateComp
                                    src={NoContent}
                                    patientContent={true}
                                    headerText={noContent}
                                    description={noContentDesc}
                                    btnText={
                                       !patientContent?.length > 0 && searchTerm.length > 0 ? false : addContentBtn
                                    }
                                    className="margin-viewd-screen"
                                    onClick={setShowCreateContent}
                                 />
                              </div>
                           )}
                        </div>
                     </div>
                  </InfiniteScroll>
               )}
               {showContent && (
                  <ModalPopup
                     onModalTapped={() => {
                        setPreview(false);
                        setShowContent(false);
                     }}
                  >
                     <Card
                        item={{
                           data: selectedPost.item,
                           index: selectedPost.index,
                           id: selectedPost.item?.id || selectedPost.index,
                        }}
                        classname={`grid-view-post ${
                           preview ? " p-0" : " px-5 py-3 "
                        } bg-white  w-75 h-85 round-border-5xl`}
                        showPreview={true}
                        content={patientContent}
                     />
                  </ModalPopup>
               )}

               {showReferral && (
                  <ModalPopup
                     id="show-referral-content-view-modal"
                     onModalTapped={() => {
                        setShowReferral(false);
                        setPreview(false);
                        setShowContent(false);
                     }}
                  >
                     <ReferralDetailsView referralDetails={referralInfo} />
                  </ModalPopup>
               )}
            </div>
         )}
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      fbUser: state.auth?.northwelluser,
      userCredentials: state.auth?.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      enterPriseDetails: state.dashboardStates?.enterPriseDetails,
   };
};

export default connect(mapStateToProps)(withRouter(EveryoneTabGql));
