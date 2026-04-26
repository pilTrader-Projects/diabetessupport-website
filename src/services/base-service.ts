import prisma from '@/lib/prisma'
import { FeatureService } from './feature-service'

/**
 * BaseService ensures that every database query is scoped to the correct tenant and branch,
 * and that modular features are gated by the subscription tier.
 */
export class BaseService {
    protected tenantId: string
    protected branchId?: string
    private featureService: FeatureService

    constructor(tenantId: string, branchId?: string) {
        if (!tenantId) {
            throw new Error('Tenant ID is required for BaseService')
        }
        this.tenantId = tenantId
        this.branchId = branchId
        this.featureService = new FeatureService()
    }

    /**
     * Helper to append tenant and branch scoping to Prisma queries.
     */
    protected getScope() {
        return {
            tenantId: this.tenantId,
            ...(this.branchId ? { branchId: this.branchId } : {}),
        }
    }

    /**
     * Universal feature gate. Throws if the feature is not available for this tenant.
     */
    async ensureFeature(featureName: string) {
        const hasAccess = await this.featureService.hasFeature(this.tenantId, featureName)
        if (!hasAccess) {
            throw new Error(`Feature '${featureName}' is not enabled for this tenant. Please upgrade your plan.`)
        }
    }
}
