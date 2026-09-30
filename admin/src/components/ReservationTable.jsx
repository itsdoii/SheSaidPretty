import { ChevronRight, Trash2 } from 'lucide-react'

const statusColors = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  cancelled: 'status-cancelled',
  completed: 'status-completed',
}

export default function ReservationTable({
  reservations,
  onSelectReservation,
  onDeleteReservation,
}) {
  if (reservations.length === 0) {
    return (
      <div className="table-empty-state">
        <p>No reservations found</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      <table className="reservations-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Social Media</th>
            <th>Service</th>
            <th>Date</th>
            <th>Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {reservations.map((reservation) => {
            const createdDate = new Date(
              reservation.created_at
            )

            const formattedCreated =
              createdDate.toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )

            // Determine the actual service
            let serviceLabel = '💅 Nails'
            let serviceClass = 'nails'

            if (
              reservation.service_type ===
              'nail_removal'
            ) {
              serviceLabel = '✨ Nail Removal'
              serviceClass = 'nail-removal'
            } else if (
              reservation.appointment_type ===
              'lashes'
            ) {
              serviceLabel = '👁 Lashes'
              serviceClass = 'lashes'
            }

            return (
              <tr
                key={reservation.id}
                className="table-row"
              >
                <td className="cell-name">
                  {reservation.customer_name}
                </td>

                <td className="cell-social">
                  {reservation.social_media_name}
                </td>

                <td>
                  <span
                    className={`appointment-type-badge ${serviceClass}`}
                  >
                    {serviceLabel}
                  </span>
                </td>

                <td className="cell-date">
                  {reservation.reservation_date}
                </td>

                <td className="cell-time">
                  {reservation.reservation_time}
                </td>

                <td className="cell-duration">
                  {reservation.duration_minutes} min
                </td>

                <td className="cell-status">
                  <span
                    className={`status-badge ${
                      statusColors[
                        reservation.status
                      ] || ''
                    }`}
                  >
                    {reservation.status}
                  </span>
                </td>

                <td className="cell-created">
                  <span className="created-time">
                    {formattedCreated}
                  </span>
                </td>

                <td className="cell-actions">
                  <button
                    type="button"
                    className="action-button view-button"
                    onClick={() =>
                      onSelectReservation(
                        reservation
                      )
                    }
                    title="View details"
                    aria-label="View reservation details"
                  >
                    <ChevronRight size={18} />
                  </button>

                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() =>
                      onDeleteReservation(
                        reservation.id
                      )
                    }
                    title="Delete reservation"
                    aria-label="Delete reservation"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}