import { BaseRepository } from '@/lib/base-repository';

export class OrderRepository extends BaseRepository {
    /**
     * Creates a new order with items.
     * Note: Transactions should be handled outside at the service level 
     * OR passed as a prisma 'tx' client.
     */
    async create(tenantId: string, branchId: string, userId: string, totalAmount: number, items: any[]) {
        return this.prisma.order.create({
            data: {
                tenantId,
                branchId,
                userId,
                totalAmount,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        pricePaid: item.price,
                    })),
                },
            },
        });
    }

    /**
     * Aggregates total revenue across all branches for the tenant.
     */
    async getGlobalSales(tenantId: string) {
        const aggregation = await this.prisma.order.aggregate({
            where: { tenantId },
            _sum: { totalAmount: true },
        });
        return aggregation._sum.totalAmount || 0;
    }

    /**
     * Compares performance across branches.
     */
    async getBranchPerformance(tenantId: string) {
        return this.prisma.order.groupBy({
            by: ['branchId'],
            where: { tenantId },
            _sum: { totalAmount: true },
            orderBy: {
                _sum: { totalAmount: 'desc' },
            },
        });
    }
}
