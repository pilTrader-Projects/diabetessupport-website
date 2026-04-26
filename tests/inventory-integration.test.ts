import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from '@/modules/inventory/services/inventory-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        product: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
        stock: {
            updateMany: vi.fn(),
        },
        tenant: {
            findUnique: vi.fn(),
        }
    },
}))

describe('Inventory Integration (Phase 3 TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: InventoryService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new InventoryService(tenantId, branchId)
    })

    it('should deduct raw materials when a product is consumed', async () => {
        // Mock feature enabled
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'pro', features: ['inventory'] })

        const productId = 'prod-1'
        const mockProduct = {
            id: productId,
            ingredients: [
                { ingredientId: 'beef', amount: 0.2 }, // 0.2kg
                { ingredientId: 'bun', amount: 1 },   // 1 unit
            ],
        }
            ; (prisma.product.findFirst as any).mockResolvedValue(mockProduct)

        await service.consumeIngredients(productId, 5)

        // Verification: 0.2 * 5 = 1kg beef, 1 * 5 = 5 buns
        expect(prisma.stock.updateMany).toHaveBeenCalledTimes(2)
        expect(prisma.stock.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ ingredientId: 'beef' }),
            data: { quantity: { decrement: 1.0 } }
        }))
    })
})
