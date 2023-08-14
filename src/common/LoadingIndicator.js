import React from "react";
var LoadingIndicator = (props) => {
   let { rootClass = false } = props;
   return (
      <div className={rootClass ? rootClass : "loading"}>
         <img alt="loading" src="/assets/gif/animation_500_kc4ogugy.gif" />
      </div>
   );
};
export default LoadingIndicator;
