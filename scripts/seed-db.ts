import { loadEnvFile } from 'node:process';
import { DEMO_BRANCH, DEMO_INGREDIENTS, DEMO_PRODUCTS, INITIAL_STOCK } from '../src/lib/demo-data.js';

// Load environment variables from .env file (Native in Node 20.6+)
try {
    loadEnvFile();
} catch (e) {
    // .env might not exist if using system env vars
}

// Dynamically import prisma after env is loaded
const { default: prisma } = await import('../src/lib/prisma.js');

async function seed() {
    try {
        console.log('Starting seed...');

        // 1. Create Demo Tenant
        const tenant = await prisma.tenant.upsert({
            where: { id: 'tenant-demo' },
            update: {},
            create: {
                id: 'tenant-demo',
                name: 'FoodHouse Demo Corp',
                plan: 'pro',
                features: ['dashboard', 'inventory', 'pos']
            }
        });
        console.log('Tenant created/found:', tenant.id);

        // 2. Create Default Role & User
        const role = await prisma.role.upsert({
            where: { id: 'role-admin' },
            update: {},
            create: {
                id: 'role-admin',
                name: 'Admin',
                tenantId: tenant.id
            }
        });

        const user = await prisma.user.upsert({
            where: { email: 'admin@demo.com' },
            update: {},
            create: {
                id: 'user-admin',
                email: 'admin@demo.com',
                name: 'Demo Admin',
                password: 'password123',
                tenantId: tenant.id,
                roleId: role.id
            }
        });

        // 3. Create Demo Branch
        const branch = await prisma.branch.upsert({
            where: { id: DEMO_BRANCH.id },
            update: {},
            create: {
                id: DEMO_BRANCH.id,
                name: DEMO_BRANCH.name,
                tenantId: tenant.id
            }
        });

        // 4. Create Ingredients
        for (const ing of DEMO_INGREDIENTS) {
            await prisma.ingredient.upsert({
                where: { id: ing.id },
                update: {},
                create: {
                    id: ing.id,
                    name: ing.name,
                    unit: ing.unit,
                    tenantId: tenant.id
                }
            });

            // Initialize Stock
            await prisma.stock.upsert({
                where: {
                    branchId_ingredientId: {
                        branchId: branch.id,
                        ingredientId: ing.id
                    }
                },
                update: { quantity: INITIAL_STOCK[ing.id as keyof typeof INITIAL_STOCK] },
                create: {
                    branchId: branch.id,
                    ingredientId: ing.id,
                    tenantId: tenant.id,
                    quantity: INITIAL_STOCK[ing.id as keyof typeof INITIAL_STOCK]
                }
            });
        }
        console.log('Ingredients and Stock initialized');

        // 5. Create Products & Recipes
        for (const prod of DEMO_PRODUCTS) {
            const product = await prisma.product.upsert({
                where: { id: prod.id },
                update: { price: prod.price },
                create: {
                    id: prod.id,
                    name: prod.name,
                    price: prod.price,
                    tenantId: tenant.id,
                    branchId: branch.id
                }
            });

            await prisma.recipeItem.deleteMany({ where: { productId: product.id } });

            for (const item of prod.recipe) {
                await prisma.recipeItem.create({
                    data: {
                        productId: product.id,
                        ingredientId: item.ingredientId,
                        amount: item.amount
                    }
                });
            }
        }
        console.log('Products and Recipes seeded');
        console.log('Seed completed successfully!');
    } catch (e) {
        console.error('Seed failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
