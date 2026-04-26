import { NextResponse } from 'next/server';
import { TenantService } from '@/services/tenant-service';
import { FeatureService } from '@/services/feature-service';

/**
 * POST handler for tenant onboarding.
 * Creates a new tenant and initializes necessary feature flags.
 * 
 * @param {Request} request - The incoming HTTP request containing tenant name and plan.
 * @returns {Promise<NextResponse>} JSON response with the created tenant details or an error message.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, plan } = body;

        // In a real app, we'd get a user ID from session or create one here
        const adminUserId = 'user-admin'; // Placeholder

        const tenantService = new TenantService();
        const tenant = await tenantService.createTenant({ name, plan });

        // Features are automatically enabled based on the plan in FeatureService
        // No need to manually enable 'pos' and 'inventory' as they are in 'basic' plan
        // 'dashboard' is in 'pro' plan.

        return NextResponse.json({
            message: 'Tenant created successfully',
            tenantId: tenant.id,
            plan: tenant.plan
        });
    } catch (error: any) {
        console.error('Onboarding failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
