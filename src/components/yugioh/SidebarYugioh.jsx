import Select from "react-select";
import customSelectStyles from "../../utils/customSelectStyles";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

export default function Sidebar({
  search,
  setSearch,
  type,
  setType,
  archetype,
  setArchetype,
  attribute,
  setAttribute,
  atkMin,
  setAtkMin,
  atkMax,
  setAtkMax,
  defMin,
  setDefMin,
  defMax,
  setDefMax,
  levelMin,
  setLevelMin,
  levelMax,
  setLevelMax,
  orderField,
  setOrderField,
  orderBy,
  setOrderBy,
  typeOptions,
  archetypeOptions,
  attributeOptions,
  setPage,
  loading,
}) {
  const { t } = useTranslation();

  const isFiltersChanged =
    search !== "" ||
    type?.value !== typeOptions[0]?.value ||
    archetype?.value !== archetypeOptions[0]?.value ||
    attribute?.value !== attributeOptions[0]?.value ||
    atkMin !== "" ||
    atkMax !== "" ||
    defMin !== "" ||
    defMax !== "" ||
    levelMin !== "" ||
    levelMax !== "" ||
    orderField !== "name" ||
    orderBy !== "asc";

  const clearYugiohFilters = () => {
    setSearch("");
    setType(typeOptions[0]);
    setArchetype(archetypeOptions[0]);
    setAttribute(attributeOptions[0]);
    setAtkMin("");
    setAtkMax("");
    setDefMin("");
    setDefMax("");
    setLevelMin("");
    setLevelMax("");
    setOrderField("name");
    setOrderBy("asc");
    setPage(1);
  };

  return (
    <div className="w-60 shrink-0 sidebar">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">{t("filters")}</h2>
        <button
          className="text-[20px] leading-none py-1! px-2!"
          onClick={clearYugiohFilters}
          disabled={!isFiltersChanged || loading}
          data-tooltip-id="clear-filters-tooltip"
          data-tooltip-content={t("clearFilters")}
        >
          🧹
        </button>
        <Tooltip id="clear-filters-tooltip" place="top" effect="solid" />
      </div>

      <input
        type="text"
        placeholder={t("search") + "..."}
        className="border p-2 rounded w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={loading}
      />

      <Select
        className="mb-3"
        options={typeOptions}
        value={type}
        onChange={setType}
        isDisabled={loading}
        placeholder="Select Type"
        styles={customSelectStyles}
      />
      <Select
        className="mb-3"
        options={archetypeOptions}
        value={archetype}
        onChange={setArchetype}
        isDisabled={loading}
        placeholder="Select Archetype"
        styles={customSelectStyles}
      />
      <Select
        className="mb-3"
        options={attributeOptions}
        value={attribute}
        onChange={setAttribute}
        isDisabled={loading}
        placeholder="Select Attribute"
        styles={customSelectStyles}
      />

      <div className="mb-3">
        <p className="font-bold italic">{t("atkRange")}</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t("min")}
            className="border p-1 rounded w-full"
            value={atkMin}
            onChange={(e) => setAtkMin(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            placeholder={t("max")}
            className="border p-1 rounded w-full"
            value={atkMax}
            onChange={(e) => setAtkMax(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-bold italic">{t("defRange")}</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t("min")}
            className="border p-1 rounded w-full"
            value={defMin}
            onChange={(e) => setDefMin(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            placeholder={t("max")}
            className="border p-1 rounded w-full"
            value={defMax}
            onChange={(e) => setDefMax(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-bold italic">{t("levelRange")}</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t("min")}
            className="border p-1 rounded w-full"
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
            disabled={loading}
          />
          <input
            type="number"
            placeholder={t("max")}
            className="border p-1 rounded w-full"
            value={levelMax}
            onChange={(e) => setLevelMax(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-bold italic mb-1">{t("orderField")}</p>
        <label className="mr-3">
          <input
            type="radio"
            value="name"
            checked={orderField === "name"}
            onChange={(e) => setOrderField(e.target.value)}
            disabled={loading}
          />{" "}
          {t("name")}
        </label>
        <label>
          <input
            type="radio"
            value="price"
            checked={orderField === "price"}
            onChange={(e) => setOrderField(e.target.value)}
            disabled={loading}
          />{" "}
          {t("price")}
        </label>
      </div>

      <div className="mb-3">
        <p className="font-bold italic mb-1">{t("orderBy")}</p>
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
