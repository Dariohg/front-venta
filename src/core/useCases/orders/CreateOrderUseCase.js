import {Order} from "../../domain/models/Order";

export class CreateOrderUseCase {

    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(clientId, productId, quantity, totalPrice) {
        try {
            if (!clientId || !productId || !quantity || !totalPrice) {
                throw new Error('Todos los campos son requeridos');
            }

            if (quantity <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            if (totalPrice <= 0) {
                throw new Error('El precio total debe ser mayor a 0');
            }

            const order = new Order(
                clientId,
                productId,
                quantity,
                'Pending',
                totalPrice
            );

            const result = await this.orderRepository.createOrder(order);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Error en CreateOrderUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al crear la orden'
            };
        }
    }
}