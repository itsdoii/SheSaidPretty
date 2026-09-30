import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

import ReservationTable from './ReservationTable'
import ReservationDetailsModal from './ReservationDetailsModal'

import {
  getReservations,
  updateReservation,
  deleteReservation,
} from '../services/reservationService'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [selectedReservation, setSelectedReservation] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterServiceType, setFilterServiceType] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')

  useEffect(() => {
    loadReservations()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    reservations,
    searchTerm,
    filterStatus,
    filterServiceType,
    filterDate,
    sortBy,
  ])

  const loadReservations = async () => {
    try {
      setIsLoading(true)
      setError('')

      const data = await getReservations()

      setReservations(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load reservations')
    } finally {
      setIsLoading(false)
    }
  }

  const getReservationService = (reservation) => {
    if (reservation.service_type === 'nail_removal') {
      return 'nail_removal'
    }

    if (reservation.appointment_type === 'lashes') {
      return 'lashes'
    }

    return 'nails'
  }

  const applyFilters = () => {
    let filtered = [...reservations]

    // ----------------------------------
    // SEARCH
    // ----------------------------------

    if (searchTerm) {
      const term = searchTerm.toLowerCase()

      filtered = filtered.filter((reservation) => {
        const customerName =
          reservation.customer_name?.toLowerCase() || ''

        const socialMedia =
          reservation.social_media_name?.toLowerCase() || ''

        const id =
          reservation.id?.toLowerCase() || ''

        return (
          customerName.includes(term) ||
          socialMedia.includes(term) ||
          id.includes(term)
        )
      })
    }

    // ----------------------------------
    // STATUS
    // ----------------------------------

    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (reservation) =>
          reservation.status === filterStatus
      )
    }

    // ----------------------------------
    // SERVICE
    // ----------------------------------

    if (filterServiceType !== 'all') {
      filtered = filtered.filter(
        (reservation) =>
          getReservationService(reservation) ===
          filterServiceType
      )
    }

    // ----------------------------------
    // DATE
    // ----------------------------------

    if (filterDate) {
      filtered = filtered.filter(
        (reservation) =>
          reservation.reservation_date === filterDate
      )
    }

    // ----------------------------------
    // SORTING
    // ----------------------------------

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return (
            new Date(a.reservation_date) -
            new Date(b.reservation_date)
          )

        case 'date-desc':
          return (
            new Date(b.reservation_date) -
            new Date(a.reservation_date)
          )

        case 'created-newest':
          return (
            new Date(b.created_at) -
            new Date(a.created_at)
          )

        case 'created-oldest':
          return (
            new Date(a.created_at) -
            new Date(b.created_at)
          )

        case 'name-asc':
          return a.customer_name.localeCompare(
            b.customer_name
          )

        case 'name-desc':
          return b.customer_name.localeCompare(
            a.customer_name
          )

        default:
          return 0
      }
    })

    setFilteredReservations(filtered)
  }

  const handleUpdateReservation = async (
    id,
    updates
  ) => {
    try {
      await updateReservation(id, updates)

      const updated = await getReservations()

      setReservations(updated)
      setSelectedReservation(null)
    } catch (err) {
      console.error(err)

      throw new Error(
        'Failed to update reservation'
      )
    }
  }

  const handleDeleteReservation = async (id) => {
    const shouldDelete = window.confirm(
      'Are you sure you want to permanently delete this reservation?'
    )

    if (!shouldDelete) return

    try {
      await deleteReservation(id)

      const updated = await getReservations()

      setReservations(updated)

      if (selectedReservation?.id === id) {
        setSelectedReservation(null)
      }
    } catch (err) {
      console.error('Delete error:', err)

      setError(
        'Failed to delete reservation'
      )
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterServiceType('all')
    setFilterDate('')
    setSortBy('date-desc')
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Reservations Management</h2>

        <p>
          View and manage all customer reservations
        </p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by name, social media, or ID..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Status</label>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value)
              }
            >
              <option value="all">
                All Statuses
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Service</label>

            <div
              className="appointment-type-filter"
              role="group"
              aria-label="Filter by service"
            >
              <button
                type="button"
                className={
                  filterServiceType === 'all'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setFilterServiceType('all')
                }
              >
                ALL
              </button>

              <button
                type="button"
                className={
                  filterServiceType === 'nails'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setFilterServiceType('nails')
                }
              >
                💅 NAILS
              </button>

              <button
                type="button"
                className={
                  filterServiceType === 'lashes'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setFilterServiceType('lashes')
                }
              >
                👁 LASHES
              </button>

              <button
                type="button"
                className={
                  filterServiceType ===
                  'nail_removal'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setFilterServiceType(
                    'nail_removal'
                  )
                }
              >
                ✨ NAIL REMOVAL
              </button>
            </div>
          </div>

          <div className="filter-group">
            <label>Date</label>

            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(e.target.value)
              }
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="date-desc">
                Date (Newest)
              </option>

              <option value="date-asc">
                Date (Oldest)
              </option>

              <option value="created-newest">
                Created (Newest)
              </option>

              <option value="created-oldest">
                Created (Oldest)
              </option>

              <option value="name-asc">
                Name (A-Z)
              </option>

              <option value="name-desc">
                Name (Z-A)
              </option>
            </select>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <p>Loading reservations...</p>
        </div>
      ) : (
        <>
          <div className="results-info">
            <p>
              Showing{' '}
              <strong>
                {filteredReservations.length}
              </strong>{' '}
              of{' '}
              <strong>
                {reservations.length}
              </strong>{' '}
              reservations
            </p>
          </div>

          <ReservationTable
            reservations={
              filteredReservations
            }
            onSelectReservation={
              setSelectedReservation
            }
            onDeleteReservation={
              handleDeleteReservation
            }
          />
        </>
      )}

      {selectedReservation && (
        <ReservationDetailsModal
          reservation={
            selectedReservation
          }
          onClose={() =>
            setSelectedReservation(null)
          }
          onUpdate={
            handleUpdateReservation
          }
        />
      )}
    </div>
  )
}