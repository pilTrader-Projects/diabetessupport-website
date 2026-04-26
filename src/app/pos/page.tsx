'use client';

import { useState, useEffect } from 'react';
import { DEMO_PRODUCTS, DEMO_INGREDIENTS, INITIAL_STOCK, DEMO_BRANCH } from '@/lib/demo-data';

export default function PosTerminalPage() {
    const [cart, setCart] = useState<any[]>([]);
    const [stock, setStock] = useState<Record<string, number>>(INITIAL_STOCK);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    
    // Quantity Modal State
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantityInput, setQuantityInput] = useState(1);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentType, setPaymentType] = useState('Cash');
    const [amountTendered, setAmountTendered] = useState<string>('');
    const [change, setChange] = useState<number>(0);

    useEffect(() => {
        const tenantId = localStorage.getItem('tenantId') || 'tenant-demo';
        const branchId = 'branch-downtown';

        async function fetchProducts() {
            try {
                const res = await fetch('/api/products', {
                    headers: { 'x-tenant-id': tenantId }
                });
                const envelope = await res.json();
                if (envelope.success && Array.isArray(envelope.data)) {
                    setProducts(envelope.data);
                } else {
                    setProducts(DEMO_PRODUCTS);
                }
            } catch (e) {
                setProducts(DEMO_PRODUCTS);
            }
        }
        fetchProducts();
    }, []);

    const openQuantityModal = (product: any) => {
        setSelectedProduct(product);
        setQuantityInput(1);
    };

    const confirmAddToCart = () => {
        if (selectedProduct && quantityInput > 0) {
            setCart([...cart, { 
                ...selectedProduct, 
                quantity: quantityInput,
                displayPrice: selectedProduct.price * quantityInput,
                cartId: Math.random() 
            }]);
            setSelectedProduct(null);
        }
    };

    const removeFromCart = (cartId: number) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const total = cart.reduce((sum, item) => sum + item.displayPrice, 0);

    // Calculate change in real-time
    useEffect(() => {
        const tendered = parseFloat(amountTendered) || 0;
        if (tendered >= total) {
            setChange(tendered - total);
        } else {
            setChange(0);
        }
    }, [amountTendered, total]);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        const tenantId = localStorage.getItem('tenantId') || 'tenant-demo';
        const branchId = 'branch-downtown';

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenantId,
                    'x-branch-id': branchId
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }),
            });

            if (res.ok) {
                setCart([]);
                setShowPaymentModal(false);
                setAmountTendered('');
                alert(`Order Successful!\nTotal: ₱${total.toFixed(2)}\nPayment: ${paymentType}\nChange: ₱${change.toFixed(2)}`);
                // Force reload or update inventory here if needed
                window.location.reload(); 
            } else {
                const error = await res.json();
                alert(`Checkout failed: ${error.error}`);
            }
        } catch (e) {
            alert("Connection error during checkout");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 150px)', position: 'relative' }}>
            
            {/* Modal Overlay Helper */}
            {(selectedProduct || showPaymentModal) && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 100, borderRadius: '1rem'
                }}>
                    {/* Quantity Modal */}
                    {selectedProduct && (
                        <div className="card" style={{ width: '300px', textAlign: 'center' }}>
                            <h3>{selectedProduct.name}</h3>
                            <p style={{ margin: '1rem 0' }}>Enter Quantity:</p>
                            <input 
                                type="number" min="1" autoFocus
                                value={quantityInput}
                                onChange={(e) => setQuantityInput(parseInt(e.target.value) || 1)}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.5rem', textAlign: 'center', marginBottom: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setSelectedProduct(null)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={confirmAddToCart} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer' }}>Add to Order</button>
                            </div>
                        </div>
                    )}

                    {/* Payment Modal */}
                    {showPaymentModal && (
                        <div className="card" style={{ width: '400px' }}>
                            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Checkout & Payment</h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem' }}>
                                <span>Total Amount:</span>
                                <strong>₱{total.toFixed(2)}</strong>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <button 
                                        onClick={() => setPaymentType('Cash')}
                                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `2px solid ${paymentType === 'Cash' ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: paymentType === 'Cash' ? '#eff6ff' : 'white', cursor: 'pointer' }}
                                    >Cash</button>
                                    <button 
                                        onClick={() => setPaymentType('Digital')}
                                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: `2px solid ${paymentType === 'Digital' ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: paymentType === 'Digital' ? '#eff6ff' : 'white', cursor: 'pointer' }}
                                    >GCash / Card</button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Amount Tendered (₱)</label>
                                <input 
                                    type="number" autoFocus
                                    placeholder="0.00"
                                    value={amountTendered}
                                    onChange={(e) => setAmountTendered(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                />
                            </div>

                            {paymentType === 'Cash' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem' }}>
                                    <span style={{ fontWeight: 'bold', color: '#166534' }}>Change:</span>
                                    <strong style={{ fontSize: '1.25rem', color: '#166534' }}>₱{change.toFixed(2)}</strong>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: '1rem', border: '1px solid var(--border)', background: 'white', borderRadius: '0.5rem', cursor: 'pointer' }}>Back</button>
                                <button 
                                    onClick={handleCheckout}
                                    disabled={parseFloat(amountTendered) < total || isCheckingOut}
                                    style={{ flex: 1, padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', opacity: parseFloat(amountTendered) < total ? 0.5 : 1 }}
                                >
                                    {isCheckingOut ? 'Processing...' : 'Complete Sale'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Left: Product Grid & Inventory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>Menu: {DEMO_BRANCH.name}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {Array.isArray(products) && products.map(product => (
                            <div key={product.id} className="card" style={{ cursor: 'pointer', textAlign: 'center', transition: 'transform 0.1s' }} onClick={() => openQuantityModal(product)}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍔</div>
                                <strong>{product.name}</strong>
                                <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₱{product.price.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h3>Live Branch Inventory</h3>
                    <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.5rem' }}>Ingredient</th>
                                <th style={{ padding: '0.5rem' }}>Available Stock</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_INGREDIENTS.map(ing => (
                                <tr key={ing.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.5rem' }}>{ing.name}</td>
                                    <td style={{ padding: '0.5rem', fontWeight: 'bold', color: stock[ing.id] < 2 ? 'var(--danger)' : 'inherit' }}>
                                        {stock[ing.id].toFixed(2)} {ing.unit}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right: Cart */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>Current Order</h3>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
                    {cart.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>Cart is empty</p>}
                    {cart.map(item => (
                        <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                            <span>{item.name} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span></span>
                            <div>
                                <strong>₱{item.displayPrice.toFixed(2)}</strong>
                                <button onClick={() => removeFromCart(item.cartId)} style={{ marginLeft: '0.5rem', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                        <span>Total</span>
                        <span>₱{total.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => setShowPaymentModal(true)}
                        disabled={cart.length === 0}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: cart.length === 0 ? 0.6 : 1 }}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
