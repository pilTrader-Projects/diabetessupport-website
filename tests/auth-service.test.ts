import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '@/services/auth-service'
import prisma from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    default: {
        user: {
            findUnique: vi.fn().mockResolvedValue({
                id: 'user-1',
                role: {
                    permissions: [],
                },
            }),
        },
    },
}))

describe('AuthService (RBAC)', () => {
    const authService = new AuthService()

    it('should grant access if user has the specific permission', async () => {
        const mockUser = {
            id: 'user-1',
            role: {
                permissions: [{ name: 'pos:transactions' }],
            },
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)

        const hasAccess = await authService.hasPermission('user-1', 'pos:transactions')
        expect(hasAccess).toBe(true)
    })

    it('should grant access if user has tenant:admin permission', async () => {
        const mockUser = {
            id: 'user-2',
            role: {
                permissions: [{ name: 'tenant:admin' }],
            },
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)

        const hasAccess = await authService.hasPermission('user-2', 'any:permission')
        expect(hasAccess).toBe(true)
    })

    it('should deny access if user lacks the permission', async () => {
        const mockUser = {
            id: 'user-3',
            role: {
                permissions: [{ name: 'pos:transactions' }],
            },
        }
            ; (prisma.user.findUnique as any).mockResolvedValue(mockUser)

        const hasAccess = await authService.hasPermission('user-3', 'accounting:view')
        expect(hasAccess).toBe(false)
    })
})
