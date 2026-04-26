import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '@/services/product-service'
import { ProductRepository } from '@/repositories/product-repository'
import { FeatureService } from '@/services/feature-service'

describe('ProductService - Menu Management (TDD)', () => {
    const tenantId = 'tenant-1'
    let service: ProductService
    let mockRepo: ProductRepository

    beforeEach(() => {
        vi.clearAllMocks()
        mockRepo = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
        } as any
        service = new ProductService(tenantId, mockRepo)
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should allow creating a custom menu item with PHP pricing', async () => {
        const productData = { name: 'Chicken Adobo', price: 150.0 }
        mockRepo.create.mockResolvedValue({ id: 'p1', ...productData } as any)

        const product = await service.createProduct(productData)

        expect(product.name).toBe('Chicken Adobo')
        expect(product.price).toBe(150.0)
        expect(mockRepo.create).toHaveBeenCalledWith(tenantId, productData)
    })

    it('should fetch the full menu for a tenant', async () => {
        mockRepo.findAll.mockResolvedValue([
            { id: 'p1', name: 'Item 1', price: 100 }
        ] as any)

        const menu = await service.getProducts()

        expect(menu).toHaveLength(1)
        expect(mockRepo.findAll).toHaveBeenCalledWith(tenantId)
    })
})
