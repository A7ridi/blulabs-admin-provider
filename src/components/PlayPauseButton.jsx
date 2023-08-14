import React from "react";

function PlayPauseButton({ click = () => {}, className = "", imageSrc = "" }) {
  return (
    <div
      onClick={() => click()}
      className={`PlayPauseButton ${className}`}
    >
      <div className="inner-div">
        <img src={imageSrc} alt="" />
      </div>
    </div>
  );
}

export default PlayPauseButton;

// const PlayPauseButton = React.memo(
//   ({ click = () => {}, className = "", imageSrc = "" }) => {
//     return (
//       <div
//         onClick={() => click()}
//         className={`PlayPauseButton ${className} ${outerAnim}`}
//       >
//         <div className="inner-div">
//           <img src={imageSrc} alt="" />
//         </div>
//       </div>
//     );
//   }
// );
