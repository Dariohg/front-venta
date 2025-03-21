import { INotificationRepository } from '../../core/repositories/INotificationRepository';
import { ApiClient } from '../services/ApiClient';

export class NotificationRepository extends INotificationRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient();
        this.apiHost = process.env.REACT_APP_NOTIFICATION_API_HOST || 'http://13.216.195.66';
    }


    async getNotifications() {
        try {
            const response = await this.apiClient.get(`${this.apiHost}/api/notifications`);

            if (response && response.messages) {
                // Procesar las notificaciones
                const parsedOrders = response.messages
                    .map(msg => {
                        if (typeof msg === 'string' && msg.includes('Orden recibida:')) {
                            try {
                                const orderJson = msg.replace('Orden recibida: ', '');
                                const order = JSON.parse(orderJson);
                                return order;
                            } catch (e) {
                                console.error('Error parsing order:', e);
                                return null;
                            }
                        }
                        return null;
                    })
                    .filter(order => order !== null && order.id !== 0);  // Filtrar órdenes no válidas

                return parsedOrders;
            } else {
                throw new Error('Formato de respuesta inesperado');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }


    async updateOrderStatus(orderId, status) {
        try {

            console.log(`Actualizando estado de orden ${orderId} a ${status}`);

            return {
                success: true,
                message: `Orden ${orderId} actualizada a ${status}`
            };
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }
}