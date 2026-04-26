import { PrismaClient } from '@prisma/client';
import prisma from './prisma';

/**
 * Base repository to provide a common interface for CRUD operations.
 * Enforces tenant-based isolation at the data access level.
 */
export abstract class BaseRepository {
    protected prisma: PrismaClient;

    constructor(client: PrismaClient = prisma) {
        this.prisma = client;
    }

    /**
     * Helper to ensure all queries are scoped to the current tenant.
     */
    protected getScopedQuery(tenantId: string, extra: object = {}) {
        return {
            where: {
                tenantId,
                ...extra,
            },
        };
    }
}
