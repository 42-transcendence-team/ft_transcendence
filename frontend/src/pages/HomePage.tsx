import {Post} from '@components/Post'

const postsData = [//testing de datos
  {
	id: 1,
	username: "lore",
	time: "Ahora mismo",
	message: " TODO BORRAR",
	isHighlighted: false,
	likes: 10,
  },
  {
	id: 2,
	username: "yoni",
	time: "2 min",
	message: "Listo pal roneitoooo",
	isHighlighted: true,
	likes: 10,
  },
  {
	id: 3,
	username: "lore",
	time: "Ahora mismo",
	message: " TODO BORRAR",
	isHighlighted: false,
	likes: 10,
  },{
	id: 4,
	username: "lore",
	time: "Ahora mismo",
	message: " TODO BORRAR",
	isHighlighted: false,
	likes: 10,
  },{
	id: 5,
	username: "lore",
	time: "Ahora mismo",
	message: " TODO BORRAR",
	isHighlighted: false,
	likes: 10,
  },
];



export const HomePage = () => {
	return (
    // <div className='page-wrapper'>
	<div className='profile-feed'>
		<div className='feed-posts-container'>{/*si quremos añadir contenido necesitamos el feed-posts-container */}
			{postsData.map((post) => (
				<Post 
					key={post.id}
					username={post.username}
					time={post.time}
					message={post.message}
					isHighlighted={post.isHighlighted}
					likes={post.likes}
				/>
			))}
		</div>
	 </div>
	);
};