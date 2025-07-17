const customSelectStyles = {
    singleValue: (base, state) => {
      const isPlaceholderSelected = state.data.value === "";
      return {
        ...base,
        color: isPlaceholderSelected ? "#9CA3AF" : "#000", // gray-400 nếu là option đầu tiên
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      };
    },
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#E6F2FE" : "white",
      color: "#000",
      padding: "0.5rem 0.75rem",
      fontSize: "0.875rem",
      cursor: "pointer",
    }),
  };

  export default customSelectStyles;