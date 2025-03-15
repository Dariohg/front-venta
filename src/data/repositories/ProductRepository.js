import { IProductRepository } from '../../core/repositories/IProductRepository';
import { ApiClient } from '../services/ApiClient';


export class ProductRepository extends IProductRepository {
    constructor() {
        super();
        this.apiClient = new ApiClient();
        this.apiHost = process.env.REACT_APP_API_HOST || 'http://localhost:8080';
    }


    async getProducts() {
        try {
            const response = await this.apiClient.get(`${this.apiHost}/v1/product/`);
            return response.data || [];
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    }


    async createProduct(product) {
        try {
            const response = await this.apiClient.post(`${this.apiHost}/v1/product/`, product);
            return response;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    }
}