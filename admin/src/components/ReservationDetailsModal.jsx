import { X, Save, Loader } from 'lucide-react'
import { useState } from 'react'

export default function ReservationDetailsModal({
  reservation,
  onClose,
  onUpdate,
}) {
  const [status, setStatus] = useState(reservation.status)
  const [notes, setNotes] = useState(
    reservation.admin_notes || ''
  )

  const [isUpdating, setIsUpdating] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')

  let serviceLabel = '💅 Nails'

  if (reservation.service_type === 'nail_removal') {
    serviceLabel = '✨ Nail Removal'
  } else if (
    reservation.appointment_type === 'lashes'
  ) {
    serviceLabel = '👁 Lashes'
  }

  const handleUpdateStatus = async () => {
    setIsUpdating(true)
    setUpdateMessage('')

    try {
      await onUpdate(
        reservation.id,
        {
          status,
          admin_notes: notes,
        }
      )

      setUpdateMessage(
        '✓ Reservation updated successfully'
      )

      setTimeout(() => {
        setUpdateMessage('')
      }, 3000)
    } catch (error) {
      setUpdateMessage(
        '✗ Failed to update reservation'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modal-header">
          <h2>Reservation Details</h2>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close reservation details"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="details-section">
            <h3>Customer Information</h3>

            <div className="detail-row">
              <label>Name</label>
              <p>
                {reservation.customer_name}
              </p>
            </div>

            <div className="detail-row">
              <label>
                Social Media
              </label>

              <p>
                {reservation.social_media_name}
              </p>
            </div>
          </div>

          <div className="details-section">
            <h3>Reservation Information</h3>

            <div className="detail-row">
              <label>Service</label>
              <p>{serviceLabel}</p>
            </div>

            <div className="detail-row">
              <label>Date</label>
              <p>
                {reservation.reservation_date}
              </p>
            </div>

            <div className="detail-row">
              <label>Time</label>
              <p>
                {reservation.reservation_time}
              </p>
            </div>

            <div className="detail-row">
              <label>Duration</label>

              <p>
                {reservation.duration_minutes}{' '}
                minutes
              </p>
            </div>

            <div className="detail-row">
              <label>Reservation ID</label>

              <p className="id-text">
                {reservation.id}
              </p>
            </div>

            <div className="detail-row">
              <label>Created</label>

              <p>
                {new Date(
                  reservation.created_at
                ).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </p>
            </div>
          </div>

          <div className="details-section">
            <h3>Status Management</h3>

            <div className="detail-row">
              <label>Status</label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
                className="status-select"
                disabled={isUpdating}
              >
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
          </div>

          <div className="details-section">
            <h3>Admin Notes</h3>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Add internal notes about this reservation..."
              className="notes-textarea"
              disabled={isUpdating}
              rows={4}
            />
          </div>

          {updateMessage && (
            <div
              className={`update-message ${
                updateMessage.includes('✓')
                  ? 'success'
                  : 'error'
              }`}
            >
              {updateMessage}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
            disabled={isUpdating}
          >
            Close
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleUpdateStatus}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader
                  size={16}
                  style={{
                    animation:
                      'spin 1s linear infinite',
                  }}
                />

                Updating...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}