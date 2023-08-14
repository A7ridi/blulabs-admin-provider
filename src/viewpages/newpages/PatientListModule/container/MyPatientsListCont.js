import React, { useState, useEffect } from "react";
import { GET_PATIENT_LIST } from "../actions/patientListQueries";
import PatientList from "../components/PatientList";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { fetchViewedPatient } from "../../../../redux/actions/patientList.action";
import { formatPhoneNumber, getFormattedStampDate } from "../../../../helper/CommonFuncs";
import { fetchQuery } from "../../../../actions/index";

function MyPatientsListCont(props) {
   const { fetchPatients, patientList, myPatients = false, showReferralKey } = props;
   const [hasMore, setHasMore] = useState(false);
   const [myPatientLoader, setMyPatientLoader] = useState(true);

   useEffect(() => {
      getPatienData(() => {}, true);
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
   }, []);

   const getPatienData = (callBack = () => {}, changeOffset = false) => {
      var obj = {};
      if (changeOffset) {
         obj = {
            offset: 0,
            limit: 10,
            myPatients: true,
         };
      } else {
         obj = {
            offset: patientList.myPatients.offset + patientList.myPatients.limit,
            limit: patientList.myPatients.limit,
            myPatients: true,
         };
      }

      fetchQuery(GET_PATIENT_LIST, obj, (data) => {
         const result = data.data.getPatients;
         if (result !== null && result?.users?.length > 0) {
            const res =
               data?.data?.getPatients?.users?.map((obj, i) => {
                  obj["pObj"] = {};
                  obj.pObj["colorCode"] = obj.colorCode;
                  obj.pObj["name"] =
                     obj.name?.fullName ||
                     obj.contactInformation?.email ||
                     formatPhoneNumber(obj.contactInformation?.mobileNumber) ||
                     "Patient";
                  obj.pObj["dob"] = obj?.dob || "-";
                  obj.pObj["mrn"] = obj.mrnData?.mrn || "-";
                  obj.pObj["patientId"] = obj?.id || "";
                  obj.pObj["mobileNo"] = obj?.contactInformation?.mobileNumber || "";
                  obj.pObj["email"] = obj.contactInformation?.email || "";
                  obj.pObj["dateAdded"] = getFormattedStampDate(obj.createdAt) || "-";
                  obj.pObj["dateUpdated"] = getFormattedStampDate(obj.updatedAt) || "-";
                  obj.pObj["lastVisit"] = getFormattedStampDate(obj.lastLoginTime) || "-";
                  obj.loading = false;
                  return obj;
               }) || [];

            const allData = changeOffset ? res : [...patientList.myPatients.list, ...res];
            const hasMoreFlag = allData.length < data.data.getPatients.totalCount;
            setHasMore(hasMoreFlag);
            setMyPatientLoader(false);
            let objRedux = {};
            if (changeOffset) {
               objRedux = {
                  list: res,
                  loading: false,
                  offset: 0,
                  limit: 10,
               };
            } else {
               objRedux = {
                  list:
                     patientList.myPatients.offset + patientList.myPatients.limit >= patientList.myPatients.limit
                        ? [...patientList.myPatients.list, ...res]
                        : res,
                  loading: false,
                  limit: 10,
                  offset: patientList.myPatients.offset + patientList.myPatients.limit,
               };
            }

            fetchPatients(objRedux, myPatients);
            callBack();
         } else {
            setMyPatientLoader(false);
            setHasMore(false);
            fetchPatients(
               {
                  list: [],
                  loading: false,
                  offset: 0,
                  limit: 10,
               },
               myPatients
            );
         }
      });
   };

   const isLoading = patientList.myPatients.loading;
   return (
      <div>
         <PatientList
            loader={myPatientLoader}
            hasMore={hasMore}
            setHasMore={setHasMore}
            showReferralKey={showReferralKey}
            patientsList={patientList.myPatients.list}
            {...props}
            loading={isLoading}
            myPatients={myPatients}
            getPatienData={getPatienData}
         />
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

export default connect(mapStateToProps, mapDispatchToProps)(MyPatientsListCont);
