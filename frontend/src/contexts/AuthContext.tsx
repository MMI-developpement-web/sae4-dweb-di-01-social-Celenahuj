import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
// 1. Interfaces pour typer proprement nos données
export interface User {
    id: number;
    username: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

// 2. Création du Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Fournisseur du Context (Provider)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialisation depuis le localStorage pour persister la session au refresh
    const [token, setToken] = useState<string | null>(localStorage.getItem('user_token'));
    const [user, setUser] = useState<User | null>(null);

    // Récupération initiale de l'utilisateur stocké
    useEffect(() => {
        const storedId = localStorage.getItem('user_id');
        const storedUsername = localStorage.getItem('user_username');
        const storedAvatar = localStorage.getItem('user_avatar');

        if (storedId && storedUsername) {
            setUser({
                id: parseInt(storedId, 10),
                username: storedUsername,
                avatar: storedAvatar || undefined
            });
        }
    }, []);

    // Met à jour le state ET le localStorage
    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('user_token', newToken);
        localStorage.setItem('user_id', userData.id.toString());
        localStorage.setItem('user_username', userData.username);
        if (userData.avatar) {
            localStorage.setItem('user_avatar', userData.avatar);
        }
    };

    // Vide le state ET le localStorage
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_username');
        localStorage.removeItem('user_avatar');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Hook personnalisé exporté
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
};