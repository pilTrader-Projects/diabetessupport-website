import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/analytics/global-sales/route'
import { AnalyticsService } from '@/services/analytics-service'
import { NextRequest } from 'next/server'

// Mock AnalyticsService
vi.mock('@/services/analytics-service')

describe('API: Global Sales Route (Task 5.1 TDD)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if x-tenant-id is missing', async () => {
        const req = new NextRequest('http://localhost/api/analytics/global-sales')
        const response = await GET(req)

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.error).toContain('Tenant ID is required')
    })

    it('should return global sales data for a valid tenant', async () => {
        // Mock the service call
        vi.spyOn(AnalyticsService.prototype, 'getGlobalSales').mockResolvedValue(1234.56)

        const req = new NextRequest('http://localhost/api/analytics/global-sales', {
            headers: { 'x-tenant-id': 'tenant-1' }
        })

        const response = await GET(req)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body.success).toBe(true)
        expect(body.data.totalSales).toBe(1234.56)
    })
})
