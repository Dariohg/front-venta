import { IOrderRepository } from '../../core/repositories/IOrderRepository';
import { ApiClient } from '../services/ApiClient';

export class OrderRepository extends IOrderRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient();
        this.apiHost = process.env.REACT_APP_API_HOST || 'http://localhost:8080';
    }


    async createOrder(order) {
        try {
            const response = await this.apiClient.post(`${this.apiHost}/v1/order`, order);
            return response;
        } catch (error) {
            console.error('Error al crear orden:', error);
            throw error;
        }
    }


    async getOrders() {
        try {
            const response = await this.apiClient.get(`${this.apiHost}/v1/order`);
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            throw error;
        }
    }

    async getOrdersByClientId(clientId) {
        try {
            const response = await this.apiClient.get(`${this.apiHost}/v1/order/client/${clientId}`);

            // La respuesta viene en formato messages, procesamos para convertir a objetos
            if (response.messages && Array.isArray(response.messages)) {
                return response.messages.map(msg => {
                    try {
                        // Extraer el JSON dentro de la cadena del mensaje
                        const orderStr = msg.replace('Orden recibida: ', '');
                        return JSON.parse(orderStr);
                    } catch (e) {
                        console.error('Error parsing order message:', e);
                        return null;
                    }
                }).filter(order => order !== null);
            }

            return [];
        } catch (error) {
            console.error('Error al obtener órdenes del cliente:', error);
            throw error;
        }
    }
}