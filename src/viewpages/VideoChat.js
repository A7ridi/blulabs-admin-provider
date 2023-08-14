import React from "react";
import Room from "./Room";
import BaseComponent from "../components/BaseComponent";
//import '../video.css'
//import LoadingIndicator from '../common/LoadingIndicator';
import Apimanager from "../Apimanager/index";
import Select from "react-select";
import swal from "sweetalert";
class VideoChat extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      roomName: null,
      token: "abc",
      billingCodeList: [],
      recentUsedList: [],
      selectedbillingCode: null,
      telehealthID: "",
      callDisconnect: 1,
      callDifferenceTime: null,
    };
  }

  componentDidMount() {
    Apimanager.getBillingCode(
      {},
      (success) => {
        if (success && success.status && success.status === 200) {
          if (success.data.data.billingCodes) {
            this.setState({
              billingCodeList: success.data.data.billingCodes,
              recentUsedList: success.data.data.recentlyUsed,
            });
          }
        }
      },
      (error) => {}
    );

    // if (localStorage.getItem("teleHealthID")) {
    if (this.state.telehealthID) {
      let params = {
        // telehealthId: localStorage.getItem("teleHealthID"),
        telehealthId: this.state.telehealthID,
      };
      Apimanager.getTelehealthToken(
        params,
        (success) => {
          if (
            success &&
            success.data &&
            success.data.settings &&
            success.data.settings.status === 1
          ) {
            this.setState({
              token: success.data.jwt,
              telehealthID: success.data.telehealthId,
            });

            localStorage.setItem("videoCallToken", success.data.jwt);
          } else {
            this.ErrorAlertbar(success.data.settings.message);
          }

          return;
        },
        (error) => {
          if (error && error.status === 400) {
            this.ErrorAlertbar(error.data.settings.message);
          }

          if (error && error.status === 500) {
            if (
              error.data &&
              error.data.settings &&
              error.data.settings.message
            ) {
              this.ErrorAlertbar(error.data.settings.message);
              return;
            }
          }

          return;
        }
      );
    } else {
      let queryparams = {
        room: localStorage.getItem("videoPatientID"),
        receiverUserId: localStorage.getItem("videoPatientID"),
        isSandbox: false,
      };

      Apimanager.getVideoCallToken(
        queryparams,
        (success) => {
          if (
            success &&
            success.data &&
            success.data.settings &&
            success.data.settings.status === 1
          ) {
            this.setState({
              token: success.data.jwt,
              telehealthID: success.data.telehealthId,
            });

            localStorage.setItem("videoCallToken", success.data.jwt);
            // localStorage.setItem("teleHealthID", success.data.telehealthId);
          } else {
            this.ErrorAlertbar(success.data.settings.message, () =>
              this.closeWindow()
            );
          }

          return;
        },
        (error) => {
          if (error && error.status === 400) {
            this.ErrorAlertbar(error.data.settings.message, () =>
              this.closeWindow()
            );
          }

          if (error && error.status === 500) {
            if (
              error.data &&
              error.data.settings &&
              error.data.settings.message
            ) {
              this.ErrorAlertbar(error.data.settings.message, () =>
                this.closeWindow()
              );
              return;
            }
          }

          return;
        }
      );
    }
  }

  closeWindow = () => {
    localStorage.removeItem("videoCallToken");
    localStorage.removeItem("patientNameVideo");
    localStorage.removeItem("teleHealthID");
    localStorage.removeItem("videoPatientID");
    window.close();
  };

  handleLogout = () => {
    localStorage.removeItem("videoCallToken");
    localStorage.removeItem("patientNameVideo");
    var d = new Date();
    var difference = d.getTime() - window.startTime;

    var minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60;

    var secondsDifference = Math.floor(difference / 1000);
    window.local && window.local.disconnect();

    if (window.participant) {
      this.setState({
        token: null,
        callDisconnect: 2,
        callDifferenceTime:
          minutesDifference + " minutes, " + secondsDifference + " seconds",
      });
      window.participant = false;

      let queryparams = {
        // telehealthID: localStorage.getItem("teleHealthID"),
        telehealthID: this.state.telehealthID,
        senderUserId: localStorage.getItem("videoPatientID"),
      };

      Apimanager.rejectBillingCode(
        queryparams,
        (success) => {},
        (error) => {
          swal("", error.message, "error");
        }
      );
    } else {
      //window.close()
      this.rejectCallByAdmin();
    }
  };

  handleSelectBillingCode = (code) => {
    this.setState({
      selectedbillingCode: code,
    });

    this.updateBillingCode(true, code.value);
  };

  rejectCallByAdmin = () => {
    let queryparams = {
      // telehealthID: localStorage.getItem("teleHealthID"),
      telehealthID: this.state.telehealthID,
      senderUserId: localStorage.getItem("videoPatientID"),
    };

    localStorage.removeItem("videoCallToken");
    localStorage.removeItem("patientNameVideo");
    localStorage.removeItem("teleHealthID");
    localStorage.removeItem("videoPatientID");

    Apimanager.rejectBillingCode(
      queryparams,
      (success) => {},
      (error) => {
        swal("", error.message, "error");
      }
    );

    window.close();
  };

  updateBillingCode = (billabe = true, id = null) => {
    let queryparams = {
      isBillable: billabe,
      billingCodeId: id,
      // telehealthID: localStorage.getItem("teleHealthID"),
      telehealthID: this.state.telehealthID,
    };

    Apimanager.updateBillingCode(
      queryparams,
      (success) => {
        if (success && success.status && success.status === 200) {
          swal("Successful !", success.data.settings.message, "success").then(
            (value) => {
              localStorage.removeItem("videoCallToken");
              localStorage.removeItem("patientNameVideo");
              localStorage.removeItem("teleHealthID");
              localStorage.removeItem("videoPatientID");
              window.close();
            }
          );
        }
      },
      (error) => {
        swal("", error.message, "error");
      }
    );
  };

  render() {
    let codeList = [];

    if (this.state.billingCodeList.length > 0) {
      codeList = this.state.billingCodeList.map((list, index) => {
        return {
          value: list.id,
          label: list.title,
        };
      });
    }

    let recentData = null;
    if (this.state.recentUsedList.length > 0) {
      recentData = this.state.recentUsedList.map((list, index) => {
        return (
          <div
            onClick={() => this.updateBillingCode(true, list.id)}
            className="ad-column"
          >
            {list.title}
          </div>
        );
      });
    }

    return (
      <>
        {this.state.token && this.state.callDisconnect === 1 ? (
          <Room
            roomName={this.state.roomName}
            token={this.state.token === "abc" ? null : this.state.token}
            handleLogout={this.handleLogout}
          />
        ) : (
          <div className="call-billable">
            <div className="call-billable-wrap">
              <h3>Was this call billable?</h3>
              <div className="call-time">{this.state.callDifferenceTime} </div>
              <div className="recently-used-div">
                <p className="recentused">Recently used.</p>
                <div style={{ flex: 1 }}></div>
                <Select
                  styles={{
                    container: (provided) => ({
                      ...provided,
                      width: 350,
                    }),
                  }}
                  value={this.state.selectedbillingCode}
                  onChange={this.handleSelectBillingCode}
                  options={codeList}
                  placeholder="Search for billing code"
                  openOnFocus={true}
                  autofocus={true}
                />
              </div>
              {recentData ? (
                <div className="advance-block">{recentData}</div>
              ) : (
                ""
              )}

              <div className="n-b-button">
                <button
                  className="btn btn-blue-block"
                  onClick={() => this.updateBillingCode(false)}
                >
                  Not billable
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
}

export default VideoChat;
