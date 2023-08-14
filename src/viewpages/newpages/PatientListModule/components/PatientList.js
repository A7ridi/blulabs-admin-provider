import React, { useState } from "react";
import PatientTableView from "./PatientTableView";
import { withRouter } from "react-router-dom";
import PatientInfoEditView from "../../../../components/newcomponents/PatientInfoEditView/PatientInfoEditView";
import PatientSendMessageView from "../../../../components/newcomponents/PatientSendMessageView/PatientSendMessageView";
import PatientReferralView from "../../../../components/newcomponents/PatientReferralView/PatientReferralView";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import ModalPopup from "../../../../components/newcomponents/ModalPopup";
import { sendMessageSuccess, sendReferralSuccess, ErrorMessage } from "../../../../helper/CommonFuncs";
import InfiniteScroll from "../../../../shared/components/infiniteScroll/infiniteScroll";
import { updatePatientInfo } from "../../../../redux/actions/patientList.action";

function PatientList(props) {
   const { loading, patientsList, showReferralKey, myPatients = false, hasMore, getPatienData, loader } = props;
   const [state, setState] = useState({
      showPatientUpdateInfoModal: false,
      showPatientSendMessageModal: false,
      showPatientReferralViewModal: false,
      patientInfoEditObject: {},
      patientSendMessageObject: {},
      patientReferralObject: {},
   });

   const openPatientUpdateInfoModal = (objPatient) => {
      setState({
         ...state,
         showPatientUpdateInfoModal: true,
         patientInfoEditObject: objPatient,
      });
   };

   const openPatientSendMessageModal = (objPatient) => {
      setState({
         ...state,
         showPatientSendMessageModal: true,
         patientSendMessageObject: objPatient,
      });
   };

   const openPatientReferralViewModal = (objPatient) => {
      setState({
         ...state,
         showPatientReferralViewModal: true,
         patientReferralObject: objPatient,
      });
   };

   return (
      <div>
         <InfiniteScroll callBack={getPatienData} showLoader={hasMore}>
            <PatientTableView
               loader={loader}
               redirectTo={props.history}
               showReferralKey={showReferralKey}
               stateLoading={loading}
               patients={patientsList}
               noPatientData={patientsList?.length === 0}
               openModal={openPatientUpdateInfoModal}
               openSendMessageModal={openPatientSendMessageModal}
               openPatientReferralViewModal={openPatientReferralViewModal}
               isMyPatient={myPatients}
            />
         </InfiniteScroll>

         {state.showPatientUpdateInfoModal ? (
            <ModalPopup
               id={pendoIds.btnUpdatePatientInfoModal}
               onModalTapped={() => {
                  setState({
                     ...state,
                     showPatientUpdateInfoModal: false,
                  });
               }}
            >
               <PatientInfoEditView
                  refetch={updatePatientInfo}
                  patients={patientsList}
                  buttonId={pendoIds.btnUpdatePatientInfoModal}
                  patientInfo={state.patientInfoEditObject}
                  closeModalTapped={() =>
                     setState({
                        ...state,
                        showPatientUpdateInfoModal: false,
                     })
                  }
                  error={ErrorMessage}
                  myPatients={myPatients}
               />
            </ModalPopup>
         ) : null}
         {state.showPatientSendMessageModal ? (
            <ModalPopup
               id={pendoIds.btnSendPatientMessageModal}
               onModalTapped={() => {
                  setState({
                     ...state,
                     showPatientSendMessageModal: false,
                  });
               }}
            >
               <PatientSendMessageView
                  buttonId={pendoIds.btnSendPatientMessageModal}
                  patientSendMessageInfo={state.patientSendMessageObject}
                  closeSendMessageModalTapped={() =>
                     setState({
                        ...state,
                        showPatientSendMessageModal: false,
                     })
                  }
                  onSuccess={sendMessageSuccess}
                  error={ErrorMessage}
               />
            </ModalPopup>
         ) : null}
         {state.showPatientReferralViewModal ? (
            <ModalPopup
               isReferralView={true}
               id={pendoIds.btnPlaybackConnectModal}
               onModalTapped={() => {
                  setState({
                     ...state,
                     showPatientReferralViewModal: false,
                  });
               }}
            >
               <PatientReferralView
                  buttonId={pendoIds.btnPlaybackConnectModal}
                  closePatientReferralViewModalTapped={() =>
                     setState({
                        ...state,
                        showPatientReferralViewModal: false,
                     })
                  }
                  patientReferralInfo={state.patientReferralObject}
                  patientReferralSuccess={sendReferralSuccess}
                  error={ErrorMessage}
               />
            </ModalPopup>
         ) : null}
      </div>
   );
}

export default withRouter(PatientList);
