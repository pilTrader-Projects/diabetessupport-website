import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '@/services/product-service'
import prisma from '@/lib/prisma'
import { FeatureService } from '@/services/feature-service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        product: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        tenant: {
            findUnique: vi.fn(),
        },
    },
}))

describe('ProductService (POS-lite TDD)', () => {
    const tenantId = 'tenant-1'
    let service: ProductService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new ProductService(tenantId)
    })

    it('should create a product if POS feature is enabled', async () => {
        // Mock feature enabled
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'basic', features: ['pos'] })

        const productData = { name: 'Burger', price: 5.99 }
            ; (prisma.product.create as any).mockResolvedValue({ id: 'prod-1', ...productData, tenantId })

        const product = await service.createProduct(productData)

        expect(prisma.product.create).toHaveBeenCalledWith({
            data: {
                ...productData,
                tenantId,
            },
        })
        expect(product.id).toBe('prod-1')
    })

    it('should fail to create a product if POS feature is disabled', async () => {
        // Mock feature disabled (basic plan normally has it, but let's say it's missing)
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'none', features: [] })

        const productData = { name: 'Burger', price: 5.99 }

        await expect(service.createProduct(productData)).rejects.toThrow(/Feature 'pos' is not enabled/)
    })
})
