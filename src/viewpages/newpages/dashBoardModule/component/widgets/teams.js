import React from "react";
import PatientDetailsView from "../../../../../components/newcomponents/patientDetailsView/PatientDetailsView";

export default class Teams extends React.Component {
   render() {
      const { title, teams, loading = false } = this.props;
      return (
         <div className="cards-each-list">
            <div className="div-cards-title-api">{title}</div>
            <div className="main-div-cards-listing-dash">
               {loading
                  ? Array(10)
                       .fill()
                       .map((o, index) => <div key={index} className="loading-shade-cards" />)
                  : teams.map((s, index) => {
                       const initialsApi = s?.initials || false;
                       const color = window.initialColors[index % window.initialColors.length];
                       const name = s.name || "Team";
                       const department = s.description || "";
                       return (
                          <div className="each-card-patient-list " key={index}>
                             <PatientDetailsView
                                initialsApi={initialsApi}
                                dashboard={true}
                                userBg={color}
                                name={name}
                                details={[
                                   {
                                      title: department,
                                   },
                                ]}
                             />
                          </div>
                       );
                    })}
            </div>
         </div>
      );
   }
}
