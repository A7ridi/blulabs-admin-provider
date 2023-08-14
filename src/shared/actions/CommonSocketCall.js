import { showSwal } from "../../common/alert";
import { socketActions, socketSubActions } from "../../helper/Websocket";

export const providerGetHospitals = async (enterpriseId, callBack) => {
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
         callBack(data);
      } else {
         showSwal(resultStatus?.message);
         callBack([]);
      }
   });
};

export const providerGetDepartments = (hospital, callBack) => {
   let onboardingParams = {
      action: socketActions.onboarding,
      subAction: socketSubActions.getDepartmentsV2,
      hospitalId: hospital?.value,
   };
   window.socket.send(onboardingParams, (resultStatus) => {
      if (resultStatus?.settings?.status === 1) {
         let data = resultStatus?.data?.map((o) => {
            return { label: o.name, value: o.id, data: o };
         });
         callBack(data);
      } else {
         showSwal(resultStatus?.settings?.message);
         callBack([]);
      }
   });
};
