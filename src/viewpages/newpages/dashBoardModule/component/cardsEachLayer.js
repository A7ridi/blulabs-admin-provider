import React from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { ageForDob, getDateFormatFromTimeStamp } from "../../../../helper/CommonFuncs";
import InfiniteScroll from "../../../../shared/components/infiniteScroll/infiniteScroll";
import EmptyStateComp from "../../EmptyStateComp";
import caption from "../../../../I18n/en.json";

import NoPatients from "../../../../images/empty-states/no-patients.svg";
export default class PatientComp extends React.Component {
   render() {
      const { patients = [], loading, specs, fetchPatientList, hasMore, myPatient = false } = this.props;
      const title = specs.data.subsitutions.title;
      return (
         <div className="cards-each-list">
            <div className="div-cards-title-api">{title}</div>
            <div className="main-div-cards-listing-dash">
               {loading ? (
                  Array(10)
                     .fill()
                     .map((o, index) => <div key={index} className="loading-shade-cards" />)
               ) : patients.length === 0 ? (
                  <EmptyStateComp
                     src={NoPatients}
                     headerText={myPatient ? caption.emptyState.myPatients : caption.emptyState.viewed}
                     description={myPatient ? caption.emptyState.findPatient : caption.emptyState.addPatients}
                     btnText={myPatient ? caption.emptyState.findMyPatient : caption.emptyState.addPatient}
                  />
               ) : (
                  <InfiniteScroll callBack={fetchPatientList} showLoader={hasMore}>
                     {patients.map((s, index) => {
                        const name = s?.name?.fullName + " (" + ageForDob(s?.dateOfBirth) + ")";
                        const color = s?.colorCode || window.initialColors[index % window.initialColors.length];
                        const initialsApi = s?.name?.initials || false;
                        return (
                           <div className="each-card-patient-list" key={index}>
                              <PatientDetailsView
                                 dashboard={true}
                                 userBg={color}
                                 name={name}
                                 initialsApi={initialsApi}
                                 details={[
                                    {
                                       title: "DOB : ",
                                       value: getDateFormatFromTimeStamp(s?.dateOfBirth),
                                    },
                                 ]}
                              />
                           </div>
                        );
                     })}
                  </InfiniteScroll>
               )}
            </div>
         </div>
      );
   }
}
