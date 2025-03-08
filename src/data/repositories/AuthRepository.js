import { User } from '../../core/domain/models/User';
import { IAuthRepository } from '../../core/repositories/IAuthRepository';
import { ApiClient } from '../services/ApiClient';


export class AuthRepository extends IAuthRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient();
        this.storageKey = 'auth_user';
        this.apiHost = process.env.REACT_APP_API_HOST || 'http://localhost:8080';
    }


    async login(email, password) {
        try {
            const loginData = {
                email,
                password
            };

            const response = await this.apiClient.get(`${this.apiHost}/v1/client`, loginData);

            if (response?.success && response?.data) {
                const userData = response.data;

                const user = new User(
                    userData.Id,
                    userData.Name,
                    userData.Email,
                    userData.token
                );

                localStorage.setItem(this.storageKey, JSON.stringify(user));

                return user;
            } else {
                throw new Error(response?.error || 'Formato de respuesta inesperado');
            }
        } catch (error) {
            console.error('Error during login:', error);

            if (process.env.NODE_ENV === 'development') {
                const mockUser = new User(
                    1, // Id
                    'Usuario de Prueba',
                    email, // Email
                    'token-simulado-123456'
                );
                localStorage.setItem(this.storageKey, JSON.stringify(mockUser));
                return mockUser;
            }

            throw new Error('Error al iniciar sesión. Verifique sus credenciales.');
        }
    }


    async register(name, email, password, address) {
        try {
            const requestData = {
                name: name,
                description: email,
                password: password,
                address: address
            };

            const response = await this.apiClient.post(`${this.apiHost}/v1/client`, requestData);


            return await this.login(email, password);
        } catch (error) {
            console.error('Error during registration:', error);

            if (process.env.NODE_ENV === 'development') {
                const mockUser = new User(
                    1,
                    name,
                    email,
                    'token-registro-654321'
                );
                localStorage.setItem(this.storageKey, JSON.stringify(mockUser));
                return mockUser;
            }

            throw new Error('Error al registrar el usuario. Intente con otro correo.');
        }
    }


    async logout() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Error during logout:', error);
            throw new Error('Error al cerrar sesión.');
        }
    }


    getCurrentUser() {
        const userData = localStorage.getItem(this.storageKey);
        if (!userData) return null;

        try {
            const parsed = JSON.parse(userData);
            return new User(
                parsed.Id,
                parsed.Name,
                parsed.Email,
                parsed.token
            );
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }


    isAuthenticated() {
        return !!this.getCurrentUser();
    }
}