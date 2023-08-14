import React from "react";
import "../container/share.css";
import "../../../providerListingModule/containers/providerListing.css";
import TextContent from "../../../../../I18n/en.json";
import SearchPagination from "../../../providerListingModule/components/searchPagination";
import { useState } from "react";
import ProviderListCont from "../container/ProviderListCont";
import TeamListCont from "../container/TeamListCont";
import ShareToThirdParty from "./ShareToThirdParty";
import SharedImage from "./SharedImage";

const Share = ({
   ftype,
   closeModal,
   shareContentToMails,
   sharedMails,
   setSharedMails,
   setComments,
   comments,
   setButtonIdx,
   setTeamMails,
   tab,
   teamMails,
   setTab,
   contentId,
   title,
   setProvidersMails,
}) => {
   const [offset, setOffset] = useState(0);
   const [search, setSearch] = useState("");
   const [totalCount, setTotalCount] = useState(0);
   const [list, setList] = useState([]);
   const [allTeams, setAllTeams] = useState([]);

   let limit = tab === 0 ? 10 : totalCount + 1;

   const onTabChange = (i) => {
      setTab(i);
      setSearch("");
      setSharedMails([]);
      setTeamMails([]);
      setProvidersMails([]);
      if (i === 1) {
         setOffset(0);
         setTotalCount(0);
      }
   };

   return (
      <div className="share-media-view round-border-xxl bg-white p-0">
         <SharedImage
            contentId={contentId}
            ftype={ftype}
            closeModal={closeModal}
            setComments={setComments}
            comments={comments}
            title={title}
         />

         <div className="shared-content">
            <span className="share-this-content">{TextContent.shareFeature.title}</span>

            <SearchPagination
               totalCount={totalCount}
               data={list}
               cls="pt-4 pb-3"
               inputCls="search-pagination-width"
               setOffset={setOffset}
               offset={offset}
               limit={limit}
               setSearch={setSearch}
               tab={tab}
               showPagination={tab === 1 ? false : true}
            />
            <>
               <div className="tab-cont-modal">
                  {TextContent.shareFeature.tabs.map((s, i) => (
                     <div
                        onClick={() => {
                           onTabChange(i);
                        }}
                        className={`${tab === i && "selected-tab-modal"} single-tab-modal pb-2`}
                        style={{ fontSize: 16 }}
                        key={i}
                     >
                        {s.title}
                     </div>
                  ))}
               </div>
               {tab === 0 && (
                  <ProviderListCont
                     offset={offset}
                     limit={limit}
                     setProviderList={setList}
                     providerList={list}
                     setSearch={setSearch}
                     search={search}
                     setTotalCount={setTotalCount}
                     setSharedMails={setSharedMails}
                     sharedMails={sharedMails}
                  />
               )}
               {tab === 1 && (
                  <TeamListCont
                     search={search}
                     teamsList={list}
                     sharedMails={sharedMails}
                     setTeamMails={setTeamMails}
                     teamMails={teamMails}
                     allTeams={allTeams}
                     setAllTeams={setAllTeams}
                  />
               )}
            </>

            <hr className="horizontal-bar" />

            <ShareToThirdParty
               shareContentToMails={shareContentToMails}
               sharedMails={sharedMails}
               teamMails={teamMails}
               setButtonIdx={setButtonIdx}
               ftype={ftype}
               tab={tab}
               contentId={contentId}
               comments={comments}
               allTeams={allTeams}
               providerList={list}
               setTeamMails={setTeamMails}
               setProvidersMails={setProvidersMails}
            />
         </div>
      </div>
   );
};

export default Share;
