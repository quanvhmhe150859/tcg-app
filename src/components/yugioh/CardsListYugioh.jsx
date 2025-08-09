import { useEffect, useState } from "react";
import api from "../../utils/api";
import { allTypesYugioh, allAttributesYugioh } from "../../utils/constants";
import Pagination from "../common/Pagination";
import Sidebar from "./SidebarYugioh";

export default function YugiohCardList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSidebar, setShowSidebar] = useState(true);

  // Bộ lọc
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
          type={type}
          setType={setType}
          archetype={archetype}
          setArchetype={setArchetype}
          attribute={attribute}
          setAttribute={setAttribute}
          atkMin={atkMin}
          setAtkMin={setAtkMin}
          atkMax={atkMax}
          setAtkMax={setAtkMax}
          defMin={defMin}
          setDefMin={setDefMin}
          defMax={defMax}
          setDefMax={setDefMax}
          levelMin={levelMin}
          setLevelMin={setLevelMin}
          levelMax={levelMax}
          setLevelMax={setLevelMax}
          orderField={orderField}
          setOrderField={setOrderField}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          typeOptions={typeOptions}
          archetypeOptions={archetypeOptions}
          attributeOptions={attributeOptions}
          setPage={setPage}
        />
      )}
    </div>
  );
}
