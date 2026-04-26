'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('Cashier');

    useEffect(() => {
        const saved = localStorage.getItem('demo_employees');
        if (saved) {
            setEmployees(JSON.parse(saved));
        } else {
            const initial = [
                { id: 1, name: 'Admin User', email: 'admin@foodhouse.com', role: 'Owner' }
            ];
            setEmployees(initial);
            localStorage.setItem('demo_employees', JSON.stringify(initial));
        }
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const newEmp = { id: Date.now(), name, email, role };
        const updated = [...employees, newEmp];
        setEmployees(updated);
        localStorage.setItem('demo_employees', JSON.stringify(updated));
        setName('');
        setEmail('');
    };

    return (
        <div style={{ maxWidth: '800px' }}>
            <h1>Team Management</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Invite employees and assign roles to your business.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div className="card">
                    <h3>Current Employees</h3>
                    <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem' }}>Name</th>
                                <th style={{ padding: '0.75rem' }}>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem' }}>
                                        <strong>{emp.name}</strong>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.5rem', 
                                            borderRadius: '1rem', 
                                            fontSize: '0.75rem', 
                                            backgroundColor: emp.role === 'Owner' ? '#fef3c7' : '#f1f5f9',
                                            color: emp.role === 'Owner' ? '#92400e' : '#475569'
                                        }}>
                                            {emp.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Add Employee</h3>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        <input 
                            required
                            placeholder="Full Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}
                        />
                        <input 
                            required
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}
                        />
                        <select 
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid var(--border)' }}
                        >
                            <option>Cashier</option>
                            <option>Manager</option>
                            <option>Accountant</option>
                            <option>Owner</option>
                        </select>
                        <button 
                            type="submit"
                            style={{ padding: '0.75rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.4rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Invite Member
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
