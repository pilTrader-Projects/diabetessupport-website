import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AnalyticsService } from '@/services/analytics-service'
import { FeatureService } from '@/services/feature-service'

describe('AnalyticsService (Consolidation - Phase 4 TDD)', () => {
    const tenantId = 'tenant-1'
    let service: AnalyticsService
    let mockOrderRepo: any
    let mockStockRepo: any

    beforeEach(() => {
        vi.clearAllMocks()
        mockOrderRepo = {
            getGlobalSales: vi.fn(),
            getBranchPerformance: vi.fn(),
        }
        mockStockRepo = {
            findCriticalStock: vi.fn(),
        }
        service = new AnalyticsService(tenantId, mockOrderRepo, mockStockRepo)
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(true)
    })

    it('should aggregate total sales across all branches of a tenant', async () => {
        mockOrderRepo.getGlobalSales.mockResolvedValue(5000.50)

        const total = await service.getGlobalSales()

        expect(total).toBe(5000.50)
        expect(mockOrderRepo.getGlobalSales).toHaveBeenCalledWith(tenantId)
    })

    it('should fail if dashboard feature is not enabled', async () => {
        vi.spyOn(FeatureService.prototype, 'hasFeature').mockResolvedValue(false)
        await expect(service.getGlobalSales()).rejects.toThrow(/Feature 'dashboard' is not enabled/)
    })

    it('should return branch performance ranked by sales', async () => {
        const mockPerformance = [
            { branchId: 'branch-A', totalAmount: 1000 },
            { branchId: 'branch-B', totalAmount: 500 },
        ]
        mockOrderRepo.getBranchPerformance.mockResolvedValue(mockPerformance)

        const performance = await service.getBranchPerformance()

        expect(performance).toHaveLength(2)
        expect(mockOrderRepo.getBranchPerformance).toHaveBeenCalledWith(tenantId)
    })

    it('should fetch critical stock across all branches', async () => {
        mockStockRepo.findCriticalStock.mockResolvedValue([])

        await service.getGlobalCriticalStock(5)

        expect(mockStockRepo.findCriticalStock).toHaveBeenCalledWith(tenantId, 5)
    })
})
