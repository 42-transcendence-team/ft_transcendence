import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/_profile.scss';
import skullLogo from '../assets/icons/skull_logo.png';
import photo1 from '../assets/img/choni1.png';
import photo2 from '../assets/img/choni2.png';
import photo3 from '../assets/img/choni3.png';
import {Post} from '../components/Post'
import {Button1} from '../components/Button1'
import { AvatarEditorModal } from '../components/users/AvatarEditorModal';

//Todo cambiar los datos y q lleguen de la bd este seria un esquima de datos mas o menos
const postsData = [//testing de datos
  {
    id: 1,
    username: "lore",
    time: "Ahora mismo",
    message: " TODO BORRAR",
    isHighlighted: false
  },
  {
    id: 2,
    username: "yoni",
    time: "2 min",
    message: "Listo pal roneitoooo",
    images: [photo1, photo2, photo3, photo3],
    isHighlighted: true
  },
  {
    id: 3,
    username: "lore",
    time: "Ahora mismo",
    message: " TODO BORRAR",
    isHighlighted: false
  },{
    id: 4,
    username: "lore",
    time: "Ahora mismo",
    message: " TODO BORRAR",
    isHighlighted: false
  },{
    id: 5,
    username: "lore",
    time: "Ahora mismo",
    message: " TODO BORRAR",
    isHighlighted: false
  },
];

export const Profile = () => {
  const { user, loading, refreshUser } = useAuth();
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

  if (loading)
    return <div className="loading-screen">Cargando el roneito...</div>;
  if (!user)
    return <div className="error-screen">No se ha podido cargar tu sesión.</div>;

  const hasCustomAvatar = Boolean(user.avatarPath);

  const avatarSource = hasCustomAvatar
	  ? `/${user.avatarPath}`
	  : skullLogo;

  return (
    <div className='page-wrapper'>
      <div className='profile-container'>
        <div className='profile-banner'></div>

        {/* 2. Sección de Información de Cabecera */}
        <div className='profile-header-info'>
			<button
			  className='profile-logo profile-logo--editable'
			  type='button'
			  aria-label='Edit profile image'
			  onClick={() => setIsAvatarEditorOpen(true)}
			>
			  <img
			    src={avatarSource}
			    alt={`${user.login} profile`}
			    className={[
			      'profile-avatar',
			      hasCustomAvatar ? '' : 'profile-avatar--fallback',
			    ]
			      .filter(Boolean)
			      .join(' ')}
			  />

			  <span
			    className='profile-logo__edit-overlay'
			    aria-hidden='true'
			  >
			    <i className='fas fa-camera'></i>
			  </span>
			  {/* punto verde */}
			  <div
			    className={`status-dot ${
			      user.isOnline ? 'online' : 'offline'
			    }`}
			  ></div>
			</button>

          <div className='user-details'>
            <div className='visitas'>
              <i className="fas fa-chart-line"></i>
              {/* Dato real de visitas desde Redis */}
              <span>Nº Visitas al perfil {user.visits || 0}</span>
            </div>
            {/* Mostramos el nombre real o el login desde Postgres */}
            <h4 className='user-name'>{user.name && user.surname ? `${user.name} ${user.surname}` : user.login}</h4>
          </div>
          <Button1 label='Share'></Button1>
        </div>

        {/* 3. Sección del Feed */}
        <div className='profile-feed'>
          {/* El estado también podría venir del objeto 'user' si lo guardas en DB */}
          <p className='status-text'>{user.status || "Sin estado disponible"}</p>

          <div className='feed-posts-container'>{/*si quremos añadir contenido necesitamos el feed-posts-container */}
            {postsData.length > 0 ? (
              postsData.map((post) => (
                <Post 
                  key={post.id}
                  username={post.username}
                  time={post.time}
                  message={post.message}
                  images={post.images}
                  isHighlighted={post.isHighlighted}
                />
              ))
            ) : (
              <div className="no-posts">Aún no hay roneos por aquí...</div>
            )}
          </div>
        </div>
      </div>

	  <AvatarEditorModal
	      open={isAvatarEditorOpen}
	      currentAvatarPath={user.avatarPath ?? null}
	      onClose={() => setIsAvatarEditorOpen(false)}
	      onUpdated={refreshUser}
      />
    </div>
  );
};
