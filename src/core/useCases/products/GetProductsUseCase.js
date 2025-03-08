export class GetProductsUseCase {

    constructor(productRepository) {
        this.productRepository = productRepository;
    }


    async execute() {
        try {
            const products = await this.productRepository.getProducts();

            return {
                success: true,
                data: products
            };
        } catch (error) {
            console.error('Error en GetProductsUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al obtener los productos'
            };
        }
    }
}