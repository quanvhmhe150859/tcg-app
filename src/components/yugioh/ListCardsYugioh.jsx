import { useEffect, useState } from "react";
import { allTypesYugioh, allAttributesYugioh } from "../../utils/constants";
import Pagination from "../common/Pagination";
import Sidebar from "./SidebarYugioh";
import { fetchYugiohCards, fetchYugiohArchetypes } from "./yugiohApiHelpers";
import CardItemYugioh from "./CardItemYugioh";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
import { useTranslation } from "react-i18next";

export default function ListCardsYugioh() {
  const { t } = useTranslation();

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
  const allTypeOption = { value: "", label: t("all") + " Type" };
  const allArchetypeOption = { value: "", label: t("all") + " Archetype" };
  const allAttributeOption = { value: "", label: t("all") + " Attribute" };

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

  useEffect(() => {
    async function loadArchetypes() {
      try {
        const data = await fetchYugiohArchetypes();
        if (Array.isArray(data)) {
          setArchetypeOptions([
            allArchetypeOption,
            ...data.map((item) => ({ value: item, label: item })),
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch archetypes", err);
      }
    }
    loadArchetypes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      try {
        const data = await fetchYugiohCards({
          name: debouncedSearch,
          page,
          type: type?.value,
          archetype: archetype?.value,
          attribute: attribute?.value,
          atkMin,
          atkMax,
          defMin,
          defMax,
          levelMin,
          levelMax,
          orderField,
          orderBy,
        });
        setCards(data.data);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error("Failed to fetch cards", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    }
    loadCards();
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

  return (
    <div className="flex gap-4 p-4 justify-center">
      {/* Main content */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">
            <span className="hidden sm:inline">{t("list")} {t("card")} </span>
            Yu-Gi-Oh!
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
          <div className={styles.cardList}>
            <AnimatePresence>
              {cards.filter(Boolean).map((card, index) => (
                <motion.div
                  key={`${card.cardId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardItemYugioh card={card} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
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
          loading={loading}
        />
      )}
    </div>
  );
}
