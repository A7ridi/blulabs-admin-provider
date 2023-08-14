import React from "react";

const ContentAndCareTeamSearch = ({
   showSearch = false,
   showLayout = false,
   showbutton = false,
   setSearchKey,
   layoutChange,
   layoutImg,
   disabledBtn,
   searchKey,
   onChangeSearch,
   pendoId,
   contentBtnPendoId,
   layoutPendoId,
   careTeam,
   addBtnPendoId,
   famPendoId,
   btnText,
   onClickBtn = () => {},
   familyFriends,
   createContentTapped,
   debounceSearch = false,
}) => {
   return (
      <div className="d-flex flex-center justify-content-start py-2 pb-4 ml-3" style={{ position: "relative" }}>
         {showSearch && (
            <input
               id={pendoId}
               type="text"
               placeholder="Search"
               className="search-input-profile"
               value={searchKey}
               onChange={(e) => setSearchKey(e.target.value)}
            />
         )}
         <div className="flex-grow-1" />

         {showbutton && (
            <button
               id={careTeam ? addBtnPendoId : familyFriends ? famPendoId : contentBtnPendoId}
               disabled={disabledBtn}
               className="text-truncate create-content-button"
               onClick={() => {
                  onClickBtn(true);
                  createContentTapped && createContentTapped();
               }}
            >
               {btnText}
            </button>
         )}

         {showLayout && (
            <img id={layoutPendoId} alt="" className="mr-3 pointer" src={layoutImg} onClick={() => layoutChange()} />
         )}
      </div>
   );
};

export default ContentAndCareTeamSearch;
