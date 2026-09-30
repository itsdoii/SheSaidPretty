import { useState, useEffect } from 'react'
import AdminLayout from '../components/AdminLayout'
import AdminAuthLogin from '../components/AdminAuthLogin'
import AdminDashboardContent from '../components/AdminDashboardContent'
import AdminReservations from '../components/AdminReservations'
import AdminSchedule from '../components/AdminSchedule'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (isMounted && !error) {
        setCurrentUser(data.session?.user || null)
      }
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user || null)
      })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  if (!currentUser) {
    return <AdminAuthLogin onLogin={handleLogin} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardContent />

      case 'reservations':
        return <AdminReservations />

      case 'schedule':
        return <AdminSchedule />

      case 'customers':
        return (
          <div className="admin-page">
            <div className="admin-page-header">
              <h2>Customers</h2>
              <p>Customer management coming soon</p>
            </div>

            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--muted)',
              }}
            >
              Customer management features will be available in a future update.
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="admin-page">
            <div className="admin-page-header">
              <h2>Settings</h2>
              <p>Admin settings coming soon</p>
            </div>

            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--muted)',
              }}
            >
              Settings management will be available in a future update.
            </div>
          </div>
        )

      default:
        return <AdminDashboardContent />
    }
  }

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AdminLayout>
  )
}