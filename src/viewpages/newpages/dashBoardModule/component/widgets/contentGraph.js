import React, { useEffect, useState } from "react";
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "../../../dashboard/Dashboard.css";

import { getProviderAnalyticsData } from "../../../../../Apimanager/Networking";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
   maintainAspectRatio: false,
   scales: {
      x: {
         grid: {
            display: false,
         },
      },
      y: {
         grid: {
            display: false,
         },
      },
   },

   responsive: true,
   elements: {
      point: {
         radius: 0,
      },
   },
   plugins: {
      legend: {
         display: false,
      },
   },
};

const labels = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];
const lineTension = 0.5;

export const data = {
   labels,
   datasets: [
      {
         label: "Dataset 2",
         data: labels.map(() => Math.random()),
         backgroundColor: "#E4ECF7",
         borderColor: "rgb(255, 99, 132)",
         lineTension,
      },
      {
         data: labels.map(() => Math.random()),
         backgroundColor: "#043293",
         borderColor: "#043293",
         lineTension,
      },
   ],
};

const optionSelect = [
   { label: "Last 7 days", value: 7 },
   { label: "Last 30 days", value: 30 },
   { label: "All time", value: 0 },
];

export default function ContentGraph({ title }) {
   const [dropValue, setDropValue] = useState(7);
   const [loading, setLoading] = useState(true);
   const [contentData, setContentData] = useState(null);
   useEffect(() => {
      getAnalyticsData();
   }, [dropValue]);

   const getAnalyticsData = () => {
      getProviderAnalyticsData({ numberOfDays: dropValue }).then((result) => {
         let analyticsData = result.data?.data;
         setLoading(false);
         setContentData(analyticsData);
      });
   };
   return (
      <div className="cards-each-list">
         <div className="d-flex justify-content-between ">
            <div className="div-cards-title-api">{title}</div>
            <div>
               <select
                  onChange={(e) => {
                     setLoading(true);
                     setDropValue(e.target.value);
                  }}
                  className="select-custom"
               >
                  {optionSelect.map((s) => (
                     <option value={s.value}>{s.label}</option>
                  ))}
               </select>
            </div>
         </div>
         <div className={`${loading && "loading-shade"}`}>
            <div className="responsive-graphs">
               <Line options={options} data={data} />
            </div>

            <div style={{ paddingTop: 15 }} className="graph-legends">
               {[
                  { name: "Created", color: "#043293" },
                  { name: "Viewed", color: "#FF92AE" },
               ].map((s) => (
                  <span>
                     <div style={{ backgroundColor: s.color }} className="color-div"></div> {s.name}
                  </span>
               ))}
            </div>
         </div>
      </div>
   );
}
