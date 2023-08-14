import React from "react";

const CustomLoader = () => {
   return (
      <table className={`w-100 bg-white h-100`}>
         <tbody>
            {Array(10)
               .fill()
               .map((o, index) => (
                  <tr key={index} className="loading-shade">
                     <td width="100%">
                        <div className="loading-shade demo-view w-100 h-medium loading-table-row" />
                     </td>
                  </tr>
               ))}
         </tbody>
      </table>
   );
};

export default CustomLoader;
