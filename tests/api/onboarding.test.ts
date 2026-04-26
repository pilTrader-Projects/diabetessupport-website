import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/onboarding/route'
import { TenantService } from '@/services/tenant-service'
import { NextRequest } from 'next/server'

// Mock services
vi.mock('@/services/tenant-service')
vi.mock('@/services/feature-service')

describe('API: Onboarding Route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create a tenant and return 200', async () => {
        const mockTenant = { id: 'tenant-123', name: 'Mario Pizza', plan: 'basic' }
        vi.spyOn(TenantService.prototype, 'createTenant').mockResolvedValue(mockTenant as any)

        const req = new NextRequest('http://localhost/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({ name: 'Mario Pizza', plan: 'basic' })
        })

        const response = await POST(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.tenantId).toBe('tenant-123')
    })

    it('should return 500 if tenant creation fails', async () => {
        vi.spyOn(TenantService.prototype, 'createTenant').mockRejectedValue(new Error('DB Error'))

        const req = new NextRequest('http://localhost/api/onboarding', {
            method: 'POST',
            body: JSON.stringify({ name: 'Fail Pizza', plan: 'basic' })
        })

        const response = await POST(req)
        const body = await response.json()

        expect(response.status).toBe(500)
        expect(body.success).toBe(false)
        expect(body.error).toBe('DB Error')
    })
})
