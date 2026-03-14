import { useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, Users, Kanban, TrendingUp } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/contacts', label: 'Contacts', icon: Users },
  { path: '/pipeline', label: 'Pipeline', icon: Kanban },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1><span className="icebrg">ICEBRG</span><span className="crm">CRM</span></h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        IcebrgCRM v1.0 &mdash; Sales Dashboard
      </div>
    </aside>
  )
}
