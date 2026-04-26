import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/products/route'
import { ProductService } from '@/services/product-service'
import { NextRequest } from 'next/server'

// Mock ProductService
vi.mock('@/services/product-service')

describe('API: Products Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if x-tenant-id is missing (GET)', async () => {
        const req = new NextRequest('http://localhost/api/products')
        const response = await GET(req)

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.success).toBe(false)
        expect(body.error).toBe('Missing tenant ID')
    })

    it('should list products for a valid tenant', async () => {
        const mockProducts = [{ id: '1', name: 'Burger', price: 10 }]
        vi.spyOn(ProductService.prototype, 'getProducts').mockResolvedValue(mockProducts as any)

        const req = new NextRequest('http://localhost/api/products', {
            headers: { 'x-tenant-id': 'tenant-789' }
        })

        const response = await GET(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data).toHaveLength(1)
        expect(body.data[0].name).toBe('Burger')
    })

    it('should create a product for a valid tenant', async () => {
        const mockProduct = { id: '2', name: 'Fries', price: 5 }
        vi.spyOn(ProductService.prototype, 'createProduct').mockResolvedValue(mockProduct as any)

        const req = new NextRequest('http://localhost/api/products', {
            method: 'POST',
            headers: { 'x-tenant-id': 'tenant-789' },
            body: JSON.stringify({ name: 'Fries', price: 5 })
        })

        const response = await POST(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.name).toBe('Fries')
    })
})
