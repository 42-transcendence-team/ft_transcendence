import "../styles/components/_userMenu.scss";
import { FiUser, FiSettings, FiLogOut, FiMenu } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Logout } from "api/Logout";
import { useAuth } from "@components/auth-router/AuthContext";
import { useAuth as useAuthProfile} from "../context/AuthContext";
import { getUserProfile, type UserProfile } from "../api/UserProfile";
import { useNavigate } from "react-router-dom";

export const UserMenu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const { refreshAuth } = useAuth();
	const navigate = useNavigate();
	const { user: authenticatedUser } = useAuthProfile();
	const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const handleLogoutClick = async () => {
		try {
			await Logout();
			await refreshAuth();
			setIsOpen(false);
			navigate("/login");
			console.log("Logout click");
		} catch (error) {
			console.log("logout ERROR", error);
		}
	};

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

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleNavigation = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: PointerEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div className="userMenu" ref={menuRef}>
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