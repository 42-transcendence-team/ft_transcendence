import {Post} from '@components/Post'

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
				/>
			))}
		</div>
	// </div>
	);
};