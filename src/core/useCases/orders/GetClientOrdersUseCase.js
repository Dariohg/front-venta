export class GetClientOrdersUseCase {

    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }


    async execute(clientId) {
        try {
            if (!clientId) {
                throw new Error('El ID del cliente es requerido');
            }

            const orders = await this.orderRepository.getOrdersByClientId(clientId);

            return {
                success: true,
                data: orders
            };
        } catch (error) {
            console.error('Error en GetClientOrdersUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener las órdenes del cliente'
            };
        }
    }
}