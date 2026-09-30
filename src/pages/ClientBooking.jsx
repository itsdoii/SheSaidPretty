import { useEffect, useState } from 'react'
import Header from '../components/Header'
import WeekNavigator from '../components/WeekNavigator'
import TimeSlots from '../components/TimeSlots'
import BookingForm from '../components/BookingForm'
import BookingSummary from '../components/BookingSummary'
import ConfirmationCard from '../components/ConfirmationCard'
import InstagramSection from '../components/InstagramSection'
import Footer from '../components/Footer'
import PaymentModal from '../components/PaymentModal'
import ScrollReveal from '../components/ScrollReveal'

import { bookingConfig } from '../data/config'

import {
  checkAvailability,
  createReservation,
  getReservations,
  getAvailableSlots,
} from '../services/reservationService'

import {
  formatDateKey,
  getStartOfWeek,
} from '../utils/dateUtils'

const initialForm = {
  customer_name: '',
  social_media_name: '',
}

export default function ClientBooking() {
  const today = new Date()

  const [weekStart, setWeekStart] = useState(getStartOfWeek(today))
  const [selectedDate, setSelectedDate] = useState(formatDateKey(today))
  const [selectedTime, setSelectedTime] = useState('')

  // Customer-facing service selection
  const [serviceType, setServiceType] = useState('nail_removal')

  /*
   * Nail Removal still uses the Nails schedule.
   *
   * nails        -> nails
   * nail_removal -> nails
   * lashes       -> lashes
   */
  const appointmentType =
    serviceType === 'nail_removal'
      ? 'nails'
      : serviceType

  const [form, setForm] = useState(initialForm)
  const [reservations, setReservations] = useState([])
  const [confirmedReservation, setConfirmedReservation] = useState(null)

  const [availableSlots, setAvailableSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getReservations()
      .then(setReservations)
      .catch((err) => {
        console.error('Failed to load reservations:', err)
      })
  }, [])

  useEffect(() => {
    if (!selectedDate || !appointmentType) {
      setAvailableSlots([])
      return
    }

    let cancelled = false

    async function loadAvailableSlots() {
      try {
        setSlotsLoading(true)

        const data = await getAvailableSlots(
          selectedDate,
          appointmentType
        )

        if (cancelled) return

        const slots = data.slots || []

        setAvailableSlots(slots)

        setSelectedTime((currentTime) => {
          if (!currentTime) {
            return ''
          }

          const stillAvailable = slots.some(
            (slot) =>
              slot.time === currentTime &&
              slot.status === 'available'
          )

          return stillAvailable ? currentTime : ''
        })
      } catch (err) {
        if (cancelled) return

        console.error(
          'Failed to load available appointment times:',
          err
        )

        setAvailableSlots([])
        setSelectedTime('')
      } finally {
        if (!cancelled) {
          setSlotsLoading(false)
        }
      }
    }

    loadAvailableSlots()

    return () => {
      cancelled = true
    }
  }, [
      selectedDate,
      appointmentType,
      serviceType,
      reservations,
])

  const isFormValid = Boolean(
    selectedDate &&
      selectedTime &&
      form.customer_name.trim() &&
      form.social_media_name.trim()
  )

  function changeWeek(direction) {
    if (direction === 0) {
      const current = new Date()

      setWeekStart(getStartOfWeek(current))
      setSelectedDate(formatDateKey(current))
    } else {
      const next = new Date(weekStart)

      next.setDate(
        next.getDate() + direction * 7
      )

      setWeekStart(next)
      setSelectedDate(formatDateKey(next))
    }

    setSelectedTime('')
    setError('')
  }

  function changeDate(date) {
    setSelectedDate(date)
    setSelectedTime('')
    setError('')
  }

  function changeServiceType(type) {
    setServiceType(type)
    setSelectedTime('')
    setError('')
  }

  function changeMonth(direction) {
    const nextMonth = new Date(
      weekStart.getFullYear(),
      weekStart.getMonth() + direction,
      1
    )

    setWeekStart(getStartOfWeek(nextMonth))
    setSelectedTime('')
    setError('')
  }

  function goToToday() {
    const current = new Date()

    setWeekStart(getStartOfWeek(current))
    setSelectedDate(formatDateKey(current))
    setSelectedTime('')
    setError('')
  }

  function handleFormChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }))

    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const selectedSlot =
        availableSlots.find(
          (slot) =>
            slot.time === selectedTime
        )

      if (
        !selectedSlot ||
        selectedSlot.status !== 'available'
      ) {
        throw new Error(
          'That appointment time is no longer available. Please choose another time.'
        )
      }

      const available =
        await checkAvailability(
          selectedDate,
          selectedTime,
          appointmentType
        )

      if (!available) {
        throw new Error(
          'That appointment time was just reserved. Please choose another time.'
        )
      }

      const reservation =
        await createReservation({
          customer_name:
            form.customer_name.trim(),

          social_media_name:
            form.social_media_name.trim(),

          appointment_type:
            appointmentType,

          // Backend support for this comes next.
          service_type:
            serviceType,

          reservation_date:
            selectedDate,

          reservation_time:
            selectedTime,

          duration_minutes:
            bookingConfig.slotDurationMinutes,
        })

      const refreshedReservations =
        await getReservations()

      setReservations(
        refreshedReservations
      )

      setConfirmedReservation(
        reservation
      )

      setShowPaymentModal(true)
    } catch (submissionError) {
      setError(
        submissionError.message ||
          'Failed to create reservation.'
      )

      try {
        const data = await getAvailableSlots(
          selectedDate,
          appointmentType,
          serviceType
        )

        setAvailableSlots(
          data.slots || []
        )
      } catch (refreshError) {
        console.error(
          'Failed to refresh slots:',
          refreshError
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function finishPaymentStep() {
    setShowPaymentModal(false)
  }

  function closePaymentModal() {
    setShowPaymentModal(false)
  }

  function resetBooking() {
    setConfirmedReservation(null)
    setShowPaymentModal(false)

    const current = new Date()

    setWeekStart(
      getStartOfWeek(current)
    )

    setSelectedDate(
      formatDateKey(current)
    )

    setSelectedTime('')
    setServiceType('nails')

    setForm(initialForm)
    setError('')
  }

  return (
    <div className="app-shell">
      <Header />

      <main>
        {!confirmedReservation ? (
          <>
            <ScrollReveal>
              <section className="hero">
                <div className="hero-copy">
                  <p className="eyebrow">
                    Ready?
                  </p>

                  <h1>
                    Let's get you booked!
                  </h1>

                  <p>
                    Select your service and find an available appointment time
                  </p>
                </div>

              </section>
            </ScrollReveal>

            <div className="booking-layout">
              <ScrollReveal>
                <div className="booking-main">
                  <div className="appointment-type-picker">
                    <p className="eyebrow">
                      CHOOSE A SERVICE
                    </p>

                    <div
                      className="appointment-type-toggle"
                      role="group"
                      aria-label="Choose service"
                    >
                      <button
                        type="button"
                        className={
                          serviceType === 'nail_removal'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          changeServiceType(
                            'nail_removal'
                          )
                        }
                        aria-pressed={
                          serviceType ===
                          'nail_removal'
                        }
                      >
                        ✨ NAIL REMOVAL
                      </button>
                      
                      <button
                        type="button"
                        className={
                          serviceType === 'nails'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          changeServiceType('nails')
                        }
                        aria-pressed={
                          serviceType === 'nails'
                        }
                      >
                        💅 NAILS
                      </button>

                      <button
                        type="button"
                        className={
                          serviceType === 'lashes'
                            ? 'active'
                            : ''
                        }
                        onClick={() =>
                          changeServiceType('lashes')
                        }
                        aria-pressed={
                          serviceType === 'lashes'
                        }
                      >
                        👁 LASHES
                      </button>

                    </div>
                  </div>

                  <WeekNavigator
                    weekStart={weekStart}
                    selectedDate={selectedDate}
                    onWeekChange={changeWeek}
                    onMonthChange={changeMonth}
                    onToday={goToToday}
                    onDateChange={changeDate}
                  />

                  <TimeSlots
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    slots={availableSlots}
                    isLoading={slotsLoading}
                    onTimeChange={setSelectedTime}
                    serviceType={serviceType}
/>

                  {error && (
                    <p
                      className="error-message"
                      role="alert"
                    >
                      {error}
                    </p>
                  )}

                  <BookingForm
                    form={form}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    isValid={isFormValid}
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <BookingSummary
                  appointmentType={appointmentType}
                  serviceType={serviceType}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                />
              </ScrollReveal>
            </div>
          </>
        ) : (
          <ScrollReveal>
            <ConfirmationCard
              reservation={confirmedReservation}
              onReset={resetBooking}
            />
          </ScrollReveal>
        )}

        <ScrollReveal delay={100}>
          <InstagramSection />
        </ScrollReveal>
      </main>

      {showPaymentModal &&
        confirmedReservation && (
          <PaymentModal
            reservation={
              confirmedReservation
            }
            onDone={
              finishPaymentStep
            }
            onClose={
              closePaymentModal
            }
          />
        )}

      <Footer />
    </div>
  )
}