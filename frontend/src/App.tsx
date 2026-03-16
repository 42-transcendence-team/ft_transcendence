import './styles/App.scss';

import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <div className="content">
		<Outlet />
    </div>
  );
};

export default App;
