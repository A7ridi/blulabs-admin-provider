import React, { memo, useState, useEffect, useCallback } from "react";
import DropdownToggle from "./DropdownToggle";
import { withRouter } from "react-router-dom";
import BadgeView from "./BadgeView";
import { getQueryParams } from "../../viewpages/newpages/searchModule/components/SearchPage";
import { pendoIds } from "../../Constants/pendoComponentIds/pendoConstants";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as searchActions from "../../redux/actions/searchPatient.action";
import FilterView from "./PatientSearchFilterView";
import { pushToSearchPatients, getPrevFilters, checkAreSameObjects } from "../../redux/actions/searchPatient.action";
import { getHospitalListing } from "../../Apimanager/Networking";
import moment from "moment";
import { debounce } from "lodash";
import { fetchSearchPatientResults } from "../../viewpages/newpages/searchModule/actions/searchQueries";
import { removeExtraSpace } from "../../helper/CommonFuncs";

function PatientSearchField(props) {
   const searchparms = getQueryParams(props);

   const {
      searchPatientList,
      setSearchQuery,
      setSearchName,
      setSearchDOB,
      setClearSearchFields,
      setSearchHospitalId,
      setSearchMRN,
      userCredentials,
   } = props;
   const [state, setstate] = useState({
      showFilters: false,
   });

   const [hospitals, setHospitals] = useState([]);

   useEffect(() => {
      if (userCredentials?.user?.enterpriseId) {
         getHospitals();
      }
   }, [userCredentials?.user]);

   const getHospitals = async () => {
      let hospResp = await getHospitalListing({
         enterpriseId: userCredentials?.user?.enterpriseId,
      });
      let hospitals =
         hospResp.data.data.map((obj, i) => {
            return {
               label: obj.name,
               value: obj.id || i,
               data: obj,
            };
         }) || [];
      singleHospital(hospitals);
      setHospitals(hospitals);
   };

   const singleHospital = (list) => {
      let selectedHospital = null;
      if (searchparms?.hospitalId !== null && list.length > 0) {
         selectedHospital = list.find((find) => {
            return find.value === searchparms?.hospitalId;
         });
         if (searchparms?.query !== "") {
            setSearchQuery(searchparms?.query);
            setSearchName(searchparms?.query);
         }
         if (searchparms?.name !== "") {
            setSearchName(searchparms?.name);
            setSearchQuery(searchparms?.name);
         }
         if (searchparms?.dob) {
            const dateObj = moment(searchparms?.dob).toISOString();
            setSearchDOB(new Date(dateObj));
         }
         if (searchparms?.mrn !== "") {
            setSearchMRN(searchparms?.mrn);
         }
         if (searchparms?.hospitalId) {
            setSearchHospitalId({ label: selectedHospital?.label, value: selectedHospital?.value });
         }
      }
   };

   useEffect(() => {
      if (props.location.search.length !== 0) return;
      setClearSearchFields();
   }, [props.location.search]);

   const deb = useCallback(
      debounce((text) => {
         fetchSearchPatientResults(() => {}, text, false, false, true);
         pushToSearchPatients(props.history, false, text);
         if (text === "") {
            props.history.push("/");
         }
      }, 500),
      []
   );

   const handleSearchText = (text) => {
      deb(removeExtraSpace(text));
   };

   return (
      <div className="w-100">
         <div id={pendoIds.inputSearchPatient} className="input-group d-flex flex-nowrap">
            <DropdownToggle
               id="filterToggle"
               menuViewCls="w-100"
               onOptTapped={(obj) => {
                  const text = removeExtraSpace(obj?.data?.name || obj?.data?.searchQuery);
                  setSearchQuery(text);
                  setSearchName(text);
                  fetchSearchPatientResults(() => {}, text, false, false, true);

                  pushToSearchPatients(props.history, false, text);
               }}
               options={getPrevFilters().map((obj) => {
                  return {
                     text: obj?.name || obj?.searchQuery,
                     data: obj,
                  };
               })}
            >
               <input
                  id="filterToggle"
                  data-toggle="dropdown"
                  type="text"
                  className="form-control input-search-vertical"
                  placeholder={
                     searchPatientList.playbackSearchFlag
                        ? "Search by name, mobile, email"
                        : "Search by first and last name"
                  }
                  autoComplete="off"
                  onFocus={() => setstate({ ...state, showFilters: false })}
                  value={searchPatientList.searchQuery}
                  onChange={(e) => {
                     setSearchQuery(e.target.value);
                     setSearchName(e.target.value);
                     handleSearchText(e.target.value);
                  }}
               />
            </DropdownToggle>
            <div className="input-group-append">
               <BadgeView
                  id={pendoIds.btnFilterSearchPatient}
                  className="input-group-text bg-transparent pointer"
                  src="/assets/images/newimages/filter-icon.svg"
                  text={checkAreSameObjects() ? "" : "0"}
                  dotStyle={{
                     color: "transparent",
                     minWidth: "0px",
                     width: "8px",
                     height: "8px",
                     left: null,
                     right: "7px",
                     top: "4px",
                     backgroundColor: "var(--primary-color)",
                  }}
                  onClick={() => setstate({ ...state, showFilters: !state.showFilters })}
               />
               <button
                  id={pendoIds.btnSearchPatientsIcon}
                  className="search-button input-group-text pointer"
                  disabled={true}
               />
            </div>
         </div>
         {state.showFilters ? (
            <FilterView
               areSameObjects={checkAreSameObjects}
               hospitals={hospitals}
               onAction={(val) => {
                  state.showFilters = false;
                  setstate({ ...state });
               }}
               {...props}
            />
         ) : null}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      searchPatientList: state.searchpatientlist,
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setSearchPatientList: searchActions.setSearchPatientList,
         setSearchQuery: searchActions.setSearchQuery,
         setSearchDOB: searchActions.setSearchDOB,
         setSearchMRN: searchActions.setSearchMRN,
         setSearchHospitalId: searchActions.setSearchHospitalId,
         setSearchEnterpriseId: searchActions.setSearchEnterpriseId,
         setSearchUserType: searchActions.setSearchUserType,
         setSearchName: searchActions.setSearchName,
         setClearSearchFields: searchActions.setClearSearchFields,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(memo(PatientSearchField)));
