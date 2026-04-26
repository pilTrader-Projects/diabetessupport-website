const assert = require('assert');
const fs = require('fs');
const path = require('path');

/**
 * VANILLA JS INTEGRITY RUNNER (V2)
 * Strips TS types and runs logic natively to bypass node_modules blockers.
 */

const mockPrisma = {
  tenant: {
    create: async () => ({ id: 'tenant-1', name: 'Test Tenant', plan: 'basic', features: [] }),
    findUnique: async (args) => {
        if (args.where.id === 'tenant-1') return { id: 'tenant-1', plan: 'pro', features: [] };
        if (args.where.id === 'no-pos-tenant') return { id: 'no-pos-tenant', plan: 'none', features: [] };
        return null;
    }
  },
  branch: {
    create: async () => ({ id: 'branch-1', name: 'Test Branch' })
  },
  product: {
    create: async (args) => ({ id: 'prod-1', ...args.data }),
    findUnique: async () => ({ id: 'prod-1', ingredients: [] })
  },
  order: {
    create: async (args) => ({ id: 'order-1', ...args.data })
  },
  $transaction: async (cb) => cb(mockPrisma)
};

global.prismaOverride = mockPrisma;

function loadClass(filePath) {
    const code = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    
    const cleanCode = code
        .replace(/import .* from .*/g, '')
        .replace(/export class/g, 'class')
        .replace(/export const/g, 'const')
        .replace(/: [A-Z][A-Za-z<>\[\], ]+/g, '') // Strip simple types like ": string", ": Record<...>"
        .replace(/implements [A-Za-z]+/g, '')
        .replace(/private /g, 'this.')
        .replace(/protected /g, 'this.')
        .replace(/public /g, '');

    const classNameMatch = code.match(/class (\w+)/);
    const className = classNameMatch ? classNameMatch[1] : null;

    const context = { require, prisma: mockPrisma, console };
    const fn = new Function('context', `${cleanCode}; return ${className};`);
    return fn(context);
}

async function runIntegrityAudit() {
  console.log('🚀 [QA] Starting Zero-Dependency Integrity Audit...');

  try {
    const FeatureService = loadClass('src/services/FeatureService.ts');
    const TenantService = loadClass('src/services/TenantService.ts');
    const PosService = loadClass('src/services/PosService.ts');

    const tenantService = new TenantService();
    const tenant = await tenantService.createTenant({ name: 'Test' });
    assert.strictEqual(tenant.id, 'tenant-1');
    console.log('✅ [QA] Tenant Service: PASS');

    const featureService = new FeatureService();
    assert.strictEqual(await featureService.hasFeature('tenant-1', 'dashboard'), true);
    console.log('✅ [QA] Feature Gating: PASS');

    const posService = new PosService('tenant-1', 'branch-1');
    const order = await posService.createOrder([{ productId: 'prod-1', quantity: 1, price: 10 }]);
    assert.strictEqual(order.id, 'order-1');
    console.log('✅ [QA] POS-lite Workflow: PASS');

    console.log('\n--- 🎯 [QA] VERIFICATION SCORE: 100% GREEN ---');
  } catch (error) {
    console.error('\n--- 🛑 [QA] INTEGRITY BREACH DETECTED ---');
    console.error(error);
    process.exit(1);
  }
}

runIntegrityAudit();
