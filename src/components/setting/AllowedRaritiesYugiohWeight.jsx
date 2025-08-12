import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { allRaritiesYugioh } from "../../utils/constants";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

const LOCAL_KEY = "allowedRaritiesYugiohWeights";
const TOTAL_WEIGHT = 10000;

const AllowedRaritiesYugiohWeight = forwardRef((props, ref) => {
  const { t } = useTranslation();

  const [weights, setWeights] = useState({});
  const [fixedFirstPercent, setFixedFirstPercent] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    setWeights(stored);
  }, []);

  useImperativeHandle(ref, () => ({
    save: () => {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(weights));
    },
  }));

  const onChangeWeight = (rarity, value) => {
    const maxValue = 10000;
    const parsed = parseInt(value);
    if (!isNaN(parsed)) {
      setWeights((prev) => ({
        ...prev,
        [rarity]: Math.min(parsed, maxValue),
      }));
    }
  };

  const handleFixedPercentChange = (e) => {
    setFixedFirstPercent(e.target.value);
  };

  const handleFixedPercentBlur = () => {
    let value = fixedFirstPercent;
    if (value === "") return;
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    num = Math.min(Math.max(num, 0), 100);
    setFixedFirstPercent(num.toFixed(2));
  };

  const getRandomWeights = (keys, fixedFirstPercent) => {
    const count = keys.length;
    const randoms = [];

    let fixedValue = 0;
    let available = TOTAL_WEIGHT;

    const isFixed =
      fixedFirstPercent !== null &&
      fixedFirstPercent !== "" &&
      !isNaN(fixedFirstPercent);

    if (isFixed) {
      fixedValue = Math.round(
        (Math.min(Math.max(+fixedFirstPercent, 0), 100) / 100) * TOTAL_WEIGHT
      );
      available = TOTAL_WEIGHT - fixedValue;
    }

    for (let i = 0; i < (isFixed ? count - 1 : count); i++) {
      randoms.push(Math.random());
    }

    const sum = randoms.reduce((a, b) => a + b, 0);
    const unrounded = randoms.map((v) => (v / sum) * available);
    const rounded = unrounded.map((v) => Math.floor(v));
    let diff = available - rounded.reduce((a, b) => a + b, 0);

    for (let i = 0; i < diff; i++) {
      rounded[i % rounded.length]++;
    }

    const result = {};
    if (isFixed) {
      result[keys[0]] = fixedValue;
      keys.slice(1).forEach((key, i) => {
        result[key] = rounded[i];
      });
    } else {
      keys.forEach((key, i) => {
        result[key] = rounded[i];
      });
    }

    return result;
  };

  const handleRandom = () => {
    handleFixedPercentBlur();
    const fixed =
      fixedFirstPercent === "" ? null : parseFloat(fixedFirstPercent);
    const random = getRandomWeights(allRaritiesYugioh, fixed);
    setWeights(random);
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="section">
      <Tooltip id="tooltip" />

      <h3 className="text-lg font-bold">Rarities {t("allowed")}</h3>

      <div className="flex justify-center items-center gap-2">
        <label>Common:</label>
        <input
          type="number"
          step="10"
          min={0}
          max={100}
          value={fixedFirstPercent}
          onChange={handleFixedPercentChange}
          onBlur={handleFixedPercentBlur}
          className="border p-1 rounded w-24"
        />
        <label>%</label>
        <button
          onClick={handleRandom}
          className="bg-blue-500 text-white px-2 py-1 rounded"
          data-tooltip-id="randomize-tooltip"
          data-tooltip-content={t("randomizeBasedOnCommon")}
        >
          {t("randomize")}
        </button>
        <Tooltip id="randomize-tooltip" place="top" effect="solid" />

        <label>
          {t("total")} Weights: ({t("total")} = {total})
        </label>
      </div>

      <div className="overflow-y-auto max-h-[500px] m-1 p-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {allRaritiesYugioh.map((rarity) => {
            const weight = weights[rarity] ?? 0;
            const percent =
              total > 0 ? ((weight / total) * 100).toFixed(2) : "0.00";
            return (
              <div
                key={rarity}
                className="flex justify-between items-center gap-2 border p-2 rounded"
              >
                <div className="flex justify-between items-center w-full">
                  <span
                    className="truncate pr-2 flex-1 min-w-0 text-left"
                    data-tooltip-id="tooltip"
                    data-tooltip-content={rarity}
                  >
                    {rarity}
                  </span>
                  <div className="flex items-center gap-4 min-w-32 justify-end">
                    <input
                      type="number"
                      step="10"
                      inputMode="numeric"
                      pattern="\\d*"
                      value={weight}
                      className="border p-1 w-20 text-right rounded"
                      onChange={(e) => onChangeWeight(rarity, e.target.value)}
                    />
                    <span className="text-sm text-gray-400 leading-none w-[60px] text-right">
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default AllowedRaritiesYugiohWeight;
