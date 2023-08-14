import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ShowAlert } from "../../../../../common/alert";
import { errorToDisplay, formatPhoneNumber, getFormattedDate } from "../../../../../helper/CommonFuncs";
import { SHARE_CONTENT_TO_MAIL } from "../action/shareAction";
import Share from "../component/Share";
import ModalPopup from "../../../../../components/newcomponents/ModalPopup";
import { connect } from "react-redux";

const ShareCont = ({ contentId, ftype, selectedPatient, title, showShareContent, setShowShareContent }) => {
   const [sharedMails, setSharedMails] = useState([]);
   const [teamMails, setTeamMails] = useState([]);
   const [comments, setComments] = useState("");
   const [buttonIdx, setButtonIdx] = useState(0);
   const [tab, setTab] = useState(0);
   const [providersMails, setProvidersMails] = useState([]);

   const toggleShareModal = () => {
      setShowShareContent(!showShareContent);
      setTab(0);
      setTeamMails([]);
      setSharedMails([]);
      setComments("");
   };

   const [shareContentToMails] = useMutation(SHARE_CONTENT_TO_MAIL, {
      onCompleted(result) {
         const isEmail = selectedPatient?.contactInformation?.email || "";
         const isMobile = selectedPatient?.contactInformation?.mobileNumber || "";
         const isDOB = selectedPatient?.dob || "";
         const shareLink = result?.createContent?.shareLink;
         if (buttonIdx === 1 && shareLink !== null) {
            const mailsString = providersMails.toString() || teamMails.toString();
            const message = `Name: ${selectedPatient?.name?.fullName || ""}${isDOB && "\nDOB: "}${getFormattedDate(
               isDOB
            )}${isEmail && "\nEmail: "}${isEmail}${isMobile && "\nMobile:"}${formatPhoneNumber(isMobile).substring(2)}`;
            let val = message + "\n\n" + shareLink;
            let a = document.createElement("a");
            a.target = "_blank";
            a.href = `https://teams.microsoft.com/l/chat/0/0?users=${mailsString}&message=${encodeURIComponent(val)}`;
            a.click();
         }
         ShowAlert(result?.createContent?.message);
         toggleShareModal();
      },
      onError(err) {
         let errMessage = errorToDisplay(err);
         ShowAlert(errMessage, "error");
      },
   });
   return (
      <ModalPopup onModalTapped={toggleShareModal}>
         <Share
            ftype={ftype}
            contentId={contentId}
            closeModal={toggleShareModal}
            shareContentToMails={shareContentToMails}
            sharedMails={sharedMails}
            setSharedMails={setSharedMails}
            setComments={setComments}
            comments={comments}
            setButtonIdx={setButtonIdx}
            setTeamMails={setTeamMails}
            teamMails={teamMails}
            setTab={setTab}
            tab={tab}
            title={title}
            providersMails={providersMails}
            setProvidersMails={setProvidersMails}
         />
      </ModalPopup>
   );
};

const mapStateToProps = (state) => {
   return {
      selectedPatient: state.patientProfile.selectedPatient.list,
   };
};

export default connect(mapStateToProps)(ShareCont);
