import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import { fetchQuery } from "../../../actions";
import { GET_SEARCHPROVIDER_DATA } from "../careTeamModule/action/careTeamAction";
import useDebounce from "../../../shared/components/customHooks/useDebounce";
import { showRoleChangePopup, teamRoleOption } from "../teamModule/action/teamAction";

const customStyles = {
   container: () => ({
      marginTop: 20,
      height: 50,
      width: 462,
   }),
   control: (provided) => ({
      ...provided,
      display: "flex",
      maxHeight: 80,
      minHeight: 50,
      overflow: "auto",
   }),
   indicatorsContainer: (provided) => ({
      ...provided,
      flexShrink: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minWidth: 50,
   }),
   loadingIndicator: (provided) => ({ ...provided, marginLeft: "-40px" }),
};

const AddProvider = ({
   setSelectedValue,
   disableOption = () => {},
   teamSection,
   teamMemberRole,
   setTeamRole,
   teamRole = "",
   placeholder = "Select...",
   placeholder2 = "Select...",
   checkAttendingMember = () => {},
}) => {
   const [loading, setLoading] = useState(false);
   const [searchProviderData, setSearchProviderData] = useState([]);
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

   const MultiValue = (props) => (
      <components.MultiValue {...props}>
         <span>{props.data.chipLabel}</span>
      </components.MultiValue>
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
         setSearchProviderData([]);
         return;
      }
      let params = {
         searchData: {
            search: e,
            userType: "provider",
         },
         limit: 100,
      };
      return fetchQuery(
         GET_SEARCHPROVIDER_DATA,
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
            setSearchProviderData(data);
            return data;
         },
         (error) => {
            console.log(error);
         }
      );
   };

   const searchProvText = () => {
      if (searchKey.length >= 3 && searchProviderData.length === 0) return "No provider found";
      else return "Search provider name...";
   };

   return (
      <>
         {teamSection ? (
            <>
               <Select
                  className="h-100"
                  styles={customStyles}
                  cacheOptions={true}
                  defaultOptions
                  isMulti
                  placeholder={placeholder}
                  noOptionsMessage={() => searchProvText()}
                  loadingMessage={() => "loading..."}
                  isClearable={true}
                  isSearchable={true}
                  onChange={(e) => {
                     if (e?.length > 1) setTeamRole("");
                     setSelectedValue(e);
                  }}
                  components={{ Option, MultiValue }}
                  onInputChange={handleSearch}
                  options={searchProviderData}
                  isLoading={loading}
                  filterOption={filterOption}
               />
               {teamMemberRole && (
                  <Select
                     className="w-xlarge h-100"
                     styles={customStyles}
                     cacheOptions={true}
                     defaultOptions
                     noOptionsMessage={() => "Select team role"}
                     loadingMessage={() => "loading..."}
                     isClearable={true}
                     isSearchable={true}
                     placeholder={placeholder2}
                     onChange={(e) => {
                        if (checkAttendingMember() && e.value === "attending") showRoleChangePopup(setTeamRole, e);
                        else setTeamRole(e);
                     }}
                     options={teamRoleOption}
                     value={teamRole}
                     isOptionDisabled={(option) => disableOption(option)}
                  />
               )}
            </>
         ) : (
            <Select
               className="w-xlarge h-100"
               styles={customStyles}
               cacheOptions={true}
               defaultOptions
               noOptionsMessage={() => searchProvText()}
               loadingMessage={() => "loading..."}
               isClearable={true}
               isSearchable={true}
               placeholder={placeholder}
               onChange={(e) => setSelectedValue(e)}
               components={{ Option, SingleValue }}
               onInputChange={handleSearch}
               options={searchProviderData}
               isLoading={loading}
               filterOption={filterOption}
            />
         )}
      </>
   );
};
export default AddProvider;
