import React, { useEffect, useState, useCallback, useRef } from "react";
import spinner from "../../../assets/gif/newgifs/spinner.gif";

function InfiniteScroll(props) {
   const { callBack, children, showLoader = false } = props;
   const [isNextLoading, setNextLoading] = useState(false);

   useEffect(() => {
      if (!isNextLoading) return;
      if (isNextLoading) refetchApi();
   }, [isNextLoading]);

   const refetchApi = () => {
      callBack(setNext);
   };
   const setNext = () => {
      setNextLoading(false);
   };

   const loaderObserver = useRef();
   const loadMore = useCallback(
      (node) => {
         loaderObserver.current = new IntersectionObserver(async (loaderView) => {
            if (loaderView[0].isIntersecting && !isNextLoading) {
               setNextLoading(true);
            }
         });
         if (node) loaderObserver.current.observe(node);
      },
      [isNextLoading]
   );

   return (
      <div>
         {children}
         {showLoader && (
            <div ref={loadMore} className="flex-center justify-center my-5">
               <img width={30} height={30} src={spinner} alt="" />
            </div>
         )}
      </div>
   );
}

export default InfiniteScroll;
