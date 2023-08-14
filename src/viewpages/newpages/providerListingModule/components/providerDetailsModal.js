import React from "react";
import ModalTabs from "./modalComp/modalTabs";
import ProviderDetails from "./modalComp/providerDetails";

import crossBtn from "../../../../images/cross.svg";
export default function ProviderDetailsModal({ closeModal, showModal }) {
   return (
      <div className="modal-provider-details relative">
         <div className="round-border-m" style={{ position: "absolute", top: 20, right: 20, zIndex: "9" }}>
            <img id="click-photo-new" src={crossBtn} alt="cross" className="pointer " onClick={closeModal} />
         </div>

         <div className="left-modal">
            <ProviderDetails showModal={showModal} />
         </div>
         <div className="right-modal">
            <ModalTabs showModal={showModal} />
         </div>
      </div>
   );
}
