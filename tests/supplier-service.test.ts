import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupplierService } from '@/modules/suppliers/services/supplier-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        stock: {
            upsert: vi.fn(),
        },
    },
}))

describe('SupplierService (TDD)', () => {
    const tenantId = 'tenant-1'
    const branchId = 'branch-1'
    let service: SupplierService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new SupplierService(tenantId, branchId)
    })

    it('should record delivery by upserting stock levels', async () => {
        ; (prisma.stock.upsert as any).mockResolvedValue({})

        await service.recordDelivery('ing-1', 50)

        expect(prisma.stock.upsert).toHaveBeenCalledWith(expect.objectContaining({
            create: expect.objectContaining({
                branchId,
                ingredientId: 'ing-1',
                quantity: 50,
            }),
            update: {
                quantity: { increment: 50 }
            }
        }))
    })
})
