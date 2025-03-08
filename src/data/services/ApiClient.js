import axios from 'axios';

export class ApiClient {
    constructor() {
        this.client = axios.create({
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }


    async get(url, params = {}) {
        try {
            const response = await this.client.get(url, { params });
            return response.data;
        } catch (error) {
            this.handleApiError(error);
        }
    }


    async post(url, data = {}) {
        try {
            const response = await this.client.post(url, data);
            return response.data;
        } catch (error) {
            this.handleApiError(error);
        }
    }


    async put(url, data = {}) {
        try {
            const response = await this.client.put(url, data);
            return response.data;
        } catch (error) {
            this.handleApiError(error);
        }
    }

    async delete(url) {
        try {
            const response = await this.client.delete(url);
            return response.data;
        } catch (error) {
            this.handleApiError(error);
        }
    }

    handleApiError(error) {
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            const { status, data } = error.response;

            if (status === 400) {
                throw new Error(data.message || 'Solicitud incorrecta');
            } else if (status === 401) {
                throw new Error('No autorizado. Por favor, inicie sesión nuevamente');
            } else if (status === 403) {
                throw new Error('Acceso denegado');
            } else if (status === 404) {
                throw new Error('Recurso no encontrado');
            } else if (status === 500) {
                throw new Error('Error del servidor');
            }

            throw new Error(data.message || 'Error en la solicitud');
        } else if (error.request) {
            // La solicitud se realizó pero no se recibió respuesta
            throw new Error('No se recibió respuesta del servidor');
        } else {
            // Algo ocurrió al configurar la solicitud
            throw new Error('Error al realizar la solicitud');
        }
    }
}