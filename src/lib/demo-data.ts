/**
 * DEMO SEED DATA
 * This provides the static data for the Store-Level Demo.
 */

export const DEMO_BRANCH = { id: 'branch-downtown', name: 'Downtown Store' };

export const DEMO_INGREDIENTS = [
    { id: 'ing-beef', name: 'Ground Beef', unit: 'kg' },
    { id: 'ing-bun', name: 'Burger Buns', unit: 'pcs' },
    { id: 'ing-cheese', name: 'Cheddar Cheese', unit: 'slices' },
];

export const DEMO_PRODUCTS = [
    { 
        id: 'prod-cheeseburger', 
        name: 'Classic Cheeseburger', 
        price: 12.50,
        recipe: [
            { ingredientId: 'ing-beef', amount: 0.15 }, // 150g
            { ingredientId: 'ing-bun', amount: 1 },
            { ingredientId: 'ing-cheese', amount: 1 },
        ]
    },
    { 
        id: 'prod-double-beef', 
        name: 'Double Beef Burger', 
        price: 18.00,
        recipe: [
            { ingredientId: 'ing-beef', amount: 0.30 }, // 300g
            { ingredientId: 'ing-bun', amount: 1 },
            { ingredientId: 'ing-cheese', amount: 1 },
        ]
    }
];

// Initial stock levels for the demo
export const INITIAL_STOCK = {
    'ing-beef': 10.0, // 10kg
    'ing-bun': 50,    // 50 buns
    'ing-cheese': 100, // 100 slices
};
