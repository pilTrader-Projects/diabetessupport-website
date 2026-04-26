import { PosService } from '@/modules/pos/services/pos-service';
import { OrderRepository } from '@/repositories/order-repository';
import { createResponse } from '@/lib/api-response';

/**
 * POST handler to create a new POS order and deduct inventory.
 * 
 * @param {Request} request - Incoming request with x-tenant-id, x-branch-id, and order items.
 * @returns {Promise<NextResponse>} JSON response with the created order or error.
 */
export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        const branchId = request.headers.get('x-branch-id');

        if (!tenantId || !branchId) {
            return createResponse(null, 'Missing tenant or branch ID', 400);
        }

        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return createResponse(null, 'Invalid items format', 400);
        }

        const posService = new PosService(tenantId, branchId, new OrderRepository());
        const order = await posService.createOrder(items);

        return createResponse(order);
    } catch (error: any) {
        console.error('Failed to create order:', error);
        return createResponse(null, error.message, 500);
    }
}
