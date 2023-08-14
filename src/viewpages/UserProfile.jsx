import React, { useEffect, useState } from "react";
import Apimanager from "../Apimanager/index";

// function reverseString(str) {
//     if (str) {
//         var nameSrt = str.split("")
//         var newname = []
//         var isemail = nameSrt.includes('@') ? 1 : 2;
//         for (var i = 0; i < isemail; i++) { newname.push(nameSrt[i]) }
//         str = newname.join("")
//     }

//     return str
// }

function reverseString(str) {
  if (str) {
    return str.split("").join("");
  } else {
    return "";
  }
}

const UserProfile = (props) => {
  const { userObject, searchText } = props;
  //console.log("userObject", userObject)
  let queryparams = { userId: userObject.data.id };
  let fullName = userObject.data.firstName + " " + userObject.data.lastName;
  const [isCallEnable, setisCallEnable] = useState(false);
  //const [isLoading, setLoading] = useState(false);
  const [imagePath, setimagePath] = useState();

  useEffect(() => {
    if (userObject.data.id) {
      Apimanager.getPatientDetails(
        queryparams,
        (success) => {
          if (
            success &&
            success.status === 200 &&
            success.data &&
            success.data.data
          ) {
            let patientDatails =
              success.data && success.data.data ? success.data.data : "";
            setisCallEnable(patientDatails.isCallEnable);
          }
        },
        (error) => {}
      );
    }
  }, []);

  const patientVideoCall = (patientID, patientName) => {
    localStorage.setItem("videoPatientID", patientID);
    localStorage.setItem("patientNameVideo", patientName);

    var popUp = window.open("/video-call");
    // $.post("/ajax/friendlyPrintPage", postData).done(function (htmlContent) {
    //   myWindow.document.write(htmlContent);
    //   myWindow.focus();
    // });
    let imagePath = "/assets/images/chrome.png";
    if (popUp == null || typeof popUp == "undefined") {
      var navigator = window.navigator;

      //var nVer = navigator.appVersion;
      var nAgt = navigator.userAgent;
      var browserName = navigator.appName;
      //var fullVersion = "" + parseFloat(navigator.appVersion);
      //var majorVersion = parseInt(navigator.appVersion, 10);
      var nameOffset, verOffset;

      // In Opera, the true version is after "Opera" or after "Version"
      if ((verOffset = nAgt.indexOf("Opera")) !== -1) {
        browserName = "Opera";
        //fullVersion = nAgt.substring(verOffset + 6);
        //if ((verOffset = nAgt.indexOf("Version")) !== -1)
        //fullVersion = nAgt.substring(verOffset + 8);
      }
      // In MSIE, the true version is after "MSIE" in userAgent
      else if ((verOffset = nAgt.indexOf("MSIE")) !== -1) {
        browserName = "Microsoft Internet Explorer";
        //fullVersion = nAgt.substring(verOffset + 5);
      }
      // In Chrome, the true version is after "Chrome"
      else if ((verOffset = nAgt.indexOf("Chrome")) !== -1) {
        browserName = "Chrome";
        //fullVersion = nAgt.substring(verOffset + 7);
        imagePath = "/assets/images/Chrome.png";
      }
      // In Safari, the true version is after "Safari" or after "Version"
      else if ((verOffset = nAgt.indexOf("Safari")) !== -1) {
        browserName = "Safari";
        imagePath = "/assets/images/Safari.png";
        //fullVersion = nAgt.substring(verOffset + 7);
        //if ((verOffset = nAgt.indexOf("Version")) !== -1)
        //fullVersion = nAgt.substring(verOffset + 8);
      }
      // In Firefox, the true version is after "Firefox"
      else if ((verOffset = nAgt.indexOf("Firefox")) !== -1) {
        browserName = "Firefox";
        //fullVersion = nAgt.substring(verOffset + 8);
        imagePath = "/assets/images/Firefox.png";
      }
      // In most other browsers, "name/version" is at the end of userAgent
      else if (
        (nameOffset = nAgt.lastIndexOf(" ") + 1) <
        (verOffset = nAgt.lastIndexOf("/"))
      ) {
        browserName = nAgt.substring(nameOffset, verOffset);
        ///fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() === browserName.toUpperCase()) {
          browserName = navigator.appName;
        }
      }
      document.getElementById("modal-btn-open").click();
      setimagePath(imagePath);
    } else {
      popUp.focus();
    }
  };

  return (
    <>
      <div className="custom-box box-person">
        <div className="box-title-item">
          <div className="box-icon">
            {userObject && userObject.isHaveImage && (
              <img
                alt="Patient Profile"
                title={userObject && userObject.data && userObject.data.name}
                src={`https://storage.googleapis.com/${process.env.REACT_APP_STORAGEBUCKET}/${props.match.params.patientid}`}
                onError={() => props.handleerror(userObject)}
              />
            )}
            {userObject && !userObject.isHaveImage && (
              <p style={{ textTransform: "uppercase" }}>
                {reverseString(
                  userObject.data.name &&
                    userObject.data.name.match(/\b(\w)/g).join("")
                    ? userObject.data.name.match(/\b(\w)/g).join("")
                    : fullName.match(/\b(\w)/g).join("")
                )}
              </p>
            )}
          </div>
          <div className="box-details">
            <span className="box-title-sup">{""}</span>
            <h2>
              {userObject && userObject.data && userObject.data.name
                ? userObject.data.name
                : userObject.data.firstName + " " + userObject.data.lastName}
            </h2>
            <span className="box-title-sub">
              {userObject && userObject.data && userObject.data.email
                ? userObject.data.email
                : ""}
            </span>
          </div>
          {/* {props.params.match.visitid ? <button className="ml-auto" onClick={() => props.history.goBack()}>:<button className="ml-auto" onClick={() => props.history.goBack()}>} */}
          <div className="box-person-right">
            {isCallEnable ? (
              <button
                className="video-call"
                onClick={() =>
                  patientVideoCall(userObject.data.id, userObject.data.name)
                }
              >
                <img src="/assets/images/video-call.svg" alt="Call" />
              </button>
            ) : (
              ""
            )}

            <button
              onClick={() =>
                props.match && props.match.params && props.match.params.visitid
                  ? searchText
                    ? props.history.push(
                        "/patient/" + props.match.params.patientid,
                        { searchText: searchText, patientObj: userObject.data }
                      )
                    : props.history.push(
                        "/patient/" + props.match.params.patientid,
                        { patientObj: userObject.data }
                      )
                  : searchText
                  ? props.history.push("/", {
                      searchText: searchText,
                      patientObj: userObject.data,
                    })
                  : props.history.push("/", { patientObj: userObject.data })
              }
            >
              <img
                src="/assets/images/icon-back.svg"
                alt="back"
                height="20"
                width="20px"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="modal fade" id="myModal-1" role="dialog">
        <div class="modal-dialog modal-blocker">
          <div class="modal-content">
            <div class="modal-header">
              {/* <h4 class="modal-title"></h4> */}
              <p>Please disable your pop-up blocker</p>
              <button type="button" class="close" data-dismiss="modal">
                &times;
              </button>
            </div>
            <div class="modal-body">
              <div className="general-btns-group invite-patient-btns">
                <img src={imagePath} alt=""></img>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        style={{ display: "none" }}
        id="modal-btn-open"
        class="btn btn-info btn-lg"
        data-toggle="modal"
        data-target="#myModal-1"
      >
        Open Modal
      </button>
    </>
  );
};

export default UserProfile;
