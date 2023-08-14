import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { GET_PATIENT_LIST } from "../../PatientListModule/actions/patientListQueries";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PatientComp from "../../dashBoardModule/component/cardsEachLayer";

import { fetchQuery } from "../../../../actions/index";
import { fetchViewedPatient } from "../../../../redux/actions/patientList.action";

function ViewedPatientCont(props) {
   const [loading, setLoading] = useState(true);
   const { patientList, fetchPatients } = props;
   useEffect(() => {
      fetchPatientList(() => {}, true);
      return () => {
         fetchPatients({
            list: [],
            loading: true,
            limit: 10,
            offset: 0,
         });
      };
   }, []);

   const fetchPatientList = (callBack = () => {}, refetch = false) => {
      var obj = refetch
         ? { offset: 0, limit: 10, viewed: true, subType: "view" }
         : { offset: patientList.offset + patientList.limit, limit: patientList.limit, viewed: true, subType: "view" };
      fetchQuery(GET_PATIENT_LIST, obj, (data) => {
         callBack();
         if (loading) {
            setLoading(false);
         }
         const list = data?.data?.getPatients?.users;
         const totalCount = data.data.getPatients.totalCount;
         fetchPatients({
            list: refetch ? list : [...patientList.list, ...list],
            loading: false,
            offset: refetch ? 0 : patientList.offset + patientList.limit,
            limit: refetch ? 10 : patientList.limit,
            totalCount: refetch ? totalCount : patientList.totalCount,
         });
      });
   };
   const hasMore = patientList.list.length < patientList.totalCount;
   return (
      <PatientComp
         {...props}
         patients={patientList.list}
         fetchPatientList={fetchPatientList}
         loading={loading}
         hasMore={hasMore}
      />
   );
}

const mapStateToProps = (state) => {
   return {
      patientList: state.patientlist.viewed,
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

export default connect(mapStateToProps, mapDispatchToProps)(ViewedPatientCont);
