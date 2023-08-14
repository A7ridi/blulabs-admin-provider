import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const options = {
   responsive: true,
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
   plugins: {
      legend: {
         display: false,
      },
   },
};

const labels = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];
const barPercentage = 0.9;
const barThickness = 18;
const maxBarThickness = 8;
const categoryPercentage = 10;

export const data = {
   labels,
   datasets: [
      {
         label: "Dataset 2",
         data: labels.map(() => Math.random()),
         backgroundColor: "#E4ECF7",
         barPercentage,
         barThickness,
         maxBarThickness,
         categoryPercentage,
      },
      {
         data: labels.map(() => Math.random()),
         backgroundColor: "#043293",
         barPercentage,
         barThickness,
         maxBarThickness,
         categoryPercentage,
      },
      {
         label: "Dataset 2",
         data: labels.map(() => Math.random()),
         backgroundColor: "#FF92AE",
         barPercentage,
         barThickness,
         maxBarThickness,
         categoryPercentage,
      },
   ],
};

export default function PatientGraph({ title }) {
   return (
      <div className="cards-each-list">
         <div className="d-flex align-items-center justify-content-between ">
            <div className="div-cards-title-api">{title}</div>
            <div className="graph-legends">
               {[
                  { name: "Active", color: "#043293" },
                  { name: "Invitation sent", color: "#FF92AE" },
                  { name: "Not Invited", color: "#E4ECF7" },
               ].map((s) => (
                  <span>
                     <div style={{ backgroundColor: s.color }} className="color-div"></div> {s.name}
                  </span>
               ))}
            </div>
         </div>

         <Bar options={options} data={data} />
      </div>
   );
}
