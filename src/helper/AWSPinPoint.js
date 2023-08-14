import * as AWS from "aws-sdk";
import moment from "moment";
import { v4 as uuid } from "uuid";
import { store } from "../redux/store";

// const { CognitoIdentityCredentials } = require("aws-sdk");

// const {
//   fromCognitoIdentityPool,
// } = require("aws-sdk/clients/cognitoidentityserviceprovider");
// const { Polly } = require("@aws-sdk/client-polly");
// const { getSynthesizeSpeechUrl } = require("@aws-sdk/polly-request-presigner");

// // Create the Polly service client, assigning your credentials
// const client = new Polly({
//   region: "REGION",
//   credentials: fromCognitoIdentityPool({
//     client: new CognitoIdentityClient({ region: "REGION" }),
//     identityPoolId: "IDENTITY_POOL_ID", // IDENTITY_POOL_ID
//   }),
// });

const Pinpoint = require("aws-sdk/clients/pinpoint");
AWS.config.region = process.env.REACT_APP_AWS_REGION;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: process.env.REACT_APP_AWS_COGNITO_POOL_ID,
});
let pp = new Pinpoint();

export let EventType = {
  itemCreated: "itemCreated",
  mediaCreated: "mediaCreated",
  itemUpdated: "itemUpdated",
  itemViewed: "itemViewed",
  mediaViewed: "mediaViewed",
  mediaFinished: "mediaFinished",
  mediaUnfinished: "mediaUnfinished",
  bundleShare: "bundleShare",
  signIn: "signIn",
  faqViewed: "faqViewed",

  providerHomeViewed: "providerHomeViewed",
  providerSharingViewed: "providerSharingViewed",
  TeleHealthFinished: "TeleHealthFinished",
  chatBotSuggestion: "chatBotSuggestion",
  patientHomeViewed: "patientHomeViewed",
  patientSharingViewed: "patientSharingViewed",
  familyMemberHomeViewed: "familyMemberHomeViewed",
  familyMemberSharingViewed: "familyMemberSharingViewed",
  localNotificationPending: "localNotificationPending",

  invitePatient: "invitePatient",
  inviteEMR: "inviteEMR",
  inviteFamilyFriends: "inviteFamilyFriends",
  inviteCareTeam: "inviteCareTeam",
  addFamilyAfterPatientInvite: "addFamilyAfterPatientInvite",
  referred: "referred",
  referredViewed: "referredViewed",
  sendFileExternal: "sendFileExternal",
};

let defaultParams = () => {
  let obj = store.getState().auth.userCredentials.user;
  return {
    // UserID: obj.id,
    name: obj.name,
    email: obj.email,
    mobile: obj.officeMobileNo,
    hospitalID: obj.hospitalId,
    hospitalName: obj.hospitalName || obj.Hospital?.name,
    departmentID: obj.departmentId,
    enterpriseName: obj.enterpriseName,
    enterpriseID: obj.enterpriseId,
    dbUserID: obj.userId,
    role: "provider",
    deviceType: "web",
  };
};

export function record(params, batchId, eventType) {
  let eventAttr = { ...defaultParams(), ...params };
  let date = moment().toISOString();
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let recordData = {
    ApplicationId: process.env.REACT_APP_AWS_PINPOINT_APPLICATION_ID /* required */,
    EventsRequest: {
      BatchItem: {
        [batchId + "web"]: {
          Endpoint: {
            Demographic: {
              Locale: navigator.language,
              Platform: "web",
              Timezone: timezone, //moment().toISOString(),
            },
            User: {
              UserId: batchId,
            },
          },
          Events: {
            [uuid().toString()]: {
              EventType: eventType,
              Attributes: eventAttr,
              Timestamp: date, //moment().toISOString(),
            },
          },
        },
      },
    },
  };

  // console.log("eventType is " + eventType);
  // console.log("event data is " + JSON.stringify(eventAttr, null, 4));

  pp.putEvents(recordData, function (err, data) {
    // console.log("eventType is " + eventType);
    // console.log("event data is " + JSON.stringify(eventAttr, null, 4));
    // if (err) console.log(err, err.stack);
    // // an error occurred
    // else console.log(JSON.stringify(data, null, 4)); // successful response
  });

  // var params = {
  //   ApplicationId:
  //     process.env.REACT_APP_AWS_PINPOINT_APPLICATION_ID /* required */,
  //   UserId: batchId /* required */,
  // };
  // pp.getUserEndpoints(params, function (err, data) {
  //   if (err) console.log(err, err.stack);
  //   // an error occurred
  //   else console.log(data); // successful response
  // });
}
