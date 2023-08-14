import React, { memo, useState, useEffect } from "react";
import "./Dashboard.css";
import DashboardHeader from "./DashboardHeader";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Banner from "./banner";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import ViewedPatientsListCont from "../PatientListModule/container/ViewedPatientsListCont";
import MyPatientsListCont from "../PatientListModule/container/MyPatientsListCont";
import { fetchViewedPatient } from "../../../redux/actions/patientList.action";
import { bindActionCreators } from "redux";
import { fetchQuery } from "../../../actions";
import { GET_INACTIVE_PATIENT_LIST } from "../activatePatientModule/actions/inactivePatientListAction";
const selListClass = "sfpro-text text-primary2";
const unselListClass = "sfpro-text text-black";

function Dashboard(props) {
   const { userCredentials, showReferral, fetchPatients, featureFlags, loggedInProviderDetails } = props;
   const { user } = userCredentials;
   const [totalInactivePatients, setTotalInactivePatients] = useState(0);
   const [state, setState] = useState({
      isNew: false,
   });

   useEffect(() => {
      getInActivePatient();
      return () => {
         var obj = {};
         obj = {
            list: [],
            loading: true,
            limit: 10,
            offset: 0,
         };
         if (state.isNew) {
            fetchPatients(obj, true);
         } else {
            fetchPatients(obj, false);
         }
      };
   }, []);

   const getInActivePatient = () => {
      let activationObj = {
         limit: 10,
         offset: 0,
         inactive: true,
         enterpriseId: user?.enterpriseId,
      };
      fetchQuery(
         GET_INACTIVE_PATIENT_LIST,
         activationObj,
         (result) => {
            let totCount = result?.data?.getPatients?.totalCount || 0;
            setTotalInactivePatients(totCount);
         },
         (error) => {
            console.log(error);
         }
      );
   };

   useEffect(() => {
      props.getEnterpriseInfo && props.getEnterpriseInfo();
   }, []);

   const showBanner =
      user?.role?.some((some) => {
         return some === "admin";
      }) &&
      featureFlags?.showAdminBanner &&
      totalInactivePatients > 0;

   const providerName = loggedInProviderDetails?.fullName?.fullName || "";
   return (
      <div id="dashboard" className="responsive-dashboard h-100 p-4 ">
         {showBanner && <Banner inactivePatinet={totalInactivePatients} />}
         <div>
            <DashboardHeader providerName={providerName} />
         </div>
         <div className={`d-flex flex-center justify-content-start mt-4 text-medium`}>
            <div
               id={pendoIds.tabHomeViewedPatients}
               className={`pointer mr-3 ${state.isNew ? unselListClass : selListClass} `}
               onClick={() => {
                  if (!state.isNew) return;
                  setState({
                     ...state,
                     isNew: false,
                  });
               }}
            >
               Viewed
               {!state.isNew && <div className="separator-underline"></div>}
            </div>
            <div
               id={pendoIds.tabHomeMyPatients}
               className={`pointer ml-3 ${state.isNew ? selListClass : unselListClass}`}
               onClick={() => {
                  if (state.isNew) return;
                  setState({
                     ...state,
                     isNew: true,
                  });
               }}
            >
               My Patients
               {state.isNew && <div className="separator-underline"></div>}
            </div>
         </div>
         <div>
            <div>
               {!state.isNew && <ViewedPatientsListCont myPatients={false} showReferralKey={showReferral} />}
               {state.isNew && <MyPatientsListCont myPatients={true} showReferralKey={showReferral} />}
            </div>
         </div>
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userCredentials: state.auth.userCredentials,
      featureFlags: state.launchdarkly.ldFeatureFlags,
      loggedInProviderDetails: state.auth?.loggedInProviderDetails,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(memo(Dashboard)));
