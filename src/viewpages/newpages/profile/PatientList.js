import React, { memo, useState, useEffect, useRef } from "react";
import PatientDetailsView from "../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import SegmentView from "../../../components/newcomponents/SegmentView/SegmentView";
import { ageForDob } from "../../../helper/CommonFuncs";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import InvitePatientView from "../../../components/newcomponents/InvitePatientView";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import { fetchViewedPatient } from "../../../redux/actions/patientList.action";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withRouter } from "react-router";
import InfiniteScroll from "../../../shared/components/infiniteScroll/infiniteScroll";
import moment from "moment";
import EmptyStateComp from "../EmptyStateComp";
import * as i18n from "../../../I18n/en.json";

import NoPatients from "../../../images/empty-states/no-patients.svg";
import LoaderList from "../../../shared/components/loaderList/loaderList";
import { checkProviderData } from "../../../actions";

const segmentOptions = [
   {
      text: "My Patients",
      id: 1,
      pendoId: pendoIds.tabProfileMyPatients,
   },
   {
      text: "Viewed",
      id: 2,
      pendoId: pendoIds.tabProfileViewedPatients,
   },
];

function PatientList(props) {
   const getStarted = i18n.emptyState.getStarted;
   const patientDesc = i18n.emptyState.patientDesc;
   const {
      onPatientTap,
      getViewedPatients,
      getMyPatients,
      patientList,
      loading,
      setLoading,
      hasMore,
      selectedIndex,
      setSelectedIndex,
      setHasMore,
   } = props;
   const [state, setstate] = useState({
      selectedIndex: 0,
      listToShow: [],
      viewedList: [],
      newList: {
         totalRecords: 0,
         data: [],
         hasMore: false,
         config: { pageSize: 20, page: 1 },
      },
      isloading: true,
      loadSegment: true,
      showloader: false,
      showInvite: false,
      initialLoading: false,
   });

   const listRef = useRef();
   const selectedView = useRef();
   const scrollListToUp = () => {
      let profileListSectionDiv = document.getElementById("profile-module-patient-list");
      if (profileListSectionDiv) profileListSectionDiv.scrollTop = 0;
   };

   const scrollLoading = () => {
      scrollListToUp();
      setLoading(true);
      setHasMore(false);
   };

   const checkProviderDataCallback = () => {
      setstate({ ...state, showInvite: true });
   };

   const dataToMap = selectedIndex === 1 ? patientList.viewed.list : patientList.myPatients.list;
   const showPatientLoader = hasMore && dataToMap?.length > 0;
   return (
      <div className="h-100 d-flex flex-column " id="patient-list">
         <SegmentView
            profile
            tabOne={patientList.myPatients.totalCount || 0}
            tabTwo={patientList.viewed.totalCount || 0}
            className="text-small m-3"
            name="profile-list-radio"
            teamClass="p-1 unselected-color"
            teamClassName="round-border-s"
            selectedIndex={selectedIndex}
            options={segmentOptions}
            onSelect={(opt, index) => {
               if (selectedIndex !== index) {
                  setSelectedIndex(index);
                  if (index === 1) {
                     getViewedPatients(() => {}, true);
                     scrollLoading();
                  } else {
                     getMyPatients(() => {}, true);
                     scrollLoading();
                  }
               }
            }}
         />
         <div id="profile-module-patient-list" ref={listRef} className="list flex-grow-1">
            <InfiniteScroll
               callBack={selectedIndex === 0 ? getMyPatients : getViewedPatients}
               showLoader={showPatientLoader}
            >
               {loading ? (
                  <LoaderList />
               ) : dataToMap.length === 0 ? (
                  <div className="d-flex justify-content-center text-center" style={{ marginTop: "5rem" }}>
                     <EmptyStateComp
                        src={NoPatients}
                        patientList={true}
                        headerText={getStarted}
                        description={patientDesc}
                        className="margin-viewd-screen"
                     />
                  </div>
               ) : (
                  dataToMap.map((obj, i) => {
                     const color = obj?.colorCode || window.initialColors[i % window.initialColors.length];
                     const initials = obj?.name?.initials || false;
                     return (
                        <div
                           ref={obj.pObj.patientId === props.selectedId ? selectedView : null}
                           className={`${
                              obj.pObj.patientId === props.selectedId ? "bg-selected-new" : "bg-unselected-new"
                           }`}
                           key={i}
                           onClick={() => onPatientTap && onPatientTap(obj)}
                        >
                           <PatientDetailsView
                              imageRad={32}
                              profile
                              className="p-3 hover-default pointer"
                              imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${
                                 obj.pObj.patientId
                              }?ver=${Math.random()}`}
                              userBg={color}
                              initialsApi={initials}
                              name={obj?.name?.fullName ? obj?.name?.fullName : "Patient"}
                              details={[
                                 {
                                    title: "DOB",

                                    value:
                                       obj?.dob && obj?.dob !== ""
                                          ? ": " + moment(obj?.dob).format("MM/DD/YYYY")
                                          : ": --/--/----" || ": -",
                                 },
                                 {
                                    title: "Age",
                                    value: ": " + ageForDob(obj?.dob) || "-",
                                 },
                              ]}
                           />
                        </div>
                     );
                  })
               )}
            </InfiniteScroll>
         </div>
         {props.enterPriseDetails?.name !== "Northwell" && (
            <div className="invite-div w-100 flex-center flex-shrink-0">
               <button
                  id={pendoIds.btnProfileInvitePatient}
                  onClick={() => checkProviderData(checkProviderDataCallback)}
                  className="btn-default text-small h-small round-border-s"
               >
                  Invite Patient
               </button>
            </div>
         )}

         {state.showInvite ? (
            <ModalPopup
               className="overflow-scroll p-5 align-items-start"
               id={pendoIds.btnInvitePatientModal}
               styles={{ overflow: "scroll" }}
               onModalTapped={() => setstate({ ...state, showInvite: false })}
            >
               <InvitePatientView
                  buttonId={pendoIds.btnInvitePatientModal}
                  enterpriseId={props.userCredentials?.user?.enterpriseId}
                  onClose={(id) => {
                     setstate({ ...state, showInvite: false });
                     if (id) {
                        onPatientTap(id, true);
                     }
                  }}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
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

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(memo(PatientList)));
