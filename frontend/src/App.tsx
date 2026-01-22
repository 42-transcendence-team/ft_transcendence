import './styles/App.scss';

import { Route, Routes } from "react-router-dom";

import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { Login } from './pages/Login'

const App = () => {
  return (
    <div className="content">
		<Header />
		<Routes>
			<Route path='/' element={<HomePage/>}/>
			<Route path='/login' element={<Login/>}/>
		</Routes>
		<Footer/>
    </div>
  );
};

export default App;
