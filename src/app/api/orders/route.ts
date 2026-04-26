import { NextResponse } from 'next/server';
import { PosService } from '@/modules/pos/services/pos-service';

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
            return NextResponse.json({ error: 'Missing tenant or branch ID' }, { status: 400 });
        }

        const body = await request.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
        }

        const posService = new PosService(tenantId, branchId);
        const order = await posService.createOrder(items);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Failed to create order:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
