import React, { Fragment } from "react";
import LoaderCardAndTable from "../../../../../common/LoaderCardAndTable";

const LoaderWithText = ({ text = "", className = "" }) => {
   return (
      <Fragment>
         {text && <h3 className="providers-text">{text}</h3>}
         <LoaderCardAndTable className={className} view={0} />
      </Fragment>
   );
};

export default LoaderWithText;
