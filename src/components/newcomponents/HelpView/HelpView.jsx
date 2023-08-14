import React, { useEffect, useState, useCallback } from "react";
import "./HelpView.css";
import { connect } from "react-redux";
import * as firebase from "firebase/app";
// import Apimanager from "../../Apimanager";
import { supportMessage } from "../../../Apimanager/Networking";
import ReactDOM from "react-dom";
import LoadingSmallContent from "../../../common/LoadingSmallContent";
import Skeleton from "react-loading-skeleton";
import LoadingIndicator from "../../../common/LoadingIndicator";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let embedYoutubeLink = (url) => {
  let urlcomps = url.split("/");
  let vid = urlcomps[urlcomps.length - 1];
  let yurl = `https://www.youtube.com/embed/${vid}`;
  return yurl;
};

function HelpView(props) {
  let { closeTapped = () => {} } = props;
  let [state, setState] = useState({
    loader: false,
    mainText: "",
    buttonTitle: "",
    placeholder: "",
    faqArr: [],
    text: "",
    textcount: 0,
    maxTextCount: 500,
    gettingData: true,
  });
  let provider = props.userCredentials;
  let runSupportApi = () => {
    setState({ ...state, loader: true });
    supportMessage({ message: state.text })
      .then((result) => {
        setState({ ...state, text: "", loader: false, textcount: 0 });
        toast.success("Request sent successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
        });
      })
      .catch((error) => {
        setState({ ...state, text: "", loader: false, textcount: 0 });
        toast.error("Something went wrong!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
        });
      });
  };
  useEffect(() => {
    let subscribers = firebase
      .firestore()
      .collection("AppText")
      .doc("Help")
      .onSnapshot(function (doc) {
        let fbObject = { ...state };
        if (doc.exists) {
          let data = doc.data();
          fbObject = {
            ...state,
            mainText: data.mainText,
            buttonTitle: data.buttonTitle,
            placeholder: data.placeHolder,
            loader: false,
          };
        }
        // Apimanager.getFaqs((result) => {
        //   let data = result.data.map((obj) => ({ ...obj, isOpen: false }));
        //   setState({ ...fbObject, faqArr: data, gettingData: false });
        // });
        setState({ ...fbObject, gettingData: false });
      });
    return () => subscribers();
  }, []);

  return ReactDOM.createPortal(
    <div className="HelpView" onClick={closeTapped}>
      <div className="help-container">
        <div
          id="close-help-view"
          className="close"
          data-dismiss="modal"
          onClick={closeTapped}
        >
          &times;
        </div>
        <h3>Help</h3>
        <h2>{"Hi " + provider.user.name}</h2>
        <div className="scroll-container">
          <p>{state.gettingData ? <LoadingSmallContent /> : state.mainText}</p>
          <div className="question-div">
            <textarea
              placeholder={state.placeholder}
              value={state.text}
              onChange={(e) => {
                if (e.target.value.length <= state.maxTextCount) {
                  setState({
                    ...state,
                    text: e.target.value,
                    textcount: e.target.value.length,
                  });
                }
              }}
            />
            <label>{`${state.textcount}/${state.maxTextCount}`}</label>
            <div className="w-100 flex-center justify-content-end my-3">
              <button
                disabled={state.text === ""}
                onClick={runSupportApi}
                className="btn-default text-small w-2xs round-border-s"
              >
                Send
                {/* {state.gettingData ? (
                <div className="button-skeleton">
                  <Skeleton count={1} height={45} />
                </div>
              ) : (
                state.buttonTitle
              )} */}
              </button>
            </div>
          </div>
          {/* {state.faqArr && state.faqArr.length > 0 ? (
            <p id="faq-text">FAQs</p>
          ) : null} */}
          <div className="faq-div flex-center">
            FAQs
            <br />
            Coming Soon!
            {/* <div className="table-div">
              {state.gettingData ? (
                <>
                  <LoadingSmallContent />
                  <LoadingSmallContent />
                  <LoadingSmallContent />
                  <LoadingSmallContent />
                </>
              ) : (
                state.faqArr?.map((obj) => {
                  return (
                    <div
                      key={obj.id}
                      className="faq-cell"
                      onClick={() => {
                        if (
                          obj.type === "url" &&
                          !obj.answer.includes("https://youtu.be/")
                        ) {
                          window.open(obj.answer);
                        } else {
                          let arr = [...state.faqArr];
                          let itemIndex = arr.findIndex((o) => obj.id === o.id);
                          arr[itemIndex].isOpen = !arr[itemIndex].isOpen;
                          setState({
                            ...state,
                            faqArr: arr,
                          });
                        }
                      }}
                    >
                      <div>
                        <div className="faq-quest-arrow-div">
                          {obj.question}
                          <span></span>
                          <div className="faq-arrow">
                            {obj.isOpen ? (
                              <img
                                src="/assets/images/arrow-up.svg"
                                alt=""
                                className="faq-down-arrow"
                              />
                            ) : (
                              <img
                                src="/assets/images/arrow-down.svg"
                                alt=""
                                className="faq-down-arrow"
                              />
                            )}
                          </div>
                        </div>
                        {obj.isOpen ? (
                          obj.type === "url" &&
                          obj.answer.includes("https://youtu.be/") ? (
                            <div className="faq-answer">
                              <iframe src={embedYoutubeLink(obj.answer)} />
                            </div>
                          ) : (
                            <div className="faq-answer">{obj.answer}</div>
                          )
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div> */}
          </div>
        </div>
        {state.loader ? (
          <div className="create-content-loading">
            <LoadingIndicator />
          </div>
        ) : null}
      </div>
    </div>,
    document.getElementById("portal")
  );
}

const mapStateToProps = (state) => {
  return {
    userCredentials: state.auth.userCredentials,
  };
};

export default connect(mapStateToProps)(React.memo(HelpView));
