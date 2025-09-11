import React from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

const RollButtonGroup = ({
  handleRoll,
  isRolling,
  options = [1, 10],
  spinMode,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex w-full sm:w-fit sm:mx-auto gap-2 sm:justify-center">
      {options.map((count, index) => (
        <React.Fragment key={index}>
          <button
            onClick={() => handleRoll(count)}
            disabled={isRolling}
            className={`min-w-0 flex-1 flex flex-col items-center disabled:opacity-50`}
            {...(spinMode === "ticket"
              ? {
                  "data-tooltip-id": `tooltip-roll-${count}`,
                  "data-tooltip-content": `${t("cost")} ${count} ${t(
                    "ticket"
                  )}${count > 1 && i18n.language == "en" ? "s" : ""}`,
                }
              : {})} // 🆕 nếu không phải ticket thì không gán tooltip
          >
            <span className="text-2xl">🎲</span>
            <span className="whitespace-nowrap text-sm">
              {t("roll")} {count}
            </span>
          </button>
          <Tooltip
            id={`tooltip-roll-${count}`}
            place="bottom"
            multiline
            className="max-w-[200px] break-words text-sm"
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default RollButtonGroup;
