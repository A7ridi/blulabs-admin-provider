import React from "react";
import { gql } from "@apollo/client";
import { toast } from "react-toastify";
import ToastView, { defaultToastProps } from "../../../../components/newcomponents/ToastView";
import { allowDownloadContent, deleteMediaItem } from "../../../../Apimanager/Networking";
import swal from "@sweetalert/with-react";
import AlertView from "../../../../components/newcomponents/AlertView";
import { checkMediaType } from "../../../../helper/CommonFuncs";
import { fetchQuery } from "../../../../actions";

const showSwalAlert = (titleText, contentText, callback) =>
   swal(<AlertView titleText={titleText} contentText={contentText} showClose={false} onAction={callback} />, {
      buttons: false,
   });

const showToast = (text, type) => toast(<ToastView text={text} type={type} />, defaultToastProps);

export const postOptTapped = (
   opt,
   postIndex,
   contentList,
   setContentList,
   sendContent,
   callback = () => {},
   callBackUnset = () => {}
) => {
   var listData = contentList.map((s) => s);
   let obj = listData[postIndex];
   if (opt.id === 2) {
      let cText = obj.isPrintable ? "Restrict" : "Allow";
      showSwalAlert(obj?.title, `${cText} download for this content?`, (btnData) => {
         swal.close();
         if (btnData.id === "alert-confirm-button") {
            let p = { mediaId: obj?.id };
            let b = { printEnable: !obj.isPrintable };
            allowDownloadContent(p, b).then(() => {
               showToast("Successfully updated");
               obj.isPrintable = !obj.isPrintable;
               listData[postIndex] = obj;
               setContentList(listData);
            });
         }
      });
   } else if (opt.id === 1) {
      sendContent && sendContent(obj);
   } else if (opt.id === 3) {
      let key = "mediaId";
      if (obj?.type === "text" || obj?.type === "item") {
         key = "itemId";
      }
      const titleObj = obj?.title;
      const title = titleObj?.length > 80 ? titleObj?.substring(0, 80) + "..." : titleObj;
      showSwalAlert(title, "Are you sure you want to delete this content?", (btnData) => {
         swal.close();
         if (btnData.id === "alert-confirm-button") {
            callback();
            deleteMediaItem({ [key]: obj?.id }).then(() => {
               callBackUnset();
               showToast("Successfully deleted");
               listData.splice(postIndex, 1);
               setContentList(listData);
            });
         }
      });
   }
};

export const fetchSignedUrlContentShare = (data, callBack) => {
   fetchQuery(
      GET_THUMBNAIL_SIGNED_URL,
      data,
      (res) => {
         return callBack(res.data?.getSignedURL?.url);
      },
      (err) => {
         return console.log("Content load error", err);
      }
   );
};

export const GET_PATIENT_CONTENT = gql`
   query GetPatientContentQuery(
      $offset: Int!
      $limit: Int!
      $user_id: String!
      $search: String!
      $patientOnly: Boolean!
      $providerOnly: Boolean!
   ) {
      getPatientContent(
         offset: $offset
         limit: $limit
         user: { id: $user_id }
         search: $search
         patientOnly: $patientOnly
         providerOnly: $providerOnly
      ) {
         totalCount
         contents {
            title
            type
            id
            createdAt
            isPrintable
            provider {
               name {
                  fullName
               }
               contactInformation {
                  email
               }
               id
            }
            patient {
               id
               name {
                  fullName
               }
               contactInformation {
                  email
               }
            }
            views {
               viewedAt
               viewer {
                  id
                  name {
                     fullName
                  }
                  contactInformation {
                     email
                  }
               }
            }
            hasThumbnail
            loves
            mentions
            tags
            hospital {
               id
               name
            }
            description
            healthSystem {
               id
               name
               patientIdentifiers {
                  number
                  type
                  authority
               }
            }
         }
      }
   }
`;

export const GET_THUMBNAIL_SIGNED_URL = gql`
   query GetSignedURL($thumbnail: Boolean!, $content: ContentInput!) {
      getSignedURL(thumbnail: $thumbnail, content: $content) {
         url
         thumbnailUrl
      }
   }
`;

export const GET_CONTENT_SIGNED_URL = gql`
   query GetSignedURL($thumbnail: Boolean!, $content: ContentInput!) {
      getSignedURL(thumbnail: $thumbnail, content: $content) {
         url
      }
   }
`;

export const GET_PATIENT_CONTENT_SEENBY_LIST = gql`
   query GetPatientContentSeenByQuery(
      $offset: Int!
      $limit: Int!
      $content: ContentInput
      $user: UserInput
      $providerOnly: Boolean
   ) {
      getPatientContent(offset: $offset, limit: $limit, content: $content, user: $user, providerOnly: $providerOnly) {
         contents {
            views {
               viewer {
                  id
                  colorCode
                  contactInformation {
                     email
                     mobileNumber
                  }
                  name {
                     initials
                     fullName
                  }
               }
               viewedAt
            }
         }
      }
   }
`;

export const CREATE_CONTENT = gql`
   mutation Mutation($media: ContentInput) {
      createContent(media: $media) {
         id
         signedUrl {
            url
         }
      }
   }
`;

export const UPDATE_ITEM_VIEWED_STATUS = gql`
   mutation AddActivity($options: AddActivityOptions) {
      addActivity(options: $options) {
         status {
            code
            success
            message
         }
      }
   }
`;
