import prisma from '@/lib/prisma'

export const SYSTEM_PERMISSIONS = [
    { name: 'pos:transactions', description: 'Create and view sales' },
    { name: 'inventory:manage', description: 'Update stock levels' },
    { name: 'inventory:view', description: 'View stock levels' },
    { name: 'accounting:view', description: 'View consolidated reports' },
    { name: 'branch:manage', description: 'Manage branch settings and personnel' },
    { name: 'tenant:admin', description: 'Full access to tenant data' },
]

export const DEFAULT_ROLES = [
    { name: 'Cashier', permissions: ['pos:transactions', 'inventory:view'] },
    { name: 'Manager', permissions: ['pos:transactions', 'inventory:manage', 'inventory:view', 'branch:manage'] },
    { name: 'Accountant', permissions: ['accounting:view', 'inventory:view'] },
    { name: 'Owner', permissions: ['tenant:admin', 'accounting:view', 'branch:manage'] },
]

export async function seedRolesAndPermissions() {
    console.log('Seeding permissions...')
    for (const perm of SYSTEM_PERMISSIONS) {
        await prisma.permission.upsert({
            where: { name: perm.name },
            update: perm,
            create: perm,
        })
    }

    console.log('Seeding default roles...')
    // Note: Roles are usually tenant-specific but we can provide system defaults 
    // that can be cloned when a new tenant signs up.
}
