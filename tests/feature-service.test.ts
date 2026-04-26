import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FeatureService } from '@/services/feature-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        tenant: {
            findUnique: vi.fn(),
        },
    },
}))

describe('FeatureService (TDD)', () => {
    let service: FeatureService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new FeatureService()
    })

    it('should enable POS for all plans by default', async () => {
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'basic', features: [] })
        const hasPos = await service.hasFeature('tenant-1', 'pos')
        expect(hasPos).toBe(true)
    })

    it('should disable Dashboard for basic plan', async () => {
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'basic', features: [] })
        const hasDashboard = await service.hasFeature('tenant-1', 'dashboard')
        expect(hasDashboard).toBe(false)
    })

    it('should enable Dashboard for pro plan', async () => {
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'pro', features: [] })
        const hasDashboard = await service.hasFeature('tenant-1', 'dashboard')
        expect(hasDashboard).toBe(true)
    })

    it('should enable feature if explicitly added to features array regardless of plan', async () => {
        ; (prisma.tenant.findUnique as any).mockResolvedValue({ plan: 'basic', features: ['dashboard'] })
        const hasDashboard = await service.hasFeature('tenant-1', 'dashboard')
        expect(hasDashboard).toBe(true)
    })
})
