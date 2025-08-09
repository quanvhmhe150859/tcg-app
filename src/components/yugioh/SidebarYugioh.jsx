import Select from "react-select";
import customSelectStyles from "../../utils/customSelectStyles";

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
}) {
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
    <div className="w-60 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Filters</h2>
        <button
          className="text-[12px] leading-none"
          onClick={clearYugiohFilters}
        >
          🧹
        </button>
      </div>

      <input
        type="text"
        placeholder="Search cards..."
        className="border p-2 rounded w-full mb-3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <Select
        className="mb-3"
        options={typeOptions}
        value={type}
        onChange={setType}
        placeholder="Select Type"
        styles={customSelectStyles}
      />
      <Select
        className="mb-3"
        options={archetypeOptions}
        value={archetype}
        onChange={setArchetype}
        placeholder="Select Archetype"
        styles={customSelectStyles}
      />
      <Select
        className="mb-3"
        options={attributeOptions}
        value={attribute}
        onChange={setAttribute}
        placeholder="Select Attribute"
        styles={customSelectStyles}
      />

      <div className="mb-3">
        <p className="font-medium">ATK Range</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="border p-1 rounded w-full"
            value={atkMin}
            onChange={(e) => setAtkMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="border p-1 rounded w-full"
            value={atkMax}
            onChange={(e) => setAtkMax(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-medium">DEF Range</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="border p-1 rounded w-full"
            value={defMin}
            onChange={(e) => setDefMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="border p-1 rounded w-full"
            value={defMax}
            onChange={(e) => setDefMax(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-medium">Level Range</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="border p-1 rounded w-full"
            value={levelMin}
            onChange={(e) => setLevelMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="border p-1 rounded w-full"
            value={levelMax}
            onChange={(e) => setLevelMax(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-3">
        <p className="font-medium mb-1">Order Field</p>
        <label className="mr-3">
          <input
            type="radio"
            value="name"
            checked={orderField === "name"}
            onChange={(e) => setOrderField(e.target.value)}
          />{" "}
          Name
        </label>
        <label>
          <input
            type="radio"
            value="price"
            checked={orderField === "price"}
            onChange={(e) => setOrderField(e.target.value)}
          />{" "}
          Price
        </label>
      </div>

      <div className="mb-3">
        <p className="font-medium mb-1">Order By</p>
        <label className="mr-3">
          <input
            type="radio"
            value="asc"
            checked={orderBy === "asc"}
            onChange={(e) => setOrderBy(e.target.value)}
          />{" "}
          Asc
        </label>
        <label>
          <input
            type="radio"
            value="desc"
            checked={orderBy === "desc"}
            onChange={(e) => setOrderBy(e.target.value)}
          />{" "}
          Desc
        </label>
      </div>
    </div>
  );
}