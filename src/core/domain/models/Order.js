export class Order {

    constructor(id, clientId, productId, quantity, status, totalPrice) {
        this.id = id;
        this.client_id = clientId;
        this.product_id = productId;
        this.quantity = quantity;
        this.status = status;
        this.total_price = totalPrice;
    }
}