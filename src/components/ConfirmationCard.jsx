import { Check } from 'lucide-react'
import { formatLongDate } from '../utils/dateUtils'

export default function ConfirmationCard({
  reservation,
  onReset,
}) {
  const serviceLabel =
    reservation.service_type === 'nail_removal'
      ? '✨ Nail Removal'
      : reservation.appointment_type === 'lashes'
        ? '👁 Lashes'
        : '💅 Nails'

  const durationMinutes =
    Number(reservation.duration_minutes) || 0

  const durationLabel =
    durationMinutes === 60
      ? '1 HOUR'
      : durationMinutes === 120
        ? '2 HOURS'
        : `${durationMinutes} MINUTES`

  return (
    <section
      className="confirmation-card"
      aria-live="polite"
    >
      <div className="confirmation-mark">
        <Check size={25} />
      </div>

      <p className="eyebrow">
        RESERVATION CONFIRMED
      </p>

      <h1>You&apos;re Booked.</h1>

      <p>
        Thank you, {reservation.customer_name}.
        Your She Said Pretty appointment has
        been reserved.
      </p>

      <dl className="confirmation-details">
        <div>
          <dt>SERVICE</dt>
          <dd>{serviceLabel}</dd>
        </div>

        <div>
          <dt>DATE</dt>
          <dd>
            {formatLongDate(
              reservation.reservation_date
            )}
          </dd>
        </div>

        <div>
          <dt>TIME</dt>
          <dd>{reservation.reservation_time}</dd>
        </div>

        <div>
          <dt>DURATION</dt>
          <dd>{durationLabel}</dd>
        </div>

        <div>
          <dt>SOCIAL MEDIA</dt>
          <dd>{reservation.social_media_name}</dd>
        </div>
      </dl>

      <button
        className="secondary-button"
        onClick={onReset}
      >
        BOOK ANOTHER APPOINTMENT
        <span aria-hidden="true">↗</span>
      </button>
    </section>
  )
}