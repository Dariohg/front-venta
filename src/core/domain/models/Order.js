export class Order {
    constructor(clientId, productId, quantity, status, totalPrice) {
        this.client_id = clientId;
        this.product_id = productId;
        this.quantity = quantity;
        this.status = status;
        this.total_price = totalPrice;
    }
}