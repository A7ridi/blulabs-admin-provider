import React, { useState } from "react";
import Apimanager from "../../Apimanager";
import swal from "sweetalert";
import LoadingIndicator from "../../common/LoadingIndicator";
export const isValidMob = (mobile) => {
  let mobReg = /^(\+1|)?(\d{3})(\d{3})(\d{4})$/;
  return mobReg.test(mobile);
};

export function formatPhoneNumber(phoneNumberString) {
  if (!phoneNumberString) return "";
  if (window.phoneNumbers && window.phoneNumbers[phoneNumberString]) {
    return window.phoneNumbers[phoneNumberString];
  }
  if (!window.phoneNumbers) {
    window["phoneNumbers"] = {};
  }
  let number = phoneNumberString.replace(
    /(\+\d{1})(\d{3})(\d{3})(\d{4})/,
    "$1 ($2) $3-$4"
  );
  window.phoneNumbers[phoneNumberString] = number;
  return number || "";
}

function sweetAlertbar(message, icon = "success", callback = null) {
  swal({
    title: icon === "success" ? "Successful" : "There is some Error!",
    text: message,
    icon: icon,
    dangerMode: icon === "success",
  });
}

function removeProvider(
  provider,
  patientid,
  removed = () => {},
  error = () => {}
) {
  let apiParam = {
    id: provider.id,
    userId: patientid, //this.props.match.params.patientid,
  };

  Apimanager.deleteCareTeamMember(
    apiParam,
    (success) => {
      removed();
      sweetAlertbar(success.data.settings.message);
    },
    (err) => {
      if (err && err.status === 500) {
        error();
        sweetAlertbar(error.data.settings.message, "error");
      }
    }
  );
}

function CareTeamProviderView(props) {
  let { provider, removed = () => {} } = props;
  const [loading, setLoading] = useState(false);
  return (
    <div className="CareTeamProviderView flex-center-column">
      <div className="modal-header mb-3">
        <div className="header-content-div">
          <h4 className="modal-title">{provider.name}</h4>
          <button
            type="button"
            id="visitModelDismiss"
            className="close"
            data-dismiss="modal"
            onClick={() => {}}
          >
            &times;
          </button>
        </div>
      </div>

      {provider.userSettings?.cellToProvider ? (
        <p className="your-request mb-3">{`Mobile: ${
          isValidMob(provider.mobileNo)
            ? formatPhoneNumber(provider.mobileNo)
            : "-"
        }`}</p>
      ) : null}
      <p className="your-request mb-3">
        {`Office: ${
          isValidMob(provider.officeMobileNo)
            ? formatPhoneNumber(provider.officeMobileNo)
            : "-"
        }`}

        {/* {`Office: ${
          provider.officeMobileNo === "" || provider.officeMobileNo === null
            ? "-"
            : provider.officeMobileNo
          // formatPhoneNumber(provider.officeMobileNo).formatted
        }`} */}
      </p>
      {provider.userSettings?.emailToProvider ? (
        <div
          className="follow-button"
          onClick={() => {
            window.location.href = `mailto:${provider.email}`;
          }}
        >
          Send Email
        </div>
      ) : null}
      
      {provider.address ? (
        <div
          className="follow-button"
          onClick={() => {
            let pAddrs = provider.address;
            let address = `${pAddrs.address1}+${pAddrs.address2}+${pAddrs.city}+${pAddrs.zip}`;
            window.open(`http://maps.google.com/maps?daddr=${address}`);
          }}
        >
          Directions
        </div>
      ) : null}
      <div
        className="follow-button"
        style={{ backgroundColor: "#BC2626" }}
        onClick={() => {
          setLoading(true);
          removeProvider(provider, props.match.params.patientid, () => {
            setLoading(false);
            removed();
            document.getElementById("visitModelDismiss").click();
          });
        }}
      >
        Remove
      </div>
      {loading ? (
        <div className="create-content-loading">
          <LoadingIndicator />
        </div>
      ) : null}
    </div>
  );
}

export default React.memo(CareTeamProviderView);
