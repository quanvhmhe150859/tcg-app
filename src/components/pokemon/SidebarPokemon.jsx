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
  loading,
}) {
  const { t } = useTranslation();

  const isFiltersChanged =
    dexNumber !== "" ||
    search !== "" ||
    superType?.value !== superTypeOptions[0]?.value ||
    rarity?.value !== rarityOptions[0]?.value ||
    type?.value !== typeOptions[0]?.value ||
    orderBy !== "asc";

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
    <div className="w-60 shrink-0 sidebar">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">{t("filters")}</h2>
        <button
          className="text-[20px] leading-none py-1! px-2!"
          onClick={clearPokemonFilters}
          disabled={!isFiltersChanged || loading}
          data-tooltip-id="clear-filters-tooltip"
          data-tooltip-content={t("clearFilters")}
        >
          🧹
        </button>
        <Tooltip id="clear-filters-tooltip" place="left" effect="solid" />
      </div>

      {/* DexNumber */}
      <input
        type="number"
        placeholder={t("dexNumber")}
        className="border p-2 rounded w-full mb-3"
        value={dexNumber}
        onChange={(e) => setDexNumber(e.target.value)}
      />

      {/* Name */}
      <input
        type="text"
        placeholder={t("search") + "..."}
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
        isDisabled={loading}
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
        isDisabled={loading}
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
        isDisabled={loading}
        styles={customSelectStyles}
      />

      {/* OrderBy */}
      <div className="mb-3">
        <p className="font-bold italic mb-1">
          {t("orderBy")} {t("name")}
        </p>
        <label className="mr-3">
          <input
            type="radio"
            value="asc"
            checked={orderBy === "asc"}
            onChange={(e) => setOrderBy(e.target.value)}
            disabled={loading}
          />{" "}
          {t("ascending")}
        </label>
        <label>
          <input
            type="radio"
            value="desc"
            checked={orderBy === "desc"}
            onChange={(e) => setOrderBy(e.target.value)}
            disabled={loading}
          />{" "}
          {t("descending")}
        </label>
      </div>
    </div>
  );
}
