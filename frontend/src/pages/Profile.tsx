import { useAuth } from '../context/AuthContext';
import '../styles/pages/_profile.scss';
import skullLogo from '../assets/icons/skull_logo.png';
import photo1 from '../assets/img/choni1.png';
import photo2 from '../assets/img/choni2.png';
import photo3 from '../assets/img/choni3.png';

export const Profile = () => {
  const { user, loading } = useAuth();

  if (loading)
    return <div className="loading-screen">Cargando el roneito...</div>;
  if (!user)
    return <div className="error-screen">No se ha podido cargar tu sesión.</div>;

  return (
    <div className='page-wrapper'>
      <div className='profile-container'>
        <div className='profile-banner'></div>

        {/* 2. Sección de Información de Cabecera */}
        <div className='profile-header-info'>
          <div className='profile-logo'>
            <img src={skullLogo} alt="Skull Icon" className='skull-icon' />
            {/* punto verde */}
            <div className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></div>
          </div>

          <div className='user-details'>
            <div className='visitas'>
              <i className="fas fa-chart-line"></i>
              {/* Dato real de visitas desde Redis */}
              <span>Nº Visitas al perfil {user.visits || 0}</span>
            </div>
            {/* Mostramos el nombre real o el login desde Postgres */}
            <h4 className='user-name'>{user.name && user.surname ? `${user.name} ${user.surname}` : user.login}</h4>
          </div>

          <div className='action-buttons'>
            <button className='share-btn'>Share</button>
          </div>
        </div>

        {/* 3. Sección del Feed */}
        <div className='profile-feed'>
          {/* El estado también podría venir del objeto 'user' si lo guardas en DB */}
          <p className='status-text'>{user.status || "Sin estado disponible"}</p>

          <div className='feed-posts-container'>
            
            <div className='feed-post'>
              <div className='post-header'>
                <div className='small-logo'>
                  <img src={skullLogo} alt="Username logo" />
                </div>
                <div className='post-info'>
                  <span className='username'>{user.login}</span>
                  <span className='time'>Ahora mismo</span>
                </div>
              </div>
              <p className='post-message'>
                ID es {user.id} y email es {user.email}.
                TODO BORRAR LUEGO
                {/* TODO BORRAR LUEGO */}
              </p>
            </div>

            {/* Post estático de ejemplo */}
            <div className='feed-post highlighted-post'>
              <div className='post-header'>
                <div className='small-logo'>
                  <img src={skullLogo} alt="Username logo" />
                </div>
                <div className='post-info'>
                  <span className='username'>{user.login}</span>
                  <span className='time'>2 min</span>
                </div>
              </div>
              <p className='post-message'>Listo pal roneitoooo</p>
              
              <div className='photo-gallery'>
                <img src={photo1} alt="Photo 1" />
                <img src={photo2} alt="Photo 2" />
                <img src={photo3} alt="Photo 3" />
                <div className='more-photos'>+5</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};