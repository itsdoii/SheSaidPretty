import ClientBooking from './pages/ClientBooking'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin')
  return isAdminRoute ? <AdminDashboard /> : <ClientBooking />
}
