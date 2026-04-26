import { BaseRepository } from '@/lib/base-repository';
import { PrismaClient } from '@prisma/client';

export class RecipeRepository extends BaseRepository {
    /**
     * Replaces the recipe for a product within a transaction client if provided.
     */
    async replaceRecipe(tx: any, productId: string, ingredients: { ingredientId: string; amount: number }[]) {
        const client = tx || this.prisma;

        // 1. Remove old recipe items
        await client.recipeItem.deleteMany({
            where: { productId },
        });

        // 2. Add new recipe items
        return client.recipeItem.createMany({
            data: ingredients.map((item: any) => ({
                productId,
                ingredientId: item.ingredientId,
                amount: item.amount,
            })),
        });
    }
}
