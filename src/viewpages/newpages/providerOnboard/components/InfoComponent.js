import React from "react";
import CustomSelect from "../../../../shared/components/customSelect/CustomSelect";
import { capitalizeFirstLetter } from "../../teamModule/action/teamAction";

function InfoComponent(props) {
   const {
      firstName,
      setFirstName,
      lastName,
      setLastName,
      inputField,
      providerTitle,
      setProviderTitle,
      hospitalList,
      setHospitalList,
      departmentList,
      setDepartmentList,
      degreeList,
      setDegreeList,
      selectedHosp,
      setSelectedHosp,
      selectedDept,
      setSelectedDept,
      selectedDegree,
      setSelectedDegree,
      providerGetDepartments,
      hospLoading,
      deptLoading,
      degreeLoading,
   } = props;
   return (
      <div>
         <div className="w-100">
            <input
               value={firstName}
               autoComplete="off"
               autoFocus
               className="login-input new"
               placeholder="First name"
               onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
               type="firstName"
               name="firstname"
               style={{ marginBottom: "8px" }}
               ref={inputField}
            />
            <input
               value={lastName}
               autoComplete="off"
               className="login-input new"
               placeholder="Last name"
               onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
               type="lastName"
               name="lastname"
               autofocus
            />
            <CustomSelect
               className="my-3 text-medium text-grey7"
               placeholder="Hospital"
               value={selectedHosp}
               options={hospitalList}
               onChange={(e) => {
                  setSelectedHosp(e);
                  setSelectedDept(null);
                  providerGetDepartments(e);
               }}
               isLoading={hospLoading}
            />
            <CustomSelect
               className="my-3 text-medium text-grey7"
               placeholder="Department"
               value={selectedDept}
               options={selectedHosp !== null ? departmentList : []}
               onChange={(e) => {
                  setSelectedDept(e);
               }}
               isLoading={deptLoading}
            />
            <CustomSelect
               className="my-3 text-medium text-grey7"
               placeholder="Suffix"
               value={selectedDegree}
               options={degreeList}
               isClearable={true}
               onChange={(e) => {
                  setSelectedDegree(e);
               }}
               isLoading={degreeLoading}
            />
            <input
               value={providerTitle}
               autoComplete="off"
               className="login-input new"
               placeholder="Title (ex. Surgeon, Nurse, Practitioner)"
               onChange={(e) => setProviderTitle(e.target.value)}
               type="providerTitle"
               name="providerTitle"
               autofocus
            />
         </div>
      </div>
   );
}

export default InfoComponent;
