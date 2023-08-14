import React from "react";
import CheckBox from "../../../../../shared/components/CheckBox";
import TeamDetailsView from "../../../../../viewpages/newpages/teamModule/component/TeamDetailsView";
import EmptyStateComp from "../../../EmptyStateComp";
import { getMailsArr } from "../action/shareAction";
import NoProviderImg from "../../../../../images/empty-states/no-providers.svg";
import LoaderWithText from "./LoaderWithText";

const ProviderList = (props) => {
   const { providerList, loading, sharedMails, careList = [], setSharedMails } = props;

   if (loading)
      return (
         <div className="share-modal-tabs overflow-hidden">
            <LoaderWithText />
         </div>
      );
   else if (providerList?.length === 0 && careList.length === 0)
      return <EmptyStateComp src={NoProviderImg} headerText={"No result found"} />;
   else
      return (
         <div className="share-modal-tabs">
            {providerList?.map((prov, i) => {
               const name = prov?.name?.fullName || "";
               const color = prov?.colorCode || window.initialColors[i % window.initialColors.length];
               const initials = prov?.name?.initials || false;
               const department = prov?.providerInfo?.department || "";
               const degree = prov?.providerInfo?.degree || "";
               const email = prov?.contactInformation?.email || "";
               const provId = prov?.id || "";
               let isChecked = sharedMails.includes(provId);
               return (
                  <CheckBox
                     i={provId}
                     checked={isChecked}
                     value={provId}
                     selected={isChecked}
                     onClick={() => {
                        getMailsArr(sharedMails, provId, (data) => setSharedMails(data));
                     }}
                     clsName="overflow-share-modal form-check d-flex align-items-center checkbox-warning-filled hover-default"
                  >
                     <TeamDetailsView
                        providerList
                        teamTable
                        imageSrc={`${process.env.REACT_APP_PROFILE_URL}/${provId}`}
                        imageRad={32}
                        className="pointer text-truncate"
                        userBg={color}
                        initialsApi={initials}
                        name={name}
                        details={[{ title: department, degree }]}
                     />
                  </CheckBox>
               );
            })}
         </div>
      );
};

export default ProviderList;
