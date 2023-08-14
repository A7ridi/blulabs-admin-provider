import React, { memo } from "react";
import AlertView from "../../../../components/newcomponents/AlertView";
import TitleTextView from "../../../../components/newcomponents/TitleTextView";
import "react-datepicker/dist/react-datepicker.css";
import "../team.css";
import { withRouter } from "react-router-dom";
import "../team.css";
import { pendoIds } from "../../../../Constants/pendoComponentIds/pendoConstants";
import {
   capitalizeFirstLetter,
   checkMemberRole,
   checkUserRole,
   clinicalTypeOption,
   showDeleteTeamPopup,
} from "../action/teamAction";
import { bindActionCreators } from "redux";
import { setTeamDescription, setTeamName } from "../../../../redux/actions/teamList.action";
import { connect } from "react-redux";
import { ShowAlert } from "../../../../common/alert";
import { useState } from "react";
import AddProvider from "../../profile/AddProvider";
import * as i18n from "../../../../I18n/en.json";
import CustomSelect from "../../../../shared/components/customSelect/CustomSelect";

const InputView = memo((props) => (
   <div className={`col-lg-12 col-md-12 col-sm-12 col-xs-12 p-0 mb-2 ${props.inputView ? "" : "px-4"}`}>
      <TitleTextView titleClass="mb-3" {...props} />
      <div className={`h-4xs text-danger text-small ${props.teamSection || props.createTeamList ? "" : "mb-4"}`}>
         {props.error}
      </div>
   </div>
));

function CreateTeamView(props) {
   const {
      onClose,
      onTeamNameChange,
      onTeamDescription,
      teamName,
      teamDescription,
      buttonId,
      setTeamName,
      setTeamDescription,
      createClinicalTeam,
      clinicalTeamName,
      clinicalTeamDescription,
      updateClinicalTeam,
      deleteClinicalTeam,
      enterpriseId,
      eachTeam = {},
      permissionTxt = "",
      setUpdateClinicalType = () => {},
      updateClinicalType,
   } = props;
   const [members, setMembers] = useState([]);
   const [clinicalType, setClinicalType] = useState(null);

   const placeholder = i18n?.clinicalTeam?.placeholder;
   const teamError = i18n?.clinicalTeam?.teamError;
   const memberError = i18n?.clinicalTeam?.memberError;

   const createTeam = () => {
      let email = members?.data?.contactInformation?.email || "";
      let obj = {
         variables: {
            team: {
               name: clinicalTeamName,
               description: clinicalTeamDescription,
               clinicalType: clinicalType?.value,
               members: [
                  {
                     contactInformation: {
                        email,
                     },
                     role: "attending",
                  },
               ],
            },
            addTeam: true,
         },
      };
      createClinicalTeam(obj);
   };

   const validateTeamDetails = () => {
      const checkMembersArr = members?.length === 0 || members?.value?.length === 0;
      let letters = /^\s+$/;
      if (clinicalTeamName.length < 3) {
         ShowAlert(teamError, "error");
      } else if (clinicalType === null) {
         ShowAlert("Please Select a clinical type", "error");
      } else if (checkMembersArr) {
         ShowAlert(memberError, "error");
      } else if (clinicalTeamName.match(letters) === null && clinicalTeamName.length > 3) {
         createTeam();
      }
   };

   const validateUpdateTeam = () => {
      if (teamName.length <= 3) {
         ShowAlert(teamError, "error");
         return;
      } else if (updateClinicalType === null || updateClinicalType?.value === null) {
         ShowAlert("Please Select a clinical type", "error");
      } else {
         updateClinicalTeam();
         onClose && onClose();
      }
   };

   const inputBox = {
      fontSize: "14px",
      color: "#4F4F4F",
      borderRadius: "5px",
      border: "1px solid #cbc9c9",
   };

   const checkRole = checkUserRole() || checkMemberRole(eachTeam);

   return (
      <div
         className="invite-patient-view col col-md-7 p-5 bg-white round-border-m"
         style={{ maxWidth: "600px", height: `${props.renameTeam ? "405px" : "450px"}` }}
      >
         {props.renameTeam ? (
            <AlertView
               createClassName="create-team__margin"
               textClass="text-class"
               alertclass="w-100"
               titleText="Edit"
               confirmButtonId={buttonId}
               confirmButtonText="Update"
               cancelButtonId={pendoIds.btnDeleteClinicalTeamModal}
               cancelmButtonText="Delete"
               showClose={true}
               onClose={onClose}
               permissionTxt={permissionTxt}
               onAction={() => validateUpdateTeam()}
               checkRole={checkRole}
               deletedTeam={() => {
                  if (checkRole) showDeleteTeamPopup(deleteClinicalTeam, teamName);
               }}
               cancelcls={`${checkRole ? "pointer" : "cursor-events tooltipTeam"}`}
               teamSection
               className="edit-marginTop"
               contentView={() => (
                  <div className="w-100 flex-center mb-3 my-5">
                     <div className="row w-85 gx-5">
                        <div className="w-100">
                           <InputView
                              id="name"
                              pattern="[A-Za-z]{3,}"
                              onChange={(e) => {
                                 let val = capitalizeFirstLetter(e.target.value);
                                 onTeamNameChange(val);
                              }}
                              defaultValue={teamName}
                              inputView
                              teamSection
                              required
                              placeholder="Title"
                           />
                           <InputView
                              id="description"
                              pattern="[A-Za-z]{1,}"
                              onChange={(e) => onTeamDescription(e.target.value)}
                              defaultValue={teamDescription}
                              inputView
                              teamSection
                              placeholder="Description (optional)"
                           />
                        </div>
                        <CustomSelect
                           className="w-100 h-100"
                           defaultOptions
                           isSearchable={true}
                           placeholder="Select type"
                           onChange={(e) => setUpdateClinicalType(e)}
                           options={clinicalTypeOption}
                           value={updateClinicalType}
                           inputBox={inputBox}
                        />
                     </div>
                  </div>
               )}
            />
         ) : (
            <AlertView
               createClassName="create-team__margin"
               textClass="text-class"
               alertclass="w-100"
               xbuttonClass="x-button-class"
               titleText="Create your team"
               showClose={true}
               onClose={onClose}
               createTeamList
               createNewTeam={() => validateTeamDetails()}
               confirmButtonId={buttonId}
               confirmButtonText="Create team"
               contentView={() => (
                  <div className="w-100 flex-center mb-3 my-5">
                     <div className="row w-85 gx-5">
                        <div className="w-100">
                           <InputView
                              id="name"
                              placeholder="Title"
                              pattern="[A-Za-z]{1,}"
                              onChange={(e) => {
                                 let val = capitalizeFirstLetter(e.target.value);
                                 setTeamName(val);
                              }}
                              value={clinicalTeamName}
                              inputView
                              createTeamList
                              placeholderClass="placeholder-class"
                           />
                           <InputView
                              id="description"
                              placeholder="Description (optional)"
                              pattern="[A-Za-z]{1,}"
                              onChange={(e) => setTeamDescription(e.target.value)}
                              value={clinicalTeamDescription}
                              inputView
                              createTeamList
                              placeholderClass="placeholder-class"
                           />
                        </div>
                        <CustomSelect
                           className="w-100 h-100"
                           defaultOptions
                           isSearchable={true}
                           placeholder="Select type"
                           onChange={(e) => setClinicalType(e)}
                           options={clinicalTypeOption}
                           value={clinicalType}
                           inputBox={inputBox}
                        />
                        <AddProvider
                           setSelectedValue={setMembers}
                           enterpriseId={enterpriseId}
                           placeholder={placeholder}
                           inputBox={inputBox}
                        />
                     </div>
                  </div>
               )}
            />
         )}
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      clinicalTeamName: state?.teamList?.teamName,
      clinicalTeamDescription: state?.teamList?.teamDescription,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         setTeamName: setTeamName,
         setTeamDescription: setTeamDescription,
      },
      dispatch
   );
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateTeamView));
