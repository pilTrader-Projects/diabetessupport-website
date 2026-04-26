import { BaseRepository } from '@/lib/base-repository';

export class ProductRepository extends BaseRepository {
    /**
     * Fetches all products for a specific tenant.
     */
    async findAll(tenantId: string) {
        return this.prisma.product.findMany({
            where: { tenantId },
        });
    }

    /**
     * Creates a new product for a tenant.
     */
    async create(tenantId: string, data: { name: string; price: number }) {
        return this.prisma.product.create({
            data: {
                ...data,
                tenantId,
            },
        });
    }

    /**
     * Finds a specific product by ID and tenant ID.
     */
    async findById(tenantId: string, productId: string) {
        return this.prisma.product.findFirst({
            where: { id: productId, tenantId },
            include: {
                ingredients: {
                    include: { ingredient: true },
                },
            },
        });
    }
}
