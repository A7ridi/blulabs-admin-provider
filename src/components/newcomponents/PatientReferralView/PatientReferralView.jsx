import React, { memo, useState, useEffect, useRef, useCallback } from "react";
import "./PatientReferralView.css";
import Select, { components } from "react-select";
import {
   getReferralEntpList,
   getReferralContentList,
   getReferralPhysList,
   uploadmedia,
} from "../../../Apimanager/Networking";
import { checkIconType } from "../../../helper/CommonFuncs";
import Avatar from "../avatar/Avatar";
import { connect } from "react-redux";
import VideoRecorder, { Video } from "../../../components/newcomponents/VideoRecorder";
import ModalPopup from "../ModalPopup";
import swal from "@sweetalert/with-react";
import AlertView from "../../newcomponents/AlertView";
import Socket, { socketActions, socketSubActions } from "../../../helper/Websocket";
import { v4 as uuid } from "uuid";
import texts from "../../../helper/texts";
import * as Analytics from "../../../helper/AWSPinPoint";
import axios from "axios";
import { ShowAlert } from "../../../common/alert";

const customStyles = {
   option: (styles, { isSelected }) => {
      return {
         ...styles,
         fontSize: "12px",
         backgroundColor: isSelected ? "rgba(3, 100, 230, 0.1)" : "white",
         color: "black",
         ":hover": {
            backgroundColor: isSelected ? "" : "rgba(3, 100, 230, 0.1)",
         },
      };
   },
};

const SingleValue = (props) => (
   <components.SingleValue {...props}>
      <span>{props.data.label}</span>
   </components.SingleValue>
);

const MultiValue = (props) => (
   <components.MultiValue {...props}>
      <span>{props.data.label}</span>
   </components.MultiValue>
);

const ValueContainer = ({ children, ...props }) => {
   let [values, input] = children;

   if (Array.isArray(values)) {
      values = values.length > 2 ? `${values.length} selected` : values;
   }

   return (
      <components.ValueContainer {...props}>
         {values}
         {input}
      </components.ValueContainer>
   );
};

const VideoRecordView = (props) => {
   const { onSave, closeRecorder } = props;
   const [state, setstate] = useState({
      file: null,
      mediaUrl: null,
   });
   return (
      <div className="w-2xl ratio-eq bg-white p-4 round-border-m flex-center flex-column justify-content-between">
         <div className="flex-center w-100">
            <div className="w-100 text-large text-center font-weight-bold mb-3">Record Video</div>
            <button className="px-3 mb-3 text-grey5" style={{ fontSize: "28px" }} onClick={closeRecorder}>
               &times;
            </button>
         </div>
         {state.file ? (
            <Video style={{ width: "446px" }} className="bg-black round-border-s" controls>
               <source src={state.mediaUrl} type={state.file?.type}></source>
            </Video>
         ) : (
            <VideoRecorder containerclass="round-border-s" onStop={(obj) => setstate({ ...obj })} {...props} />
         )}
         {state.file ? (
            <div className="action-div flex-center h-small">
               <button
                  className="w-xsmall h-100 bg-disabled text-black font-weight-bold text-small round-border-s flex-center mx-3"
                  onClick={() =>
                     setstate({
                        file: null,
                        mediaUrl: null,
                     })
                  }
               >
                  Re-Record
               </button>
               <button
                  className="w-xsmall h-100 btn-default text-white font-weight-bold text-small round-border-s flex-center mx-3"
                  onClick={() => onSave(state)}
               >
                  Save
               </button>
            </div>
         ) : null}
      </div>
   );
};

function PatientReferralView(props) {
   const { patientReferralInfo, buttonId } = props;
   const defaultSelectedValues = {
      list: [],
      isLoading: true,
      isDisabled: true,
      selected: null,
      error: "",
   };

   const renderLoader = () => {
      return (
         <div ref={loadMore} className="w-100 flex-center my-5">
            <img width={30} height={30} src="/assets/gif/newgifs/spinner.gif" alt="" />
         </div>
      );
   };

   const [isNextLoading, setNextLoading] = useState(false);
   const [state, setState] = useState({
      enterprise: defaultSelectedValues,
      physician: defaultSelectedValues,
      content: defaultSelectedValues,
      textMessage: "",
      textMessageError: "",
      checked: false,
      initialLoading: true,
      showVideoRecorder: false,
      media: {
         file: null,
         mediaUrl: null,
      },
      sendLoader: false,
   });

   const [physician, setPhysician] = useState(defaultSelectedValues);

   const [searchValue, setSearchVal] = useState("");
   const [page, setPage] = useState(1);
   const [loadMorePaginate, setLoadMore] = useState(true);
   const requestToken = useRef(null);

   const loaderObserver = useRef();
   const loadMore = useCallback(
      (node) => {
         loaderObserver.current = new IntersectionObserver(async (loaderView) => {
            if (loaderView[0].isIntersecting && !isNextLoading) {
               setNextLoading(true);
            }
         });
         if (node) loaderObserver.current.observe(node);
      },
      [isNextLoading]
   );

   useEffect(() => {
      if (!isNextLoading) return;
      if (isNextLoading) {
         setPage(page + 1);
         getPhyisicianList(state.enterprise.selected, false, page + 1);
      }
   }, [isNextLoading]);

   useEffect(() => {
      if (searchValue === "" && state.enterprise.selected) {
         getPhyisicianList(state.enterprise.selected, searchValue);
         setPage(1);
         setLoadMore(true);
      }
   }, [searchValue]);

   const getPhyisicianList = async (entpObj, search = false, pagination = 1) => {
      if (search !== false) {
         requestToken.current.cancel();
      }
      requestToken.current = axios.CancelToken.source();
      let st = { ...physician };
      let bodyParams = {
         enterpriseId: entpObj?.value,
         byProvider: true,
         pageSize: 10,
         page: search ? 1 : pagination,
         searchTerm: search ? search : searchValue,
         filterLoggedIn: false,
      };
      let physData = await getReferralPhysList(bodyParams, requestToken.current);
      if (physData?.data?.settings?.status === 1) {
         let tempList =
            physData?.data?.data.map((physician, index) => {
               let mName =
                  physician.middleName === null || physician.middleName === undefined ? "" : physician.middleName;
               return {
                  initials: physician.initials,
                  label: (physician.firstname + " " + mName + " " + physician.lastname).replace(/\s+/g, " "),
                  value: physician.email,
                  index: index,
               };
            }) || [];

         if (tempList.length === 0) {
            setLoadMore(false);
         }
         var arr = [];
         if (pagination === 1) {
            arr = tempList;
         } else {
            arr = st.list.concat(tempList);
         }
         st.list = arr;
         st.isLoading = false;
         st.isDisabled = false;
         st.selected = null;
         if (isNextLoading) setNextLoading(false);
         setPhysician({ ...st });
      } else {
         console.log("Something went wrong!", JSON.stringify(physData, null, 4));
      }
   };

   const setSelectState = (key, value) => {
      setState({
         ...state,
         [key]: { ...state[key], ...value },
      });
   };

   useEffect(() => {
      let enterpriseList = [];
      let contentList = [];
      async function getLists() {
         enterpriseList = await getEnterpriseList();
         contentList = await getContentList();
         setState((prevState) => {
            return {
               ...prevState,
               initialLoading: false,
               enterprise: {
                  ...prevState.enterprise,
                  list: enterpriseList,
                  isLoading: false,
                  isDisabled: false,
               },
               physician: {
                  ...prevState.physician,
                  isLoading: false,
               },
               content: {
                  ...prevState.content,
                  list: contentList,
                  isLoading: false,
                  isDisabled: false,
               },
            };
         });
      }
      getLists();
   }, []);

   // useEffect(() => {
   //    if (state.initialLoading === true) return;
   //    getPhyisicianList(state.enterprise.selected);
   // }, [state.enterprise.selected]);

   const getEnterpriseList = async () => {
      let bodyParams = { byProvider: true };
      let tempList = [];
      let entpData = await getReferralEntpList(bodyParams);
      if (entpData?.data?.settings?.status === 1) {
         tempList = entpData?.data?.data?.map((enterprise, index) => {
            return {
               label: enterprise.name,
               value: enterprise.id,
               index: index,
            };
         });
         return tempList;
      } else {
         console.log("Something went wrong!", JSON.stringify(entpData, null, 4));
      }
   };

   const getContentList = async () => {
      let queryParams = {
         userId: patientReferralInfo.accessUser ? patientReferralInfo.accessUser.id : patientReferralInfo.id,
         v: 1.2,
         page: 1,
         pageSize: 1000,
         listtype: "",
         sendThumbnail: false,
      };
      let tempList = [];
      try {
         let contData = await getReferralContentList(queryParams);
         tempList = contData.data?.data?.map((content, index) => {
            return {
               label: content.title,
               value: content.id,
               type: content.type,
               fileType: content.fileType,
            };
         });
         return tempList;
      } catch (error) {
         console.log("Something went wrong!", JSON.stringify(error, null, 4));
      }
   };

   const validateReferralInfo = () => {
      let validateReferralFields = true;
      let st = { ...state };
      let phy = { ...physician };
      if (!state.enterprise.selected || state.enterprise.selected?.length <= 0) {
         st.enterprise.error = texts.requireHealthSystem;
         validateReferralFields = false;
      }
      if (!physician.selected || physician.selected?.length <= 0) {
         phy.error = texts.requirePhysician;
         validateReferralFields = false;
      }
      if (state.textMessage.length > 300) {
         st.textMessageError = texts.textMessageMaxLength;
         validateReferralFields = false;
      }
      setState({ ...st });
      setPhysician({ ...phy });
      return validateReferralFields;
   };

   const patientReferralStringFunction = (obj) => {
      let { token, websocketFile } = obj;
      let contentNameArray = state.content.selected?.map((content) => content.value);
      let physicianNameArray = physician.selected.map((physician) => physician.value);
      let enterpriseName = Object.assign({}, state.enterprise.selected);
      let referredAnalyticsDetails = { referredEnterprise: enterpriseName.value };

      let patientReferralStr = {
         Authorization: token,
         action: socketActions.referral,
         subAction: socketSubActions.patientReferral,
         loggedInUserId: props.userCredentials.user.id,
         enterpriseId: enterpriseName.value,
         patientId: patientReferralInfo.id,
         videoContent: websocketFile ? websocketFile : "",
         messageContent: state.textMessage,
         providers: physicianNameArray,
         contents: contentNameArray,
         allContent: false,
      };
      window.socket.send(patientReferralStr, (resultPatient) => {
         if (resultPatient.settings?.status === 1) {
            ShowAlert("Patient's referral sent successfully!");
            setState({ ...state, sendLoader: false });
            Analytics.record(referredAnalyticsDetails, props.userCredentials?.user?.id, Analytics.EventType.referred);
            props.closePatientReferralViewModalTapped();
         } else {
            setState({ ...state, sendLoader: false });
            ShowAlert("Something went wrong!", "error");
         }
      });
   };

   const referPatientNow = () => {
      if (validateReferralInfo()) {
         setState({ ...state, sendLoader: true });
         let authtoken = "";
         authtoken = `Bearer ${props.userObject.stsTokenManager.accessToken}`;
         if (state.media.file) {
            let referralDocumentStr = {
               Authorization: authtoken,
               action: socketActions.referral,
               subAction: socketSubActions.referralDocument,
               fileName: "Video" + uuid() + ".mp4",
               loggedInUserId: props.userCredentials.user.id,
            };
            window.socket.send(referralDocumentStr, (result) => {
               if (result.settings?.status === 1) {
                  let signedUrl = result.data?.signedUrl;
                  let fileName = result.data?.fileName;
                  uploadmedia(signedUrl, state.media.file)
                     .then((success) => {
                        setState({ ...state, sendLoader: false });
                        patientReferralStringFunction({
                           token: authtoken,
                           websocketFile: fileName,
                        });
                     })
                     .catch((error) => {
                        setState({ ...state, sendLoader: false });
                        ShowAlert("Something went wrong!", "error");
                     });
               } else {
                  setState({ ...state, sendLoader: false });
                  ShowAlert("Something went wrong!", "error");
               }
            });
         } else {
            patientReferralStringFunction({ token: authtoken });
         }
      }
   };

   const removeVideoMessage = () => {
      swal(
         <AlertView
            titleText="Confirm"
            contentText={`Are you sure? You want to delete this file.`}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  setState({
                     ...state,
                     media: {
                        file: null,
                        mediaUrl: null,
                     },
                  });
               }
            }}
         />,
         { buttons: false }
      );
   };

   const Option = (props) => (
      <div>
         <components.Option {...props}>
            <div className="d-flex align-items-center">
               <div>
                  <input
                     type="checkbox"
                     checked={props.isSelected}
                     onChange={() => null}
                     style={{ width: "18px", height: "18px", marginTop: "5px" }}
                  />{" "}
               </div>
               {props.data?.type ? (
                  <img
                     src={checkIconType(props.data)}
                     alt=""
                     style={{ marginLeft: 8, marginRight: 8 }}
                     // className="mx-4"
                     width="20px"
                     height="20px"
                  />
               ) : (
                  <div className="mx-2">
                     <Avatar
                        initialsApi={props?.data.initials || false}
                        radius={40}
                        name={props.label}
                        bgColor={window.initialColors[props.data.index % window.initialColors.length]}
                     />
                  </div>
               )}

               <div className="text-small text-truncate">{props.label}</div>
            </div>
         </components.Option>

         {props.data.initials &&
            loadMorePaginate &&
            props.data.value === props.options[props.options.length - 1].value && <>{renderLoader()}</>}
      </div>
   );
   return (
      <div className="patient-referral-view">
         <div className="flex-center justify-content-end mt-3 w-100">
            <div className="flex-center justify-content-end flex-grow-1"></div>
            <div className="text-grey5 position-absolute w-100 text-center h1 text-extra-bold">Playback Connect</div>

            <button
               className="px-3 pb-2 mr-2 text-grey5"
               style={{ fontSize: "28px" }}
               onClick={props.closePatientReferralViewModalTapped}
            >
               &times;
            </button>
         </div>
         <div className="flex-center flex-column mx-4 mt-3">
            <div className="w-100 px-4 pb-3">
               <div className="mt-2 text-medium text-bold">Health System</div>
               <Select
                  styles={customStyles}
                  className="w-100"
                  isDisabled={state.enterprise.isDisabled}
                  isLoading={state.enterprise.isLoading}
                  options={state.enterprise.list}
                  isSearchable={true}
                  components={{ Option, SingleValue }}
                  value={state.enterprise.selected}
                  onChange={(e) => {
                     setPage(1);
                     setLoadMore(true);
                     getPhyisicianList(e, false, 1);
                     setPhysician({
                        ...physician,
                        selected: null,
                     });

                     setState({
                        ...state,
                        physician: defaultSelectedValues,
                        enterprise: { ...state.enterprise, selected: e, error: "" },
                     });
                  }}
                  isClearable={true}
               />
               {<span className="text-danger text-xsmall">{state.enterprise.error}</span>}
            </div>
            <div className="w-100 px-4 pb-3">
               <div className="mt-2 text-medium text-bold">Physician</div>
               <div>
                  <Select
                     styles={customStyles}
                     className="w-100"
                     selectProps={{ renderLoader }}
                     isLoading={physician.isLoading}
                     options={state.enterprise.selected !== null ? physician.list : []}
                     components={{ Option, MultiValue, ValueContainer }}
                     isMulti
                     onChange={(e) => {
                        setPhysician({
                           ...physician,
                           selected: e,
                           error: "",
                        });
                     }}
                     onInputChange={(e) => {
                        if (e !== "") {
                           getPhyisicianList(state.enterprise.selected, e);
                        }
                        setSearchVal(e);
                     }}
                     hideSelectedOptions={false}
                     closeMenuOnSelect={false}
                     value={physician.selected}
                     isDisabled={state.enterprise.selected === null}
                  />
                  {<span className="text-danger text-xsmall">{physician.error}</span>}
               </div>
            </div>
            <div className="w-100 px-4 pb-3">
               <div className="d-flex justify-content-between">
                  <div className="mt-2 text-medium text-bold">Content</div>
                  <div className="flex-center align-items-end">
                     <input
                        onChange={(e) => {
                           setState({ ...state, checked: !state.checked });
                           setSelectState("content", {
                              selected: e.target.checked ? state.content.list : [],
                           });
                        }}
                        type="checkbox"
                        id="selectAll"
                        value="selectAll"
                        checked={
                           state.checked || state.content.selected?.length === state.content.list.length ? true : false
                        }
                        style={{ marginBottom: "0.4rem" }}
                     />
                     <label className="text-small ml-2">Select all</label>
                  </div>
               </div>
               <Select
                  styles={customStyles}
                  className="w-100"
                  isDisabled={state.content.isDisabled}
                  isLoading={state.content.isLoading}
                  options={state.content.list}
                  components={{ Option, MultiValue, ValueContainer }}
                  isMulti
                  onChange={(e) => setSelectState("content", { selected: e })}
                  hideSelectedOptions={false}
                  closeMenuOnSelect={false}
                  value={state.content.selected}
               />
            </div>
            <div className="w-100 px-4">
               <div className="mt-2 text-medium text-bold">Note</div>
               <textarea
                  placeholder="Write a note for physician here......."
                  rows={5}
                  className="w-100 round-border-s text-small p-3 no-border"
                  style={{
                     color: "#494949",
                     backgroundColor: "rgba(178, 177, 182, 0.2)",
                  }}
                  value={state.textMessage}
                  onChange={(e) => {
                     setState({
                        ...state,
                        textMessage: e.target.value,
                        textMessageError: "",
                     });
                  }}
               />
               {<span className="text-danger text-xsmall">{state.textMessageError}</span>}
            </div>
            <div className="w-100 px-4">
               <div className=" text-medium text-bold mt-2">Video Message</div>
               <div
                  className="flex-center w-100 round-border-s ratio-16-9"
                  style={{
                     backgroundColor: "rgba(178, 177, 182, 0.2)",
                     height: "120px",
                  }}
               >
                  {state.media.file ? (
                     <div
                        className="cross-button rounded-circle flex-center position-absolute pointer"
                        style={{ zIndex: "1" }}
                     >
                        <button className="text-small text-white pointer" onClick={removeVideoMessage}>
                           &times;
                        </button>
                     </div>
                  ) : null}
                  {state.showVideoRecorder ? (
                     <ModalPopup
                        id="video-recorder-modal"
                        onModalTapped={() => {
                           setState({
                              ...state,
                              showVideoRecorder: false,
                           });
                        }}
                     >
                        <VideoRecordView
                           onSave={(media) =>
                              setState({
                                 ...state,
                                 showVideoRecorder: false,
                                 media: { ...media },
                              })
                           }
                           closeRecorder={() => {
                              setState({
                                 ...state,
                                 showVideoRecorder: false,
                                 media: { file: null, mediaUrl: null },
                              });
                           }}
                        />
                     </ModalPopup>
                  ) : null}
                  {state.media.file ? (
                     <Video src={state.media.mediaUrl} height="100%" controls />
                  ) : (
                     <img
                        src="/assets/images/newimages/record-icon.svg"
                        alt=""
                        onClick={() => setState({ ...state, showVideoRecorder: true })}
                        className="pointer"
                     />
                  )}
               </div>
            </div>
         </div>
         {state.sendLoader ? (
            <div className="w-100 flex-center my-3">
               <img width="40px" height="40px" src="/assets/gif/newgifs/spinner.gif" alt="" />
            </div>
         ) : (
            <div className="mt-3 flex-center">
               <button id={buttonId} className="mb-3 btn-default round-border-s text-small" onClick={referPatientNow}>
                  Connect Now
               </button>
            </div>
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser.user,
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(PatientReferralView));
