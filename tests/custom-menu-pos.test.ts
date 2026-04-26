import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PosService } from '@/modules/pos/services/pos-service'
import { ProductService } from '@/services/product-service'
import prisma from '@/lib/prisma'
import { FeatureService } from '@/services/feature-service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        $transaction: vi.fn((cb) => cb(prisma)),
        order: { create: vi.fn() },
        product: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn()
        },
        stock: {
            updateMany: vi.fn()
        }
    },
}))

// Mock FeatureService
vi.mock('@/services/feature-service')

describe('Integration: Custom Menu Sale (₱ PHP)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'

    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should correctly process a sale for a custom menu item in PHP', async () => {
        const productService = new ProductService(tenantId)
        const posService = new PosService(tenantId, branchId)

        // 1. Create custom product
        const customItem = { name: 'Adobo Rice', price: 150.0 }
            ; (prisma.product.create as any).mockResolvedValue({ id: 'custom-1', ...customItem })
        const product = await productService.createProduct(customItem)

            // 2. Perform Sale
            ; (prisma.product.findFirst as any).mockResolvedValue({
                id: 'custom-1',
                ingredients: [] // No recipe for this simple item
            })
            ; (prisma.order.create as any).mockResolvedValue({ id: 'order-1', totalAmount: 300.0 })

        const order = await posService.createOrder([
            { productId: 'custom-1', quantity: 2, price: 150.0 }
        ])

        // 3. Verify
        expect(order.totalAmount).toBe(300.0)
        expect(prisma.order.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                totalAmount: 300.0,
                branchId
            })
        }))
    })
})
