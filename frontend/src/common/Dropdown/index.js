import * as React from "react";
import Select from "react-select";

const Dropdown = ({ options, value, onChange, isDisabled, ...props }) => {
  return (
    <Select
      isDisabled={isDisabled}
      styles={{
        control: (provided) => ({
          ...provided,
          backgroundColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          boxShadow: "none",
          fontFamily: "Poppins",
        }),
        indicatorSeparator: (provided) => ({
          ...provided,
          backgroundColor: "transparent",
        }),
        singleValue: (provided) => ({
          ...provided,
          color: "white",
          fontFamily: "Poppins",
        }),
        multiValue: (provided) => ({
          ...provided,
          color: "white",
          fontFamily: "Poppins",
        }),
      }}
      options={options}
      value={value}
      onChange={onChange}
      {...props}
    ></Select>
  );
};

export default Dropdown;
