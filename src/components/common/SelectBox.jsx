import Select from "react-select";
import customSelectStyles from "../../utils/customSelectStyles";

const SelectBox = ({
  options,
  value,
  onChange,
  isDisabled,
  isSearchable = false,
  onInputChange = () => {},
  noOptionsMessage = () => "No options",
  placeholder = "",
}) => {
  return (
    <Select
      className="w-full"
      value={options.find((opt) => opt.value === value)}
      onChange={(selected) => onChange(selected.value)}
      onInputChange={onInputChange}
      noOptionsMessage={noOptionsMessage}
      options={options}
      isDisabled={isDisabled}
      isSearchable={isSearchable}
      styles={customSelectStyles}
      placeholder={placeholder}
    />
  );
};

export default SelectBox;