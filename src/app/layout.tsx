import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FoodHouse SaaS | Dashboard',
  description: 'Multi-branch management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="dashboard-container">
          <aside className="sidebar">
            <h2>FoodHouse</h2>
            <nav>
              <ul className="nav-links">
                <li><a href="/" className="nav-item">Dashboard</a></li>
                <li><a href="/pos" className="nav-item">POS Terminal</a></li>
                <li><a href="/settings/menu" className="nav-item">Menu Management</a></li>
                <li><a href="/settings/team" className="nav-item">Manage Team</a></li>
              </ul>
            </nav>
          </aside>
          
          <main className="main-content">
            <header className="header">
              <div className="breadcrumb">FoodHouse SaaS</div>
              <div className="user-profile">
                <a href="/settings/team" style={{ marginRight: '1.5rem', fontSize: '0.875rem', color: 'var(--primary)', textDecoration: 'none' }}>Manage Team</a>
                <a href="/onboarding" style={{ marginRight: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>Reset Demo</a>
              </div>
            </header>
            
            <section className="content-area">
              {children}
            </section>
          </main>
        </div>
      </body>
    </html>
  )
}
