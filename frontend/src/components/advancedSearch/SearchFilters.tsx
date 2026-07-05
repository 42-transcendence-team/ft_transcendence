import type { UserRelation, UserSearchSort, } from "../../api/userSearch";
import "../../styles/components/advancedSearch/_searchFilters.scss";
import { FiUsers, FiSend, FiInbox, FiSlash, } from "react-icons/fi";

type SearchFiltersProps = {
  selectedRelations: UserRelation[];
  onRelationsChange: (relations: UserRelation[]) => void;

  selectedSort: UserSearchSort;
  onSortChange: (sort: UserSearchSort) => void;
};


const filters: {
  value: UserRelation;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "friends",
    label: "Amigos",
    icon: <FiUsers />,
  },
  {
    value: "pending_sent",
    label: "Enviadas",
    icon: <FiSend />,
  },
  {
    value: "pending_received",
    label: "Recibidas",
    icon: <FiInbox />,
  },
  {
    value: "blocked_by_me",
    label: "Bloqueados",
    icon: <FiSlash />,
  },
];

export const SearchFilters = ({
  selectedRelations,
  onRelationsChange,
  selectedSort,
  onSortChange,
}: SearchFiltersProps) => {


  const handleChange = (relation: UserRelation) => {
    if (selectedRelations.includes(relation)) {
      onRelationsChange(
        selectedRelations.filter(
          (item) => item !== relation
        )
      );

    } else {
      onRelationsChange([
        ...selectedRelations,
        relation,
      ]);
    }
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

      <select
        className="searchFilters__select"
        value={selectedSort}
        onChange={(event) =>
          onSortChange(event.target.value as UserSearchSort)
        }
      >
        <option value="username_asc">Nombre A-Z</option>
        <option value="username_desc">Nombre Z-A</option>
        <option value="newest">Más recientes</option>
        <option value="oldest">Más antiguos</option>
      </select>
    </div>
  );
};