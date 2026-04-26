import { NextRequest } from 'next/server'
import { AnalyticsService } from '@/services/analytics-service'
import { OrderRepository } from '@/repositories/order-repository'
import { StockRepository } from '@/repositories/stock-repository'
import { createResponse } from '@/lib/api-response'

export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id')

    if (!tenantId) {
        return createResponse(null, 'Tenant ID is required in headers', 400)
    }

    try {
        const service = new AnalyticsService(
            tenantId,
            new OrderRepository(),
            new StockRepository()
        )
        const totalSales = await service.getGlobalSales()

        return createResponse({ totalSales })
    } catch (error: any) {
        console.error('Failed to fetch analytics:', error)
        return createResponse(null, error.message, 500)
    }
}
