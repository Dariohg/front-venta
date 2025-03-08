import { createContext, useContext, useState, useEffect } from 'react';
import { AuthRepository } from '../../data/repositories/AuthRepository';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const authRepository = new AuthRepository();

    useEffect(() => {
        // Verificar si hay un usuario en localStorage al cargar
        const currentUser = authRepository.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const loggedInUser = await authRepository.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };

    const register = async (name, email, password, address) => {
        const registeredUser = await authRepository.register(name, email, password, address);
        setUser(registeredUser);
        return registeredUser;
    };

    const logout = async () => {
        await authRepository.logout();
        setUser(null);
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};