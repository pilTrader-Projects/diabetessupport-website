import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProductService } from '@/services/product-service'
import { ProductRepository } from '@/repositories/product-repository'
import { FeatureService } from '@/services/feature-service'

describe('Multi-tenancy Isolation (ProductService)', () => {
    let mockRepo: ProductRepository

    beforeEach(() => {
        vi.clearAllMocks()
        mockRepo = {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
        } as any
        // Mock FeatureService to always return true for tests
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should scope findAll queries to the tenant', async () => {
        const service = new ProductService('tenant-1', mockRepo)
        await service.getProducts()

        expect(mockRepo.findAll).toHaveBeenCalledWith('tenant-1')
    })

    it('should scope create operations to the tenant', async () => {
        const service = new ProductService('tenant-2', mockRepo)
        const productData = { name: 'Fried Chicken', price: 15.0 }

        await service.createProduct(productData)

        expect(mockRepo.create).toHaveBeenCalledWith('tenant-2', productData)
    })
})
