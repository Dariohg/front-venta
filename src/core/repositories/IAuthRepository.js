export class IAuthRepository {

    async login(email, password) {
        throw new Error('Method not implemented');
    }

    async register(name, email, password, address) {
        throw new Error('Method not implemented');
    }

    async logout() {
        throw new Error('Method not implemented');
    }
}