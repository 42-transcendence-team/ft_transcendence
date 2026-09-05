import { createContext, useContext, useEffect, useState } from "react";
import { GetMyProfile } from "../api/Login";

interface AuthContextType {
    user: any;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        setLoading(true);
        return GetMyProfile()
            .then(data => {setUser(data.user);})
            .catch(() => {setUser(null);})
            .finally(() => {setLoading(false);});
    };

    useEffect(() => { fetchUser(); }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};