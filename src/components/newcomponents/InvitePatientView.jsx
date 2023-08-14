import React, { memo, useState, useEffect } from "react";
import AlertView from "./AlertView";
import TitleTextView from "./TitleTextView";
import { sepNameReg, isValidEmail, isValidMob, errorToDisplay } from "../../helper/CommonFuncs";
import InputMask from "react-input-mask";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import { getHospitalListing, getDepartmentListing, getDoctorList } from "../../Apimanager/Networking";
import texts from "../../helper/texts";
import { pendoIds } from "../../Constants/pendoComponentIds/pendoConstants";
import { INVITE_PATIENT } from "../../viewpages/newpages/InvitePatientModdule/invitePatientAction";

import { useMutation } from "@apollo/client";
import { ShowAlert } from "../../common/alert";
import { capitalizeFirstLetter } from "../../viewpages/newpages/teamModule/action/teamAction";
export const InputView = memo((props) => (
   <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12 p-0 mb-2 px-4">
      <TitleTextView titleClass="mb-3" {...props} />
      <div className="h-4xs text-danger text-small mb-4">{props.error}</div>
   </div>
));

const customStyles = {
   container: () => ({
      height: 48,
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      height: 48,
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

const getSelectObj = (data) => {
   return (
      data?.map((obj, i) => ({
         label: obj.name,
         value: obj.id || i,
         data: obj,
      })) || []
   );
};

function InvitePatientView(props) {
   const [invitePatient] = useMutation(INVITE_PATIENT, {
      onCompleted(res) {
         ShowAlert(texts.inviteSuccess);
         onClose && onClose(res.addPatient.user.id);
      },
      onError(error) {
         ShowAlert(errorToDisplay(error), "error");
         setstate({ ...state, loader: false });
      },
   });
   const { enterpriseId, patient, onClose, buttonId } = props;
   const [state, setstate] = useState({
      email: "",
      mobileNo: "",
      dob: null,
      fname: "",
      lname: "",
      hospitals: [],
      departments: [],
      doctors: [],
      documents: [],
      selHospital: null,
      selDepartment: null,
      selDoctor: null,
      selDocument: null,
      loader: false,
      errors: {
         fname: "",
         lname: "",
         mobileNo: "",
         email: "",
         dob: null,
      },
   });

   useEffect(() => {
      (async () => {
         let st = { hospitals: [], documents: [] };
         try {
            let hosptls = await getHospitalListing({ enterpriseId: enterpriseId });
            st.hospitals = getSelectObj(hosptls.data.data);
         } catch (error) {}
         // try {
         //    let tags = await getTagList();
         //    st.documents = getSelectObj(tags.data);
         // } catch (error) {}
         setstate({ ...state, ...st });
      })();
   }, []);

   useEffect(() => {
      if (!state.selHospital) {
         setstate({ ...state, departments: [], selDepartment: null });
         return;
      }
      (async () => {
         try {
            let depts = await getDepartmentListing({
               id: state.selHospital.value,
            });
            setstate({ ...state, departments: getSelectObj(depts.data) });
         } catch (error) {}
      })();
   }, [state.selHospital]);

   useEffect(() => {
      if (!state.selDepartment) {
         setstate({ ...state, doctors: [], selDoctor: null });
         return;
      }
      (async () => {
         try {
            let docts = await getDoctorList({
               enterpriseId: enterpriseId,
               hospitalName: state.selHospital.label,
               departmentName: state.selDepartment.label,
            });
            setstate({ ...state, doctors: getSelectObj(docts.data.data.newlist) });
         } catch (error) {}
      })();
   }, [state.selDepartment]);

   const validate = () => {
      document.activeElement.blur();
      state.errors.fname = "";
      state.errors.lname = "";
      state.errors.mobileNo = "";
      state.errors.email = "";
      state.errors.dob = "";
      setstate({ ...state });
      let isValid = true;
      if (sepNameReg.test(state.fname) || state.fname.length < 2) {
         state.errors.fname = texts.invalidFname;
         isValid = false;
      }
      if (sepNameReg.test(state.lname) || state.lname.length < 2) {
         state.errors.lname = texts.invalidLname;
         isValid = false;
      }
      if (state.mobileNo.length === 0 && state.email.length === 0) {
         state.errors.mobileNo = texts.invalidMob;
         state.errors.email = texts.invalidEmail;
         isValid = false;
      }
      if (!isValidMob(state.mobileNo) && state.mobileNo.length > 0) {
         state.errors.mobileNo = texts.invalidMob;
         isValid = false;
      }
      if (!isValidEmail(state.email) && state.email.length > 0) {
         state.errors.email = texts.invalidEmail;
         isValid = false;
      }
      if (!state.dob) {
         state.errors.dob = "Please select date of birth";
         isValid = false;
      }
      setstate({ ...state });
      return isValid;
   };

   const invite = () => {
      if (!validate()) return;
      setstate({ ...state, loader: true });
      const { fname, lname, email, mobileNo, dob, selHospital, selDepartment } = state;
      let payload = {
         patient: {
            name: {
               firstName: fname,
               lastName: lname,
            },
            contactInformation: {
               email: email,
               mobileNumber: mobileNo,
            },
            dateOfBirth: moment(dob).format("YYYY-MM-DD"),
            hospitals:
               selHospital !== null
                  ? [
                       {
                          name: selHospital?.label,
                          id: selHospital?.value,
                          hospitalCode: selHospital?.data?.hospitalCode,
                       },
                    ]
                  : null,
            departments:
               selDepartment !== null
                  ? [
                       {
                          id: selDepartment?.value,
                          name: selDepartment?.label,
                       },
                    ]
                  : null,
            providerInfo: {
               title: state.selDoctor === null ? null : state.selDoctor.label,
            },
         },
      };
      invitePatient({
         variables: payload,
      });
   };

   const setName = (e) => {
      let name = capitalizeFirstLetter(e.target.value);
      setstate({ ...state, [e.target.id]: name });
   };

   return (
      <div className="invite-patient-view col col-md-7 p-5 bg-white round-border-s">
         <AlertView
            confirmButtonId={buttonId}
            alertclass="w-100"
            titleText="Invite Patient"
            onClose={onClose}
            showClose={false}
            onAction={(btn) => {
               btn.id === pendoIds.btnInvitePatientModal ? invite() : onClose && onClose();
            }}
            showLoader={state.loader}
            contentView={() => (
               <div className="w-100 flex-center mb-3 my-5">
                  <div className="row w-100 gx-5">
                     <InputView
                        id="fname"
                        title="Patient Name"
                        placeholder="Enter first name"
                        // pattern="[A-Za-z]{1,}"
                        defaultValue={state.fname}
                        onChange={setName}
                        error={state.errors.fname}
                     />
                     <InputView
                        title=""
                        id="lname"
                        placeholder="Enter last name"
                        // pattern="[A-Za-z]{1,}"
                        defaultValue={state.lname}
                        onChange={setName}
                        error={state.errors.lname}
                     />
                     <InputView
                        title="Phone Number"
                        renderInput={() => (
                           <InputMask
                              className="default-text-input h-small text-small p-3"
                              mask="+1 (999) 999-9999"
                              placeholder="+1 (000) 000-0000"
                              onChange={(e) => {
                                 let phone = e.target.value.mobileInputMaskValue();
                                 setstate({ ...state, mobileNo: phone });
                              }}
                           />
                        )}
                        error={state.errors.mobileNo}
                     />
                     <InputView
                        title="Email"
                        placeholder="abc@example.com"
                        onChange={(e) => setstate({ ...state, email: e.target.value })}
                        error={state.errors.email}
                     />
                     <InputView
                        title="Date of birth"
                        renderInput={() => (
                           <DatePicker
                              popperProps={{ positionFixed: true }}
                              onSelect={(date) => setstate({ ...state, dob: date })}
                              value={state.dob}
                              selected={state.dob}
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              wrapperClassName="w-100 h-100"
                              className="p-4 w-100 default-text-input bg-transparent h-small"
                              autoComplete="off"
                              placeholderText="00/00/0000"
                              dateFormat="MM/dd/yyyy"
                              maxDate={new Date()}
                              customInput={
                                 <InputMask mask="99/99/9999">{(inputProps) => <input {...inputProps} />}</InputMask>
                              }
                           />
                        )}
                        error={state.errors.dob}
                     />
                     <InputView title="" renderInput={() => <div />} />
                     <InputView
                        title="Hospital (Optional)"
                        renderInput={() => (
                           <Select
                              styles={customStyles}
                              options={state.hospitals}
                              value={state.selHospital}
                              isClearable
                              onChange={(obj) =>
                                 setstate({ ...state, selHospital: obj, selDepartment: null, selDoctor: null })
                              }
                           />
                        )}
                     />
                     <InputView
                        title="Department (Optional)"
                        renderInput={() => (
                           <Select
                              styles={customStyles}
                              options={state.departments}
                              value={state.selDepartment}
                              isClearable
                              onChange={(o) => setstate({ ...state, selDepartment: o, selDoctor: null })}
                           />
                        )}
                     />
                     <InputView
                        title="Doctors (Optional)"
                        renderInput={() => (
                           <Select
                              styles={customStyles}
                              options={state.doctors}
                              value={state.selDoctor}
                              isClearable
                              onChange={(o) => setstate({ ...state, selDoctor: o })}
                           />
                        )}
                     />
                  </div>
               </div>
            )}
         />
      </div>
   );
}

export default memo(InvitePatientView);
