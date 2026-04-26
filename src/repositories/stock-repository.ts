import { BaseRepository } from '@/lib/base-repository';

export class StockRepository extends BaseRepository {
    /**
     * Atomically decrements stock for an ingredient in a branch.
     */
    async decrementStock(tenantId: string, branchId: string, ingredientId: string, amount: number) {
        // updateMany is used here because branchId + ingredientId is the composite key 
        // but updateMany allows cleaner scoping in this BaseService pattern.
        return this.prisma.stock.updateMany({
            where: {
                tenantId,
                branchId,
                ingredientId,
            },
            data: {
                quantity: {
                    decrement: amount,
                },
            } as any,
        });
    }

    /**
     * Identifies stock items that are below a certain threshold across all branches.
     */
    async findCriticalStock(tenantId: string, threshold: number) {
        return this.prisma.stock.findMany({
            where: {
                tenantId,
                quantity: { lte: threshold },
            },
            include: {
                branch: { select: { name: true } },
                ingredient: { select: { name: true, unit: true } },
            },
        });
    }
}
