import Select from "react-select";
import customSelectStyles from "../../utils/customSelectStyles";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

export default function Sidebar({
  search,
  setSearch,
  superType,
  setSuperType,
  rarity,
  setRarity,
  type,
  setType,
  dexNumber,
  setDexNumber,
  orderBy,
  setOrderBy,
  superTypeOptions,
  rarityOptions,
  typeOptions,
  setPage,
}) {
  const { t } = useTranslation();

  const clearPokemonFilters = () => {
    setSearch("");
    setSuperType(superTypeOptions[0]);
    setRarity(rarityOptions[0]);
    setType(typeOptions[0]);
    setDexNumber("");
    setOrderBy("asc");
    setPage(1);
  };

  return (
    <div className="w-60 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">{t("filters")}</h2>
        <button
          className="text-[20px] leading-none py-1! px-2!"
          onClick={clearPokemonFilters}
          data-tooltip-id="clear-filters-tooltip"
          data-tooltip-content={t("clearFilters")}
        >
          🧹
        </button>
        <Tooltip id="clear-filters-tooltip" place="top" effect="solid" />
      </div>

      <input
        type="text"
        placeholder={t("search")+"..."}
        className="border p-2 rounded w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* SuperType */}
      <Select
        className="mb-3"
        options={superTypeOptions}
        value={
          superTypeOptions.find((o) => o.value === superType?.value) ||
          superTypeOptions[0]
        }
        onChange={(selected) => setSuperType(selected)}
        styles={customSelectStyles}
      />

      {/* Rarity */}
      <Select
        className="mb-3"
        options={rarityOptions}
        value={
          rarityOptions.find((o) => o.value === rarity?.value) ||
          rarityOptions[0]
        }
        onChange={(selected) => setRarity(selected)}
        styles={customSelectStyles}
      />

      {/* Type */}
      <Select
        className="mb-3"
        options={typeOptions}
        value={
          typeOptions.find((o) => o.value === type?.value) || typeOptions[0]
        }
        onChange={(selected) => setType(selected)}
        styles={customSelectStyles}
      />

      {/* DexNumber */}
      <input
        type="number"
        placeholder={t("dexNumber")}
        className="border p-2 rounded w-full mb-3"
        value={dexNumber}
        onChange={(e) => setDexNumber(e.target.value)}
      />

      {/* OrderBy */}
      <div className="mb-3">
        <p className="font-bold italic mb-1">{t("orderBy")} {t("name")}</p>
        <label className="mr-3">
          <input
            type="radio"
            value="asc"
            checked={orderBy === "asc"}
            onChange={(e) => setOrderBy(e.target.value)}
          />{" "}
          {t("ascending")}
        </label>
        <label>
          <input
            type="radio"
            value="desc"
            checked={orderBy === "desc"}
            onChange={(e) => setOrderBy(e.target.value)}
          />{" "}
          {t("descending")}
        </label>
      </div>
    </div>
  );
}