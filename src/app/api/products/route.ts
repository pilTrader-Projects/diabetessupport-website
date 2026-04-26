import { ProductService } from '@/services/product-service';
import { ProductRepository } from '@/repositories/product-repository';
import { createResponse } from '@/lib/api-response';

/**
 * GET handler to retrieve all products for a specific tenant.
 * 
 * @param {Request} request - Incoming request with x-tenant-id header.
 * @returns {Promise<NextResponse>} JSON list of products or error.
 */
export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return createResponse(null, 'Missing tenant ID', 400);

        const productService = new ProductService(tenantId, new ProductRepository());
        const products = await productService.getProducts();
        return createResponse(products);
    } catch (error: any) {
        console.error('Failed to fetch products:', error);
        return createResponse(null, error.message, 500);
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
        if (!tenantId) return createResponse(null, 'Missing tenant ID', 400);

        const body = await request.json();
        const productService = new ProductService(tenantId, new ProductRepository());
        const product = await productService.createProduct(body);

        return createResponse(product);
    } catch (error: any) {
        console.error('Failed to create product:', error);
        return createResponse(null, error.message, 500);
    }
}
