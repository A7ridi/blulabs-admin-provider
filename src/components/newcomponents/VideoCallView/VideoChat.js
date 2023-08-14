import React, { useState, useEffect } from "react";
import {
  getBillingCode,
  getTelehealthToken,
  getVideoCallToken,
  rejectBillingCode,
  updateBillingCode,
} from "../../../Apimanager/Networking";
import swal from "sweetalert";
import Room from "./Room";
import Select from "react-select";

function VideoChat() {
  const [state, setState] = useState({
    roomName: null,
    token: "abc",
    billingCodeList: [],
    recentUsedList: [],
    selectedbillingCode: null,
    telehealthID: "",
    callDisconnect: 1,
    callDifferenceTime: null,
  });

  useEffect(() => {
    getBilling();
    if (state.telehealthID) {
      getTeleToken();
    } else {
      getVideoToken();
    }
  }, []);

  const getTeleToken = async () => {
    try {
      let params = { telehealthId: state.telehealthID };
      let success = await getTelehealthToken(params);
      if (success?.data?.settings?.status === 1) {
        setState({
          ...state,
          token: success.data.jwt,
          telehealthID: success.data.telehealthId,
        });
        localStorage.setItem("videoCallToken", success.data.jwt);
      } else {
        console.log(
          "Status code != 1 for telehealth get token",
          JSON.stringify(success, null, 4)
        );
      }
    } catch (error) {
      console.log("telehealth get token Error", JSON.stringify(error, null, 4));
    }
  };

  const getVideoToken = async () => {
    try {
      let queryparams = {
        room: localStorage.getItem("videoPatientID"),
        receiverUserId: localStorage.getItem("videoPatientID"),
        isSandbox: false,
      };
      let success = await getVideoCallToken(queryparams);
      if (success?.data?.settings?.status === 1) {
        setState((prevState) => ({
          ...prevState,
          token: success.data.jwt,
          telehealthID: success.data.telehealthId,
        }));
        localStorage.setItem("videoCallToken", success.data.jwt);
      } else {
        closeWindow();
      }
    } catch (error) {
      console.log("Something went wrong! --> ", JSON.stringify(error, null, 4));
    }
  };

  const getBilling = async () => {
    try {
      let success = await getBillingCode();
      if (success?.data?.data?.billingCodes) {
        setState({
          ...state,
          billingCodeList: success?.data?.data?.billingCodes,
          recentUsedList: success?.data?.data?.recentlyUsed,
        });
      } else {
        console.log(
          "Status code != 1 for get Billing Code",
          JSON.stringify(success, null, 4)
        );
      }
    } catch (error) {
      console.log("Something went wrong! --> ", JSON.stringify(error, null, 4));
    }
  };

  const closeWindow = () => {
    localStorage.removeItem("videoCallToken");
    localStorage.removeItem("patientNameVideo");
    localStorage.removeItem("teleHealthID");
    localStorage.removeItem("videoPatientID");
    window.close();
  };

  const handleLogout = (room) => {
    room && room.localParticipant.tracks.forEach(publication => {
      const track = publication.track;
      if (track.kind == "video" || track.kind == "audio") {
        track.detach().forEach(element => element.remove())
        track.stop()
      }
      publication.unpublish()
    })
    room && room.disconnect()



    localStorage.removeItem("videoCallToken");
    localStorage.removeItem("patientNameVideo");
    var d = new Date();
    var difference = d.getTime() - window.startTime;
    var minutesDifference = Math.floor(difference / 1000 / 60);
    difference -= minutesDifference * 1000 * 60;
    var secondsDifference = Math.floor(difference / 1000);
    window.local && window.local.disconnect();

    if (window.participant) {
      setState({
        ...state,
        token: null,
        callDisconnect: 2,
        callDifferenceTime:
          minutesDifference + " minutes, " + secondsDifference + " seconds",
      });
      window.participant = false;
      rejectBilling();
    } else {
      rejectCallByAdmin();
    }
  };

  const rejectBilling = async () => {
    try {
      let queryparams = {
        telehealthID: state.telehealthID,
        senderUserId: localStorage.getItem("videoPatientID"),
      };
      let success = await rejectBillingCode(queryparams);
      if (success) console.log("Reject Billing successful");
    } catch (error) {
      swal("", error?.message, "error");
    }
    console.log("Function completed");
  };

  const rejectCallByAdmin = async () => {
    await rejectBilling();
    console.log("Back to reject call by admin");
    window.close();
  };

  const handleSelectBillingCode = async (code) => {
    setState({
      ...state,
      selectedbillingCode: code,
    });
    updateBilling(true, code.value);
  };

  const updateBilling = async (billabe = true, id = null) => {
    try {
      let queryparams = {
        isBillable: billabe,
        billingCodeId: id,
        telehealthID: state.telehealthID,
      };
      let success = await updateBillingCode(queryparams);
      if (success?.status === 200) {
        swal("Successful !", success?.data?.settings?.message, "success").then(
          (value) => closeWindow()
        );
      }
    } catch (error) {
      swal("", error.message, "error");
    }
  };

  let codeList = [];
  if (state.billingCodeList?.length > 0) {
    codeList = state.billingCodeList?.map((list, index) => {
      return {
        value: list.id,
        label: list.title,
      };
    });
  }

  let recentData = null;
  if (state.recentUsedList?.length > 0) {
    recentData = state.recentUsedList?.map((list, index) => {
      return (
        <div onClick={() => updateBilling(true, list.id)} className="ad-column">
          {list.title}
        </div>
      );
    });
  }

  return (
    <>
      {state.token && state.callDisconnect === 1 ? (
        <Room
          roomName={state.roomName}
          token={state.token === "abc" ? null : state.token}
          handleLogout={handleLogout}
        />
      ) : (
        <div className="call-billable">
          <div className="call-billable-wrap">
            <h3>Was this call billable?</h3>
            <div className="call-time">{state.callDifferenceTime} </div>
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
                value={state.selectedbillingCode}
                onChange={handleSelectBillingCode}
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
                onClick={() => updateBilling(false)}
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

export default VideoChat;
