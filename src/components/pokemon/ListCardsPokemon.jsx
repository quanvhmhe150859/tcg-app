import { useEffect, useState } from "react";
import api from "../../utils/api";
import Pagination from "../common/Pagination";
import Sidebar from "./SidebarPokemon";
import { allRaritiesPokemon, allTypesPokemon } from "../../utils/constants";
import { useTranslation } from "react-i18next";

export default function ListCardsPokemon() {
  const { t } = useTranslation();

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
    { value: "", label: t("all") + " Supertypes" },
    { value: "Pokémon", label: "Pokémon" },
    { value: "Trainer", label: "Trainer" },
    { value: "Energy", label: "Energy" },
  ];

  const rarityOptions = [
    { value: "", label: t("all") + " Rarities" },
    ...allRaritiesPokemon.map((r) => ({ value: r, label: r })),
  ];

  const typeOptions = [
    { value: "", label: t("all") + " Types" },
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
          <h2 className="text-xl font-bold">
            <span className="hidden sm:inline">{t("listCards")} </span>
            Pokémon
          </h2>
          <button
            className="text-sm text-blue-500 underline"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            {showSidebar ? (
              // Icon đóng
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Icon phễu
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 4h18l-7 8v4l-4 4v-8L3 4z"
                />
              </svg>
            )}
          </button>
        </div>

        {loading ? (
          <p className="italic text-gray-500">{t("loadingCards")}...</p>
        ) : cards.length === 0 ? (
          <p>{t("noResultsFound")}.</p>
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

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          isLoading={loading}
        />
      </div>

      {showSidebar && (
        <Sidebar
          search={search}
          setSearch={setSearch}
          superType={superType}
          setSuperType={setSuperType}
          rarity={rarity}
          setRarity={setRarity}
          type={type}
          setType={setType}
          dexNumber={dexNumber}
          setDexNumber={setDexNumber}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          superTypeOptions={superTypeOptions}
          rarityOptions={rarityOptions}
          typeOptions={typeOptions}
          setPage={setPage}
          loading={loading}
        />
      )}
    </div>
  );
}
