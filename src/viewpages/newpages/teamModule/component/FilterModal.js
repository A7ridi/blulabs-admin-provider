import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setDepartmentId, setHospitalId } from "../../../../redux/actions/teamList.action";
import { providerGetDepartments, providerGetHospitals } from "../../../../shared/actions/CommonSocketCall";
import CustomBtn from "../../../../shared/components/CustomBtn";
import CustomSelect from "../../../../shared/components/customSelect/CustomSelect";

const FilterModal = ({
   closeModal,
   enterpriseId,
   selectedIndex,
   setFilteredOn,
   searchTeam,
   getTeamListData,
   setHospitalName,
   teamsList,
   setDepartmentName,
   searchKey,
}) => {
   const [loading, setLoading] = useState(true);
   const [hospitalData, setHospitalData] = useState([]);
   const [departmentData, setDepartmentData] = useState([]);
   const [state, setstate] = useState({
      department: "",
      hospital: "",
      errors: {
         department: null,
         hospital: null,
      },
   });

   const hospitalName = teamsList.hospitalId;
   const departmentName = teamsList.departmentId;

   useEffect(() => {
      providerGetHospitals(enterpriseId, (data) => {
         setHospitalData(data);
         setLoading(false);
         if (hospitalName) {
            providerGetDepartments(hospitalName, (data) => {
               setDepartmentData(data);
               setLoading(false);
            });
         }
      });
   }, []);

   const hospitalChange = (e) => {
      setHospitalName(e);
      providerGetDepartments(e, (data) => {
         setDepartmentData(data);
         setLoading(false);
      });
      let st = { ...state };
      state.errors.hospital = "";
      setstate(st);
      setDepartmentName("");
   };

   const departmentChange = (e) => {
      setDepartmentName(e);
      let st = { ...state };
      state.errors.department = "";
      setstate(st);
   };

   const inputBox = {
      fontSize: "14px",
      background: "#F2F2F2",
      borderRadius: "5px",
   };

   const applyFilter = () => {
      let st = { ...state };
      let isValid = true;
      state.errors.department = null;
      state.errors.hospital = null;
      if (hospitalName === null && departmentName === null) {
         state.errors.department = "Please enter the department";
         state.errors.hospital = "Please enter the hospital";
         isValid = false;
      } else {
         setFilteredOn(true);
         closeModal();
         searchTeam(searchKey, selectedIndex, teamsList);
      }
      setstate(st);
      return isValid;
   };

   const clearAllInput = () => {
      setHospitalName(null);
      setDepartmentName(null);
      setDepartmentData([]);
      setFilteredOn(false);
      if (hospitalName !== null || departmentName !== null) searchTeam(searchKey, selectedIndex, null);
   };

   const checkMarginTop = state.errors.hospital || state.errors.department;
   const checkMarginBottom = state.errors.hospital && state.errors.department;

   const modalId = "dropDownCustom";

   const closeOnClickOutSide = (e) => {
      if (e.target.id === modalId) {
         e.stopPropagation();
         closeModal();
      }
   };

   return (
      <div id={modalId} className="close-filter-modal" onMouseDown={closeOnClickOutSide}>
         <div className="filter-modal">
            <div className="filter-close">
               <h3>Filter</h3>
               <div className="close-btn" onClick={closeModal}>
                  &times;
               </div>
            </div>

            <div className="hospital-department">
               <CustomSelect
                  className="h-100"
                  placeholder="Hospital"
                  onChange={hospitalChange}
                  components={{
                     IndicatorSeparator: () => null,
                  }}
                  value={hospitalName}
                  options={hospitalData}
                  isLoading={loading}
                  inputBox={inputBox}
               />
               <div className={`text-danger text-xxsmall  ${checkMarginBottom && "check-margin"}`}>
                  {state.errors.hospital}
               </div>
               <CustomSelect
                  className="h-100"
                  placeholder="Department"
                  onChange={departmentChange}
                  components={{
                     IndicatorSeparator: () => null,
                  }}
                  value={departmentName}
                  options={departmentData}
                  isLoading={loading}
                  inputBox={inputBox}
               />
               <div className="text-danger text-xxsmall">{state.errors.department}</div>
            </div>
            <CustomBtn
               successText="Apply"
               cancelText="Clear All"
               successClass={
                  "w-small h-90 btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3 mt-4"
               }
               cancelClass={"w-small h-90 font-weight-bold text-small round-border-s flex-center mx-3 cancel-btn mt-4"}
               successClick={applyFilter}
               cancelClick={clearAllInput}
               className={`flex-center h-small content ${!checkMarginTop && "mt-4"} pl-2 pr-2`}
            />
         </div>
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      teamsList: state.teamList,
   };
};

const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setHospitalName: setHospitalId,
         setDepartmentName: setDepartmentId,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(FilterModal);
