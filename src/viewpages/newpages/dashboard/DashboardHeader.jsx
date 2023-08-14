import React, { useState, useEffect } from "react";
import { getProviderAnalyticsData } from "../../../Apimanager/Networking";
import Select from "react-select";
import "firebase/auth";

const customStyles = {
   option: (styles, { isSelected }) => {
      return {
         ...styles,
         fontSize: "12px",
         backgroundColor: isSelected ? "rgba(3, 100, 230, 0.1)" : "white",
         color: "black",
         ":hover": {
            backgroundColor: isSelected ? "" : "rgba(3, 100, 230, 0.1)",
         },
      };
   },
};

const DashboardAnalytics = (props) => {
   const { analyticsTitle, analyticsValue, className, analyticsLoading } = props;
   return (
      <div
         className={`analytics-container shadow round-border-m p-3 sfpro-text border-light-grey ${className} ${
            analyticsLoading ? "loading-shade" : ""
         }`}
      >
         <div className="analytics-title text-small text-grey">{analyticsTitle}</div>
         <div className="analytics-value flex-center fw-bold">
            {analyticsValue >= 1000000
               ? (analyticsValue / 1000000).toFixed(1) + "M"
               : analyticsValue >= 1000 && analyticsValue < 1000000
               ? (analyticsValue / 1000).toFixed(1) + "K"
               : analyticsValue}
         </div>
      </div>
   );
};

function DashboardHeader(props) {
   const { providerName } = props;
   const [state, setState] = useState({
      dropdownValue: { label: "Last 7 days", value: 7 } || "",
      patientCount: null,
      contentCount: null,
      viewsCount: null,
      reactionsCount: null,
      isLoading: false,
   });

   useEffect(() => {
      setState({ ...state, isLoading: true });
      let obj = {
         numberOfDays: state.dropdownValue.value,
      };
      getProviderAnalyticsData(obj).then((result) => {
         let analyticsData = result.data?.data;
         setState({
            ...state,
            patientCount: analyticsData?.careTeam,
            contentCount: analyticsData?.contentCount,
            viewsCount: analyticsData?.contentViewCount,
            reactionsCount: analyticsData?.reactionCount,
         });
      });
   }, [state.dropdownValue]);

   const handleDropdownValue = (e) => {
      setState({
         ...state,
         dropdownValue: e,
      });
   };
   return (
      <div className="dashboard-header">
         <div className="name-dropdown-row flex-center justify-content-between">
            <div>
               <h6 className="header-name sfpro-text">Hi {providerName}</h6>
               {/* <h6 className="header-name sfpro-text">Hi, {firebase.auth().currentUser?.displayName + ","}</h6> */}
            </div>
            <div className="header-dropdown w-medium">
               <Select
                  styles={customStyles}
                  className="w-50"
                  onChange={(e) => handleDropdownValue(e)}
                  value={state.dropdownValue}
                  options={[
                     { label: "Last 7 days", value: 7 },
                     { label: "Last 30 days", value: 30 },
                     { label: "All time", value: 0 },
                  ]}
               />
               {/* <select
            className="bg-white round-border-s text-normal no-border sfpro-text pointer"
            value={state.dropdownValue}
            onChange={(e) => handleDropdownValue(e)}
          >
            <option defaultValue value={0}>
              Last 7 days
            </option>
            <option value={1}>Last 30 days</option>
            <option value={2}>All time</option>
          </select> */}
            </div>
         </div>
         <div className={`analytics-row mt-4`}>
            <DashboardAnalytics
               analyticsTitle="Patient"
               analyticsValue={state.patientCount}
               className={` ${state.isLoading ? "analytics-loading-shade" : ""}`}
               analyticsLoading={state.isLoading}
            />
            <DashboardAnalytics
               analyticsTitle="Content"
               analyticsValue={state.contentCount}
               className={` ${state.isLoading ? "analytics-loading-shade" : ""}`}
               analyticsLoading={state.isLoading}
            />
            <DashboardAnalytics
               analyticsTitle="Views"
               analyticsValue={state.viewsCount}
               className={` ${state.isLoading ? "analytics-loading-shade" : ""}`}
               analyticsLoading={state.isLoading}
            />
            <DashboardAnalytics
               analyticsTitle="Reactions"
               analyticsValue={state.reactionsCount}
               className={` ${state.isLoading ? "analytics-loading-shade" : ""}`}
               analyticsLoading={state.isLoading}
            />
         </div>
      </div>
   );
}

export default DashboardHeader;
