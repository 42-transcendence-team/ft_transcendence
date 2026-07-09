import { useEffect, useRef, useState } from "react";
import type { UserRelation, UserSearchSort } from "../../api/userSearch";
import "../../styles/components/advancedSearch/_searchFilters.scss";
import { FiUsers, FiSend, FiInbox, FiSlash, FiChevronDown } from "react-icons/fi";

type SearchFiltersProps = {
  selectedRelations: UserRelation[];
  onRelationsChange: (relations: UserRelation[]) => void;

  selectedSort: UserSearchSort;
  onSortChange: (sort: UserSearchSort) => void;
};

const sortOptions: {
    value: UserSearchSort;
    label: string;
  }[] = [
    { value: "username_asc", label: "A - Z" },
    { value: "username_desc", label: "Z - A" },
    { value: "newest", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
  ];

const filters: {
  value: UserRelation;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "friends", label: "Amigos", icon: <FiUsers /> },
  { value: "pending_sent", label: "Enviadas", icon: <FiSend /> },
  { value: "pending_received", label: "Recibidas", icon: <FiInbox /> },
  { value: "blocked_by_me", label: "Bloqueados", icon: <FiSlash /> },
];

export const SearchFilters = ({
  selectedRelations,
  onRelationsChange,
  selectedSort,
  onSortChange,
}: SearchFiltersProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);

  const currentSortLabel = sortOptions.find((option) => option.value === selectedSort)?.label ?? "Ordenar";

  useEffect(() => {
    if (!isSortOpen) return;

    function handleClickOutside(event: PointerEvent) {
      if (
        sortMenuRef.current &&
        !sortMenuRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isSortOpen]);

  const handleChange = (relation: UserRelation) => {
    if (selectedRelations.includes(relation)) {
      onRelationsChange(selectedRelations.filter((item) => item !== relation));
      return;
    }

    onRelationsChange([...selectedRelations, relation]);
  };

  const handleSortSelect = (value: UserSearchSort) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <div className="searchFilters">
      <h3 className="searchFilters__title">Filtros</h3>

      <p className="searchFilters__sectionTitle">Relaciones</p>

      <div className="searchFilters__chips">
        {filters.map((filter) => {
          const isActive = selectedRelations.includes(filter.value);

          return (
            <button
              key={filter.value}
              type="button"
              className={`searchFilters__chip ${
                isActive ? "searchFilters__chip--active" : ""
              }`}
              onClick={() => handleChange(filter.value)}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      <p className="searchFilters__sectionTitle">Orden</p>

      <div className="searchFilters__sortDropdown" ref={sortMenuRef}>
        <button
          type="button"
          className="searchFilters__sortTrigger"
          onClick={() => setIsSortOpen((current) => !current)}
        >
          <span className="searchFilters__sortLabel">
            {currentSortLabel}
          </span>

          <FiChevronDown
            className={`searchFilters__sortIcon ${
              isSortOpen ? "searchFilters__sortIcon--open" : ""
            }`}
          />
        </button>

        {isSortOpen && (
         <div className="searchFilters__sortMenu">
          {sortOptions.map((option) => {
            const isActive = option.value === selectedSort;
            return (
              <button
                key={option.value}
                type="button"
                className={isActive ? "searchFilters__sortOption--active" : ""}
                onClick={() => handleSortSelect(option.value)}
              >
                {option.label}
              </button>
            );
          })}
</div>
        )}
      </div>
    </div>
  );
};