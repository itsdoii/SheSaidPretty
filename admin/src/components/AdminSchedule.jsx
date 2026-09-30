import { useEffect, useState } from 'react'
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Ban,
  RotateCcw,
} from 'lucide-react'

import {
  getWeeklySchedule,
  saveWeeklySchedule,
  getDateSchedule,
  saveDateSchedule,
} from '../services/reservationService'

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function AdminSchedule() {
  const [view, setView] = useState('weekly')
  const [appointmentType, setAppointmentType] = useState('nails')

  const [dayOfWeek, setDayOfWeek] = useState(1)
  const [weeklySlots, setWeeklySlots] = useState([])
  const [newWeeklyTime, setNewWeeklyTime] = useState('')

  const [selectedDate, setSelectedDate] = useState('')
  const [dateMode, setDateMode] = useState('weekly')
  const [dateSlots, setDateSlots] = useState([])
  const [newDateTime, setNewDateTime] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (view === 'weekly') {
      loadWeekly()
    }
  }, [view, appointmentType, dayOfWeek])

  useEffect(() => {
    if (view === 'special' && selectedDate) {
      loadDate()
    }
  }, [view, appointmentType, selectedDate])

  async function loadWeekly() {
    try {
      setLoading(true)

      const data = await getWeeklySchedule(
        appointmentType,
        dayOfWeek
      )

      setWeeklySlots(data.slots || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadDate() {
    try {
      setLoading(true)

      const data = await getDateSchedule(
        selectedDate,
        appointmentType
      )

      setDateMode(data.mode || 'weekly')
      setDateSlots(data.slots || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function addWeeklyTime() {
    if (!newWeeklyTime) return

    if (!weeklySlots.includes(newWeeklyTime)) {
      setWeeklySlots((current) => [
        ...current,
        newWeeklyTime,
      ])
    }

    setNewWeeklyTime('')
  }

  function removeWeeklyTime(time) {
    setWeeklySlots((current) =>
      current.filter((slot) => slot !== time)
    )
  }

  async function handleSaveWeekly() {
    try {
      setLoading(true)

      await saveWeeklySchedule({
        appointment_type: appointmentType,
        day_of_week: dayOfWeek,
        slots: weeklySlots,
      })

      setMessage('Weekly schedule saved.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  function addDateTime() {
    if (!newDateTime) return

    if (!dateSlots.includes(newDateTime)) {
      setDateSlots((current) => [
        ...current,
        newDateTime,
      ])
    }

    setNewDateTime('')
  }

  function removeDateTime(time) {
    setDateSlots((current) =>
      current.filter((slot) => slot !== time)
    )
  }

  async function handleSaveDate() {
    if (!selectedDate) return

    try {
      setLoading(true)

      await saveDateSchedule({
        appointment_type: appointmentType,
        date: selectedDate,
        mode: dateMode,
        slots: dateMode === 'override' ? dateSlots : [],
      })

      setMessage('Special date schedule saved.')

      await loadDate()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Schedule</h2>
        <p>
          Control exactly when customers can book
          Nails and Lashes.
        </p>
      </div>

      {message && (
        <div className="schedule-message">
          {message}
        </div>
      )}

      <div className="schedule-toolbar">
        <div className="appointment-type-filter">
          <button
            type="button"
            className={
              appointmentType === 'nails'
                ? 'active'
                : ''
            }
            onClick={() => setAppointmentType('nails')}
          >
            💅 NAILS
          </button>

          <button
            type="button"
            className={
              appointmentType === 'lashes'
                ? 'active'
                : ''
            }
            onClick={() => setAppointmentType('lashes')}
          >
            👁 LASHES
          </button>
        </div>

        <div className="schedule-view-toggle">
          <button
            type="button"
            className={view === 'weekly' ? 'active' : ''}
            onClick={() => setView('weekly')}
          >
            <Clock size={16} />
            Weekly Schedule
          </button>

          <button
            type="button"
            className={view === 'special' ? 'active' : ''}
            onClick={() => setView('special')}
          >
            <CalendarDays size={16} />
            Special Date
          </button>
        </div>
      </div>

      {view === 'weekly' ? (
        <div className="schedule-card">
          <div className="schedule-card-header">
            <div>
              <p className="schedule-label">
                REGULAR SCHEDULE
              </p>

              <h3>
                {
                  DAYS.find(
                    (day) => day.value === dayOfWeek
                  )?.label
                }
              </h3>
            </div>

            <select
              value={dayOfWeek}
              onChange={(e) =>
                setDayOfWeek(Number(e.target.value))
              }
            >
              {DAYS.map((day) => (
                <option
                  key={day.value}
                  value={day.value}
                >
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="schedule-add-time">
            <input
              type="time"
              value={newWeeklyTime}
              onChange={(e) =>
                setNewWeeklyTime(e.target.value)
              }
            />

            <button
              type="button"
              className="secondary-button"
              onClick={addWeeklyTime}
            >
              <Plus size={16} />
              Add Time
            </button>
          </div>

          <div className="schedule-slot-list">
            {weeklySlots.length === 0 ? (
              <p className="empty-text">
                No appointment times configured.
              </p>
            ) : (
              weeklySlots.map((time) => (
                <div
                  key={time}
                  className="schedule-slot"
                >
                  <span>
                    <Clock size={16} />
                    {time}
                  </span>

                  <button
                    type="button"
                    className="action-button delete-button"
                    onClick={() =>
                      removeWeeklyTime(time)
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            className="primary-button"
            disabled={loading}
            onClick={handleSaveWeekly}
          >
            Save Weekly Schedule
          </button>
        </div>
      ) : (
        <div className="schedule-card">
          <div className="schedule-card-header">
            <div>
              <p className="schedule-label">
                SPECIAL DATE OVERRIDE
              </p>

              <h3>
                {selectedDate || 'Choose a date'}
              </h3>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
            />
          </div>

          {selectedDate && (
            <>
              <div className="schedule-mode-grid">
                <button
                  type="button"
                  className={`schedule-mode ${
                    dateMode === 'weekly'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setDateMode('weekly')
                  }
                >
                  <RotateCcw size={19} />

                  <strong>Normal Schedule</strong>

                  <span>
                    Use the regular weekly times.
                  </span>
                </button>

                <button
                  type="button"
                  className={`schedule-mode ${
                    dateMode === 'override'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setDateMode('override')
                  }
                >
                  <CalendarDays size={19} />

                  <strong>Special Hours</strong>

                  <span>
                    Completely customize this date.
                  </span>
                </button>

                <button
                  type="button"
                  className={`schedule-mode ${
                    dateMode === 'closed'
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setDateMode('closed')
                  }
                >
                  <Ban size={19} />

                  <strong>Closed</strong>

                  <span>
                    No bookings on this date.
                  </span>
                </button>
              </div>

              {dateMode === 'override' && (
                <>
                  <div className="schedule-add-time">
                    <input
                      type="time"
                      value={newDateTime}
                      onChange={(e) =>
                        setNewDateTime(
                          e.target.value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={addDateTime}
                    >
                      <Plus size={16} />
                      Add Custom Time
                    </button>
                  </div>

                  <div className="schedule-slot-list">
                    {dateSlots.map((time) => (
                      <div
                        key={time}
                        className="schedule-slot"
                      >
                        <span>
                          <Clock size={16} />
                          {time}
                        </span>

                        <button
                          type="button"
                          className="action-button delete-button"
                          onClick={() =>
                            removeDateTime(time)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                disabled={loading}
                onClick={handleSaveDate}
              >
                Save Date Settings
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}