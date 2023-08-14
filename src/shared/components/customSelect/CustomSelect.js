import React from "react";
import Select from "react-select";
const customStyles = {
   option: (styles) => {
      return {
         ...styles,
         display: "flex",
         fontSize: "12px",
         color: "#8c8c8c;",
         backgroundColor: "white",
         ":hover": {
            backgroundColor: "rgba(3, 100, 230, 0.1)",
         },
      };
   },
   control: (base, state) => {
      const background = state.selectProps.inputBox?.background || "";
      const borderRadius = state.selectProps.inputBox?.borderRadius || "";
      const fontSize = state.selectProps.inputBox?.fontSize || "";
      const height = state.selectProps.inputBox?.height || "";
      const hoverInput = state.selectProps.inputBox?.hoverInput || "";
      const border = state.selectProps.inputBox?.border || "";
      return {
         ...base,
         border: border || "1px solid #e0e0e0",
         boxShadow: "none",
         borderRadius: borderRadius || "8px",
         fontFamily: "sfProTextRegular",
         fontSize: fontSize,
         backgroundColor: background || "",
         height: height,
         padding: 6,
         "&:hover": {
            border: `1px solid ${hoverInput || "#e0e0e0"}`,
         },
      };
   },
   container: (defaultStyles) => {
      return {
         ...defaultStyles,
         textAlign: "left",
         color: "#8c8c8c;",
      };
   },
   singleValue: (defaultStyles, state) => {
      const isDisabled = state.selectProps.isDisabled;
      const fontSize = state.selectProps.inputBox?.fontSize || "14px";
      return {
         ...defaultStyles,
         color: isDisabled ? "#acacac" : "#1e1c1c",
         fontSize: fontSize,
      };
   },

   placeholder: (defaultStyles, state) => {
      const fontSize = state.selectProps.inputBox?.fontSize || "14px";
      return {
         ...defaultStyles,
         color: "#000",
         fontSize: fontSize,
         opacity: 0.4,
         display: "flex",
      };
   },
   valueContainer: (defaultStyles, state) => {
      const marginTopValue = state.selectProps.inputBox?.marginTopValue || "";
      return {
         ...defaultStyles,
         paddingLeft: "4px",
         marginTop: marginTopValue,
      };
   },
   indicatorsContainer: (defaultStyles, state) => {
      const marginTopIcon = state.selectProps.inputBox?.marginTopIcon || "";
      return {
         ...defaultStyles,
         marginTop: marginTopIcon,
      };
   },
};

export default function CustomSelect({
   options = [],
   value = "",
   onChange = () => {},
   placeholder,
   className = "",
   isLoading = false,
   components = () => {},
   inputBox = {},
   onInputChange = () => {},
   isDisabled = false,
   isClearable = false,
}) {
   return (
      <Select
         options={options}
         placeholder={placeholder}
         value={value}
         onChange={onChange}
         styles={customStyles}
         className={className}
         isLoading={isLoading}
         components={components}
         inputBox={inputBox}
         onInputChange={onInputChange}
         isDisabled={isDisabled}
         isClearable={isClearable}
      />
   );
}
