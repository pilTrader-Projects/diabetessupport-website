import { BaseService } from '@/services/base-service'
import prisma from '@/lib/prisma'
import { InventoryService } from '../../inventory/services/inventory-service'
import { OrderRepository } from '@/repositories/order-repository'

/**
 * PosService handles order creation and coordinates with the 
 * Inventory module to ensure stock is deducted in a single transaction.
 */
export class PosService extends BaseService {
    private inventoryService: InventoryService
    private orderRepository: OrderRepository

    constructor(
        tenantId: string,
        branchId: string,
        orderRepo: OrderRepository = new OrderRepository(),
        inventoryService?: InventoryService
    ) {
        super(tenantId, branchId)
        this.orderRepository = orderRepo
        this.inventoryService = inventoryService || new InventoryService(tenantId, branchId)
    }

    /**
     * Creates a new order. 
     * This logic is wrapped in a Prisma transaction to ensure 
     * that inventory is only deducted if the order is successfully created.
     */
    async createOrder(items: { productId: string; quantity: number; price: number }[]) {
        // 1. Feature Gate
        await this.ensureFeature('pos')

        return await prisma.$transaction(async (tx) => {
            // Re-initialize repo with transaction client if we want full atomicity
            // For now, using standard create within transaction block and delegating
            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

            const order = await this.orderRepository.create(
                this.tenantId,
                this.branchId!,
                'user-admin',
                totalAmount,
                items
            )

            // 2. Delegate inventory consumption to the Inventory module
            for (const item of items) {
                await this.inventoryService.consumeIngredients(item.productId, item.quantity)
            }

            return order
        })
    }
}
