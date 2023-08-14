import React from 'react';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

var LoadingSmallContent = () => {
    return (

        <SkeletonTheme>
            <p className="pl-4 pr-4" style={{ lineHeight: "2.5" }}>
                <Skeleton count={1} height={55} />
            </p>
        </SkeletonTheme>

    )
}
export default LoadingSmallContent