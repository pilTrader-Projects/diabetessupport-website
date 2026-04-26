import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product-service';

/**
 * GET handler to retrieve all products for a specific tenant.
 * 
 * @param {Request} request - Incoming request with x-tenant-id header.
 * @returns {Promise<NextResponse>} JSON list of products or error.
 */
export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Missing tenant ID' }, { status: 400 });

        const productService = new ProductService(tenantId);
        const products = await productService.getProducts();

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST handler to create a new product.
 * 
 * @param {Request} request - Incoming request with x-tenant-id and product details in body.
 * @returns {Promise<NextResponse>} JSON response with the created product or error.
 */
export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Missing tenant ID' }, { status: 400 });

        const body = await request.json();
        const productService = new ProductService(tenantId);
        const product = await productService.createProduct(body);

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
