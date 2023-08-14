import React from 'react';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

var LoadingContent = () => {
    return (

        <SkeletonTheme>
            <p className="pl-4 pr-4" style={{ lineHeight: "2.5" }}>
                <Skeleton count={11} height={65} />
            </p>
        </SkeletonTheme>

    )
}
export default LoadingContent