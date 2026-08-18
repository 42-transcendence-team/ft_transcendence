import "../styles/components/_userMenu.scss"
import { FiUser, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { useState,useEffect } from "react";
import { Logout } from "api/Logout";
import { useAuth } from "@components/auth-router/AuthContext";
import { useAuth as useAuthProfile} from "../context/AuthContext";
import { getUserProfile, type UserProfile } from "../api/UserProfile";
import { useNavigate } from "react-router-dom";


export const UserMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { refreshAuth } = useAuth();
	const { user: authenticatedUser } = useAuthProfile();
	const navigate = useNavigate();
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
                console.error("Error cargando perfil en UserMenu", error);
            });

        return () => {
            cancelled = true;
        };
    }, [authenticatedUser?.login]);

	const handleLogoutClick = async () => {
		try {
			await Logout()
			await refreshAuth();
			setIsOpen(false);
			navigate("/login");
			console.log("Logout click");
		} catch (error) {
			console.log("logout ERROR", error);
		}
	};

	const handleNavigation = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

	return (
		<div className="userMenu">
			<button
				className="userMenu__button"
				type="button"
				onClick={() => setIsOpen(!isOpen)}
			>
				<FiMenu className="userMenu__icon" />
			</button>
			{isOpen && (
				<div className="userMenu__dropdown">
					<button
						className="userMenu__item"
						type="button"
						onClick={() => handleNavigation(`/app/profile/${authenticatedUser?.login}`)}
					>
						<FiUser className="userMenu__item-icon" />
						<span>Perfil</span>
					</button>
					<button
						className="userMenu__item"
						type="button"
						onClick={() => handleNavigation("/app/settings")}
					>
						<FiSettings className="userMenu__item-icon" />
						<span>Configuración</span>
					</button>
					<button
						className="userMenu__item userMenu__item--logout"
						type="button"
						onClick={handleLogoutClick}
					>
						<FiLogOut className="userMenu__item-icon" />
						<span>Cerrar sesión</span>
					</button>
				</div>
			)}
		</div>
	);
};