import { BaseService } from '@/services/base-service'
import { SupplierRepository } from '@/repositories/supplier-repository'

/**
 * SupplierService handles ingredient deliveries and stock replenishment.
 */
export class SupplierService extends BaseService {
    private repository: SupplierRepository

    constructor(
        tenantId: string,
        branchId: string,
        repository: SupplierRepository = new SupplierRepository()
    ) {
        super(tenantId, branchId)
        this.repository = repository
    }

    /**
     * Records a raw material delivery and updates the branch's stock level.
     */
    async recordDelivery(ingredientId: string, quantity: number) {
        return this.repository.upsertStock(
            this.tenantId,
            this.branchId!,
            ingredientId,
            quantity
        )
    }
}
