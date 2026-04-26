import { BaseRepository } from '@/lib/base-repository';

export class SupplierRepository extends BaseRepository {
    /**
     * Upserts stock for a branch.
     */
    async upsertStock(tenantId: string, branchId: string, ingredientId: string, quantity: number) {
        return this.prisma.stock.upsert({
            where: {
                branchId_ingredientId: {
                    branchId,
                    ingredientId,
                },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                tenantId,
                branchId,
                ingredientId,
                quantity,
            },
        });
    }
}
