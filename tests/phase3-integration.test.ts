import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PosService } from '@/modules/pos/services/pos-service'
import { RecipeService } from '@/modules/inventory/services/recipe-service'
import { SupplierService } from '@/modules/suppliers/services/supplier-service'
import prisma from '@/lib/prisma'
import { FeatureService } from '@/services/feature-service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        $transaction: vi.fn((cb) => cb(prisma)),
        order: { create: vi.fn() },
        recipeItem: {
            deleteMany: vi.fn(),
            createMany: vi.fn()
        },
        stock: {
            upsert: vi.fn(),
            updateMany: vi.fn(),
            findMany: vi.fn()
        },
        product: {
            findUnique: vi.fn(),
            findFirst: vi.fn()
        }
    },
}))

// Mock FeatureService
vi.mock('@/services/feature-service')

describe('Phase 3 Integration: Vertical Slice (End-to-End Inventory)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'

    beforeEach(() => {
        vi.clearAllMocks()
        // Enable features by default for integration test
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should flow from delivery -> recipe -> sale -> deduction', async () => {
        const supplier = new SupplierService(tenantId, branchId)
        const recipe = new RecipeService(tenantId)
        const pos = new PosService(tenantId, branchId)

        // 1. Record Delivery (Stock up)
        await supplier.recordDelivery('coffee-beans', 1000)
        expect(prisma.stock.upsert).toHaveBeenCalledWith(expect.objectContaining({
            create: expect.objectContaining({ ingredientId: 'coffee-beans', quantity: 1000 })
        }))

        // 2. Set Recipe
        await recipe.setRecipe('espresso', [{ ingredientId: 'coffee-beans', amount: 18 }])
        expect(prisma.recipeItem.createMany).toHaveBeenCalledWith(expect.objectContaining({
            data: [{ productId: 'espresso', ingredientId: 'coffee-beans', amount: 18 }]
        }))

            // 3. Perform Sale
            // Mock the product lookup that happens inside PosService -> InventoryService
            ; (prisma.product.findFirst as any).mockResolvedValue({
                id: 'espresso',
                ingredients: [
                    { ingredientId: 'coffee-beans', amount: 18 }
                ]
            })
            ; (prisma.order.create as any).mockResolvedValue({ id: 'order-1', totalAmount: 5.0 })

        await pos.createOrder([{ productId: 'espresso', quantity: 2, price: 2.5 }])

        // 4. Verify Deduction
        // 2 orders * 18g = 36g deduction
        expect(prisma.stock.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ ingredientId: 'coffee-beans' }),
            data: { quantity: { decrement: 36 } }
        }))
    })
})
