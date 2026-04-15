import '../styles/pages/_profile.scss';
import skullLogo from '../assets/icons/skull_logo.png';
import photo1 from '../assets/img/choni1.png';
import photo2 from '../assets/img/choni2.png';
import photo3 from '../assets/img/choni3.png';

export const Profile = () => (
  <div className='page-wrapper'>
    <div className='profile-container'>
      <div className='profile-banner'></div>

      {/* 2. Sección de Información de Cabecera */}
      <div className='profile-header-info'>
        {/* logo */}
        <div className='profile-logo'>
          <img src={skullLogo} alt="Skull Icon" className='skull-icon' />
          <div className='status-dot'></div>
        </div>

        {/* Info Usuario */}
        <div className='user-details'>
          <div className='visitas'>
            <i className="fas fa-chart-line"></i>
            <span>Nº Visitas al perfil 1312</span>
          </div>
          <h4 className='user-name'>ignacio viseras riego</h4>
        </div>

        {/* btn de aaccion */}
        <div className='action-buttons'>
          <button className='share-btn'>Share</button>
        </div>
      </div>

      {/* 3. Sección del Feed */}
      <div className='profile-feed'>
        <p className='status-text'>Estado... (Nº maximo caracteres?)</p>

        {/* seccion de post */}
        <div className='feed-posts-container'>
          
          {/* Post txt */}
          <div className='feed-post'>
            <div className='post-header'>
              <div className='small-logo'>
                <img src={skullLogo} alt="Username logo" />
              </div>
              <div className='post-info'>
                <span className='username'>Username</span>
                <span className='time'>2 min</span>
              </div>
            </div>
            <p className='post-message'>
              No vea la lore k pesada neni. K YONI ES MIO!!!!!!!
            </p>
          </div>

          {/* post txt + foto */}
          <div className='feed-post highlighted-post'>
            <div className='post-header'>
              <div className='small-logo'>
                <img src={skullLogo} alt="Username logo" />
              </div>
              <div className='post-info'>
                <span className='username'>Username</span>
                <span className='time'>2 min</span>
              </div>
            </div>
            <p className='post-message'>Listo pal roneitoooo</p>
            
            {/* fotos */}
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