import { useEffect, useState } from 'react'
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  RefreshCw,
} from 'lucide-react'

import { getReservations } from '../services/reservationService'

export default function AdminDashboardContent() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointmentType, setAppointmentType] = useState('all')

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getReservations()

      setReservations(data || [])
    } catch (err) {
      console.error('Error loading reservations:', err)
      setError('Failed to load reservations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const today = new Date().toISOString().split('T')[0]

  // -----------------------------------------
  // SERVICE HELPERS
  // -----------------------------------------

  function getServiceType(reservation) {
    if (reservation.service_type === 'nail_removal') {
      return 'nail_removal'
    }

    return reservation.appointment_type || 'nails'
  }

  function getServiceLabel(reservation) {
    const serviceType = getServiceType(reservation)

    if (serviceType === 'nail_removal') {
      return '✨ Nail Removal'
    }

    if (serviceType === 'lashes') {
      return '👁 Lashes'
    }

    return '💅 Nails'
  }

  function getServiceClass(reservation) {
    const serviceType = getServiceType(reservation)

    if (serviceType === 'nail_removal') {
      return 'nail-removal'
    }

    return serviceType
  }

  // -----------------------------------------
  // DASHBOARD FILTER
  // -----------------------------------------

  const filteredReservations =
    appointmentType === 'all'
      ? reservations
      : reservations.filter(
          (reservation) =>
            getServiceType(reservation) === appointmentType
        )

  // -----------------------------------------
  // DASHBOARD DATA
  // -----------------------------------------

  const todayReservations = filteredReservations.filter(
    (reservation) =>
      reservation.reservation_date === today &&
      reservation.status !== 'cancelled'
  )

  const upcomingReservations = filteredReservations.filter(
    (reservation) =>
      reservation.reservation_date >= today &&
      reservation.status !== 'cancelled'
  )

  const pendingReservations = filteredReservations.filter(
    (reservation) => reservation.status === 'pending'
  )

  const confirmedReservations = filteredReservations.filter(
    (reservation) => reservation.status === 'confirmed'
  )

  const completedReservations = filteredReservations.filter(
    (reservation) => reservation.status === 'completed'
  )

  const cancelledReservations = filteredReservations.filter(
    (reservation) => reservation.status === 'cancelled'
  )

  const recentReservations = [...filteredReservations]
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    )
    .slice(0, 5)

  return (
    <div className="admin-page">
      {/* HEADER */}

      <div className="admin-page-header">
        <h2>Dashboard</h2>

        <p>
          Overview of your reservations and appointments.
        </p>
      </div>

      {/* SERVICE FILTER */}

      <div
        className="appointment-type-toggle"
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          className={`secondary-button ${
            appointmentType === 'all' ? 'active' : ''
          }`}
          onClick={() => setAppointmentType('all')}
          style={{
            fontWeight:
              appointmentType === 'all' ? 700 : 500,
            opacity:
              appointmentType === 'all' ? 1 : 0.65,
          }}
        >
          All
        </button>

        <button
          type="button"
          className={`secondary-button ${
            appointmentType === 'nails' ? 'active' : ''
          }`}
          onClick={() => setAppointmentType('nails')}
          style={{
            fontWeight:
              appointmentType === 'nails' ? 700 : 500,
            opacity:
              appointmentType === 'nails' ? 1 : 0.65,
          }}
        >
          💅 Nails
        </button>

        <button
          type="button"
          className={`secondary-button ${
            appointmentType === 'lashes' ? 'active' : ''
          }`}
          onClick={() => setAppointmentType('lashes')}
          style={{
            fontWeight:
              appointmentType === 'lashes' ? 700 : 500,
            opacity:
              appointmentType === 'lashes' ? 1 : 0.65,
          }}
        >
          👁 Lashes
        </button>

        <button
          type="button"
          className={`secondary-button ${
            appointmentType === 'nail_removal'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setAppointmentType('nail_removal')
          }
          style={{
            fontWeight:
              appointmentType === 'nail_removal'
                ? 700
                : 500,
            opacity:
              appointmentType === 'nail_removal'
                ? 1
                : 0.65,
          }}
        >
          ✨ Nail Removal
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>

          <div className="stat-content">
            <p className="stat-label">
              Today's Reservations
            </p>

            <p className="stat-value">
              {loading ? '—' : todayReservations.length}
            </p>
          </div>
        </div>

        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <Clock size={24} />
          </div>

          <div className="stat-content">
            <p className="stat-label">
              Upcoming
            </p>

            <p className="stat-value">
              {loading ? '—' : upcomingReservations.length}
            </p>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">
            <AlertCircle size={24} />
          </div>

          <div className="stat-content">
            <p className="stat-label">
              Pending
            </p>

            <p className="stat-value">
              {loading ? '—' : pendingReservations.length}
            </p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>

          <div className="stat-content">
            <p className="stat-label">
              Confirmed
            </p>

            <p className="stat-value">
              {loading ? '—' : confirmedReservations.length}
            </p>
          </div>
        </div>

        <div className="stat-card stat-red">
          <div className="stat-icon">
            <Users size={24} />
          </div>

          <div className="stat-content">
            <p className="stat-label">
              Total Reservations
            </p>

            <p className="stat-value">
              {loading ? '—' : filteredReservations.length}
            </p>
          </div>
        </div>
      </div>

      {/* DASHBOARD CARDS */}

      <div className="dashboard-grid">
        {/* TODAY */}

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <Calendar size={18} />
              Today's Appointments
            </h3>

            <span className="card-count">
              {todayReservations.length}
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <p className="loading-text">
                Loading appointments...
              </p>
            ) : todayReservations.length === 0 ? (
              <p className="empty-text">
                No appointments scheduled for today.
              </p>
            ) : (
              todayReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="reservation-preview"
                >
                  <div>
                    <strong>
                      {reservation.customer_name}
                    </strong>

                    <span>
                      <span
                        className={`appointment-type-badge ${getServiceClass(
                          reservation
                        )}`}
                      >
                        {getServiceLabel(reservation)}
                      </span>{' '}
                      {reservation.reservation_time}
                    </span>
                  </div>

                  <span
                    className={`status-badge status-${reservation.status}`}
                  >
                    {reservation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* PENDING */}

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <AlertCircle size={18} />
              Pending Reservations
            </h3>

            <span className="card-count">
              {pendingReservations.length}
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <p className="loading-text">
                Loading reservations...
              </p>
            ) : pendingReservations.length === 0 ? (
              <p className="empty-text">
                No pending reservations.
              </p>
            ) : (
              pendingReservations
                .slice(0, 5)
                .map((reservation) => (
                  <div
                    key={reservation.id}
                    className="reservation-preview"
                  >
                    <div>
                      <strong>
                        {reservation.customer_name}
                      </strong>

                      <span>
                        {getServiceLabel(reservation)}
                        {' • '}
                        {reservation.reservation_date}
                        {' • '}
                        {reservation.reservation_time}
                      </span>
                    </div>

                    <span className="status-badge status-pending">
                      Pending
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* RECENT */}

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <Clock size={18} />
              Recent Reservations
            </h3>

            <span className="card-count">
              {recentReservations.length}
            </span>
          </div>

          <div className="card-body">
            {loading ? (
              <p className="loading-text">
                Loading recent reservations...
              </p>
            ) : recentReservations.length === 0 ? (
              <p className="empty-text">
                No reservations yet.
              </p>
            ) : (
              recentReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="reservation-preview"
                >
                  <div>
                    <strong>
                      {reservation.customer_name}
                    </strong>

                    <span>
                      {reservation.reservation_date}
                      {' • '}
                      {reservation.reservation_time}
                      {' • '}
                      {getServiceLabel(reservation)}
                    </span>
                  </div>

                  <span
                    className={`status-badge status-${reservation.status}`}
                  >
                    {reservation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SUMMARY */}

        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <Users size={18} />
              Reservation Summary
            </h3>
          </div>

          <div className="card-body">
            <div className="summary-row">
              <span>Confirmed</span>
              <strong>
                {confirmedReservations.length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Pending</span>
              <strong>
                {pendingReservations.length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Completed</span>
              <strong>
                {completedReservations.length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Cancelled</span>
              <strong>
                {cancelledReservations.length}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* REFRESH */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          className="secondary-button"
          onClick={loadReservations}
          disabled={loading}
        >
          <RefreshCw size={16} />

          {loading
            ? 'Refreshing...'
            : 'Refresh Dashboard'}
        </button>
      </div>
    </div>
  )
}