import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { ShowAlert, showSwal, error } from "../../../../common/alert";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import "../../providerOnboard/container/onboard.css";
import Select from "react-select";
import "./tooltip.css";
import { getProviderData } from "../../../../actions";
import { useMutation } from "@apollo/client";
import { UPDATE_NOTIFICATION_SETTINGS } from "../../NotificationSettingsModule/actions/notificationSettingsAction";
import { errorToDisplay } from "../../../../helper/CommonFuncs";

const customStyles = {
   container: () => ({
      height: 50,
      width: "100%",
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      maxHeight: 80,
      minHeight: 50,
      overflow: "auto",
      borderRadius: 8,
   }),
};

const customStyles2 = {
   container: () => ({
      height: 50,
      width: "30%",
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      maxHeight: 80,
      minHeight: 50,
      overflow: "auto",
      borderRadius: 8,
   }),
};

const ProvAboutModal = ({
   onClose,
   accessToken,
   createContentTapped = () => {},
   provOnly,
   userCredentials,
   callback,
   loggedInProviderDetails,
}) => {
   const isPreFilled = loggedInProviderDetails?.hospital?.id || false;
   const isPreFilledDept = loggedInProviderDetails?.department?.id || false;
   const isPreFilledDegree = loggedInProviderDetails?.degree || false;
   const isPreFilledTitle = loggedInProviderDetails?.title || false;

   const hospitalInfo = isPreFilled
      ? { value: loggedInProviderDetails.hospital?.id, label: loggedInProviderDetails.hospital.name }
      : "";
   const departmentInfo = isPreFilledDept
      ? { value: loggedInProviderDetails.department?.id, label: loggedInProviderDetails.department.name }
      : "";
   const degreeInfo = isPreFilledDegree
      ? { value: loggedInProviderDetails?.degree, label: loggedInProviderDetails?.degree }
      : "";
   const titleInfo = isPreFilledTitle ? loggedInProviderDetails?.title : "";
   const [providerTitle, setProviderTitle] = useState(titleInfo);
   const [shortTitle, setShortTitle] = useState(degreeInfo);
   const [department, setDepartment] = useState(departmentInfo);
   const [hospitalId, setHospitalId] = useState(hospitalInfo);
   const [shortTitleData, setShortTitleData] = useState([]);
   const [departmentData, setDepartmentData] = useState([]);
   const [hospitalData, setHospitalData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [state, setstate] = useState({
      title: "",
      shortTitle: "",
      department: "",
      hospital: "",
      errors: {
         title: null,
         shortTitle: null,
         department: null,
         hospital: null,
      },
   });

   const [update] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(data) {
         ShowAlert(data?.updateProfile?.status?.message);
         getProviderData(null, true);
         callback && callback();
         onClose();
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
      },
   });

   const enterpriseId = userCredentials?.user?.enterpriseId;

   useEffect(() => {
      fetchInitialApi();
   }, []);

   const fetchInitialApi = () => {
      providerGetShortTitle(shortTitle);
   };

   const providerGetShortTitle = async (shortTitle) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getShortTitle,
         degree: shortTitle?.data,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data =
               resultStatus?.data
                  ?.filter((o) => o.length > 1)
                  ?.map((o, i) => {
                     return { label: o, value: o, data: o };
                  }) || [];
            setShortTitleData(data);
            providerGetHospitals(hospitalId);
         } else {
            showSwal(resultStatus?.settings?.message);
         }
      });
   };

   const providerGetHospitals = async () => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getHospitals,
         enterpriseId,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data = resultStatus?.hospitals?.map((o) => {
               return { label: o.name, value: o.id, data: o };
            });
            setHospitalData(data);
            setLoading(false);
            if (isPreFilled) providerGetDepartments(hospitalInfo);
         } else {
            showSwal(resultStatus?.message);
         }
      });
   };

   const providerGetDepartments = (hospital) => {
      let onboardingParams = {
         action: socketActions.onboarding,
         subAction: socketSubActions.getDepartmentsV2,
         // department: department?.value,
         hospitalId: hospital?.value,
      };
      window.socket.send(onboardingParams, (resultStatus) => {
         if (resultStatus?.settings?.status === 1) {
            let data =
               resultStatus?.data?.map((o) => {
                  return { label: o.name, value: o.id, data: o };
               }) || [];
            setDepartmentData(data);
            setLoading(false);
            localStorage.setItem("providerDetails", "true");
         } else {
            showSwal(resultStatus?.settings?.message);
         }
      });
   };

   const updateProviderData = async (providerTitle, shortTitle, hospitalId, department) => {
      update({
         variables: {
            user: {
               providerInfo: {
                  degree: shortTitle?.label || "",
                  title: providerTitle,
               },
               departments: [{ id: department.value }],
               hospitals: [{ id: hospitalId?.value }],
            },
         },
      });
   };

   const submitFormData = () => {
      let st = { ...state };
      let isValid = true;
      state.errors.title = null;
      state.errors.department = null;
      state.errors.hospital = null;
      if (
         (hospitalId === "" || hospitalId === null || hospitalId?.length === 0) &&
         (department === "" || department?.length === 0 || department === null) &&
         (providerTitle === "" || providerTitle === null || providerTitle?.length === 0)
      ) {
         state.errors.title = "Please enter your title";
         state.errors.department = "Please enter your department";
         state.errors.hospital = "Please enter your hospital";
         isValid = false;
         // ShowAlert("Please enter required fields", error);
      } else if (
         (providerTitle === "" || providerTitle === null) &&
         (department === "" || department?.length === 0 || department === null)
      ) {
         state.errors.title = "Please enter your title";
         state.errors.department = "Please enter your department";
         isValid = false;
      } else if (
         (hospitalId === "" || hospitalId === null || hospitalId?.length === 0) &&
         (department === "" || department?.length === 0 || department === null)
      ) {
         state.errors.department = "Please enter your department";
         state.errors.hospital = "Please enter your hospital";
         isValid = false;
      } else if (
         (hospitalId === "" || hospitalId === null || hospitalId?.length === 0) &&
         (providerTitle === "" || providerTitle === null)
      ) {
         state.errors.title = "Please enter your title";
         state.errors.hospital = "Please enter your hospital";
         isValid = false;
      } else if (providerTitle === "" || providerTitle === null) {
         state.errors.title = "Please enter your title";
         isValid = false;
      }
      // else if (shortTitle === "" || shortTitle === null) {
      //    state.errors.shortTitle = "Please enter your degree";
      //    isValid = false;
      // }
      else if (hospitalId === "" || hospitalId === null || hospitalId?.length === 0) {
         state.errors.hospital = "Please enter your hospital";
         isValid = false;
      } else if (department === "" || department?.length === 0 || department === null) {
         state.errors.department = "Please enter your department";
         isValid = false;
      } else {
         updateProviderData(providerTitle, shortTitle, hospitalId, department);
      }

      setstate(st);
      return isValid;
   };

   return (
      <div
         className="invite-patient-view col col-md-7 p-4 bg-white"
         style={{ maxWidth: "800px", height: "523px", borderRadius: "20px", position: "relative" }}
      >
         <div className="alert-title-div w-100 d-flex justify-content-end">
            <h2 className={`w-100 font-weight-bold text-center text-class about-modal_header`}>Your information</h2>
            <button className={`h1 m-0 h-100 flex-centepr pr-3 position-absolute x-button-class`} onClick={onClose}>
               &times;
            </button>
         </div>
         <div className="about-modal_content">
            <h2 className={`w-100 font-weight-normal text-center text-class about-modal_content-title`}>
               Help patients get to know you
            </h2>
         </div>

         <div className="about-modal-content">
            <div className="about-modal-container">
               <div className="form-group">
                  <Select
                     className="h-100"
                     styles={customStyles}
                     cacheOptions
                     defaultOptions
                     isClearable={true}
                     onChange={(e) => {
                        if (e) {
                           providerGetDepartments(e);
                        } else {
                           setDepartmentData([]);
                        }
                        setHospitalId(e);
                        let st = { ...state };
                        state.errors.hospital = "";
                        setstate(st);
                        setDepartment("");
                     }}
                     placeholder="Hospital"
                     components={{
                        IndicatorSeparator: () => null,
                     }}
                     value={hospitalId}
                     options={hospitalData}
                     isLoading={loading}
                  />
                  <div className="text-danger text-xsmall">{state.errors.hospital}</div>
                  <Select
                     className="h-100"
                     styles={customStyles}
                     cacheOptions
                     defaultOptions
                     isClearable={true}
                     onChange={(e) => {
                        setDepartment(e);
                        let st = { ...state };
                        state.errors.department = "";
                        setstate(st);
                     }}
                     placeholder="Department"
                     components={{
                        IndicatorSeparator: () => null,
                     }}
                     value={department}
                     options={departmentData}
                     isLoading={loading}
                  />
                  <div className="text-danger text-xsmall">{state.errors.department}</div>

                  <div className="select-input-field">
                     <Select
                        className="h-100"
                        styles={customStyles2}
                        cacheOptions
                        defaultOptions
                        isClearable={true}
                        onChange={(e) => {
                           setShortTitle(e);
                        }}
                        value={shortTitle}
                        placeholder="Suffix"
                        components={{
                           IndicatorSeparator: () => null,
                        }}
                        options={shortTitleData}
                        isLoading={loading}
                     />

                     <input
                        type="text"
                        className="h-100"
                        style={{
                           padding: "16px",
                           borderRadius: "8px",
                           borderColor: "hsl(0,0%,80%)",
                           borderWidth: "1px",
                           borderStyle: "solid",
                           width: "70%",
                           fontSize: "13px",
                        }}
                        value={providerTitle}
                        placeholder="Title (ex. Surgeon, Nurse Practitioner)"
                        onChange={(e) => {
                           setProviderTitle(e.target.value);
                           let st = { ...state };
                           state.errors.title = "";
                           setstate(st);
                        }}
                     />
                  </div>
                  <div className="d-flex justify-content-center">
                     {/* <div className="text-danger text-xsmall">{state.errors.shortTitle}</div> */}
                     <div className="text-danger text-xsmall">{state.errors.title}</div>
                  </div>
               </div>

               <button
                  className="btn btn-blue-block about-modal"
                  id="enter-action-button"
                  onClick={() => submitFormData()}
                  style={{ position: "absolute", bottom: "0%" }}
               >
                  Update
               </button>
            </div>
         </div>
      </div>
   );
};

const mapStateToProps = (state) => {
   return {
      accessToken: state.auth?.northwelluser?.user?.stsTokenManager?.accessToken,
      userCredentials: state.auth?.userCredentials,
      callback: state.patientProfile?.callback,
      loggedInProviderDetails: state.auth.loggedInProviderDetails,
   };
};

export default connect(mapStateToProps)(withRouter(ProvAboutModal));
