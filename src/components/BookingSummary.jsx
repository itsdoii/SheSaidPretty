import { formatLongDate } from '../utils/dateUtils'

export default function BookingSummary({
  appointmentType,
  serviceType,
  selectedDate,
  selectedTime,
}) {
  let typeLabel = '💅 Nails'
  let durationLabel = '2 HOURS'

  if (serviceType === 'nail_removal') {
    typeLabel = '✨ Nail Removal'
    durationLabel = '1 HOUR'
  } else if (appointmentType === 'lashes') {
    typeLabel = '👁 Lashes'
    durationLabel = '2 HOURS'
  }

  return (
    <aside
      className="summary-card"
      aria-label="Booking summary"
    >
      <div>
        <p className="eyebrow">
          YOUR RESERVATION
        </p>

        <h2>Details at a glance</h2>
      </div>

      <dl>
        <div>
          <dt>SERVICE</dt>
          <dd>{typeLabel}</dd>
        </div>

        <div>
          <dt>DATE</dt>
          <dd>
            {selectedDate
              ? formatLongDate(selectedDate)
              : 'Choose a date'}
          </dd>
        </div>

        <div>
          <dt>TIME</dt>
          <dd>
            {selectedTime || 'Choose a time'}
          </dd>
        </div>

        <div>
          <dt>DURATION</dt>
          <dd>{durationLabel}</dd>
        </div>
      </dl>
    </aside>
  )
}