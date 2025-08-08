import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../utils/api";
import { allTypesYugioh, allAttributesYugioh } from "../../utils/constants";
import customSelectStyles from "../../utils/customSelectStyles";

export default function YugiohCardList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  // Bộ lọc
  const [marketPrice, setMarketPrice] = useState("");
  const [atkMin, setAtkMin] = useState("");
  const [atkMax, setAtkMax] = useState("");
  const [defMin, setDefMin] = useState("");
  const [defMax, setDefMax] = useState("");
  const [levelMin, setLevelMin] = useState("");
  const [levelMax, setLevelMax] = useState("");

  // Order
  const [orderField, setOrderField] = useState("name");
  const [orderBy, setOrderBy] = useState("asc");

  // Option mặc định
  const allTypeOption = { value: "", label: "All Type" };
  const allArchetypeOption = { value: "", label: "All Archetype" };
  const allAttributeOption = { value: "", label: "All Attribute" };

  // State mặc định là "All"
  const [type, setType] = useState(allTypeOption);
  const [archetype, setArchetype] = useState(allArchetypeOption);
  const [attribute, setAttribute] = useState(allAttributeOption);

  // Options cho dropdown
  const typeOptions = [
    allTypeOption,
    ...allTypesYugioh.map((t) => ({ value: t, label: t })),
  ];
  const attributeOptions = [
    allAttributeOption,
    ...allAttributesYugioh.map((a) => ({ value: a, label: a })),
  ];
  const [archetypeOptions, setArchetypeOptions] = useState([
    allArchetypeOption,
  ]);

  // Fetch archetypes từ API
  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const res = await api.get("/api/CardsYugioh/archetypes");
        if (Array.isArray(res.data)) {
          setArchetypeOptions([
            allArchetypeOption,
            ...res.data.map((item) => ({ value: item, label: item })),
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch archetypes", err);
      }
    };
    fetchArchetypes();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowSidebar(window.innerWidth >= 1024);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/CardsYugioh", {
          params: {
            name: debouncedSearch,
            page,
            pageSize: 10,
            type: type?.value || undefined,
            archetype: archetype?.value || undefined,
            attribute: attribute?.value || undefined,
            marketPrice: marketPrice || undefined,
            atkMin: atkMin || undefined,
            atkMax: atkMax || undefined,
            defMin: defMin || undefined,
            defMax: defMax || undefined,
            levelMin: levelMin || undefined,
            levelMax: levelMax || undefined,
            orderField,
            orderBy,
          },
        });

        const data = res.data;
        setCards(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch cards", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [
    debouncedSearch,
    page,
    type,
    archetype,
    attribute,
    marketPrice,
    atkMin,
    atkMax,
    defMin,
    defMax,
    levelMin,
    levelMax,
    orderField,
    orderBy,
  ]);

  return (
    <div className="flex gap-4 p-4">
      {/* Main content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Yugioh Cards</h2>
          <button
            className="text-sm text-blue-500 underline"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            {showSidebar ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {loading ? (
          <p className="italic text-gray-500">Loading cards...</p>
        ) : cards.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            {cards.map((card) => (
              <div
                key={card.cardId}
                className="border p-3 rounded shadow-sm hover:shadow-md transition bg-white"
              >
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-40 object-contain mb-2"
                  />
                )}
                <h3 className="font-semibold text-center text-black">
                  {card.name}
                </h3>
                <p className="text-sm text-center text-gray-500">
                  Price: {card.price ?? "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 gap-1 flex-wrap">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          {[1, 2, 3].map(
            (p) =>
              p <= totalPages && (
                <button
                  key={p}
                  className={`px-3 py-1 rounded ${
                    p === page ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
          )}

          {page > 5 && <span className="px-2">...</span>}

          {Array.from({ length: 7 }, (_, i) => page - 3 + i)
            .filter((p) => p > 3 && p < totalPages - 2)
            .map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded ${
                  p === page ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

          {page < totalPages - 4 && <span className="px-2">...</span>}

          {[totalPages - 2, totalPages - 1, totalPages].map(
            (p) =>
              p > 3 && (
                <button
                  key={p}
                  className={`px-3 py-1 rounded ${
                    p === page ? "bg-blue-500 text-white" : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
          )}

          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="w-60 shrink-0">
          <h2 className="text-lg font-bold mb-2">Search & Filters</h2>

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

          <input
            type="number"
            placeholder="Price"
            className="border p-2 rounded w-full mb-3"
            value={marketPrice}
            onChange={(e) => setMarketPrice(e.target.value)}
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
      )}
    </div>
  );
}
