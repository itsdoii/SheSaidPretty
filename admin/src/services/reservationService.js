import { supabase } from '../lib/supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function adminRequest(path, options = {}) {
  const { data, error } = await supabase.auth.getSession()
  const accessToken = data.session?.access_token

  if (error || !accessToken) {
    throw new Error('Please log in again to continue.')
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

// Helper function to handle API responses
async function handleResponse(response) {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }
  return data
}

export async function getReservations() {
  try {
    const response = await adminRequest('/reservations')
    return await handleResponse(response)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    throw error
  }
}

export async function getReservationById(id) {
  try {
    const response = await adminRequest(`/reservations/${id}`)
    return await handleResponse(response)
  } catch (error) {
    console.error(`Error fetching reservation ${id}:`, error)
    throw error
  }
}

export async function checkAvailability(reservationDate, reservationTime, appointmentType = 'nails') {
  try {
    const reservations = await getReservations()
    return !reservations.some(
      (reservation) =>
        (reservation.appointment_type || 'nails') === appointmentType &&
        reservation.reservation_date === reservationDate &&
        reservation.reservation_time === reservationTime &&
        reservation.status !== 'cancelled'
    )
  } catch (error) {
    console.error('Error checking availability:', error)
    throw error
  }
}

export async function createReservation(details) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(details),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error creating reservation:', error)
    throw error
  }
}

export async function updateReservation(id, updates) {
  try {
    const response = await adminRequest(`/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error updating reservation:', error)
    throw error
  }
}

export async function cancelReservation(id) {
  try {
    return await updateReservation(id, { status: 'cancelled' })
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    throw error
  }
}

export async function deleteReservation(id) {
  try {
    const response = await adminRequest(`/reservations/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return await handleResponse(response)
  } catch (error) {
    console.error('Error deleting reservation:', error)
    throw error
  }
}

// Admin functions
export async function getReservationsByDate(date) {
  try {
    const reservations = await getReservations()
    return reservations.filter((r) => r.reservation_date === date)
  } catch (error) {
    console.error('Error fetching reservations by date:', error)
    throw error
  }
}

export async function getReservationsByStatus(status) {
  try {
    const reservations = await getReservations()
    return reservations.filter((r) => r.status === status)
  } catch (error) {
    console.error('Error fetching reservations by status:', error)
    throw error
  }
}

export async function getReservationsSince(date) {
  try {
    const reservations = await getReservations()
    return reservations.filter((r) => new Date(r.created_at) >= new Date(date))
  } catch (error) {
    console.error('Error fetching recent reservations:', error)
    throw error
  }
}

export async function getTodayReservations() {
  try {
    const today = new Date().toISOString().split('T')[0]
    return await getReservationsByDate(today)
  } catch (error) {
    console.error('Error fetching today reservations:', error)
    throw error
  }
}

export async function getUpcomingReservations() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const reservations = await getReservations()
    return reservations.filter((r) => r.reservation_date >= today && r.status !== 'cancelled')
  } catch (error) {
    console.error('Error fetching upcoming reservations:', error)
    throw error
  }
}

export async function getReservationStats() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const reservations = await getReservations()
    const todayReservations = reservations.filter(
      (r) => r.reservation_date === today && r.status !== 'cancelled'
    )
    const upcomingReservations = reservations.filter(
      (r) => r.reservation_date >= today && r.status !== 'cancelled'
    )
    const pendingReservations = reservations.filter((r) => r.status === 'pending')
    const confirmedReservations = reservations.filter((r) => r.status === 'confirmed')
    const completedReservations = reservations.filter((r) => r.status === 'completed')
    const cancelledReservations = reservations.filter((r) => r.status === 'cancelled')

    return {
      todayCount: todayReservations.length,
      upcomingCount: upcomingReservations.length,
      pendingCount: pendingReservations.length,
      confirmedCount: confirmedReservations.length,
      completedCount: completedReservations.length,
      cancelledCount: cancelledReservations.length,
      totalCount: reservations.length,
    }
  } catch (error) {
    console.error('Error fetching reservation stats:', error)
    throw error
  } 
}
export async function getWeeklySchedule(
  appointmentType,
  dayOfWeek
) {
  try {
    const response = await adminRequest(
      `/schedule/weekly?appointment_type=${encodeURIComponent(
        appointmentType
      )}&day_of_week=${encodeURIComponent(dayOfWeek)}`
    )

    return await handleResponse(response)
  } catch (error) {
    console.error(
      'Error fetching weekly schedule:',
      error
    )

    throw error
  }
}

export async function saveWeeklySchedule(details) {
  try {
    const response = await adminRequest(
      '/schedule/weekly',
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(details),
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error(
      'Error saving weekly schedule:',
      error
    )

    throw error
  }
}

export async function getDateSchedule(
  date,
  appointmentType
) {
  try {
    const response = await adminRequest(
      `/schedule/date?date=${encodeURIComponent(
        date
      )}&appointment_type=${encodeURIComponent(
        appointmentType
      )}`
    )

    return await handleResponse(response)
  } catch (error) {
    console.error(
      'Error fetching date schedule:',
      error
    )

    throw error
  }
}

export async function saveDateSchedule(details) {
  try {
    const response = await adminRequest(
      '/schedule/date',
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(details),
      }
    )

    return await handleResponse(response)
  } catch (error) {
    console.error(
      'Error saving date schedule:',
      error
    )

    throw error
  }
}

export async function getAvailableSlots(
  date,
  appointmentType,
  serviceType
) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/availability?date=${encodeURIComponent(
        date
      )}&appointment_type=${encodeURIComponent(
        appointmentType
      )}&service_type=${encodeURIComponent(
        serviceType
      )}`
    )

    return await handleResponse(response)
  } catch (error) {
    console.error(
      'Error fetching available slots:',
      error
    )

    throw error
  }
}