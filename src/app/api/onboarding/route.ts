import { TenantService } from '@/services/tenant-service';
import { createResponse } from '@/lib/api-response';

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

        const tenantService = new TenantService();
        const tenant = await tenantService.createTenant({ name, plan });

        return createResponse({
            tenantId: tenant.id,
            plan: tenant.plan
        });
    } catch (error: any) {
        console.error('Onboarding failed:', error);
        return createResponse(null, error.message, 500);
    }
}
