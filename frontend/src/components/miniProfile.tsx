import { useState, useEffect } from "react";
import { FiTrendingUp } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProfile, getUserPresence, type UserProfile } from "../api/UserProfile"; // Ajusta la ruta
import skullLogo from '../assets/icons/skull_logo.png';

import "../styles/components/_miniProfile.scss";

// Función de ayuda copiada de tu Profile.tsx
function getImageSource(imagePath: string | null): string {
  if (!imagePath)
    return skullLogo;
  return imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
}

export const MiniProfile = () => {
  const { user: authenticatedUser, loading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!authenticatedUser?.login)
      return;
    let cancelled = false;

    getUserProfile(authenticatedUser.login, { noIncrement: true })
      .then((profile) => {
        if (!cancelled) {
          setProfileUser(profile);
        }
      })
      .catch((error) => {
        console.error("Error cargando perfil en MiniProfile", error);
      });

    return () => {
      cancelled = true;
    };
  }, [authenticatedUser?.login]);

//escucha activa si se incrementa el nmumero de visitas en el profile
  useEffect(() => {
    const handleVisitsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      const newVisits = customEvent.detail;
      setProfileUser((prev) => {
        if (!prev) return prev;
        return { ...prev, visits: newVisits };
      });
    };
    window.addEventListener('updateVisits', handleVisitsUpdate);
    return () => {
      window.removeEventListener('updateVisits', handleVisitsUpdate);
    };
  }, []);

  // Si está cargando la sesión, mostramos un esqueleto o estado de carga
  if (authLoading) {
    return (
      <div className="miniProfile" style={{ justifyContent: "center" }}>
        <span>Cargando...</span>
      </div>
    );
  }

  // Si no hay usuario logueado, no renderizamos nada (o podrías poner un error)
  if (!authenticatedUser) {
    return null; 
  }
  // 3. Preparamos las variables a mostrar cruzando el AuthContext con el UserProfile
  const displayName = profileUser?.name
    ? `${profileUser.name} ${profileUser.surname ?? ""}`.trim()
    : authenticatedUser.login;

  const avatarSrc = getImageSource(
    profileUser?.avatarPath ?? authenticatedUser.avatarPath ?? null
  );
  
  const statusClass = profileUser?.isOnline ? "online" : "offline";
  const visits = profileUser?.visits ?? 0;

  return (
    <div className="miniProfile">
      <div className="miniProfile__avatarWrapper">
        <img 
          src={avatarSrc} 
          alt={`Avatar de ${displayName}`} 
          className="miniProfile__avatar" 
        />
        <span className={`miniProfile__statusDot miniProfile__statusDot--${statusClass}`}></span>
      </div>

      <div className="miniProfile__stats" title={`${visits} visitas en tu perfil`}>
        <FiTrendingUp /> <span>{visits} visitas</span>
      </div>
      <Link
        className="miniProfile__publishBtn"
        to="/app/posts/new"
      >
        Nuevo post
      </Link>
      
    </div>
  );
};