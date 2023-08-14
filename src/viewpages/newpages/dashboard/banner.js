import React from "react";
import { Link } from "react-router-dom";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";

export default function Banner({ inactivePatinet }) {
   return (
      <div id={pendoIds.bannerActivatePatients} className="banner-container relative">
         <div className="banner-image">
            <div className="flex-div-banner">
               <div>
                  <div className="header-banner">Activate patients</div>
                  <div className="subtitle-banner">
                     You have {inactivePatinet} {inactivePatinet > 1 ? "patients" : "patient"} to activate.
                  </div>
               </div>
               <Link to="/activate-patient">
                  <button id={pendoIds.btnActivatePatients} className="button-red-banner">
                     Click Here
                  </button>
               </Link>
            </div>
         </div>
      </div>
   );
}
