import { useEffect, useState } from "react";
import Select from "react-select";
import api from "../../utils/api";
import { allRaritiesPokemon, allTypesPokemon } from "../../utils/constants";
import customSelectStyles from "../../utils/customSelectStyles";

export default function PokemonCardList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  // Bộ lọc mới
  const [superType, setSuperType] = useState(null);
  const [rarity, setRarity] = useState(null);
  const [type, setType] = useState(null);
  const [dexNumber, setDexNumber] = useState("");
  const [orderBy, setOrderBy] = useState("asc");

  // react-select options
  const superTypeOptions = [
    { value: "", label: "All SuperTypes" },
    { value: "Pokémon", label: "Pokémon" },
    { value: "Trainer", label: "Trainer" },
    { value: "Energy", label: "Energy" },
  ];

  const rarityOptions = [
    { value: "", label: "All Rarities" },
    ...allRaritiesPokemon.map((r) => ({ value: r, label: r })),
  ];

  const typeOptions = [
    { value: "", label: "All Types" },
    ...allTypesPokemon.map((t) => ({ value: t, label: t })),
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShowSidebar(window.innerWidth >= 1024);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/CardsPokemon", {
          params: {
            name: debouncedSearch,
            page,
            pageSize: 10,
            superType: superType?.value || undefined,
            rarity: rarity?.value || undefined,
            type: type?.value || undefined,
            dexNumber: dexNumber || undefined,
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
  }, [debouncedSearch, page, superType, rarity, type, dexNumber, orderBy]);

  return (
    <div className="flex gap-4 p-4">
      {/* Main content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Pokemon Cards</h2>
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
                key={card.id}
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
                  {card.rarity}
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

          {/* Trang đầu */}
          {[1, 2, 3].map(
            (p) =>
              p <= totalPages && (
                <button
                  key={p}
                  className={`px-3 py-1 rounded ${
                    p === page
                      ? "selected-tab"
                      : ""
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
          )}

          {/* Dấu ... sau trang đầu */}
          {page > 5 && <span className="px-2">...</span>}

          {/* Các trang quanh trang hiện tại */}
          {Array.from({ length: 7 }, (_, i) => page - 3 + i)
            .filter((p) => p > 3 && p < totalPages - 2)
            .map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded ${
                  p === page
                    ? "selected-tab"
                      : ""
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

          {/* Dấu ... trước trang cuối */}
          {page < totalPages - 4 && <span className="px-2">...</span>}

          {/* 3 trang cuối */}
          {[totalPages - 2, totalPages - 1, totalPages].map(
            (p) =>
              p > 3 && (
                <button
                  key={p}
                  className={`px-3 py-1 rounded ${
                    p === page
                      ? "selected-tab"
                      : ""
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
            placeholder="Dex Number"
            className="border p-2 rounded w-full mb-3"
            value={dexNumber}
            onChange={(e) => setDexNumber(e.target.value)}
          />

          {/* OrderBy */}
          <div className="mb-3">
            <p className="font-medium mb-1">Order By Name</p>
            <label className="mr-3">
              <input
                type="radio"
                value="asc"
                checked={orderBy === "asc"}
                onChange={(e) => setOrderBy(e.target.value)}
              />{" "}
              Ascending
            </label>
            <label>
              <input
                type="radio"
                value="desc"
                checked={orderBy === "desc"}
                onChange={(e) => setOrderBy(e.target.value)}
              />{" "}
              Descending
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
