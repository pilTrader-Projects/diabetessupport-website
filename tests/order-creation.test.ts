import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PosService } from '@/modules/pos/services/pos-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        $transaction: vi.fn((cb) => cb(prisma)),
        order: {
            create: vi.fn(),
        },
        tenant: {
            findUnique: vi.fn(),
        },
        product: {
            findUnique: vi.fn().mockResolvedValue({ ingredients: [] }),
            findFirst: vi.fn().mockResolvedValue({ ingredients: [] }),
        },
        stock: {
            updateMany: vi.fn(),
        },
    },
}))

describe('PosService (POS-lite TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: PosService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new PosService(tenantId, branchId)
    })

    it('should create an order successfully with branch persistency', async () => {
        // Mock feature enabled
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'basic', features: ['pos'] })

        const orderItems = [
            { productId: 'prod-1', quantity: 2, price: 10.0 },
        ]
            ; (prisma.order.create as any).mockResolvedValue({ id: 'order-1', totalAmount: 20.0 })

        const order = await service.createOrder(orderItems)

        expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                tenantId,
                branchId,
                totalAmount: 20.0,
            })
        }))
        expect(order.id).toBe('order-1')
    })

    it('should reject order if POS feature is disabled', async () => {
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'none', features: [] })

        await expect(service.createOrder([])).rejects.toThrow(/Feature 'pos' is not enabled/)
    })
})
