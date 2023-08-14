import React from "react";
import { ShowAlert } from "../../../../../common/alert";
import TextContent from "../../../../../I18n/en.json";
import Email from "../../../../../images/shared-content/email.svg";
import Teams from "../../../../../images/shared-content/teams.svg";
import { showSharePopup, teamMailsArr } from "../action/shareAction";

const ShareToThirdParty = ({
   shareContentToMails,
   setButtonIdx,
   sharedMails,
   teamMails,
   comments,
   contentId,
   ftype,
   tab,
   allTeams = [],
   providerList = [],
   setProvidersMails = () => {},
}) => {
   const skip = ftype === "text" || ftype === "item" || ftype === "referral";

   const shareContent = (idx, teamsArr = []) => {
      let payload = {
         variables: {
            media: {
               isExternalShare: true,
               ...(skip && { itemId: contentId }),
               ...(!skip && { mediaId: contentId }),
               providerIds: tab === 0 ? sharedMails : teamsArr,
               shareType: idx === 0 ? "mail" : "team",
               comment: comments,
            },
         },
      };
      shareContentToMails(payload);
   };

   const sendMails = (i, teamMails) => {
      let teamsArr = [];
      if (tab === 1) {
         let teamArr = [];

         teamMails.forEach((id) => {
            let findTeam = allTeams.find((team) => team.id === id);
            if (i === 1) {
               let email = findTeam.members.map((s) => s.contactInformation.email);
               teamArr.push(email);
            } else {
               let ids = findTeam.members.map((s) => s.id);
               teamArr.push(ids);
            }
         });
         if (teamArr) {
            teamsArr = teamMailsArr(teamArr);
            setProvidersMails(teamsArr);
         }
      } else {
         if (i === 1) {
            let providersMail = [];
            let mails = sharedMails.map((s) => s);
            mails.forEach((id) => {
               let findProv = providerList.find((t) => t.id === id);
               let email = findProv.contactInformation.email;
               providersMail.push(email);
            });
            if (providersMail) {
               setProvidersMails(providersMail);
            }
         }
      }

      setButtonIdx(i);
      if (tab === 0) {
         if (sharedMails.length === 0) ShowAlert("Please select atleast one provider!", "error");
         else if (sharedMails[0].length === 0) ShowAlert("This provider doesn't have any email!", "error");
         else showSharePopup(() => shareContent(i));
      } else {
         if (teamMails.length === 0) ShowAlert("Please select atleast one team!", "error");
         else showSharePopup(() => shareContent(i, teamsArr));
      }
   };
   return (
      <div
         className="shared-content d-flex align-items-center justify-content-between mt-4"
         style={{ padding: "0 1px" }}
      >
         <h4 className="shared-content-text">{TextContent.shareFeature.sharedContent}</h4>
         <div className="share-button">
            {TextContent.shareFeature.button.map((btn, i) => {
               return (
                  <button
                     onClick={() => sendMails(i, teamMails)}
                     key={i}
                     className="text-white share-btn-default font-weight-bold text-small round-border-s flex-center"
                  >
                     <div className="shared-icon">
                        <img src={i === 0 ? Email : Teams} alt="icon" />
                        {btn.title}
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
};

export default ShareToThirdParty;
