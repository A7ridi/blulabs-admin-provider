import React from "react";
import PatientDetailsView from "../../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { ageForDob, getFormattedDate } from "../../../../../helper/CommonFuncs";
import noSend from "../../../../../images/empty-states/no-invites.svg";
import EmptyStateComp from "../../../EmptyStateComp";
import caption from "../../../../../I18n/en.json";

export default class ResendInvite extends React.Component {
   render() {
      const { title, resendInvites = [], loading = false, specs } = this.props;
      const showRemind = specs.data.actions.some((some) => {
         return some.type === "resend";
      });
      const showResendInviteAll = specs.data.actions.some((some) => {
         return some.type === "send";
      });
      return (
         <div className="cards-each-list">
            <div className="d-flex align-items-center justify-content-between ">
               <div className="div-cards-title-api">{title}</div>
               {showResendInviteAll && <div className="send-all-dash">{"Resend all"}</div>}
            </div>

            <div className="main-div-cards-listing-dash">
               {loading ? (
                  Array(10)
                     .fill()
                     .map((o, index) => <div key={index} className="loading-shade-cards" />)
               ) : resendInvites.length === 0 ? (
                  <EmptyStateComp
                     src={noSend}
                     headerText={caption.emptyState.viewed}
                     description={caption.emptyState.allinvites}
                  />
               ) : (
                  resendInvites.map((s, index) => {
                     const dob = s?.dob ? "(" + ageForDob(s.dob) + ") " : "";
                     const name = s.name + "  " + dob || "Patient";
                     const color = s.colorCode || window.initialColors[index % window.initialColors.length];
                     const initialsApi = s.initials || false;
                     return (
                        <div
                           className="each-card-patient-list d-flex align-items-center justify-space-between"
                           key={index}
                        >
                           <PatientDetailsView
                              initialsApi={initialsApi}
                              dashboard={true}
                              userBg={color}
                              name={name}
                              details={[
                                 {
                                    title: `DOB : `,
                                    value: getFormattedDate(s.dob),
                                 },
                              ]}
                           />
                           <div>{showRemind && <div className="remind-div">Resend</div>}</div>
                        </div>
                     );
                  })
               )}
            </div>
         </div>
      );
   }
}
