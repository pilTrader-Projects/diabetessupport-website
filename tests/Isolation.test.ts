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

describe('Strict Branch Isolation Audit (Task 4.1)', () => {
    const tenantId = 'tenant-1'
    const branchA = 'branch-A'
    const branchB = 'branch-B'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should NOT allow Branch A to see orders from Branch B', async () => {
        const serviceA = new OrderService(tenantId, branchA)
        
        await serviceA.getOrderHistory()

        expect(prisma.order.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                branchId: branchA,
                tenantId: tenantId
            })
        }))

        // Verify it definitely didn't use branchB
        const callArgs = (prisma.order.findMany as any).mock.calls[0][0]
        expect(callArgs.where.branchId).not.toBe(branchB)
    })

    it('should NOT allow Branch A to cancel an order from Branch B', async () => {
        const serviceA = new OrderService(tenantId, branchA)
        const orderFromB = 'order-from-B'

        await serviceA.cancelOrder(orderFromB)

        // The query MUST include both orderId AND branchId to prevent ID guessing
        expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                id: orderFromB,
                tenantId: tenantId,
                branchId: branchA
            }
        }))
    })
})
