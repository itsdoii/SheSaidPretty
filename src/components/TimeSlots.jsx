import {
  Check,
  Clock,
} from 'lucide-react'

export default function TimeSlots({
  selectedDate,
  selectedTime,
  slots,
  isLoading,
  onTimeChange,
  serviceType,
}) {
  const durationLabel =
    serviceType === 'nail_removal'
      ? '60 minute appointment'
      : '2 hour appointment'

  return (
    <section
      className="times-section"
      aria-labelledby="times-title"
    >
      <div className="section-heading-row">
        <div>
          <p
            className="eyebrow"
            id="times-title"
          >
            AVAILABLE TIMES
          </p>

          <h2>Find your moment</h2>
        </div>

        <span className="duration-note">
          <Clock size={15} />
          {durationLabel}
        </span>
      </div>

      {!selectedDate ? (
        <p className="quiet-note">
          Select a date to see appointment times.
        </p>
      ) : isLoading ? (
        <p className="quiet-note">
          Loading available times...
        </p>
      ) : slots.length === 0 ? (
        <p className="quiet-note">
          No appointment times are available for this date.
        </p>
      ) : (
        <div className="time-grid">
          {slots.map((slot) => {
            const isSelected =
              selectedTime === slot.time

            const isUnavailable =
              slot.status !== 'available'

            return (
              <button
                key={slot.time}
                type="button"
                className={`time-slot ${
                  isSelected
                    ? 'selected'
                    : ''
                }`}
                disabled={isUnavailable}
                onClick={() =>
                  onTimeChange(slot.time)
                }
                aria-pressed={isSelected}
              >
                <span>{slot.time}</span>

                {slot.status === 'booked' ? (
                  <small>BOOKED</small>
                ) : slot.status === 'blocked' ? (
                  <small>UNAVAILABLE</small>
                ) : isSelected ? (
                  <Check size={16} />
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}