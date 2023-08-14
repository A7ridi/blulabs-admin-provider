import React from "react";

function LoaderDashBoard() {
   return (
      <div className={`d-flex `}>
         {Array(6)
            .fill()
            .map((o, i) => (
               <div
                  style={{
                     maxHeight: "375px",
                     height: "265px",
                     maxWidth: "400px",
                     width: "350px",
                     borderRadius: "30px",
                  }}
                  className=" p-0 mb-3 px-2 "
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
   );
}

export default LoaderDashBoard;
