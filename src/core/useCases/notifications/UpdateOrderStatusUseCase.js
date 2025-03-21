export class UpdateOrderStatusUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute(orderId, status) {
        try {
            if (!orderId) {
                throw new Error('El ID de la orden es requerido');
            }

            if (!status) {
                throw new Error('El estado es requerido');
            }

            const result = await this.notificationRepository.updateOrderStatus(orderId, status);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Error en UpdateOrderStatusUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar el estado de la orden'
            };
        }
    }
}