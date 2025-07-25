import { Tooltip } from "react-tooltip";

const Button = ({ id, label, tooltip, selected, onClick }) => {
  return (
    <div>
      <button
        data-tooltip-id={`tooltip-${id}`}
        data-tooltip-content={tooltip}
        className={`roll-tab ${
          selected ? "selected-tab" : ""
        } w-full md:w-auto flex-1 px-4 py-2 rounded`}
        onClick={onClick}
      >
        {label}
      </button>
      <Tooltip
        id={`tooltip-${id}`}
        place="top"
        multiline
        className="max-w-[200px] break-words text-sm"
      />
    </div>
  );
};

export default Button;
