import React, { memo } from "react";
import PatientDetailsView from "./patientDetailsView/PatientDetailsView";
import LoadingIndicator from "../../common/LoadingIndicator";
import { ShowAlert } from "../../common/alert";
import { socketActions, socketSubActions } from "../../helper/Websocket";
import { Link } from "react-router-dom";
import { formatPhoneNumber, getFormattedDate, ageForDob, calculateDateLabel } from "../../helper/CommonFuncs";
import FollowCont from "../../viewpages/newpages/profileModule/container/followModalCont";
import { setSearchPatientFollowStatus } from "../../redux/actions/searchPatient.action";

import { withRouter } from "react-router-dom";
const PatientRecordDetails = (props) => {
   const { recordTitle, recordValue, className } = props;
   return (
      <div className={`patient-record-details d-flex flex-column flex-grow-1 ${className}`}>
         <div className="record-title text-grey2 text-small sfpro-text">{recordTitle}</div>
         <div className="record-value text-black2 text-small sfpro-text">{recordValue}</div>
      </div>
   );
};

const getInviteNorthPatient = (obj, accessToken, props) => {
   props.setIsLoading(true);
   let patientData = { ...obj };

   const isHealthSystemAvailable = obj.healthSystems.length > 0 ? obj.healthSystems[0] : null;
   const isPatientSystemAvailable =
      obj.healthSystems.length > 0 && obj.healthSystems[0].patientIdentifiers.length > 0
         ? obj.healthSystems[0].patientIdentifiers[0]
         : null;
   let socketObj = {
      Authorization: `Bearer ${accessToken}`,
      address: obj.contactInformation.address,
      mrn: isPatientSystemAvailable ? isPatientSystemAvailable.number : null,
      assigningAuthority: isPatientSystemAvailable ? isPatientSystemAvailable.authority : null,
      birthDate: patientData.dob,
      firstName: patientData.name.firstName,
      lastName: patientData.name.lastName,
      mobileNo: patientData.contactInformation.mobileNumber,
      healthSystemData: {
         ...isHealthSystemAvailable,
         assigningAuthority: isPatientSystemAvailable ? isPatientSystemAvailable.authority : null,
      },
      email: patientData.contactInformation.email,
      subAction: socketSubActions.addPatient,
      action: socketActions.referral,
   };

   window.socket.send(socketObj, (result) => {
      if (result?.settings?.status === 1) {
         props.setIsLoading(false);
         getRedirectOnName(result.data.id, props);
      } else {
         const message = result?.message || "Something went wrong!";
         ShowAlert(message, "error");
         props.setIsLoading(false);
      }
      window.socket.close();
   });
};

const getRedirectOnName = (id, props) => {
   props.history.push("/patient/" + id);
};
const tableHeaderStyle = {
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   paddingLeft: 10,
   background: "rgba(224, 224, 224, 0.3)",
   border: "1px solid #E0E0E0",
   boxSizing: "border-box",
};

const tableHeaderStyleBorderLess = {
   height: 44,
   display: "flex",
   alignItems: "center",
   // justifyContent: "center",
   paddingLeft: 10,
   background: "rgba(224, 224, 224, 0.3)",
   border: "1px solid #E0E0E0",
   borderLeft: "none",
   borderRight: "none",
   boxSizing: "border-box",
};

const PatientTableView = memo((props) => {
   const { patients = [], stateLoading, className, isPLBSearch, accessToken, isLoading } = props;
   return (
      <>
         {isLoading ? (
            <div className="loader-container">
               <LoadingIndicator />
            </div>
         ) : (
            <table border="0" className={`w-100 bg-white ${className}`}>
               <thead className="text-small">
                  <tr>
                     <th width="27%" className="overflow-hidden">
                        <div
                           style={{
                              ...tableHeaderStyle,
                              borderTopLeftRadius: "8px",
                              borderRight: "none",
                           }}
                        >
                           Patient Name
                        </div>
                     </th>

                     <th width="10%">
                        <div style={tableHeaderStyleBorderLess}>Age</div>
                     </th>
                     <th width="13%">
                        <div style={tableHeaderStyleBorderLess}>Date of birth</div>
                     </th>
                     <th width="15%">
                        <div style={tableHeaderStyleBorderLess}>Contact Info</div>
                     </th>

                     <th width="12%">
                        <div
                           style={{
                              ...tableHeaderStyleBorderLess,
                              borderTopRightRadius: "8px",
                              borderLeft: "none",
                           }}
                        >
                           Last Accessed
                        </div>
                     </th>
                  </tr>
               </thead>
               <tbody>
                  {stateLoading
                     ? Array(10)
                          .fill()
                          .map((o, index) => (
                             <tr key={index}>
                                <td>
                                   <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                                </td>
                             </tr>
                          ))
                     : patients.map((obj, i) => {
                          const initials = isPLBSearch ? obj?.name?.initials : false;
                          const healthSystemsArr = obj?.healthSystems || [];
                          let isAssigningAuthority =
                             healthSystemsArr.some((healthSystem) => {
                                return healthSystem?.patientIdentifiers?.some((patientIdentifier) => {
                                   return patientIdentifier?.authority === "AIPB";
                                });
                             }) || false;
                          const mobileNumber = !isPLBSearch
                             ? obj?.contactInformation?.mobileNumber
                                ? formatPhoneNumber("+1" + obj?.contactInformation?.mobileNumber)
                                : "-"
                             : formatPhoneNumber(obj?.contactInformation?.mobileNumber) || false;
                          return (
                             <tr
                                onClick={(e) => {
                                   e.stopPropagation();
                                   if (!isAssigningAuthority && !isPLBSearch) {
                                      getInviteNorthPatient(obj, accessToken, props);
                                   } else {
                                      if (isAssigningAuthority) {
                                         getRedirectOnName(obj?.id, props);
                                      } else {
                                         getRedirectOnName(obj?.id, props);
                                      }
                                   }
                                }}
                                className="hover-default pointer"
                                key={obj.id}
                             >
                                <td className="table-row-height">
                                   <div className="d-flex align-items-center">
                                      {isPLBSearch && (
                                         <FollowCont
                                            profile={true}
                                            isFollow={obj?.isFollow}
                                            refetch={() => setSearchPatientFollowStatus({ ...obj, index: i })}
                                            userId={obj?.id}
                                         />
                                      )}
                                      <div className="text-black2 hover-anchor text-truncate">
                                         <PatientDetailsView
                                            imageSrc={
                                               obj?.id ? `${process.env.REACT_APP_PROFILE_URL}/${obj?.id}` : null
                                            }
                                            initialsApi={initials}
                                            className="p-3 sfpro-text"
                                            name={obj?.name ? obj?.name?.fullName : "Patient"}
                                            userBg={
                                               !isPLBSearch
                                                  ? "rgb(128, 128, 128)"
                                                  : obj?.colorCode ||
                                                    window.initialColors[i % window.initialColors.length]
                                            }
                                            details={[]}
                                         />
                                      </div>
                                      {isAssigningAuthority && (
                                         <div className="logo-aipb my-4">
                                            <img src="/assets/images/newimages/favicon.svg" alt="" />
                                         </div>
                                      )}
                                   </div>
                                </td>

                                <td>
                                   <div>
                                      <PatientRecordDetails
                                         recordTitle=""
                                         recordValue={ageForDob(obj?.dob)}
                                         className="p-3"
                                      />
                                   </div>
                                </td>
                                <td>
                                   <div className="text-left">
                                      <PatientRecordDetails
                                         recordTitle=""
                                         recordValue={
                                            getFormattedDate(obj?.dob) === "" ? "-" : getFormattedDate(obj?.dob)
                                         }
                                         className="p-3"
                                      />
                                   </div>
                                </td>

                                <td>
                                   <div>
                                      {mobileNumber && (
                                         <Link to={`/patient/${obj?.id}`}>
                                            <PatientRecordDetails recordValue={mobileNumber} className="px-3" />
                                         </Link>
                                      )}
                                      {obj?.contactInformation?.email && (
                                         <Link to={`/patient/${obj?.id}`}>
                                            <PatientRecordDetails
                                               recordValue={
                                                  obj?.contactInformation?.email ? obj?.contactInformation?.email : "-"
                                               }
                                               className="px-3"
                                            />
                                         </Link>
                                      )}
                                   </div>
                                </td>

                                <td>
                                   <div>
                                      <PatientRecordDetails
                                         recordTitle=""
                                         recordValue={obj?.lastAccessed ? calculateDateLabel(obj?.lastAccessed) : "-"}
                                         className="p-3"
                                      />
                                   </div>
                                </td>
                             </tr>
                          );
                       })}
               </tbody>
            </table>
         )}
      </>
   );
});

export default withRouter(PatientTableView);
