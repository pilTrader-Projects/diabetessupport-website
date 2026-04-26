'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const [sales, setSales] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        const savedTenant = localStorage.getItem('demo_tenant');
        if (savedTenant) {
            setTenant(JSON.parse(savedTenant));
        }

        // Simulation of fetching data from the API we just built
        async function fetchData() {
            const tenantId = localStorage.getItem('tenantId') || 'tenant-demo';
            try {
                const res = await fetch('/api/analytics/global-sales', {
                    headers: { 'x-tenant-id': tenantId }
                });
                const envelope = await res.json();
                if (envelope.success && envelope.data) {
                    setSales(envelope.data.totalSales || 0);
                }
            } catch (e) {
                console.error("Failed to fetch sales", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (tenant?.plan === 'basic') {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                <h2>Dashboard is a Pro Feature</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Upgrade {tenant.name} to the Pro plan to see consolidated analytics across your branches.
                </p>
                <button 
                    className="nav-item" 
                    style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '0.75rem 2rem' }}
                    onClick={() => {
                        localStorage.setItem('demo_tenant', JSON.stringify({...tenant, plan: 'pro'}));
                        window.location.reload();
                    }}
                >
                    Upgrade to Pro Now
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1>Welcome back, {tenant?.name || 'Store Owner'}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Here is what's happening across your business.</p>
            </div>
            
            <div className="stats-grid">
                <div className="card">
                    <h3>Total Global Sales</h3>
                    <div className="value">
                        {loading ? '...' : `₱${sales.toLocaleString()}`}
                    </div>
                </div>
                <div className="card">
                    <h3>Active Branches</h3>
                    <div className="value">4</div>
                </div>
                <div className="card">
                    <h3>Inventory Health</h3>
                    <div className="value" style={{ color: 'var(--danger)' }}>3 Alerts</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <h3>Branch Performance</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Branch Downtown</span>
                            <strong>₱2,450.00</strong>
                        </div>
                        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Branch Uptown</span>
                            <strong>₱1,820.00</strong>
                        </div>
                        <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Branch Suburbs</span>
                            <strong>₱730.00</strong>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3>Critical Stock Alerts</h3>
                    <div className="critical-alert">
                        <strong>Beef Patty</strong>
                        <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>5 units left in Branch Downtown</p>
                    </div>
                    <div className="critical-alert">
                        <strong>Whole Milk</strong>
                        <p style={{ fontSize: '0.875rem', color: '#7f1d1d' }}>2L left in Branch Uptown</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
