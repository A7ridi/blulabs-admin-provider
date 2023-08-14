import React, { memo, useState, useEffect } from "react";
import Select from "react-select";
import InputMask from "react-input-mask";
import { isValidMob, emailReg, firstLastNameRegex } from "../../../helper/CommonFuncs";
import TitleTextView from "../../../components/newcomponents/TitleTextView";
import AddProvider from "./AddProvider";
import { capitalizeFirstLetter } from "../teamModule/action/teamAction";
import texts from "../../../helper/texts";

const customStyles = {
   container: () => ({
      marginTop: 20,
      height: 50,
      width: 462,
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      maxHeight: 80,
      minHeight: 50,
      overflow: "auto",
   }),
   indicatorsContainer: (provided) => ({
      ...provided,
      flexShrink: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: 50,
   }),
};

export const AddProviderView = memo((props) => {
   const { teamSection, teamName = "", buttonId, placeholder, placeholder2, checkAttendingMember = () => {} } = props;
   const { enterpriseId, sendTapped, closeTapped } = props;
   const [selectedValue, setSelectedValue] = useState(null);
   const [teamRole, setTeamRole] = useState({ label: "Member", value: "member" });

   const disableOption = (option) => {
      if (selectedValue?.length > 1) return option.label === "Attending";
   };

   const truncTeamName = teamName?.length > 20 ? teamName?.slice(0, 20).trim() + "..." : teamName;

   return (
      <div className="AddProviderToCareTeamView bg-white w-2xl py-3 px-5 flex-center flex-column round-border-l">
         <div className="flex-center justify-content-end w-100">
            <div
               className="h2 font-weight-bold text-center position-absolute w-100 m-0"
               style={{ fontSize: `${teamSection && "22px"}` }}
            >
               {teamSection ? `Add to ${truncTeamName}'s Team` : "Add to Care Team"}
            </div>

            <button className="text-xlarge m-0" onClick={() => closeTapped && closeTapped()}>
               &times;
            </button>
         </div>
         <div className="h2 font-weight-light text-center mt-3 pt-2 mb-0">
            {teamSection ? `Please select member(s) below` : "Select a member to add to this patient's care team."}
         </div>
         <div>
            {teamSection ? (
               <div className="add-to-team">
                  <AddProvider
                     teamSection
                     teamMemberRole
                     setSelectedValue={setSelectedValue}
                     enterpriseId={enterpriseId}
                     setTeamRole={setTeamRole}
                     placeholder={placeholder}
                     placeholder2={placeholder2}
                     disableOption={disableOption}
                     teamRole={teamRole}
                     checkAttendingMember={checkAttendingMember}
                  />
               </div>
            ) : (
               <AddProvider setSelectedValue={setSelectedValue} enterpriseId={enterpriseId} />
            )}
         </div>

         <button
            disabled={!selectedValue || selectedValue?.length === 0}
            className="btn-default text-small round-border-s mb-5 text-truncate-custom"
            style={{ width: `${teamSection ? "125px" : "135px"}`, marginTop: `${teamSection ? "26px" : "80px"}` }}
            onClick={() => {
               if (teamSection) {
                  sendTapped({ members: [...selectedValue], teamRole });
               } else sendTapped(selectedValue);
            }}
            id={buttonId}
         >
            {teamSection ? "Add" : " Add Provider"}
         </button>
      </div>
   );
});

export const AddFriendView = memo((props) => {
   useEffect(() => {
      getCareTeamOption();
   }, []);
   const [relationships, setRelationships] = useState([]);
   const [loadingRel, setLoading] = useState(true);
   const { loading, onConfirm, onCancel, buttonId, selectedpatient = false } = props;
   const isDisabled = selectedpatient ? true : false;
   const name = selectedpatient?.careMember?.name?.fullName || "";
   const phone = selectedpatient?.careMember?.contactInformation?.mobileNumber.mobileInputMaskValue() || "";
   const relation = selectedpatient?.relationship
      ? { label: selectedpatient?.relationship, value: selectedpatient?.relationship }
      : "";
   const email = selectedpatient?.careMember?.contactInformation?.email || "";
   const [state, setstate] = useState({
      name: name,
      phone: phone,
      email: email,
      relationship: relation,
      errors: {
         name: null,
         phone: null,
         email: null,
      },
   });

   const isValidData = () => {
      let st = { ...state };
      let isValid = true;
      state.errors.name = null;
      state.errors.phone = null;
      state.errors.email = null;

      if (!firstLastNameRegex.test(state.name) && !isDisabled) {
         state.errors.name = texts.invalidNameError;
         isValid = false;
      }
      if (state.phone.length === 0 && state.email.length === 0) {
         state.errors.phone = "Please enter a correct phone number";
         state.errors.email = "Please enter a correct email";
         isValid = false;
      }
      if (!isValidMob(state.phone) && state.phone.length > 0) {
         state.errors.phone = "Please enter a correct phone number";
         isValid = false;
      }
      if (!emailReg.test(state.email) && state.email.length > 0) {
         state.errors.email = "Please enter a correct email";
         isValid = false;
      }
      setstate(st);
      return isValid;
   };

   const getCareTeamOption = async () => {
      let relationsShipOptions = await window.firestore.collection("AppText").doc("Relationship").get();
      let opts = relationsShipOptions.data().relations || [];
      var arr = opts.map((s) => {
         return { label: s, value: s };
      });
      setRelationships(arr);
      setLoading(false);
   };
   return (
      <div className="bg-white w-2xxl py-4 px-5 m-4 flex-center justify-content-start flex-column round-border-m">
         <div className="flex-center justify-content-end w-100">
            <div className="h2 font-weight-bold text-center position-absolute w-100 m-0">
               {isDisabled ? "Edit" : "Invite Family & Friends"}
            </div>
            <button style={{ top: "-1px", right: "-1px" }} className="text-xlarge m-0" onClick={onCancel}>
               &times;
            </button>
         </div>
         <div className="flex-grow-1 w-2xl mt-5">
            <TitleTextView
               title="Name"
               disabled={isDisabled}
               defaultValue={state.name}
               placeholder="Enter Full Name"
               inputclass={`${state.errors.name ? "border-danger" : ""}`}
               onBlur={(e) => {
                  let name = capitalizeFirstLetter(e.target.value);
                  setstate({ ...state, name });
               }}
            />
            <div className="mb-4 text-danger text-xsmall">{state.errors.name}</div>
            <div className=" d-block d-md-flex align-items-center">
               <div className="w-35">
                  <TitleTextView
                     title="Phone Number"
                     defaultValue={state.phone}
                     disabled={isDisabled}
                     renderInput={() => (
                        <InputMask
                           className={`default-text-input h-small text-small p-3 ${
                              state.errors.phone ? "border-danger" : ""
                           }`}
                           disabled={isDisabled}
                           mask="+1 (999) 999-9999"
                           value={state.phone}
                           placeholder="+1 (000) 000-0000"
                           onChange={(e) => {
                              let phone = e.target.value.mobileInputMaskValue();
                              setstate({ ...state, phone: phone });
                           }}
                        />
                     )}
                  />
                  <div className="mb-4 text-danger text-xsmall">{state.errors.phone}</div>
               </div>

               <div className="text-xsmall font-weight-bold text-center px-4 pt-4">OR</div>
               <div className="w-57">
                  <TitleTextView
                     title="Email"
                     defaultValue={state.email}
                     disabled={isDisabled}
                     placeholder="abc@example.com"
                     inputclass={`${state.errors.email ? "border-danger" : ""} w-100`}
                     onBlur={(e) => setstate({ ...state, email: e.target.value.trim() })}
                  />
                  <div className="mb-4 text-danger text-xsmall">{state.errors.email}</div>
               </div>
            </div>

            <div className="mt-3">
               <TitleTextView
                  title="Relationship (Optional)"
                  renderInput={() => (
                     <Select
                        className="select-relation"
                        styles={customStyles}
                        options={relationships}
                        value={state.relationship}
                        isClearable
                        isLoading={loadingRel}
                        onChange={(o) => setstate({ ...state, relationship: o })}
                     />
                  )}
               />
            </div>
         </div>
         {loading ? (
            <img width="40px" height="40px" src="/assets/gif/newgifs/loader.gif" alt="" />
         ) : (
            <div className="mt-5 mb-4">
               <button
                  className="bg-disabled text-small round-border-s w-xsmall h-xsmall m-3 font-weight-bold"
                  onClick={onCancel}
               >
                  Cancel
               </button>
               <button
                  id={buttonId}
                  className="btn-default text-small round-border-s w-xsmall h-xsmall m-3"
                  onClick={() => {
                     if (isValidData())
                        onConfirm &&
                           onConfirm({
                              name: state.name,
                              email: state.email,
                              mobileNo: state.phone,
                              relation: state?.relationship?.label || "",
                           });
                  }}
               >
                  {isDisabled ? "Update" : "Send Invite"}
               </button>
            </div>
         )}
      </div>
   );
});
