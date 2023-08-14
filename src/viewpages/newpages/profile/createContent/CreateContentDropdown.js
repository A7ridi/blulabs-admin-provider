import React, { useEffect, useState, useCallback } from "react";
import { GET_SEARCH_ALL_PROVIDERS_DATA } from "../../careTeamModule/action/careTeamAction";
import { fetchQuery } from "../../../../actions";
import Select, { components } from "react-select";
import { debounce } from "lodash";
import useDebounce from "../../../../shared/components/customHooks/useDebounce";

const customStyles = {
   container: () => ({
      height: 30,
      width: "100%",
      zIndex: "99",
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      maxHeight: 40,
      minHeight: 40,
      overflow: "auto",
      borderRadius: 5,
   }),
   menuList: () => ({
      maxHeight: "250px",
      overflowY: "auto",
   }),
};

const CreateContentDropdown = (props) => {
   const { providerData, setSearchProviderName } = props;
   const [loading, setLoading] = useState(false);
   const [searchProvResult, setSearchProvResult] = useState([]);
   const [searchKey, setSearchKey] = useState("");

   const debounceSearch = useDebounce(searchKey, 500);

   useEffect(() => {
      searchProviders(debounceSearch);
   }, [debounceSearch]);

   const handleSearch = (text) => {
      if (text.length > 2) setLoading(true);
      else setLoading(false);
      setSearchKey(text);
   };

   const SingleValue = (props) => (
      <components.SingleValue {...props}>
         <span>{props.data.chipLabel}</span>
      </components.SingleValue>
   );

   const filterOption = (option) => {
      const { label } = option;
      return label;
   };

   const Option = (props) => {
      var name = props.children;
      const nameList = name.split(" ");
      const nameToShow = nameList?.splice(0, nameList.length - 1)?.join(" ") || "";
      return (
         <div>
            <components.Option {...props}>
               <div className="d-flex align-items-center">
                  <div className="text-small text-truncate">{nameToShow}</div>
               </div>
            </components.Option>
         </div>
      );
   };

   const searchProviders = async (e) => {
      if (e.length < 3) {
         setSearchProvResult([]);
         return;
      }
      let params = {
         searchData: {
            search: e,
            enterpriseId: providerData?.enterpriseId,
            userType: "provider",
         },
         limit: 50,
         offset: 0,
      };
      return fetchQuery(
         GET_SEARCH_ALL_PROVIDERS_DATA,
         params,
         (res) => {
            let data =
               res.data?.searchAllUsers?.users?.map((o) => {
                  o["name"] = o?.name?.fullName || "";
                  const email = o?.contactInformation?.email || "";
                  const label = o.name + " " + email;
                  return { label, value: o.id, data: o, chipLabel: o.name };
               }) || [];
            setLoading(false);
            setSearchProvResult(data);
            return data;
         },
         (error) => {
            console.log(error);
         }
      );
   };

   const noProvider = () => {
      if ((searchKey?.length > 2 && searchProvResult?.length === 0) || searchProvResult === undefined) {
         return "No provider found";
      } else {
         return "Start typing provider name…";
      }
   };
   const isSmallerScreen = window.innerHeight <= 746 && searchProvResult.length > 4;
   const placement = isSmallerScreen ? "top" : "bottom";
   return (
      <>
         <div className="dropdown-prov-hospital">
            <Select
               menuPlacement={placement}
               menuPosition={isSmallerScreen ? "absolute" : "fixed"}
               noOptionsMessage={() => noProvider()}
               className="h-100"
               styles={customStyles}
               cacheOptions
               defaultOptions
               isClearable={true}
               onChange={(e) => setSearchProviderName(e)}
               components={{
                  IndicatorSeparator: () => null,
                  Option,
                  SingleValue,
               }}
               loadingMessage={() => "loading..."}
               placeholder="Provider (Optional)"
               onInputChange={handleSearch}
               options={searchProvResult}
               isLoading={loading}
               filterOption={filterOption}
            />
         </div>
      </>
   );
};

export default CreateContentDropdown;
