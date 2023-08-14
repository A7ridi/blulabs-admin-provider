import React, { useState, useEffect } from "react";
import { withRouter } from "react-router";
import { socketActions, socketSubActions } from "../../../../helper/Websocket";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { getFormattedDate, formatPhoneNumber } from "../../../../helper/CommonFuncs";
import { showSwal } from "../../../../common/alert";
import LoadingIndicator from "../../../../common/LoadingIndicator";
import { fetchQuery } from "../../../../actions";
import { GET_INACTIVE_PATIENT_LIST } from "../actions/inactivePatientListAction";
import InfiniteScroll from "../../../../shared/components/infiniteScroll/infiniteScroll";

const tableHeaderStyle = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   padding: "5px",
};

const PatientTableView = ({ inActivePatients, onActiveClick }) => {
   return (
      <>
         <table className={`w-100 mt-4 bg-white`}>
            <thead className="text-small">
               <tr>
                  <th width="27%" className="overflow-hidden">
                     <div
                        style={{
                           ...tableHeaderStyle,
                           borderTopLeftRadius: "8px",
                           borderLeft: "1px solid #ced4da",
                           paddingLeft: "15px",
                        }}
                     >
                        Patient Name
                     </div>
                  </th>
                  <th width="15%">
                     <div style={tableHeaderStyle}>Hospital Name</div>
                  </th>

                  <th width="15%">
                     <div style={tableHeaderStyle}>Date of Birth</div>
                  </th>

                  <th width="18%">
                     <div style={tableHeaderStyle}>Mobile number </div>
                  </th>
                  <th width="15%">
                     <div style={tableHeaderStyle}>Email</div>
                  </th>

                  <th width="16%" className="text-center">
                     <div
                        style={{
                           ...tableHeaderStyle,
                           borderRight: "1px solid #ced4da",
                           borderTopRightRadius: "8px",
                           justifyContent: "center",
                        }}
                     >
                        Actions
                     </div>
                  </th>
               </tr>
            </thead>
            <tbody>
               {inActivePatients &&
                  inActivePatients.length > 0 &&
                  inActivePatients.map((obj, i) => {
                     const color = obj.colorCode || window.initialColors[i % window.initialColors.length];
                     const hospitalName =
                        Array.isArray(obj.hospitals) && obj.hospitals.length > 0 ? obj.hospitals[0]?.name : "";
                     return (
                        <tr
                           onClick={() => {
                              onActiveClick(obj);
                           }}
                           style={{ cursor: "pointer" }}
                           className={`hover-default`}
                           key={obj?.id}
                        >
                           <td className="p-4">
                              <div className="d-flex align-items-center">
                                 <PatientDetailsView
                                    initialsApi={obj?.name?.initials || false}
                                    imageRad={32}
                                    className="pointer text-truncate"
                                    userBg={color}
                                    name={obj?.name?.fullName || ""}
                                 />
                              </div>
                           </td>
                           <td className="table-title-custom">{hospitalName || "-"}</td>
                           <td className="table-title-custom">{getFormattedDate(obj.dob) || "-"}</td>
                           <td className="table-title-custom">
                              {obj?.contactInformation?.mobileNumber
                                 ? formatPhoneNumber(obj.contactInformation?.mobileNumber)
                                 : "-"}
                           </td>

                           <td className="table-title-custom">{obj.contactInformation?.email || "-"}</td>

                           <td>
                              <div
                                 className="w-100 h-100 flex-center removeButton pointer"
                                 style={{
                                    justifyContent: "center",
                                 }}
                              >
                                 <div className="mr-3" />
                                 Activate
                              </div>
                           </td>
                        </tr>
                     );
                  })}
            </tbody>
         </table>
      </>
   );
};

function ActivatePatient(props) {
   const { accessToken, history, userObject, featureFlags } = props;

   const [loading, setLoading] = useState(true);

   const [inActivePatients, setInactivePatients] = useState([]);
   const [loader, setLoader] = useState(false);
   const [offset, setOffset] = useState(0);
   const [hasMore, setHasMore] = useState(true);

   useEffect(() => {
      let loadPage =
         userObject?.role?.some((some) => {
            return some === "admin";
         }) && featureFlags?.showAdminBanner;
      if (loadPage) {
         getInActivePatient();
      } else {
         props.history.push("/");
      }
   }, []);
   const getInActivePatient = (callBack = () => {}) => {
      let activationObj = {
         limit: 10,
         offset: offset,
         inactive: true,
         enterpriseId: userObject?.enterpriseId,
      };
      fetchQuery(
         GET_INACTIVE_PATIENT_LIST,
         activationObj,
         (result) => {
            let data = result?.data?.getPatients?.users || [];
            let totCount = result?.data?.getPatients?.totalCount || 0;
            let totalInactivePatients = [...inActivePatients, ...data] || [];
            if (offset > 0) {
               setInactivePatients(totalInactivePatients);
            } else {
               setInactivePatients(data);
            }
            callBack();
            setHasMore(totalInactivePatients.length < totCount);
            setOffset(offset + 10);
            setLoading(false);
         },
         (error) => {
            console.log(error);
         }
      );
   };

   const activatePatient = (patient) => {
      showSwal(
         "Confirm",
         " Are you sure you want to Activate Patient " + patient?.name?.fullName + " ?",
         () => {
            activateSocket(patient);
         },
         false,
         true
      );
   };

   const activateSocket = (patient) => {
      setLoader(true);
      let onboardingStatusParams = {
         Authorization: `Bearer ${accessToken}`,
         action: socketActions.onboarding,
         subAction: socketSubActions.openQRCode,
         patientId: patient?.id,
      };
      window.socket.send(onboardingStatusParams, (resultStatus) => {
         if (resultStatus.settings.status === 1) {
            history.push("/patient/" + patient.id);
         }
      });
   };

   return (
      <div className="SearchPage w-100 h-100 p-4 d-flex flex-column">
         <div className="text-xlarge font-weight-bold text-start w-100">{"Activate patients"}</div>
         {loader ? (
            <div className="onBoardingProvider">
               <LoadingIndicator />
            </div>
         ) : loading ? (
            <table className={`w-100 bg-white h-100`}>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((o, index) => (
                        <tr key={index}>
                           <td>
                              <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         ) : inActivePatients.length === 0 ? (
            <div className="flex-center ">
               <h3 className="text-grey5 text-large text-bold-500">No Inactive Patients</h3>
            </div>
         ) : (
            <div className="results-div w-100 overflow-auto">
               <InfiniteScroll callBack={getInActivePatient} showLoader={hasMore}>
                  <PatientTableView inActivePatients={inActivePatients} onActiveClick={activatePatient} />
               </InfiniteScroll>
            </div>
         )}
      </div>
   );
}

export default withRouter(ActivatePatient);
