import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/pages/_profile.scss';
import {
  UserAvatar,
  type UserPresence,
} from '../components/users/UserAvatar';
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

  // Controla la apertura de la modal de edición del avatar.
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);

  if (loading)
    return <div className="loading-screen">Cargando el roneito...</div>;
  if (!user)
    return <div className="error-screen">No se ha podido cargar tu sesión.</div>;

  // Temporal hasta que exista el sistema real de presencia/status.
  const profilePresence: UserPresence = 'online';

  return (
	<div className='profile'>
		<div className='profile__container'>
			<div className='profile__banner'></div>
	
			{/* 2. Sección de Información de Cabecera */}
			<div className='profile__header'>
				
				{/* 
					Muestra el avatar actual y abre su editor al pulsarlo.
					UserAvatar utiliza la imagen predeterminada cuando no existe
					un avatar personalizado o falla su carga.
				*/}
				<UserAvatar
					avatarPath={user.avatarPath}
					username={user.login}
					size='large'
					status={profilePresence}
					className='profile__avatar'
					ariaLabel='Edit profile image'
					overlay={<i className='fas fa-camera'></i>}
					onClick={() => setIsAvatarEditorOpen(true)}
				/>
	
				<div className='profile__user-details'>
					<div className='profile__visits'>
						<i className='fas fa-chart-line profile__visits-icon'></i>
	
						{/* Dato real de visitas desde Redis */}
						<span>
							Nº Visitas al perfil {user.visits || 0}
						</span>
					</div>
	
					{/* Mostramos el nombre real o el login desde Postgres */}
					<h4 className='profile__user-name'>
						{user.name && user.surname
							? `${user.name} ${user.surname}`
							: user.login}
					</h4>
				</div>
						
				<Button1 label='Share'></Button1>
			</div>
						
			{/* 3. Sección del Feed */}
			<div className='profile__feed'>
				<p className='profile__status'>
					{user.status || 'Sin estado disponible'}
				</p>
						
				<div className='profile__posts'>
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
						<div className='profile__empty'>
							Aún no hay roneos por aquí...
						</div>
					)}
				</div>
			</div>
		</div>

		{/* 
			Permite subir, sustituir o eliminar el avatar.
			Tras una modificación, refreshUser actualiza los datos del usuario
			para mostrar inmediatamente la nueva imagen.
		*/}
		<AvatarEditorModal
			open={isAvatarEditorOpen}
			currentAvatarPath={user.avatarPath ?? null}
			onClose={() => setIsAvatarEditorOpen(false)}
			onUpdated={refreshUser}
		/>
	</div>
  );
};
