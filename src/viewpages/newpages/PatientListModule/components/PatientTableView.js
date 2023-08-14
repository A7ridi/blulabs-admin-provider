import React, { memo } from "react";
import data from "../../../../I18n/en.json";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import moment from "moment";
import {
   ageForDob,
   calculateDateLabel,
   formatPhoneNumber,
   getDateFormatFromTimeStamp,
} from "../../../../helper/CommonFuncs";
import { ReactComponent as EditSvg } from "../../../../images/dashboard-action-icons/edit-grey-icon.svg";
import { ReactComponent as ReferSvg } from "../../../../images/dashboard-action-icons/pbconnect-grey-icon.svg";
import { ReactComponent as MessageSvg } from "../../../../images/dashboard-action-icons/send-message.svg";
import FollowCont from "../../profileModule/container/followModalCont";
import { updatePatientFollowStatus } from "../../../../redux/actions/patientList.action";
import EmptyStateComp from "../../EmptyStateComp";

import NoPatients from "../../../../images/empty-states/no-patients.svg";
import * as i18n from "../../../../I18n/en.json";
import { checkProviderData } from "../../../../actions";

const tableHeaderStyle = {
   border: "1px solid #ced4da",
   borderRight: "none",
   borderLeft: "none",
   background: "rgba(224, 224, 224, 0.2)",
   height: 44,
   display: "flex",
   alignItems: "center",
   justifyContent: "start",
   paddingLeft: 10,
};

const PatientRecordDetails = (props) => {
   const { recordTitle, recordValue, className } = props;
   return (
      <div className={`patient-record-details d-flex flex-column flex-grow-1 ${className}`}>
         {recordTitle && <div className="record-title text-grey2 text-small sfpro-text">{recordTitle}</div>}
         <div className="record-value text-black2 text-small sfpro-text">{recordValue}</div>
      </div>
   );
};

const PatientTableView = memo(
   ({
      patients,
      stateLoading,
      openModal,
      openSendMessageModal,
      openPatientReferralViewModal,
      showReferralKey,
      selectedIndex,
      redirectTo,
      noPatientData,
      isMyPatient,
      loader,
   }) => {
      const getStarted = i18n.emptyState.getStarted;
      const patientDesc = i18n.emptyState.patientDesc;

      const checkProviderDataCallback = (obj, i) => {
         openSendMessageModal && openSendMessageModal(obj, i);
      };
      return (
         <>
            {loader || stateLoading ? (
               <table className={`w-100 bg-white h-100`}>
                  <tbody>
                     {Array(10)
                        .fill()
                        .map((o, index) => (
                           <tr key={index} className="loading-shade">
                              <td width="100%">
                                 <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                              </td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            ) : noPatientData ? (
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
               <table className={`w-100 mt-4 bg-white`}>
                  <thead className="text-small">
                     <tr>
                        <th width="30%" className="overflow-hidden">
                           <div
                              style={{
                                 ...tableHeaderStyle,
                                 borderTopLeftRadius: "8px",
                                 borderLeft: "1px solid #ced4da",
                              }}
                           >
                              {data.patientTableHeadings.patientNameHeading}
                           </div>
                        </th>
                        <th width="8%">
                           <div style={tableHeaderStyle}> {data.patientTableHeadings.patientAgeHeading}</div>
                        </th>
                        <th width="18%">
                           <div style={tableHeaderStyle}> {data.patientTableHeadings.patientDOBHeading}</div>
                        </th>
                        <th width="18%">
                           <div style={tableHeaderStyle}> {data.patientTableHeadings.patientContactInfoHeading}</div>
                        </th>
                        <th width="18%">
                           <div style={tableHeaderStyle}> {data.patientTableHeadings.patientLastAccessedHeading}</div>
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
                              {data.patientTableHeadings.patientActionsHeading}
                           </div>
                        </th>
                     </tr>
                  </thead>

                  <tbody>
                     {patients &&
                        patients.length > 0 &&
                        patients.map((obj, i) => {
                           const color = obj.colorCode || window.initialColors[i % window.initialColors.length];
                           const initials = obj?.name?.initials || false;
                           return (
                              <tr
                                 onClick={() => {
                                    redirectTo.push(`/patient/${obj?.pObj?.patientId}`);
                                 }}
                                 style={{ cursor: "pointer" }}
                                 className={`hover-default ${stateLoading ? "loading-shade" : ""}`}
                                 key={obj?.id}
                              >
                                 <td className="table-row-height">
                                    <div className="d-flex align-items-center">
                                       <FollowCont
                                          profile={true}
                                          isFollow={obj?.isFollow}
                                          refetch={() => updatePatientFollowStatus({ ...obj, index: i }, isMyPatient)}
                                          userId={obj?.id}
                                       />
                                       <PatientDetailsView
                                          imageSrc={
                                             obj?.pObj?.patientId
                                                ? `${process.env.REACT_APP_PROFILE_URL}/${
                                                     obj.pObj.patientId
                                                  }?ver=${Math.random()}`
                                                : null
                                          }
                                          className="py-3 ml-3 sfpro-text"
                                          initialsApi={initials}
                                          name={obj?.name?.fullName ? obj?.name?.fullName : "Patient"}
                                          userBg={color}
                                       />
                                    </div>
                                 </td>
                                 <td>
                                    <PatientRecordDetails recordValue={ageForDob(obj?.dob)} className="p-3" />
                                    {/* <PatientRecordDetails recordValue={ageForDob(obj?.dateOfBirth)} className="p-3" /> */}
                                 </td>
                                 <td>
                                    <PatientRecordDetails
                                       recordValue={getDateFormatFromTimeStamp(obj?.dob)}
                                       className="p-3"
                                    />
                                 </td>

                                 <td>
                                    {obj?.contactInformation?.mobileNumber && (
                                       <PatientRecordDetails
                                          recordValue={formatPhoneNumber(obj?.contactInformation?.mobileNumber || "")}
                                          className="p-3"
                                       />
                                    )}
                                    {obj?.contactInformation?.email && (
                                       <PatientRecordDetails
                                          recordValue={obj?.contactInformation?.email || ""}
                                          className="p-3"
                                       />
                                    )}
                                 </td>
                                 <td>
                                    <PatientRecordDetails
                                       recordValue={obj?.lastAccessed ? calculateDateLabel(obj?.lastAccessed) : "-"}
                                       className="p-3"
                                    />
                                 </td>
                                 <td>
                                    <div
                                       className="w-100 h-100 flex-center"
                                       style={{
                                          justifyContent: "center",
                                       }}
                                    >
                                       <EditSvg
                                          id={pendoIds.btnEditPatientInfo}
                                          className="action-icon pointer"
                                          onClick={(e) => {
                                             openModal && openModal({ ...obj, index: i });
                                             e.stopPropagation();
                                          }}
                                          title="Edit patient information"
                                          style={{ margin: "0px 10px 0px 25px" }}
                                       />

                                       <MessageSvg
                                          id={pendoIds.btnSendPatientMessage}
                                          className="action-icon pointer"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             checkProviderData(() => {
                                                checkProviderDataCallback(obj, i);
                                             });
                                          }}
                                          title="Send patient message"
                                          style={{ margin: "0px 10px" }}
                                       />
                                       {/* {showReferralKey && (
                                          <ReferSvg
                                             id={pendoIds.btnPlaybackConnect}
                                             onClick={(e) => {
                                                openPatientReferralViewModal && openPatientReferralViewModal(obj, i);
                                                e.stopPropagation();
                                             }}
                                             title="Playback connect"
                                             className="action-icon pb-connect pointer"
                                             style={{ margin: "0px 10px" }}
                                          />
                                       )} */}
                                       <div className="mr-3" />
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
   }
);

export default PatientTableView;
