import React, { useState } from "react";
import "./dashboard.css";
import ResendInvite from "../../dashBoardModule/component/widgets/resendInvite";
import { useQuery } from "@apollo/client";
import { GET_PENDING_INVITES } from "../actions/dashboardAction";
function PendingInvitesCont(props) {
   const [resendInvites, setResendInvites] = useState([]);
   const { loading } = useQuery(GET_PENDING_INVITES, {
      fetchPolicy: "no-cache",
      onCompleted(result) {
         let data = result.pendingInvites || [];
         setResendInvites(data);
      },
   });
   return <ResendInvite {...props} resendInvites={resendInvites} loading={loading} />;
}

export default PendingInvitesCont;
