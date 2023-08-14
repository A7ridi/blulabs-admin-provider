import { gql } from "@apollo/client";
import { showSwal2 } from "../../../../../common/alert";
import Data from "../../../../../I18n/en.json";

export const SHARE_CONTENT_TO_MAIL = gql`
   mutation ShareContent($media: ContentInput) {
      createContent(media: $media) {
         message
         shareLink
      }
   }
`;

export const showSharePopup = (shareContentToMails) => {
   const titleText = "Confirm";
   let showClose;
   const contentText = Data.shareContent.contentText;
   showSwal2(titleText, contentText, shareContentToMails, showClose);
};

export const getMailsArr = (sharedMails, id, callBack = () => {}) => {
   let mails = sharedMails.map((s) => s);
   const findIdx = mails.indexOf(id);
   if (findIdx > -1) {
      mails.splice(findIdx, 1);
   } else {
      mails.push(id);
   }
   callBack(mails);
};

export const teamMailsArr = (teamMails) => {
   const newTeamArr = [];
   teamMails.forEach((element) => {
      element.forEach((el) => {
         newTeamArr.push(el);
      });
   });
   return [...new Set(newTeamArr)];
};
