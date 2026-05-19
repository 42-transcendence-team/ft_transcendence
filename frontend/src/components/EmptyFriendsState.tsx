
export const EmptyFriendsState = () => (
  <div className="empty-friends">
    <p>No tienes amigos, te sietes solo? 0.0</p>
    <button 
        type="button"
        onClick={() => console.log("go to friend search")}
    >
      Buscar amigos
    </button>
  </div>
);