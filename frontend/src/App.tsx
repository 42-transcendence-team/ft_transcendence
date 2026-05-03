// App.tsx - Limpio
import './styles/App.scss';
import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className="content">
        <Outlet /> 
      </div>
    </AuthProvider>
  );
};
export default App;