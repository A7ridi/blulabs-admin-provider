import React, { memo } from "react";
import { formatPhoneNumber } from "../../../../helper/CommonFuncs";

const InfoRowView = ({ title, value, imgSrc, onClick }) => (
   <button
      onClick={onClick}
      className="hover-default px-4 w-100 text-black text-normal flex-center justify-content-between separator-light h-small"
   >
      <div>{title}</div>
      <div className="font-weight-bold">{imgSrc ? <img src={imgSrc} alt="" /> : value}</div>
   </button>
);

function ProviderInfoView({ ctProvInfo, onRemove, onCancel }) {
   return (
      <div className="ProviderInfoView bg-white round-border-m w-xlarge flex-center justify-content-start flex-column">
         <div className="w-100 py-1 font-weight-bold text-medium separator-light h-small flex-center">
            {ctProvInfo.name}
         </div>
         {ctProvInfo.userSettings?.cellToProvider ? (
            <a className="w-100" href={`tel:${ctProvInfo.mobileNo}`}>
               <InfoRowView title="Mobile" value={formatPhoneNumber(ctProvInfo.mobileNo)} />
            </a>
         ) : null}
         {ctProvInfo.officeMobileNo ? (
            <a className="w-100" href={`tel:${ctProvInfo.officeMobileNo}`}>
               <InfoRowView title="Office" value={formatPhoneNumber(ctProvInfo.officeMobileNo)} />
            </a>
         ) : null}
         {ctProvInfo.userSettings?.emailToProvider ? (
            <InfoRowView
               title="Email"
               value={ctProvInfo.email}
               onClick={() => (window.location.href = `mailto:${ctProvInfo?.email}`)}
            />
         ) : null}
         {ctProvInfo.address ? (
            <InfoRowView
               title="Directions"
               imgSrc="/assets/images/newimages/location.svg"
               onClick={() => {
                  let pAddrs = ctProvInfo.address;
                  let address = `${pAddrs?.address1}+${pAddrs?.address2}+${pAddrs?.city}+${pAddrs?.zip}`;
                  window.open(`http://maps.google.com/maps/place/${address}`);
               }}
            />
         ) : null}
         <InfoRowView title="Remove" imgSrc="/assets/images/newimages/trash.svg" onClick={onRemove} />
         <button className="w-100 font-weight-bold text-normal py-1 h-small flex-center text-grey7" onClick={onCancel}>
            Cancel
         </button>
      </div>
   );
}

export default memo(ProviderInfoView);
