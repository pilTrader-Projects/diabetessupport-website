import { BaseService } from '@/services/base-service'
import prisma from '@/lib/prisma'
import { RecipeRepository } from '@/repositories/recipe-repository'

/**
 * RecipeService manages the relationship between Products and Ingredients.
 */
export class RecipeService extends BaseService {
    private repository: RecipeRepository

    constructor(tenantId: string, repository: RecipeRepository = new RecipeRepository()) {
        super(tenantId)
        this.repository = repository
    }

    /**
     * Defines the recipe for a product.
     * Clears existing recipe items and replaces them with the new set.
     */
    async setRecipe(productId: string, ingredients: { ingredientId: string, amount: number }[]) {
        await this.ensureFeature('inventory')

        return await prisma.$transaction(async (tx) => {
            return this.repository.replaceRecipe(tx, productId, ingredients)
        })
    }
}
