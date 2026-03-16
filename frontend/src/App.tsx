import './styles/App.scss';

import { Outlet } from "react-router-dom";

import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App = () => {
  return (
    <div className="content">
		<Outlet />
    </div>
  );
};

export default App;
