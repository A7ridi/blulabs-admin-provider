import React, { memo } from "react";
import { getFormattedDate, isValidMob, formatPhoneNumber } from "../../helper/CommonFuncs";

function EMRConnectView(props) {
   const { patientData, connectEMR, close } = props;
   return (
      <div className="h-3xl-medium w-xlarge1 bg-white round-border-m">
         <div className="flex-center justify-content-end pt-3 pb-4 separator-light">
            <div className="text-black2 position-absolute w-100 text-center text-xlarge text-bold">
               {patientData?.name}
            </div>
            <button className="px-3 mr-4 text-grey2" style={{ fontSize: "30px" }} onClick={() => close && close()}>
               &times;
            </button>
         </div>
         <div className="w-100 py-3 separator-light flex-center justify-content-between text-medium">
            <div className="my-3 mx-4 text-grey5">DOB</div>
            <div className="my-3 mx-4 text-bold-500 text-grey2">{getFormattedDate(patientData.dob) || "-"}</div>
         </div>
         <div className="w-100 py-3 separator-light flex-center justify-content-between text-medium">
            <div className="my-3 mx-4 text-grey5">Email</div>
            <div className="my-3 mx-4 text-bold-500 text-grey2">{patientData.email}</div>
         </div>
         <div className="w-100 py-3 flex-center justify-content-between text-medium">
            <div className="my-3 mx-4 text-grey5">Mobile</div>
            <div className="my-3 mx-4 text-bold-500 text-grey2">
               {isValidMob(patientData.mobileNo) ? formatPhoneNumber(patientData.mobileNo) : "-"}
            </div>
         </div>
         <div className="w-100 flex-center my-5">
            <button
               className="btn-default round-border-s text-small w-xsmall h-xsmall"
               onClick={() => connectEMR && connectEMR(patientData)}
            >
               Link to EMR
            </button>
         </div>
      </div>
   );
}

export default memo(EMRConnectView);
