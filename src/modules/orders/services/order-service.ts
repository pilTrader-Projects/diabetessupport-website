import { BaseService } from '@/services/base-service'
import prisma from '@/lib/prisma'

/**
 * OrderService manages historical order data and branch-specific visibility.
 */
export class OrderService extends BaseService {
    /**
     * Fetches the order history for a branch with pagination.
     */
    async getOrderHistory(skip = 0, take = 50) {
        return prisma.order.findMany({
            where: this.getScope(),
            include: {
                items: {
                    include: { product: true }
                },
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        })
    }

    /**
     * Cancels an order. 
     * Scoped to current tenant and branch to prevent cross-branch escalation.
     */
    async cancelOrder(orderId: string) {
        return prisma.order.update({
            where: {
                id: orderId,
                ...this.getScope(),
            },
            data: { status: 'CANCELLED' },
        })
    }
}
