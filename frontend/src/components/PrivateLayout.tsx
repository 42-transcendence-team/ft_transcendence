// Componente que actúa como una plantilla ahí donde se renderizan las rutas hijas.
import { Outlet } from "react-router-dom";

export const PrivateLayout = () => {
  // Aquí no se protege nada todavía. Cosa de otra tarea.
  // Aquí iría el guard (token, redirect, etc.)
  return <Outlet />;
};
