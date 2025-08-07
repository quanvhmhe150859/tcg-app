import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function PokemonCardList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  // detect initial screen size for sidebar default state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLargeScreen = window.innerWidth >= 1024;
      setShowSidebar(isLargeScreen);
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
        const res = await api.get("/api/CardsPokemon", {
          params: {
            search: debouncedSearch,
            page: page,
            pageSize: 10,
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
  }, [debouncedSearch, page]);

  //   const gridCols = showSidebar
  //     ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
  //     : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";

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
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
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
          <select className="border p-2 rounded w-full text-gray-500" disabled>
            <option>Filter (coming soon)</option>
          </select>
        </div>
      )}
    </div>
  );
}
