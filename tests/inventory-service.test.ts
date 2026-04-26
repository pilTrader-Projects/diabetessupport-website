import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InventoryService } from '@/modules/inventory/services/inventory-service'
import { FeatureService } from '@/services/feature-service'

describe('InventoryService (TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: InventoryService
    let mockProductRepo: any
    let mockStockRepo: any

    beforeEach(() => {
        vi.clearAllMocks()
        mockProductRepo = {
            findById: vi.fn(),
        }
        mockStockRepo = {
            decrementStock: vi.fn(),
        }
        service = new InventoryService(tenantId, branchId, mockProductRepo, mockStockRepo)
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should correctly deduct stock based on product ingredients', async () => {
        const productId = 'prod-1'
        const mockProduct = {
            id: productId,
            ingredients: [
                { ingredientId: 'ing-1', amount: 0.5 },
                { ingredientId: 'ing-2', amount: 1 },
            ],
        }
        mockProductRepo.findById.mockResolvedValue(mockProduct)

        await service.consumeIngredients(productId, 10)

        expect(mockStockRepo.decrementStock).toHaveBeenCalledTimes(2)
        expect(mockStockRepo.decrementStock).toHaveBeenCalledWith(tenantId, branchId, 'ing-1', 5)
        expect(mockStockRepo.decrementStock).toHaveBeenCalledWith(tenantId, branchId, 'ing-2', 10)
    })

    it('should throw error if product is not found', async () => {
        mockProductRepo.findById.mockResolvedValue(null)
        await expect(service.consumeIngredients('invalid', 1)).rejects.toThrow('Product not found')
    })
})
