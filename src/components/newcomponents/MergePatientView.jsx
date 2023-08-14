import React, { memo } from "react";
import { getFormattedDate, isValidMob, formatPhoneNumber } from "../../helper/CommonFuncs";
import Avatar from "./avatar/Avatar";

function MergePatientView(props) {
   const { patientData, connectEMR, close } = props;

   const data = [
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
      {
         name: "Griffin Baum",
         dob: "01/07/1993",
      },
   ];
   return (
      <div className="h-3xl-medium w-xlarge1 bg-white round-border-m">
         <div className="flex-center justify-content-end pt-3 pb-4 separator-light">
            <div className="text-black2 position-absolute w-100 text-center text-xlarge text-bold">Select Patient</div>
            <button className="px-3 mr-4 text-grey2" style={{ fontSize: "30px" }} onClick={() => close && close()}>
               &times;
            </button>
         </div>
         <div
            className="scrollbar scrollbar-black bordered-black square thin"
            style={{ height: "390px", overflow: "auto" }}
         >
            <div class="force-overflow">
               <span>Close match</span>
               {data.map((patient, id) => (
                  <div
                     className="w-100 form-check d-flex flex-start align-items-center text-medium"
                     style={{
                        paddingLeft: "30px",
                        marginTop: "12px",
                        marginBottom: "12px",
                     }}
                  >
                     <input
                        class="form-check-input pe-auto"
                        type="radio"
                        name="flexRadioDefault"
                        id={id}
                        style={{ cursor: "pointer", width: "20px", height: "20px" }}
                     />
                     <div style={{ marginLeft: "34px" }}>
                        <Avatar
                           profile
                           className="flex-shrink-0 avatar-header"
                           radius={32}
                           name={patient.name}
                           bgColor={patientData?.colorCode || window.initialColors[0]}
                        />
                     </div>
                     <div className="flex-column" style={{ cursor: "pointer" }}>
                        <div className="mx-4 form-check-label text-grey1 font-weight-bold">{patient.name}</div>
                        <div className="mx-4 form-check-label text-bold-400 text-grey1 font-weight-normal">
                           DOB: {patient.dob}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="w-100 flex-center my-5">
            <button
               className="btn-default round-border-s text-small w-xsmall h-xsmall"
               onClick={() => connectEMR && connectEMR(patientData)}
            >
               Merge
            </button>
         </div>
      </div>
   );
}

export default memo(MergePatientView);
