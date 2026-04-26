import { BaseService } from '@/services/base-service'
import { ProductRepository } from '@/repositories/product-repository'

/**
 * ProductService manages the catalog of sellable items for a tenant.
 */
export class ProductService extends BaseService {
    private repository: ProductRepository

    constructor(tenantId: string, repository: ProductRepository = new ProductRepository()) {
        super(tenantId)
        this.repository = repository
    }

    /**
     * Creates a new product for the tenant.
     * Mandates 'pos' feature availability.
     */
    async createProduct(data: { name: string; price: number }) {
        await this.ensureFeature('pos')
        return this.repository.create(this.tenantId, data)
    }

    /**
     * Fetches all products for the tenant.
     */
    async getProducts() {
        await this.ensureFeature('pos')
        return this.repository.findAll(this.tenantId)
    }
}
