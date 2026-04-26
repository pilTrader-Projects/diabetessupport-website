import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '@/modules/orders/services/order-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        order: {
            findMany: vi.fn(),
            update: vi.fn(),
        },
    },
}))

describe('OrderService (TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: OrderService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new OrderService(tenantId, branchId)
    })

    it('should fetch order history scoped to tenant and branch', async () => {
        ; (prisma.order.findMany as any).mockResolvedValue([])

        await service.getOrderHistory()

        expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { tenantId, branchId },
        }))
    })

    it('should cancel an order with scoping', async () => {
        ; (prisma.order.update as any).mockResolvedValue({ id: 'order-1', status: 'CANCELLED' })

        await service.cancelOrder('order-1')

        expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'order-1', tenantId, branchId },
            data: { status: 'CANCELLED' },
        }))
    })
})
