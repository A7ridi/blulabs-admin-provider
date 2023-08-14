import React, { memo, useState, useEffect } from "react";
import PatientDetailsView from "../../../../components/newcomponents/patientDetailsView/PatientDetailsView";
import { formatPhoneNumber, blueBtnCls } from "../../../../helper/CommonFuncs";

const SearchView = (props) => {
  const { onChange, cancelTapped } = props;
  return (
    <div className="w-75 flex-center justify-content-between px-3 my-3 round-border-s bg-light-grey-50">
      <img
        width="23px"
        height="23px"
        src="/assets/images/newimages/search-black-icon.svg"
      />
      <input
        id="care-team-search-input"
        className="no-border h4 px-3 mb-0 flex-grow-1 py-3 bg-transparent"
        placeholder="Search..."
        autoFocus
        onChange={onChange}
      />
      {/* <button
        className="m-0 h1 flex-center"
        onClick={(e) => {
          let input = document.getElementById("care-team-search-input");
          input.value = "";
          cancelTapped && cancelTapped();
        }}
      >
        &times;
      </button> */}
    </div>
  );
};

function CareTeamView(props) {
  const {
    careTeamData,
    list,
    removeTapped,
    removingId,
    addNewTapped,
    onClose,
    onClick,
  } = props;
  const [state, setstate] = useState({
    isSearchEnabled: false,
    listToShow: [],
  });

  useEffect(() => {
    setstate({ ...state, listToShow: list, isSearchEnabled: false });
  }, [list]);

  const filterResults = (e) => {
    let lts = list || [];
    if (e.target.value.length > 0) {
      lts = list.filter((o) =>
        o.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
    }
    setstate({ ...state, listToShow: lts });
  };

  return (
    <div className="CareTeamView w-xlarge bg-white h-75 round-border-m flex-center flex-column justify-content-start overflow-hidden">
      <div className="care-team-header separator w-100 px-4 py-3 flex-center justify-content-between">
        <div className="h1 font-weight-bold m-0 w-100 text-center">
          {careTeamData?.isFamily ? "Family/Friends" : "Care Team"}
        </div>
        <button className="m-0 h1 flex-center" onClick={onClose}>
          &times;
        </button>
      </div>
      <SearchView
        onChange={filterResults}
        // cancelTapped={() =>
        //   setstate({
        //     ...state,
        //     isSearchEnabled: false,
        //     searchedText: "",
        //     listToShow: list,
        //   })
        // }
      />
      <ul
        style={{ overflowY: "scroll" }}
        className="care-team-list flex-grow-1 w-100"
      >
        {state.listToShow?.map((obj, i) => (
          <li
            key={i}
            className="p-3 flex-center justify-content-start hover-default"
            onClick={() => onClick && onClick(obj)}
          >
            <PatientDetailsView
              className="pointer"
              nameclass="font-weight-bold"
              userBg={window.initialColors[i % window.initialColors.length]}
              name={
                obj?.name ||
                obj?.email ||
                formatPhoneNumber(obj?.mobileNo) ||
                "Member"
              }
              details={
                careTeamData?.isFamily
                  ? [
                      { title: obj?.email },
                      { title: formatPhoneNumber(obj?.mobileNo) },
                    ]
                  : [{ title: obj?.department }]
              }
            />
            {careTeamData?.isFamily ? null : (
              <button
                disabled={removingId === obj.id}
                className={`${
                  removingId === obj.id ? "loader" : ""
                } bg-light-grey-100 mr-3 text-black font-weight-bold round-border-s px-3 py-2 text-small`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTapped && removeTapped(obj);
                }}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="border-left-0 border-right-0 border-bottom-0  border-light-grey w-100" />
      <button className={`${blueBtnCls} w-auto my-4`} onClick={addNewTapped}>
        {careTeamData?.isFamily ? "Add New" : "Add New Care team"}
      </button>
    </div>
  );
}

export default memo(CareTeamView);
