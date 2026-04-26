import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecipeService } from '@/modules/inventory/services/recipe-service'
import prisma from '@/lib/prisma'
import { FeatureService } from '@/services/feature-service'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        $transaction: vi.fn((cb) => cb(prisma)),
        recipeItem: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
        },
    },
}))

// Mock FeatureService
vi.mock('@/services/feature-service')

describe('RecipeService (Phase 3 TDD)', () => {
    const tenantId = 'tenant-1'
    let service: RecipeService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new RecipeService(tenantId)
    })

    it('should set a recipe for a product by clearing old ones and adding new ones', async () => {
        // Enable feature
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)

        const productId = 'prod-1'
        const ingredients = [
            { ingredientId: 'ing-1', amount: 0.5 },
            { ingredientId: 'ing-2', amount: 1.0 },
        ]

        await service.setRecipe(productId, ingredients)

        // Verify old items cleared
        expect(prisma.recipeItem.deleteMany).toHaveBeenCalledWith({
            where: { productId }
        })

        // Verify new items created
        expect(prisma.recipeItem.createMany).toHaveBeenCalledWith({
            data: [
                { productId, ingredientId: 'ing-1', amount: 0.5 },
                { productId, ingredientId: 'ing-2', amount: 1.0 },
            ]
        })
    })

    it('should throw error if inventory feature is not enabled', async () => {
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(false)
        
        await expect(service.setRecipe('p1', [])).rejects.toThrow(/Feature 'inventory' is not enabled/)
    })
})
