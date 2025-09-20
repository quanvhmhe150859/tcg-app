import React from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

const RollButtonGroup = ({
  handleRoll,
  isRolling,
  spinMode,
  rollAmounts = [1, 10],
  ticketOptions = [1, 10],
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex w-full sm:w-fit sm:mx-auto gap-2 sm:justify-center">
      {rollAmounts.map((rollCount, index) => {
        const ticketCost = ticketOptions[index]; // khớp theo index
        return (
          <React.Fragment key={index}>
            <button
              onClick={() => handleRoll(rollCount)}
              disabled={isRolling}
              className={`min-w-0 flex-1 flex flex-col items-center disabled:opacity-50`}
              {...(spinMode === "ticket"
                ? {
                    "data-tooltip-id": `tooltip-roll-${rollCount}`,
                    "data-tooltip-content": `${t("cost")} ${ticketCost} ${t(
                      "ticket"
                    )}${
                      ticketCost > 1 && i18n.language == "en" ? "s" : ""
                    }`,
                  }
                : {})}
            >
              <span className="text-2xl">🎲</span>
              <span className="whitespace-nowrap text-sm">
                {t("roll")} {rollCount}
              </span>
            </button>
            <Tooltip
              id={`tooltip-roll-${rollCount}`}
              place="bottom"
              multiline
              className="max-w-[200px] break-words text-sm"
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default RollButtonGroup;
