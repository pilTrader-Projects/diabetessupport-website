import { AuthService } from './auth-service'

/**
 * rbacGuard is a high-level helper to enforce permissions at the service or API level.
 * It uses the AuthService to verify that a user has the required permission
 * within their current session context.
 */
export async function rbacGuard(userId: string, permission: string) {
    const authService = new AuthService()
    const hasAccess = await authService.hasPermission(userId, permission)

    if (!hasAccess) {
        throw new Error(`Forbidden: You do not have the required permission (${permission}) to perform this action.`)
    }

    return true
}

/**
 * contextGuard ensures that the session's tenant matches the requested resource tenant.
 */
export function contextGuard(sessionTenantId: string, resourceTenantId: string) {
    if (sessionTenantId !== resourceTenantId) {
        throw new Error('Security Violation: Attempted to access data from another tenant.')
    }
}
