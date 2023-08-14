import React, { memo, useState } from "react";
import { blueBtnCls, greyBtnCls } from "../../helper/CommonFuncs";
import { pendoIds } from "../../Constants/pendoComponentIds/pendoConstants";
import Select from "react-select";
import DatePicker from "react-datepicker";
import ModalPopup from "./ModalPopup";
import InvitePatientView from "./InvitePatientView";
import * as searchActions from "../../redux/actions/searchPatient.action";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { pushToSearchPatients, isDisabled } from "../../redux/actions/searchPatient.action";
import { fetchSearchPatientResults } from "../../viewpages/newpages/searchModule/actions/searchQueries";
import InputMask from "react-input-mask";

const inputcls = "default-text-input w-100 h-xsmall p-3 border-grey";

const Input = memo((props) => (
   <input
      className={`${props.cls} ${inputcls} ${props.disabled ? "bg-disabled opacity-half" : "bg-transparent"}`}
      {...props}
   />
));

const SearchSwitchBtn = memo(
   (props) => (
      <button
         className={`text-xsmall text-black h-100 w-small round-border-s ${
            props.selected ? blueBtnCls : "border-grey bg-light-grey"
         } h-xsmall w-25`}
         {...props}
      >
         {props.text}
      </button>
   ),
   (p, n) => p.selected === n.selected
);

const FilterView = memo((props) => {
   const {
      onAction,
      hospitals,
      areSameObjects,
      searchPatientList,
      setSearchQuery,
      setSearchName,
      setSearchDOB,
      setSearchMRN,
      setSearchHospitalId,
      setClearSearchFields,
      setPlaybackSearchFlag,
      loggedInProviderDetails,
   } = props;
   const [state, setstate] = useState({
      applyDisabled: false,
      fieldsDisabled: false,
   });

   const showAdvanceSearch = loggedInProviderDetails?.enterpriseInfo?.appIntegration?.advanceSearch || false;

   const isPlayback = searchPatientList.playbackSearchFlag;
   return (
      <div
         style={{ zIndex: "999" }}
         className="FilterView w-100 position-absolute bg-white shadow p-4 round-border-s mt-4"
      >
         {showAdvanceSearch && (
            <div className="top flex-center w-100 h-xsmall mb-4">
               <SearchSwitchBtn
                  id={pendoIds.btnPlaybackSearch}
                  text="Invited"
                  selected={isPlayback}
                  onClick={() => {
                     setPlaybackSearchFlag(true);
                     setSearchMRN("");
                  }}
               />
               <div className="mx-4" />
               <SearchSwitchBtn
                  id={pendoIds.btnEmrSearch}
                  text="EMR"
                  selected={!isPlayback}
                  onClick={() => {
                     setPlaybackSearchFlag(false);
                  }}
               />
            </div>
         )}
         <div className="my-4 w-100">
            <Input
               placeholder="Patient Name"
               disabled={state.fieldsDisabled}
               value={searchPatientList.name}
               onChange={(e) => {
                  setSearchName(e.target.value);
                  setSearchQuery(e.target.value);
               }}
            />
         </div>
         <div className="mid flex-center w-100 flex-column">
            <Input
               disabled={isPlayback}
               placeholder="MRN"
               value={searchPatientList.mrn}
               onChange={(e) => {
                  setSearchMRN(e.target.value);
               }}
            />
            <Select
               placeholder={<div className="select-compoennt-custom">Select hospital</div>}
               className="my-4 w-100 select-compoennt-custom"
               value={searchPatientList.hospitalId}
               onChange={(e) => {
                  setSearchHospitalId({ label: e?.label, value: e?.value });
               }}
               styles={{
                  container: () => ({
                     marginTop: 40,
                     marginBottom: 103,
                     height: 40,
                  }),
                  control: (provided) => ({
                     ...provided,
                     display: "flex",
                     height: 40,
                  }),
               }}
               options={hospitals}
            />
            <div className="w-100 h-xsmall bg-light-grey flex-center justify-content-end">
               <img className="position-absolute mr-3" src="/assets/images/newimages/datepicker-icon.svg" alt="" />
               <DatePicker
                  disabled={state.fieldsDisabled}
                  popperProps={{ positionFixed: true }}
                  onSelect={(date) => {
                     setSearchDOB(new Date(date));
                  }}
                  value={searchPatientList.dob}
                  selected={searchPatientList.dob}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className={` select-compoennt-custom ${state.fieldsDisabled ? "bg-disabled" : ""} ${inputcls}`}
                  autoComplete="off"
                  placeholderText="Date of birth"
                  dateFormat="MM/dd/yyyy"
                  maxDate={new Date()}
                  customInput={
                     <InputMask mask="99/99/9999" value={searchPatientList.dob}>
                        {(inputProps) => <input {...inputProps} />}
                     </InputMask>
                  }
               />
            </div>
         </div>
         <div className="bottom w-100 h-xsmall d-flex my-3">
            {showAdvanceSearch && (
               <button
                  id={pendoIds.btnSearchBoxInvitePatient}
                  onClick={() => setstate({ ...state, showInvite: true })}
                  className={`clear-button ${areSameObjects() ? "" : "pointer"}`}
               >
                  Invite Patient
               </button>
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
                        onAction && onAction();
                        //onPatientTap(id, true);
                     }}
                  />
               </ModalPopup>
            ) : null}
            {!showAdvanceSearch && (
               <button
                  onClick={() => {
                     setClearSearchFields();
                  }}
                  className={`clear-button ${areSameObjects() ? "" : "pointer"}`}
               >
                  clear
               </button>
            )}
            <div className="flex-grow-1" />
            <button
               id={pendoIds.btnCloseSearchPatient}
               className={`${greyBtnCls} m-2`}
               onClick={() => {
                  onAction && onAction();
               }}
            >
               Close
            </button>
            <button
               id={pendoIds.btnSearchPatient}
               disabled={isDisabled()}
               className={`${blueBtnCls} m-2`}
               onClick={() => {
                  pushToSearchPatients(props.history, true);
                  fetchSearchPatientResults(() => {}, searchPatientList.name, false);
                  onAction && onAction(state);
               }}
            >
               Search
            </button>
         </div>
      </div>
   );
});

const mapStateToProps = (state) => {
   return {
      searchPatientList: state.searchpatientlist,
      userCredentials: state.auth.userCredentials,
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      loggedInProviderDetails: state.auth?.loggedInProviderDetails,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setSearchQuery: searchActions.setSearchQuery,
         setSearchDOB: searchActions.setSearchDOB,
         setSearchMRN: searchActions.setSearchMRN,
         setSearchHospitalId: searchActions.setSearchHospitalId,
         setSearchEnterpriseId: searchActions.setSearchEnterpriseId,
         setSearchUserType: searchActions.setSearchUserType,
         setSearchName: searchActions.setSearchName,
         setClearSearchFields: searchActions.setClearSearchFields,
         setPlaybackSearchFlag: searchActions.setPlaybackSearchFlag,
      },
      dispatch
   );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(memo(FilterView)));
