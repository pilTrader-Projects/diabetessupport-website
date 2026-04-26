import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/orders/route'
import { PosService } from '@/modules/pos/services/pos-service'
import { NextRequest } from 'next/server'

// Mock PosService
vi.mock('@/modules/pos/services/pos-service')

describe('API: Orders Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if tenant or branch ID is missing', async () => {
        const req = new NextRequest('http://localhost/api/orders', {
            method: 'POST',
            body: JSON.stringify({ items: [] })
        })
        const response = await POST(req)

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.success).toBe(false)
        expect(body.error).toBe('Missing tenant or branch ID')
    })

    it('should create an order for valid input', async () => {
        const mockOrder = { id: 'order-1', totalAmount: 100 }
        vi.spyOn(PosService.prototype, 'createOrder').mockResolvedValue(mockOrder as any)

        const req = new NextRequest('http://localhost/api/orders', {
            method: 'POST',
            headers: {
                'x-tenant-id': 'tenant-1',
                'x-branch-id': 'branch-1'
            },
            body: JSON.stringify({
                items: [{ productId: 'p1', quantity: 2, price: 50 }]
            })
        })

        const response = await POST(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.id).toBe('order-1')
    })
})
