import React from "react";
import { formatPhoneNumber } from "../../../../helper/CommonFuncs";
import { startPatientVideoCall } from "../../profileModule/actions/profileActions";
import videoCall from "../../../../images/profileSection/video-call-icon.svg";
import { connect } from "react-redux";
import { isDirectionGql } from "../action/careTeamAction";

const InfoRowView = ({ title, value, imgSrc, onClick }) => (
   <button
      onClick={onClick}
      className="hover-default px-4 w-100 text-black text-normal flex-center justify-content-between separator-light h-small"
   >
      <div>{title}</div>
      <div className="font-weight-bold">{imgSrc ? <img src={imgSrc} alt="" /> : value}</div>
   </button>
);

function ProviderInfo({ ctProvInfo, onRemove, onCancel, user }) {
   const { careMember } = ctProvInfo;
   const name = careMember?.name?.fullName;
   const officeNumber = careMember?.contactInformation?.officeNumber;
   const mobileNo = careMember?.contactInformation?.mobileNumber;
   const contactInfo = careMember?.contactInformation;
   const emailToProvider = careMember?.providerInfo?.settings?.emailToProvider;
   const provEmail = careMember?.contactInformation?.email;
   const cellToProvider = careMember?.providerInfo?.settings?.cellToProvider;
   const showVideoCall = careMember?.contactInformation?.isCallEnable || false;
   const isSameProvider = user?.id === careMember.id;
   const FullName = careMember?.name?.firstName + " " + careMember?.name?.lastName;
   const checkDirection = isDirectionGql(contactInfo) || false;
   return (
      <div className="ProviderInfoView bg-white round-border-m w-xlarge flex-center justify-content-start flex-column">
         <div className="w-100 py-1 font-weight-bold text-medium separator-light h-small flex-center">{name}</div>
         {showVideoCall && !isSameProvider && (
            <a className="w-100">
               <InfoRowView
                  title="Video call"
                  imgSrc={videoCall}
                  onClick={() => {
                     startPatientVideoCall(careMember.id, FullName, mobileNo);
                  }}
               />
            </a>
         )}
         {cellToProvider ? (
            <a className="w-100" href={`tel:${mobileNo}`}>
               <InfoRowView title="Mobile" value={formatPhoneNumber(mobileNo)} />
            </a>
         ) : null}
         {officeNumber ? (
            <a className="w-100" href={`tel:${officeNumber}`}>
               <InfoRowView title="Office" value={formatPhoneNumber(officeNumber)} />
            </a>
         ) : null}
         {emailToProvider ? (
            <InfoRowView
               title="Email"
               value={provEmail}
               onClick={() => (window.location.href = `mailto:${provEmail}`)}
            />
         ) : null}
         {checkDirection ? (
            <InfoRowView
               title="Directions"
               imgSrc="/assets/images/newimages/location.svg"
               onClick={() => {
                  const addrs = contactInfo?.address;
                  let address = `${addrs?.streetAddress}+${addrs?.city}+${addrs?.zip}`;
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

const mapStateToProps = (state) => {
   return {
      user: state?.auth?.userCredentials?.user,
   };
};

export default connect(mapStateToProps, null)(ProviderInfo);
