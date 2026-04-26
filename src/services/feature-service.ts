import prisma from '@/lib/prisma'

/**
 * Subscription Plans and their default included features.
 */
export const PLAN_FEATURES: Record<string, string[]> = {
    basic: ['pos', 'inventory'],
    pro: ['pos', 'inventory', 'dashboard', 'landing_page'],
    enterprise: ['pos', 'inventory', 'dashboard', 'landing_page', 'unlimited_branches'],
}

/**
 * FeatureService provides the gating logic for modular SaaS functionality.
 */
export class FeatureService {
    /**
     * Checks if a tenant has access to a specific feature.
     * Access is granted if:
     * 1. The feature is part of the tenant's current plan.
     * 2. The feature is explicitly enabled in the tenant's custom features list.
     */
    async hasFeature(tenantId: string, featureName: string): Promise<boolean> {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { plan: true, features: true },
        })

        if (!tenant) return false

        // 1. Check explicit features
        if (tenant.features.includes(featureName)) return true

        // 2. Check plan features
        const planFeatures = PLAN_FEATURES[tenant.plan] || []
        return planFeatures.includes(featureName)
    }
}
