import { useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import type { UserRelation } from "../api/userSearch";
import "../styles/components/_relationsActionsMenu.scss"; 

type RelationsActionsMenuProps = {
  relation: UserRelation;
  onRemoveFriend?: () => void;
  onBlockUser?: () => void;
};

export function RelationsActionsMenu({
  relation,
  onRemoveFriend,
  onBlockUser,
}: RelationsActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const canRemoveFriend = relation === "friends" && onRemoveFriend;
  const canBlockUser =
    relation !== "blocked_by_me" &&
    relation !== "blocked_me" &&
    onBlockUser;

  const hasActions = canRemoveFriend || canBlockUser;

  if (!hasActions) {
    return null;
  }

  return (
    <div className="relationsActionsMenu">
      <button
        type="button"
        className="relationsActionsMenu__trigger"
        onClick={() => setIsOpen((current) => !current)}
      >
        <FiMoreHorizontal />
      </button>

      {isOpen && (
        <div className="relationsActionsMenu__dropdown">
          {canRemoveFriend && (
            <button
              type="button"
              className="relationsActionsMenu__item"
              onClick={() => {
                onRemoveFriend();
                setIsOpen(false);
              }}
            >
              Eliminar amigo
            </button>
          )}

          {canBlockUser && (
            <button
              type="button"
              className="relationsActionsMenu__item relationsActionsMenu__item--danger"
              onClick={() => {
                onBlockUser();
                setIsOpen(false);
              }}
            >
              Bloquear usuario
            </button>
          )}
        </div>
      )}
    </div>
  );
}