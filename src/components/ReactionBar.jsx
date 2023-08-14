import React, { useState, useEffect } from "react";
import Apimanager from "../Apimanager/index";

let likeSel = "/assets/images/ic_like_selected.svg";
let likeUnsel = "/assets/images/ic_like_deselect.svg";

let loveSel = "/assets/images/ic_love_selected.svg";
let loveUnsel = "/assets/images/ic_love_deselected.svg";

let preySel = "/assets/images/ic_prey_selected.svg";
let preyUnsel = "/assets/images/ic_prey_deselected.svg";

function runApi(obj, reaction, completed = () => {}) {
  Apimanager.reactionTapped(
    {
      type: reaction,
      mediaId: obj.type === "media" ? obj.id : "",
      itemId: obj.type !== "media" ? obj.id : "",
    },
    (success) => {
      completed();
    },
    (err) => {}
  );
}

const ReactionIcon = React.memo(
  ({ text = "", iconName = "", onclick = () => {} }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: "3",
        }}
        onClick={() => onclick()}
      >
        <img
          style={{ maxWidth: "20px", maxHeight: "20px" }}
          src={iconName}
          alt=""
        />
        <label
          style={{
            fontWeight: "bolder",
            fontSize: "10px",
            fontWeight: "500",
            color: text === 0 ? "white" : "black",
          }}
        >
          {text}
        </label>
      </div>
    );
  }
);

function ReactionBar({
  userId,
  obj = {},
  onLikeClick = () => {},
  onLoveClick = () => {},
  onThanksClick = () => {},
}) {
  let [state, setState] = useState({
    likeSelected: false,
    loveSelected: false,
    thanksSelected: false,
    likeCount: 0,
    loveCount: 0,
    thanksCount: 0,
  });

  let updateValues = (selected, countVal, objRef) => {
    setState({
      ...state,
      [selected]: !state[selected],
      [countVal]: state[selected] ? state[countVal] - 1 : state[countVal] + 1,
    });
  };

  useEffect(() => {
    setState({
      likeSelected: obj.likes?.includes(userId),
      loveSelected: obj.loves?.includes(userId),
      thanksSelected: obj.thanks?.includes(userId),
      likeCount: obj.likes?.length,
      loveCount: obj.loves?.length,
      thanksCount: obj.thanks?.length,
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: obj.addedBy === userId ? "75%" : "100%",
        justifyContent: obj.addedBy === userId ? "normal" : "space-between",
        margin: "10px 8% 0",
        zIndex: 1,
      }}
    >
      <div style={{ paddingLeft: obj.addedBy === userId ? "15px" : "" }}>
        <ReactionIcon
          text={state.likeCount}
          iconName={state.likeSelected ? likeSel : likeUnsel}
          onclick={() => {
            updateValues("likeSelected", "likeCount", "likes");
            runApi(obj, "likes", () => onLikeClick());
          }}
        />
      </div>
      <div style={{ paddingLeft: obj.addedBy === userId ? "15px" : "" }}>
        <ReactionIcon
          text={state.loveCount}
          iconName={state.loveSelected ? loveSel : loveUnsel}
          onclick={() => {
            updateValues("loveSelected", "loveCount", "loves");
            runApi(obj, "loves", () => onLoveClick());
          }}
        />
      </div>
      <div style={{ paddingLeft: obj.addedBy === userId ? "15px" : "" }}>
        <ReactionIcon
          text={state.thanksCount}
          iconName={state.thanksSelected ? preySel : preyUnsel}
          onclick={() => {
            updateValues("thanksSelected", "thanksCount", "thanks");
            runApi(obj, "thanks", () => onThanksClick());
          }}
        />
      </div>
    </div>
  );
}

export default React.memo(ReactionBar);
