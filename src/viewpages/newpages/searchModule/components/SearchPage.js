import React, { useState, useEffect } from "react";
import PatientTableView from "../../../../components/newcomponents/PatientTableView";
import { withRouter } from "react-router";
import { checkEmptyParams, formatUrl } from "../../../../helper/CommonFuncs";
import { connect } from "react-redux";
import "../../profile/profileHeader/ProfileHeader.css";
import { fetchSearchPatientResults } from "../actions/searchQueries";
import { bindActionCreators } from "redux";
import * as searchActions from "../../../../redux/actions/searchPatient.action";
import InfiniteScroll from "../../../../shared/components/infiniteScroll/infiniteScroll";
import moment from "moment";

export const getQueryParams = (props) => {
   const searchParams = new URLSearchParams(props.location.search);
   const playBackSearch = searchParams.get("playback") === "false" ? false : true;
   return {
      playbackSearch: playBackSearch,
      query: formatUrl(checkEmptyParams(searchParams.get("query"))),
      dob: checkEmptyParams(searchParams.get("dob")),
      name: checkEmptyParams(searchParams.get("name")),
      mrn: checkEmptyParams(searchParams.get("mrn")),
      hospitalId: checkEmptyParams(searchParams.get("hospitalId")),
      userType: checkEmptyParams(searchParams.get("userType")),
      disabled: false,
   };
};

function SearchPage(props) {
   const [isLoading, setIsLoading] = React.useState(false);
   const playbackSearchKey = new URLSearchParams(props.location.search);
   const playbackSearchKeyValue = playbackSearchKey.get("playback");
   const { accessToken, userCredentials, searchPatientList, setInitialSearchResults } = props;

   const SearchParamValues = getQueryParams(props);

   let searchObj = {
      searchData: {
         search: SearchParamValues?.query,
         userType: searchPatientList?.userType,
         enterpriseId: userCredentials?.user?.enterpriseId || "",
         mrn: SearchParamValues?.playbackSearch ? "" : SearchParamValues?.mrn,
         name: SearchParamValues?.name,
         dob:
            SearchParamValues?.dob === null || SearchParamValues?.dob === ""
               ? null
               : moment(SearchParamValues?.dob).format("YYYYMMDD"),
         emrSearch: SearchParamValues?.playbackSearch ? false : true,
         hospitalId: SearchParamValues?.hospitalId,
      },
      offset: 0,
      limit: 10,
   };

   const valueToSend = SearchParamValues?.query || SearchParamValues?.name;

   const refetchSearchResultsOnRefresh = () => {
      fetchSearchPatientResults(() => {}, valueToSend, false, searchObj);
   };

   const isRefresh = window.location.pathname.includes("/search");

   useEffect(() => {
      if (searchPatientList.checkForRefresh && isRefresh) refetchSearchResultsOnRefresh();
      return () => {
         setInitialSearchResults();
      };
   }, []);

   const isForQuery = SearchParamValues?.query !== "";
   return (
      <div className="SearchPage w-100 p-4 d-flex flex-column" style={{ height: "93vh" }}>
         <div className="text-xlarge font-weight-bold text-start w-100">
            {playbackSearchKeyValue === "true" ? "Invited Search Results" : "EMR Search Results"}
         </div>
         {searchPatientList?.searchPatients.loading ? (
            <table className={`w-100 loading-shade bg-disabled h-100`}>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((o, index) => (
                        <tr key={index}>
                           <td>
                              <div className="demo-view w-100 h-medium loading-table-row" />
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         ) : searchPatientList?.searchPatients.list.length === 0 ? (
            <div className="flex-center ">
               <h3 className="text-grey5 text-large text-bold-500">No search results.</h3>
            </div>
         ) : (
            <div className="results-div w-100 overflow-auto">
               <InfiniteScroll
                  callBack={(call) =>
                     fetchSearchPatientResults(call, searchPatientList.searchQuery, true, false, isForQuery)
                  }
                  showLoader={searchPatientList.searchPatients.hasMore}
               >
                  <PatientTableView
                     user={userCredentials?.user}
                     isLoading={isLoading}
                     setIsLoading={setIsLoading}
                     accessToken={accessToken}
                     className="h-100"
                     stateLoading={searchPatientList?.searchPatients.loading}
                     patients={searchPatientList?.searchPatients.list}
                     isPLBSearch={SearchParamValues?.playbackSearch}
                  />
               </InfiniteScroll>
            </div>
         )}
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
         setCheckForRefresh: searchActions.setCheckForRefresh,
         setInitialSearchResults: searchActions.setInitialState,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchPage));
