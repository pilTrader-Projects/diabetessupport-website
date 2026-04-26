import { BaseService } from './base-service'
import { OrderRepository } from '@/repositories/order-repository'
import { StockRepository } from '@/repositories/stock-repository'

/**
 * AnalyticsService provides consolidated views of data across multiple branches.
 * This is primarily used by Tenant Owners and Accountants.
 */
export class AnalyticsService extends BaseService {
    private orderRepository: OrderRepository
    private stockRepository: StockRepository

    constructor(
        tenantId: string,
        orderRepo: OrderRepository = new OrderRepository(),
        stockRepo: StockRepository = new StockRepository()
    ) {
        super(tenantId)
        this.orderRepository = orderRepo
        this.stockRepository = stockRepo
    }

    /**
     * Aggregates total revenue across all branches for the tenant.
     */
    async getGlobalSales() {
        await this.ensureFeature('dashboard')
        return this.orderRepository.getGlobalSales(this.tenantId)
    }

    /**
     * Compares performance across branches.
     */
    async getBranchPerformance() {
        await this.ensureFeature('dashboard')
        return this.orderRepository.getBranchPerformance(this.tenantId)
    }

    /**
     * Identifies stock items that are below a certain threshold across all branches.
     */
    async getGlobalCriticalStock(threshold: number = 10) {
        await this.ensureFeature('inventory')
        return this.stockRepository.findCriticalStock(this.tenantId, threshold)
    }
}
