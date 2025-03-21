export class GetNotificationsUseCase {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    async execute() {
        try {
            const notifications = await this.notificationRepository.getNotifications();

            return {
                success: true,
                data: notifications
            };
        } catch (error) {
            console.error('Error en GetNotificationsUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener las notificaciones'
            };
        }
    }
}