import React, { Component } from "react";
import "./ReferralDetailsView.css";
import * as dasboardActions from "../../redux/actions/dashboard.action";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as Analytics from "../../helper/AWSPinPoint";

export class ReferralDetailsView extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    document.getElementById("ReferralDetailsModal").click();
  }
  render() {
    let details = {};
    let patientName = "";
    if (this.props.referralDetailsObject?.details) {
      details = this.props.referralDetailsObject?.details;
      patientName = "patient";
    } else {
      details = this.props.referralPatientDetails;
      patientName = this.props.patientName;
    }

    let referredViewedAnalyticsDetails = {
      referredEnterprise: details.toHealthSystem,
      title: `${details.addedbyName} has referred ${patientName} to ${details.toHealthSystem}`,
    };
    Analytics.record(
      referredViewedAnalyticsDetails,
      this.props.userDetails.id,
      Analytics.EventType.referredViewed
    );

    let physicianArray = details.providers?.map((provider) => {
      return provider.firstname + " " + provider.lastname;
    });

    let finalPhysicianString = "";

    if (physicianArray?.length === 1) {
      finalPhysicianString = physicianArray?.join(", ");
    } else if (physicianArray?.length === 2) {
      finalPhysicianString = physicianArray[0] + " and +" + "1 other physician";
    } else {
      finalPhysicianString =
        physicianArray?.[0] +
        " and +" +
        [physicianArray?.length - 1] +
        " other physicians";
    }

    return (
      <div className="referral-details-view-modal">
        {/* Show Referral Content Modal */}

        <button
          type="button"
          class="btn btn-primary"
          data-toggle="modal"
          data-target="#ReferralDetailsModalCenter"
          id="ReferralDetailsModal"
          style={{ display: "none" }}
        >
          Launch demo modal
        </button>

        <div
          class="modal fade"
          id="ReferralDetailsModalCenter"
          tabindex="-1"
          role="dialog"
          aria-labelledby="ReferralDetailsModalCenterLabel"
          aria-hidden="true"
          data-backdrop="static"
        >
          <div class="modal-dialog" role="document">
            <div class="modal-content referral-details-content">
              <div class="modal-header referral-details-header">
                <h5
                  class="modal-title referral-details-title"
                  id="ReferralDetailsModalCenterLabel"
                ></h5>
                <button
                  type="button"
                  class="close referral-details-header-cross-button"
                  data-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    this.props.closeReferralDetail(false);
                    this.props.setReferralDetailsObject({
                      referralDetailsObject: {
                        details: null,
                        displayFlag: false,
                      },
                    });
                  }}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body referral-details-body">
                <div className="referral-details-title">
                  {`${details.addedbyName} has referred ${patientName} to ${details.toHealthSystem}`}
                </div>
                <div className="referral-physician-list">
                  {finalPhysicianString}
                </div>
                {details.messageContent ? (
                  <div>
                    <div className="referral-details-message">Note</div>
                    <div className="referral-details-description">
                      {details.messageContent}
                    </div>
                  </div>
                ) : null}
                {details.video ? (
                  <div>
                    <div className="referral-details-message">
                      Video Message
                    </div>
                    <div className="referral-details-video-message">
                      <video
                        src={details.video}
                        style={{ height: "140px", width: "100%" }}
                        controls
                        disablePictureInPicture
                        controlsList="nodownload"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <div class="modal-footer referral-details-footer"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    referralDetailsObject: state.dashboardStates.referralDetailsObject,
  };
};
const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      setReferralDetailsObject: dasboardActions.setReferralDetailsObject,
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReferralDetailsView);
