import React, { useState } from "react";
import Caption from "../../../../../I18n/en.json";
import ProviderContentListingContainer from "../../containers/contentTabCont";
import ProvidersPatientsListingContainer from "../../containers/patientTabCont";
export default function ModalTabs({ showModal }) {
   const [tab, setTab] = useState(0);
   return (
      <div style={{ margin: 10 }}>
         <div className="tab-cont-modal">
            {Caption.providerListing.tabs.map((s, i) => (
               <div
                  onClick={() => {
                     setTab(i);
                  }}
                  className={` ${tab === i && "selected-tab-modal"}  single-tab-modal "`}
                  key={i}
               >
                  {s.title}
               </div>
            ))}
         </div>
         {tab === 0 && <ProviderContentListingContainer showModal={showModal} />}
         {tab === 1 && <ProvidersPatientsListingContainer showModal={showModal} />}
      </div>
   );
}
