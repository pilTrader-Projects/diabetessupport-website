'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const [businessName, setBusinessName] = useState('');
    const [plan, setPlan] = useState('basic');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: businessName, plan }),
            });

            const data = await res.json();
            
            if (res.ok) {
                // Store tenant ID in localStorage for demo session tracking
                localStorage.setItem('tenantId', data.tenantId);
                router.push('/');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (e) {
            console.error("Signup failed", e);
            alert("Connection error. Is the server running?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '100px auto', padding: '2rem' }} className="card">
            <h1 style={{ marginBottom: '0.5rem' }}>Welcome to FoodHouse</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Set up your food business SaaS in seconds.</p>

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Business Name</label>
                    <input 
                        required
                        type="text" 
                        value={businessName} 
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Mario's Pizza"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Choose Your Plan</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div 
                            onClick={() => setPlan('basic')}
                            style={{ 
                                padding: '1rem', 
                                border: `2px solid ${plan === 'basic' ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                backgroundColor: plan === 'basic' ? '#eff6ff' : 'white'
                            }}
                        >
                            <strong>Basic</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1 Branch, POS, Inventory</p>
                        </div>
                        <div 
                            onClick={() => setPlan('pro')}
                            style={{ 
                                padding: '1rem', 
                                border: `2px solid ${plan === 'pro' ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                backgroundColor: plan === 'pro' ? '#eff6ff' : 'white'
                            }}
                        >
                            <strong>Pro</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unlimited Branches, Dashboard</p>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading || !businessName}
                    style={{ 
                        padding: '1rem', 
                        backgroundColor: 'var(--primary)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '0.5rem', 
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        opacity: isLoading ? 0.7 : 1
                    }}
                >
                    {isLoading ? 'Creating Business...' : 'Launch My SaaS'}
                </button>
            </form>
        </div>
    );
}
