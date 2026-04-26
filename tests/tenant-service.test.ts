import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TenantService } from '@/services/tenant-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        tenant: {
            create: vi.fn(),
            findUnique: vi.fn(),
        },
        branch: {
            create: vi.fn(),
        },
    },
}))

describe('TenantService (TDD)', () => {
    let service: TenantService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new TenantService()
    })

    it('should create a new tenant with a default plan', async () => {
        const tenantData = { name: 'Fried Chicken House' }
            ; (prisma.tenant.create as any).mockResolvedValue({ id: 'tenant-1', ...tenantData, plan: 'basic' })

        const tenant = await service.createTenant(tenantData)

        expect(prisma.tenant.create).toHaveBeenCalledWith({
            data: {
                ...tenantData,
                plan: 'basic',
                features: [],
            },
        })
        expect(tenant.id).toBe('tenant-1')
    })

    it('should create a branch for a tenant', async () => {
        const branchData = { name: 'Main Street Branch', tenantId: 'tenant-1' }
            ; (prisma.branch.create as any).mockResolvedValue({ id: 'branch-1', ...branchData })

        const branch = await service.createBranch(branchData)

        expect(prisma.branch.create).toHaveBeenCalledWith({
            data: branchData,
        })
        expect(branch.id).toBe('branch-1')
    })
})
