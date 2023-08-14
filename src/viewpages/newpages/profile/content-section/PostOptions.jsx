import React, { memo, useMemo } from "react";
import { connect } from "react-redux";
import DropdownToggle from "../../../../components/newcomponents/DropdownToggle";
import CheckboxToggle from "../../../../components/newcomponents/CheckboxToggle/CheckboxToggle";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import { checkMediaType } from "../../../../helper/CommonFuncs";
import ShareSvg from "../../../../images/share-icon.svg";
import NewTextIconSvg from "../../../../images/new-text-icon.svg";

function PostOptions(props) {
   const { optionTapped, data, featureFlags } = props;
   let providerId = props.user?.id;
   const datePosted = useMemo(() => window.getDateDiff(new Date().toISOString(), data?.createdAt, "hours"), [data?.id]);
   const showShareNewIcon = featureFlags?.NewIconForShareFeature || false;

   const getOptions = useMemo(() => {
      let postOptions = [];
      let cls = "text-small text-black flex-center justify-content-between py-3 px-4";

      postOptions.push({
         id: 0,
         text: "Share Internally",
         rightView: () => {
            return (
               <>
                  {showShareNewIcon && <img src={NewTextIconSvg} alt="New Icon" style={{ marginLeft: "-10px" }} />}
                  <img src={ShareSvg} alt="Share Icon" />
               </>
            );
         },
         cls: cls,
         // pendoId: pendoIds.btnSendContent,
      });

      if (checkMediaType(data?.type) && providerId === data?.provider?.id) {
         postOptions.push({
            id: 1,
            text: "Send Externally",
            rightView: () => <img src="/assets/images/newimages/send-icon.svg" alt="" />,
            cls: cls,
            pendoId: pendoIds.btnSendContent,
         });
      }

      if (checkMediaType(data?.type, true) && providerId === data?.provider?.id) {
         postOptions.push({
            id: 2,
            text: data?.isPrintable ? "Restrict Download" : "Allow Download",
            rightView: () => (
               <CheckboxToggle className="float-right" value={data?.isPrintable} width="38px" height="21px" />
            ),
            cls: cls,
            pendoId: pendoIds.btnRestrictAllowDownload,
         });
      }

      if (providerId === data?.provider?.id && datePosted <= 24) {
         postOptions.push({
            id: 3,
            text: "Delete",
            rightView: () => <img src="/assets/images/newimages/delete-icon.svg" alt="" />,
            cls: cls,
            pendoId: pendoIds.btnDeleteContent,
         });
      }

      return postOptions;
   }, [data?.id, data?.isPrintable]);
   return (
      <DropdownToggle
         post
         //   className={`h-100 options-view ${isPreview ? "dropup" : "dropleft"}`}
         className={`h-100 options-view d-flex dropleft pointer`}
         menuViewCls="shadow no-border round-border-m w-small"
         id="profile-header-actions"
         options={getOptions}
         onOptTapped={(obj, i) => {
            if (obj.id === 0) {
               optionTapped(0, { id: 0, label: "Share Internally" });
            } else if (obj.id === 1) {
               optionTapped(1, { id: 1, label: "Send Externally" });
            } else if (obj.id === 2) {
               optionTapped(2, {
                  id: 2,
                  label: data?.isPrintable,
                  data: obj,
               });
            } else {
               optionTapped(3, { id: 3, label: "Delete" });
            }
         }}
      >
         {getOptions.length > 0 ? (
            <img
               id={pendoIds.btnContentOptions}
               data-toggle="dropdown"
               src="/assets/images/newimages/dots-v.svg"
               alt=""
            />
         ) : (
            " "
         )}
      </DropdownToggle>
   );
}

const mapStateToProps = (state) => {
   return {
      user: state.auth?.userCredentials.user,
      featureFlags: state.launchdarkly.ldFeatureFlags,
   };
};

export default connect(mapStateToProps)(memo(PostOptions));
