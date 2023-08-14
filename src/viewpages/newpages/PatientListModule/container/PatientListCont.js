import React, { useEffect } from "react";
import { GET_PATIENT_LIST } from "../actions/patientListQueries";
import PatientList from "../components/PatientList";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchViewedPatient } from "../../../../redux/actions/patientList.action";

import { fetchQuery } from "../../../../actions/index";

function PatientListCont(props) {
   const { fetchPatients, patientList, myPatients = false } = props;
   console.log(props);
   useEffect(() => {
      getPatienData();
      return () => {
         fetchPatients(
            {
               list: [],
               loading: true,
               limit: 10,
               offset: 0,
            },
            myPatients
         );
      };
   }, [myPatients]);

   const getPatienData = () => {
      var obj = {};
      if (myPatients) {
         obj = {
            offset: patientList.myPatients.offset,
            limit: patientList.myPatients.limit,
            myPatients: true,
         };
      } else {
         obj = {
            offset: patientList.viewed.offset,
            limit: patientList.viewed.limit,
            viewed: true,
            subType: "view",
         };
      }
      fetchQuery(GET_PATIENT_LIST, obj, (data) => {
         const res = data.data.getPatients;
         const obj = {
            list: res,
            loading: false,
            limit: 10,
            offset: 0,
         };
         fetchPatients(obj, myPatients);
      });
   };

   const isLoading = myPatients ? patientList.myPatients.loading : patientList.viewed.loading;
   return (
      <div>
         <PatientList {...props} loading={isLoading} />
      </div>
   );
}

const mapStateToProps = (state) => {
   return {
      patientList: state.patientlist,
   };
};
const mapDispatchToProps = (dispatch) => {
   return bindActionCreators(
      {
         fetchPatients: fetchViewedPatient,
      },
      dispatch
   );
};

export default connect(mapStateToProps, mapDispatchToProps)(PatientListCont);
