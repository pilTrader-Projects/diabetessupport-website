import { BaseService } from '@/services/base-service'
import { ProductRepository } from '@/repositories/product-repository'
import { StockRepository } from '@/repositories/stock-repository'

/**
 * InventoryService handles the logical deduction of ingredients
 * based on products sold at a specific branch.
 */
export class InventoryService extends BaseService {
    private productRepository: ProductRepository
    private stockRepository: StockRepository

    constructor(
        tenantId: string,
        branchId: string,
        productRepo: ProductRepository = new ProductRepository(),
        stockRepo: StockRepository = new StockRepository()
    ) {
        super(tenantId, branchId)
        this.productRepository = productRepo
        this.stockRepository = stockRepo
    }

    /**
     * Consumes ingredients based on the quantity of a product sold.
     * This is a "destructive" operation that updates stock levels.
     */
    async consumeIngredients(productId: string, quantity: number) {
        // 1. Feature Gate
        await this.ensureFeature('inventory')

        // 2. Fetch the product recipe
        const product = await this.productRepository.findById(this.tenantId, productId)

        if (!product) {
            throw new Error('Product not found')
        }

        // 3. Iterate through ingredients and deduct stock
        for (const recipeItem of product.ingredients) {
            const amountToDeduct = recipeItem.amount * quantity
            await this.stockRepository.decrementStock(
                this.tenantId,
                this.branchId!,
                recipeItem.ingredientId,
                amountToDeduct
            )
        }
    }
}
