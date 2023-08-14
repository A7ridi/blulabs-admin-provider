import React from "react";

export const shareIcon = () => {
  return (
    <svg
      className="shareIcon-svg"
      width="16"
      height="13"
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.1667 3.50008V3.93373L9.73738 3.99506C6.93596 4.39526 4.96213 5.58838 3.58462 7.16267C2.67777 8.19907 2.01983 9.41201 1.55995 10.6944C3.60506 8.79245 6.2533 7.91675 9.66667 7.91675H10.1667V8.41675V10.6263L14.7929 6.00008L10.1667 1.37385V3.50008Z" />
    </svg>
  );
};

export const upArrow = () => {
  return (
    <svg
      width="13"
      height="8"
      viewBox="0 0 13 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5998 7.39669L5.99642 2.83012L1.41981 7.4235L0.00569977 6.01762L5.98816 0.000127231L12.0056 5.98258L10.5998 7.39669Z"
        fill="#2680BC"
      />
    </svg>
  );
};

export const downArrow = () => {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.41 0.589844L6 5.16984L10.59 0.589844L12 1.99984L6 7.99984L0 1.99984L1.41 0.589844Z"
        fill="#2680BC"
      />
    </svg>
  );
};

export const RecordAudio = () => {
  return (
    // <svg
    //   className="RecordAudio record-media-icon"
    //   width="12"
    //   height="17"
    //   viewBox="0 0 12 17"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <path
    //     d="M5.99996 10.6667C7.38329 10.6667 8.49163 9.55008 8.49163 8.16675L8.49996 3.16675C8.49996 1.78341 7.38329 0.666748 5.99996 0.666748C4.61663 0.666748 3.49996 1.78341 3.49996 3.16675V8.16675C3.49996 9.55008 4.61663 10.6667 5.99996 10.6667ZM4.99996 3.08341C4.99996 2.53341 5.44996 2.08341 5.99996 2.08341C6.54996 2.08341 6.99996 2.53341 6.99996 3.08341L6.99163 8.25008C6.99163 8.80008 6.54996 9.25008 5.99996 9.25008C5.44996 9.25008 4.99996 8.80008 4.99996 8.25008V3.08341ZM10.4166 8.16675C10.4166 10.6667 8.29996 12.4167 5.99996 12.4167C3.69996 12.4167 1.58329 10.6667 1.58329 8.16675H0.166626C0.166626 11.0084 2.43329 13.3584 5.16663 13.7667V16.5001H6.83329V13.7667C9.56663 13.3667 11.8333 11.0167 11.8333 8.16675H10.4166Z"
    //   />
    // </svg>
    <img
      style={{ width: "12px", height: "17px" }}
      className="RecordAudio record-media-icon"
      src="/assets/images/audio-rec-icon.png"
      alt=""
    />
  );
};

export const RecordVideo = () => {
  return (
    // <svg
    //   className="RecordVideo record-media-icon"
    //   width="16"
    //   height="10"
    //   viewBox="0 0 16 10"
    //   fill="none"
    //   xmlns="http://www.w3.org/2000/svg"
    // >
    //   <path d="M11.6667 3.75V4.95711L12.5202 4.10355L15 1.62377V8.37623L12.5202 5.89645L11.6667 5.04289V6.25V9.16667C11.6667 9.34886 11.5155 9.5 11.3333 9.5H1.33333C1.15114 9.5 1 9.34886 1 9.16667V0.833333C1 0.651142 1.15114 0.5 1.33333 0.5H11.3333C11.5155 0.5 11.6667 0.651142 11.6667 0.833333V3.75Z" />
    // </svg>
    <img
      style={{ width: "20px", height: "12px" }}
      className="RecordVideo record-media-icon"
      src="/assets/images/video-rec-icon.png"
      alt=""
    />
  );
};
