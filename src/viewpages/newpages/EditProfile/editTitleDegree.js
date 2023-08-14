import React, { memo, useState, useEffect } from "react";
import { connect } from "react-redux";
import ModalPopup from "../../../components/newcomponents/ModalPopup";
import { pendoIds } from "../../../Constants/pendoComponentIds/pendoConstants";
import { getDepartments, providerGetShortDegree, updateProviderData } from "./actions/editProfileActions";
import CustomInput from "../../../shared/components/CustomInput/CustomInput";
import CustomSelect from "../../../shared/components/customSelect/CustomSelect";
import { useMutation } from "@apollo/client";
import { UPDATE_NOTIFICATION_SETTINGS } from "../NotificationSettingsModule/actions/notificationSettingsAction";
import { ShowAlert } from "../../../common/alert";
import { errorToDisplay } from "../careTeamModule/action/careTeamAction";
import { getProviderData } from "../../../actions";

function EditProviderDegree({ close, loggedInProviderDetails }) {
   const [update] = useMutation(UPDATE_NOTIFICATION_SETTINGS, {
      onCompleted(data) {
         ShowAlert(data?.updateProfile?.status?.message);
         getProviderData(null, true);
         close();
      },
      onError(err) {
         ShowAlert(errorToDisplay(err), "error");
         close();
      },
   });

   const degree = loggedInProviderDetails?.degree || "";
   const title = loggedInProviderDetails?.title || "";
   const department = loggedInProviderDetails?.departmentName || "";
   const hospitalId = loggedInProviderDetails?.hospital?.id;
   const [titleEdit, setTitle] = useState(title ? title : "");
   const [selectedDepartment, setSelectedDepartment] = useState(department ? { label: department } : null);
   const [degreeEdit, setDegree] = useState(degree ? { label: degree } : null);
   const [degreeArray, setDegreeArray] = useState([]);
   const [departments, setDepartments] = useState([]);

   const [loadingDegree, setLoadingDegree] = useState(true);
   const [loadingDepartment, setLoadingDepartment] = useState(true);

   useEffect(() => {
      providerGetShortDegree((data) => {
         setDegreeArray(data);
         setLoadingDegree(false);
         getDepartments(hospitalId, (data) => {
            setDepartments(data);
            setLoadingDepartment(false);
         });
      });
   }, []);

   const inputBox = {
      fontSize: "18px",
   };

   return (
      <ModalPopup id={pendoIds.btnEditProviderDegreeModal} onModalTapped={close}>
         <div className="flex-center flex-column bg-white w-xlarge1  round-border-m mt-2 position-relative">
            <div className="flex-center w-75 pt-2 title-degree-text">
               <div className="text-grey5 text-medium text-bold">Change your department, suffix and title</div>
            </div>
            <div
               className="text-grey5 pointer close-btn-title"
               style={{ fontSize: "30px" }}
               onClick={() => close && close()}
            >
               &times;
            </div>
            <div className="w-75 ">
               <CustomSelect
                  value={selectedDepartment}
                  options={departments}
                  onChange={(e) => {
                     setSelectedDepartment(e);
                  }}
                  components={{
                     IndicatorSeparator: () => null,
                  }}
                  placeholder="Department"
                  className="my-3 text-custom text-xsmall"
                  isLoading={loadingDepartment}
                  inputBox={inputBox}
               />
            </div>
            <div className="w-75">
               <CustomSelect
                  value={degreeEdit}
                  options={degreeArray}
                  isLoading={loadingDegree}
                  isClearable={true}
                  onChange={(e) => setDegree(e)}
                  placeholder="Suffix"
                  className="my-3 text-custom text-xsmall"
                  inputBox={inputBox}
               />
            </div>
            <CustomInput
               value={titleEdit}
               onChange={(e) => {
                  setTitle(e.target.value);
               }}
               placeHolder={"Title"}
               className="title-input"
            />

            <div className="my-4">
               <button
                  className=" btn-default-capture bg-disabled text-black round-border-s mx-3 text-normal"
                  onClick={() => close && close()}
               >
                  Cancel
               </button>
               <button
                  id={pendoIds.btnEditProviderDegreeModal}
                  className=" btn-default-capture btn-default round-border-s mx-3 text-normal"
                  style={{ paddingTop: "0.9rem" }}
                  onClick={() => updateProviderData(titleEdit, degreeEdit, selectedDepartment, update)}
               >
                  Save
               </button>
            </div>
         </div>
      </ModalPopup>
   );
}

const mapStateToProps = (state) => {
   return {
      loggedInProviderDetails: state.auth.loggedInProviderDetails,
   };
};

export default connect(mapStateToProps, null)(memo(EditProviderDegree));
