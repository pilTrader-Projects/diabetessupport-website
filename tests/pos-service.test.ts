import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PosService } from '@/modules/pos/services/pos-service'
import prisma from '@/lib/prisma'
import { InventoryService } from '@/modules/inventory/services/inventory-service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        $transaction: vi.fn((cb) => cb(prisma)),
        order: {
            create: vi.fn(),
        },
        tenant: {
            findUnique: vi.fn().mockResolvedValue({ plan: 'basic', features: [] }),
        },
    },
}))

// Mock InventoryService
vi.mock('@/modules/inventory/services/inventory-service')

describe('PosService (TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: PosService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new PosService(tenantId, branchId)
    })

    it('should create an order and trigger inventory deduction', async () => {
        const orderItems = [
            { productId: 'prod-1', quantity: 2, price: 100 },
        ]
            ; (prisma.order.create as any).mockResolvedValue({ id: 'order-1', totalAmount: 200 })

        const order = await service.createOrder(orderItems)

        // Verify order creation
        expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                totalAmount: 200,
                branchId: 'branch-1',
            })
        }))

        // Verify inventory deduction was called via the inventory service
        const inventoryServiceInstance = (InventoryService as any).mock.instances[0]
        expect(inventoryServiceInstance.consumeIngredients).toHaveBeenCalledWith('prod-1', 2)
        expect(order.id).toBe('order-1')
    })
})
