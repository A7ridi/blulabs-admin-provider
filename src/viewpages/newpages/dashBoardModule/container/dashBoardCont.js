import React, { useState } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import "./dashboard.css";
import ViewDashboard from "../../dashBoardModule/component/dashboard";
import { useQuery } from "@apollo/client";
import { GET_DASHBOARD_WIDGETS } from "../actions/dashboardAction";
import dataMain from "../dataMain.json";
function ViewDashboardCont(props) {
   // const [widgets, setWidgets] = useState([]);
   // const { loading, error, data, refetch } = useQuery(GET_DASHBOARD_WIDGETS, {
   //    fetchPolicy: "no-cache",
   //    onCompleted(result) {
   //       let data = result.getWidgets || [];
   //       setWidgets(data);
   //    },
   // });
   // if (loading) return "Loading ...";
   // if (error) return `error : ${error}`;
   return <ViewDashboard {...props} data={dataMain} />;
}

export default withRouter(connect(null, null)(ViewDashboardCont));
