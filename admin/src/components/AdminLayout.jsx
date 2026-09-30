import {
  BarChart3,
  Calendar,
  CalendarClock,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'

import '../styles/admin.css'

export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}) {
  const navigation = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: Calendar,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: CalendarClock,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-header">
          <div className="admin-brand">
            <h1>Admin</h1>
            <p>She Said Pretty</p>
          </div>
        </div>

        <nav className="admin-nav">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                currentPage === item.id ? 'active' : ''
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon size={20} />

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}