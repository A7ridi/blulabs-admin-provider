import React from "react";

function LoaderCardAndTable(props) {
   const { view, className = "" } = props;

   return (
      <div className={className}>
         {view === 0 ? (
            <table className={`w-100 bg-white h-100`}>
               <tbody>
                  {Array(10)
                     .fill()
                     .map((o, index) => (
                        <tr key={index} className="loading-shade">
                           <td>
                              <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                           </td>
                        </tr>
                     ))}
               </tbody>
            </table>
         ) : (
            <div className="row grid-view">
               {Array(6)
                  .fill()
                  .map((o, i) => (
                     <div
                        style={{ maxHeight: "325px", minWidth: "275px", height: "250x" }}
                        className="grid-view-col responsive-content p-0 mb-3 px-2 "
                     >
                        <div className="Post px-4 flex-center justify-content-between flex-column shadow grid-view-post  round-border-xl border-light-grey h-100">
                           <div
                              style={{ height: "70%" }}
                              className="w-100 mt-4 mb-1 loading-shade flex-grow-1 ratio-16-9 round-border-m overflow-hidden pointer"
                           ></div>
                           <div
                              style={{ height: "30%" }}
                              className="true mt-3 mb-4 loading-shade round-border-m mt-3 round-border-m w-100 false"
                           ></div>
                        </div>
                     </div>
                  ))}
            </div>
         )}
      </div>
   );
}

export default LoaderCardAndTable;
