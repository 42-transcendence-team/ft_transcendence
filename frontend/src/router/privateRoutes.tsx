import { CreatePostPage } from '@pages/CreatePostPage';
import { Friends } from '@pages/Friends';
import { HomePage } from '@pages/HomePage';
import { MobileSearchAndNotify } from '@pages/MobileSearchAndNotify';
import { PostDetailPage } from '@pages/PostDetailPage';
import { Profile } from '@pages/Profile';
import { Settings } from '@pages/Settings';
import { PrivateLayout } from 'layouts/privateLayout';
import { redirect } from 'react-router-dom';
import { getAuthenticatedUser } from '../api/Login';
import { settingsLoader } from '../api/Settings';
import { GameRoutes } from './gameRoutes';

const privateLoader = async () => {
  try {
    const data = await getAuthenticatedUser();
    return data;
  } catch {
    throw redirect('/login');
  }
};

export const PrivateRoutes = {
  path: 'app',
  loader: privateLoader,
  element: <PrivateLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'posts/new', element: <CreatePostPage /> },
    { path: 'posts/:postId', element: <PostDetailPage /> },
    { path: 'profile/:username', element: <Profile /> },
    { path: 'settings', element: <Settings />, loader: settingsLoader },
    { path: 'friends/:username', element: <Friends /> },
    { path: 'mobile-search-notify', element: <MobileSearchAndNotify /> },
    GameRoutes,
  ],
};
