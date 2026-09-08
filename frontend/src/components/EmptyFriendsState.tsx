
export const EmptyFriendsState = () => (
  <div className="empty-friends">
    <p>Vaya, parece que esto esta' vacio...</p>
    <button 
        type="button"
        onClick={() => document.getElementById('header-search-input')?.focus()}
    >
      Buscar amigos
    </button>
  </div>
);
