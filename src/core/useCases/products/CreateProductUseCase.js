export class CreateProductUseCase {

    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(name, description, price, stock) {
        try {
            if (!name || !description || price === undefined || stock === undefined) {
                throw new Error('Todos los campos son requeridos');
            }

            if (price <= 0) {
                throw new Error('El precio debe ser mayor a 0');
            }

            if (stock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            const product = {
                name,
                description,
                price,
                stock
            };

            const result = await this.productRepository.createProduct(product);

            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Error en CreateProductUseCase:', error);
            return {
                success: false,
                error: error.message || 'Error al crear el producto'
            };
        }
    }
}
