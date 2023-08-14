import React, { memo, useState, useEffect } from "react";
import Select from "react-select";
import PatientDetailsView from "../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import AlertView from "../../../components/newcomponents/AlertView";
import swal from "@sweetalert/with-react";
import { getShareTeams, addShareWithTeams } from "../../../Apimanager/Networking";
import { connect } from "react-redux";

const customStyles = {
   container: (provided) => ({
      ...provided,
      width: "100%",
   }),
   control: (provided) => ({
      ...provided,
      height: "100%",
      margin: "10px 15px 10px 15px",
   }),
   indicatorsContainer: (provided) => ({
      ...provided,
      minWidth: "35px",
   }),
   menu: (provided) => ({
      ...provided,
      margin: "8px 15px",
      width: "95%",
      fontSize: "14px",
   }),
};
// const customStyles2 = {
//   container: (provided) => ({
//     ...provided,
//     width: "100%",
//   }),
//   control: (provided) => ({
//     ...provided,
//     width: "50%",
//     margin: "0px 15px",
//   }),
//   indicatorsContainer: (provided) => ({
//     ...provided,
//     minWidth: "35px",
//   }),
//   menu: (provided) => ({
//     ...provided,
//     margin: "8px 15px",
//     width: "50%",
//   }),
// };

function ShareWithTeamView(props) {
   const { close, currentFolder, showResponseAlert, selectedFile, getUpdatedLibrary, buttonId } = props;
   const [state, setState] = useState({
      // teamMembers: Array(15).fill(),
      teamMembers: [],
      shareTeamList: [],
      shareListLoading: true,
      selectedTeams: [],
      isSharing: false,
   });

   useEffect(() => {
      getShareTeamsList();
   }, []);

   const removeProvider = (teamObj) => {
      swal(
         <AlertView
            titleText="Confirm"
            onClose={() => {
               swal.close();
            }}
            contentText={`Are you sure, you want to remove?`}
            onAction={(btnData) => {
               swal.close();
               if (btnData.id === "alert-confirm-button") {
                  let newArr = state.teamMembers
                     .filter((team, i) => team.value !== teamObj.value)
                     .map((team) => team.value);
                  let bodyParams = {
                     id: selectedFile ? selectedFile.id : currentFolder.id,
                     teams: newArr,
                  };
                  addShareWithTeams(bodyParams)
                     .then((res) => {
                        // setState({ ...state, isSharing: false,  });
                        showResponseAlert && showResponseAlert("Team removed successfully", "success");
                        getUpdatedLibrary && getUpdatedLibrary();
                        close && close("success");
                     })
                     .catch((error) => {
                        // setState({ ...state, isSharing: false });
                        let err = error?.data?.settings?.message || "Something went wrong.";
                        showResponseAlert && showResponseAlert(err, "error");
                        close && close();
                     });
               }
            }}
         />,
         { buttons: false }
      );
   };

   const getShareTeamsList = async () => {
      try {
         let queryParams = {
            enterpriseId: props.userCredentials?.user?.enterpriseId,
            name: "",
            includeMember: false,
         };
         let data = await getShareTeams(queryParams);
         if (data) {
            let list = data?.data?.data?.map((team, index) => {
               return {
                  value: team.id || index,
                  label: team.name,
                  data: team,
               };
            });
            let a, b;
            a = list?.map((item) => {
               return item;
            });
            if (selectedFile) {
               b = selectedFile.shareWithTeams?.map((item) => {
                  return { id: item };
               });
            } else {
               b = currentFolder.shareWithTeams?.map((item) => {
                  return { id: item };
               });
            }

            let shareTeamsList = a.filter(function (o1) {
               return b.some(function (o2) {
                  return o1.value === o2.id; // return the ones with equal id
               });
            });

            let shareTeamDropdown = a.filter(function (o1) {
               return !b.some(function (o2) {
                  return o1.value === o2.id; // return the ones with not equal id
               });
            });

            setState({
               ...state,
               shareTeamList: shareTeamDropdown,
               shareListLoading: false,
               teamMembers: shareTeamsList,
            });
         }
      } catch (error) {
         console.log("Share team list fetching error--> ", error);
         setState({ ...state, shareListLoading: false });
      }
   };

   const sendShareWithTeams = () => {
      setState({ ...state, isSharing: true });
      let sharedWithTeams = state.teamMembers.map((team) => team.value);
      let selectedTeams = state.selectedTeams.map((team) => team.value);
      let FinalTeamsArray = [...sharedWithTeams, ...selectedTeams];
      let bodyParams = {
         id: selectedFile ? selectedFile.id : currentFolder.id,
         // teams: state.selectedTeams.map((obj) => obj.value),
         teams: FinalTeamsArray,
      };
      addShareWithTeams(bodyParams)
         .then((res) => {
            setState({ ...state, isSharing: false });
            showResponseAlert && showResponseAlert(res?.data?.message, "success");
            close("success");
         })
         .catch((error) => {
            setState({ ...state, isSharing: false });
            let err = error?.data?.settings?.message || "Something went wrong.";
            showResponseAlert && showResponseAlert(err, "error");
            close && close();
         });
   };

   return (
      <div className="bg-white round-border-m w-2xl">
         <div className="mx-3 justify-content-start flex-center mt-3">
            <img src="/assets/images/newimages/sharewithteam-icon.svg" alt="" className="m-3" />
            <div className="fw-bold text-large">Share with teams</div>
         </div>
         <div className="flex-center flex-column">
            <Select
               styles={customStyles}
               onChange={(e) => setState({ ...state, selectedTeams: e })}
               options={state.shareTeamList}
               isLoading={state.shareListLoading}
               isDisabled={state.shareListLoading}
               isMulti
               value={state.selectedTeams}
            />
            {/* <Select styles={customStyles2} /> */}
         </div>
         <div className="mr-4 p-2 ml-3 h-2xl vertical-scroll">
            {state.teamMembers?.length > 0
               ? state.teamMembers.map((o, i) => {
                    return (
                       <div key={i} className="flex-center hover-default pointer">
                          <PatientDetailsView
                             isShareTeam={true}
                             //   imageSrc={
                             //     obj?.pObj?.patientId
                             //       ? `${process.env.REACT_APP_PROFILE_URL}/${obj.pObj.patientId}`
                             //       : null
                             //   }
                             className="p-3 sfpro-text text-grey5"
                             name={o?.label}
                             userBg={window.initialColors[i % window.initialColors.length]}
                             details={[
                                {
                                   title: o?.label,
                                },
                             ]}
                          />
                          <div>
                             <button
                                className="bg-disabled text-small h-2xs round-border-s w-xsmall pointer"
                                onClick={() => removeProvider(o)}
                             >
                                Remove
                             </button>
                          </div>
                       </div>
                    );
                 })
               : null}
         </div>
         <div className="default-border py-4">
            {state.isSharing ? (
               <div className="w-100 flex-center mt-5">
                  <img width="40px" height="40px" src="/assets/gif/newgifs/loader.gif" alt="" />
               </div>
            ) : (
               <div className="w-100 flex-center">
                  {/* <div className="mx-4">
            <img
              src="/assets/images/newimages/copylink-icon.svg"
              alt=""
              className="pointer"
            />
          </div> */}
                  <div className="mx-4">
                     <button
                        id={buttonId}
                        className="btn-default text-small h-xsmall round-border-s w-xsmall pointer"
                        onClick={() => {
                           sendShareWithTeams();
                        }}
                        disabled={state.selectedTeams?.length > 0 ? false : true}
                     >
                        Share
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
const mapStateToProps = (state) => {
   return {
      userObject: state.auth.northwelluser?.user,
      userCredentials: state.auth.userCredentials,
   };
};

export default connect(mapStateToProps)(memo(ShareWithTeamView));
