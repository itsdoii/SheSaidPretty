const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function handleResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }

  return data
}

export async function getAvailableSlots(
  date,
  appointmentType,
  serviceType
) {
  const params = new URLSearchParams({
    date,
    appointment_type: appointmentType,
    service_type: serviceType || appointmentType,
  })

  const response = await fetch(
    `${API_BASE_URL}/availability?${params.toString()}`
  )

  return handleResponse(response)
}

export async function checkAvailability(
  reservationDate,
  reservationTime,
  appointmentType = 'nails',
  serviceType = appointmentType
) {
  const availability = await getAvailableSlots(
    reservationDate,
    appointmentType,
    serviceType
  )

  return availability.slots?.some(
    (slot) =>
      slot.time === reservationTime &&
      slot.status === 'available'
  ) || false
}

export async function createReservation(details) {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(details),
  })

  return handleResponse(response)
}
