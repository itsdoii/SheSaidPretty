import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()

// Middleware
const corsOrigins = new Set(
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
)

app.use(cors({
  origin(origin, callback) {
    const isDevelopmentWithoutAllowlist =
      process.env.NODE_ENV !== 'production' &&
      corsOrigins.size === 0

    if (
      !origin ||
      corsOrigins.has(origin) ||
      isDevelopmentWithoutAllowlist
    ) {
      return callback(null, true)
    }

    callback(new Error('Origin is not allowed by CORS'))
  },
}))
app.use(express.json())

// --------------------------------------------------
// SUPABASE CONNECTION
// --------------------------------------------------

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  console.error('❌ Missing Supabase environment variables.')
  console.error('Make sure your .env file contains:')
  console.error('SUPABASE_URL=...')
  console.error('SUPABASE_SECRET_KEY=...')
  process.exit(1)
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)

console.log('✅ Supabase client initialized')

const adminEmails = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

async function requireAdmin(req, res, next) {
  const authorization = req.get('authorization') || ''
  const accessToken = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : ''

  if (!accessToken) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (adminEmails.size === 0) {
    return res.status(503).json({ error: 'Admin access is not configured' })
  }

  try {
    const { data, error } = await supabase.auth.getUser(accessToken)

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    if (!adminEmails.has((data.user.email || '').toLowerCase())) {
      return res.status(403).json({ error: 'Admin access denied' })
    }

    req.adminUser = data.user
    next()
  } catch (error) {
    console.error('Admin authentication error:', error)
    res.status(401).json({ error: 'Unable to verify admin session' })
  }
}

// --------------------------------------------------
// BOOKING / TIME HELPERS
// --------------------------------------------------

const SERVICE_DURATIONS = {
  nails: 120,
  lashes: 120,
  nail_removal: 60,
}

function getServiceDuration(serviceType) {
  return SERVICE_DURATIONS[serviceType] || null
}

function parseTimeToMinutes(time) {
  if (!time || typeof time !== 'string') {
    return null
  }

  const trimmed = time.trim()

  // Handles 24-hour times like:
  // 07:30
  // 14:15
  const twentyFourHourMatch =
    trimmed.match(/^(\d{1,2}):(\d{2})$/)

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1])
    const minutes = Number(twentyFourHourMatch[2])

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null
    }

    return hours * 60 + minutes
  }

  // Handles 12-hour times like:
  // 7:30 AM
  // 2:00 PM
  const twelveHourMatch =
    trimmed.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    )

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1])
    const minutes = Number(twelveHourMatch[2])
    const period =
      twelveHourMatch[3].toUpperCase()

    if (
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null
    }

    if (hours === 12) {
      hours = 0
    }

    if (period === 'PM') {
      hours += 12
    }

    return hours * 60 + minutes
  }

  return null
}

function timesOverlap(
  startA,
  durationA,
  startB,
  durationB
) {
  const startAMinutes =
    parseTimeToMinutes(startA)

  const startBMinutes =
    parseTimeToMinutes(startB)

  if (
    startAMinutes === null ||
    startBMinutes === null
  ) {
    return false
  }

  const endA =
    startAMinutes + Number(durationA)

  const endB =
    startBMinutes + Number(durationB)

  return (
    startAMinutes < endB &&
    endA > startBMinutes
  )
}

// --------------------------------------------------
// GET ALL RESERVATIONS
// --------------------------------------------------

app.get('/api/reservations', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('reservation_date', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)

      return res.status(500).json({
        error: 'Failed to fetch reservations',
      })
    }

    res.json(data)
  } catch (error) {
    console.error('Error fetching reservations:', error)

    res.status(500).json({
      error: 'Failed to fetch reservations',
    })
  }
})

// --------------------------------------------------
// GET SINGLE RESERVATION
// --------------------------------------------------

app.get('/api/reservations/:id', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Reservation not found',
        })
      }

      console.error('Supabase error:', error)

      return res.status(500).json({
        error: 'Failed to fetch reservation',
      })
    }

    res.json(data)
  } catch (error) {
    console.error('Error fetching reservation:', error)

    res.status(500).json({
      error: 'Failed to fetch reservation',
    })
  }
})

// --------------------------------------------------
// CREATE RESERVATION
// --------------------------------------------------

app.post('/api/reservations', async (req, res) => {
  try {
    const {
      customer_name,
      social_media_name,
      appointment_type,
      service_type,
      reservation_date,
      reservation_time,
    } = req.body

    // --------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------

    if (
      !customer_name ||
      !social_media_name ||
      !appointment_type ||
      !service_type ||
      !reservation_date ||
      !reservation_time
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
      })
    }

    // --------------------------------------------
    // VALIDATE APPOINTMENT TYPE
    // --------------------------------------------

    if (
      !['nails', 'lashes'].includes(
        appointment_type
      )
    ) {
      return res.status(400).json({
        error:
          'Invalid appointment type.',
      })
    }

    // --------------------------------------------
    // VALIDATE SERVICE
    // --------------------------------------------

    if (
      ![
        'nails',
        'lashes',
        'nail_removal',
      ].includes(service_type)
    ) {
      return res.status(400).json({
        error: 'Invalid service type.',
      })
    }

    /*
     * Nail Removal belongs to the Nails resource.
     *
     * nails        -> appointment_type nails
     * nail_removal -> appointment_type nails
     * lashes       -> appointment_type lashes
     */

    if (
      service_type === 'nail_removal' &&
      appointment_type !== 'nails'
    ) {
      return res.status(400).json({
        error:
          'Nail removal must use the Nails schedule.',
      })
    }

    if (
      service_type === 'nails' &&
      appointment_type !== 'nails'
    ) {
      return res.status(400).json({
        error:
          'Nail appointments must use the Nails schedule.',
      })
    }

    if (
      service_type === 'lashes' &&
      appointment_type !== 'lashes'
    ) {
      return res.status(400).json({
        error:
          'Lash appointments must use the Lashes schedule.',
      })
    }

    // --------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        reservation_date
      )
    ) {
      return res.status(400).json({
        error:
          'Invalid date format. Use YYYY-MM-DD',
      })
    }

    // --------------------------------------------
    // SERVER-CONTROLLED DURATION
    // --------------------------------------------

    const duration_minutes =
      getServiceDuration(service_type)

    if (!duration_minutes) {
      return res.status(400).json({
        error:
          'Could not determine service duration.',
      })
    }

    // --------------------------------------------
    // GET EXISTING RESERVATIONS
    // --------------------------------------------

    const {
      data: existingReservations,
      error: availabilityError,
    } = await supabase
      .from('reservations')
      .select(
        'id, reservation_time, duration_minutes, service_type'
      )
      .eq(
        'appointment_type',
        appointment_type
      )
      .eq(
        'reservation_date',
        reservation_date
      )
      .neq(
        'status',
        'cancelled'
      )

    if (availabilityError) {
      console.error(
        'Availability check error:',
        availabilityError
      )

      return res.status(500).json({
        error:
          'Failed to check availability',
      })
    }

    // --------------------------------------------
    // OVERLAP CHECK
    // --------------------------------------------

    const conflictingReservation =
      existingReservations.find(
        (existing) => {
          const existingDuration =
            Number(
              existing.duration_minutes
            ) ||
            getServiceDuration(
              existing.service_type
            ) ||
            120

          return timesOverlap(
            reservation_time,
            duration_minutes,
            existing.reservation_time,
            existingDuration
          )
        }
      )

    if (conflictingReservation) {
      return res.status(409).json({
        error:
          'That appointment overlaps with another booking. Please choose another time.',
      })
    }

    // --------------------------------------------
    // CREATE RESERVATION
    // --------------------------------------------

    const newReservation = {
      id: `local-${Date.now()}`,
      customer_name,
      social_media_name,

      appointment_type,
      service_type,

      reservation_date,
      reservation_time,

      // Never trust duration sent from frontend.
      duration_minutes,

      status: 'pending',
      created_at:
        new Date().toISOString(),

      admin_notes: '',
    }

    const {
      data,
      error,
    } = await supabase
      .from('reservations')
      .insert([newReservation])
      .select()
      .single()

    if (error) {
      console.error(
        'Supabase insert error:',
        error
      )

      return res.status(500).json({
        error:
          'Failed to create reservation',
      })
    }

    res.status(201).json(data)
  } catch (error) {
    console.error(
      'Error creating reservation:',
      error
    )

    res.status(500).json({
      error:
        'Failed to create reservation',
    })
  }
})

// --------------------------------------------------
// UPDATE RESERVATION
// --------------------------------------------------

app.put('/api/reservations/:id', requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body

    // Validate status
    if (
      status &&
      !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)
    ) {
      return res.status(400).json({
        error: 'Invalid status',
      })
    }

    const updates = {}

    if (status) {
      updates.status = status
    }

    if (typeof admin_notes === 'string') {
      updates.admin_notes = admin_notes
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      })
    }

    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)

      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Reservation not found',
        })
      }

      return res.status(500).json({
        error: 'Failed to update reservation',
      })
    }

    res.json(data)
  } catch (error) {
    console.error('Error updating reservation:', error)

    res.status(500).json({
      error: 'Failed to update reservation',
    })
  }
})

// --------------------------------------------------
// DELETE RESERVATION
// --------------------------------------------------

app.delete('/api/reservations/:id', requireAdmin, async (req, res) => {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', req.params.id)

    if (error) {
      console.error('Supabase delete error:', error)

      return res.status(500).json({
        error: 'Failed to delete reservation',
      })
    }

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting reservation:', error)

    res.status(500).json({
      error: 'Failed to delete reservation',
    })
  }
})

// --------------------------------------------------
// WEEKLY SCHEDULE
// --------------------------------------------------

app.get('/api/schedule/weekly', requireAdmin, async (req, res) => {
  try {
    const {
      appointment_type,
      day_of_week,
    } = req.query

    if (
      !['nails', 'lashes'].includes(
        appointment_type
      )
    ) {
      return res.status(400).json({
        error: 'Invalid appointment type',
      })
    }

    const day = Number(day_of_week)

    if (
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6
    ) {
      return res.status(400).json({
        error: 'Invalid day of week',
      })
    }

    const { data, error } = await supabase
      .from('weekly_schedule')
      .select('slot_time')
      .eq(
        'appointment_type',
        appointment_type
      )
      .eq('day_of_week', day)

    if (error) throw error

    res.json({
      slots: data.map(
        (row) => row.slot_time
      ),
    })
  } catch (error) {
    console.error(
      'Weekly schedule error:',
      error
    )

    res.status(500).json({
      error: 'Failed to load weekly schedule',
    })
  }
})


app.put('/api/schedule/weekly', requireAdmin, async (req, res) => {
  try {
    const {
      appointment_type,
      day_of_week,
      slots = [],
    } = req.body

    if (
      !['nails', 'lashes'].includes(
        appointment_type
      )
    ) {
      return res.status(400).json({
        error: 'Invalid appointment type',
      })
    }

    const day = Number(day_of_week)

    if (
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6
    ) {
      return res.status(400).json({
        error: 'Invalid day of week',
      })
    }

    const { error: deleteError } =
      await supabase
        .from('weekly_schedule')
        .delete()
        .eq(
          'appointment_type',
          appointment_type
        )
        .eq('day_of_week', day)

    if (deleteError) throw deleteError

    if (slots.length > 0) {
      const rows = slots.map(
        (slot_time) => ({
          appointment_type,
          day_of_week: day,
          slot_time,
        })
      )

      const { error } = await supabase
        .from('weekly_schedule')
        .insert(rows)

      if (error) throw error
    }

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'Save weekly schedule error:',
      error
    )

    res.status(500).json({
      error: 'Failed to save weekly schedule',
    })
  }
})


// --------------------------------------------------
// SPECIAL DATE SCHEDULE
// --------------------------------------------------

app.get('/api/schedule/date', requireAdmin, async (req, res) => {
  try {
    const {
      date,
      appointment_type,
    } = req.query

    const { data: override, error: overrideError } =
      await supabase
        .from('schedule_day_overrides')
        .select('*')
        .eq('slot_date', date)
        .eq(
          'appointment_type',
          appointment_type
        )
        .maybeSingle()

    if (overrideError) {
      throw overrideError
    }

    const mode =
      override?.mode || 'weekly'

    let slots = []

    if (mode === 'override') {
      const { data, error } =
        await supabase
          .from('special_schedule_slots')
          .select('slot_time')
          .eq('slot_date', date)
          .eq(
            'appointment_type',
            appointment_type
          )

      if (error) throw error

      slots = data.map(
        (row) => row.slot_time
      )
    }

    res.json({
      mode,
      slots,
    })
  } catch (error) {
    console.error(
      'Date schedule error:',
      error
    )

    res.status(500).json({
      error: 'Failed to load special schedule',
    })
  }
})


app.put('/api/schedule/date', requireAdmin, async (req, res) => {
  try {
    const {
      appointment_type,
      date,
      mode,
      slots = [],
    } = req.body

    if (
      !['weekly', 'override', 'closed'].includes(
        mode
      )
    ) {
      return res.status(400).json({
        error: 'Invalid schedule mode',
      })
    }

    const { error: overrideError } =
      await supabase
        .from('schedule_day_overrides')
        .upsert(
          {
            appointment_type,
            slot_date: date,
            mode,
          },
          {
            onConflict:
              'appointment_type,slot_date',
          }
        )

    if (overrideError) {
      throw overrideError
    }

    const { error: deleteError } =
      await supabase
        .from('special_schedule_slots')
        .delete()
        .eq(
          'appointment_type',
          appointment_type
        )
        .eq('slot_date', date)

    if (deleteError) {
      throw deleteError
    }

    if (
      mode === 'override' &&
      slots.length > 0
    ) {
      const rows = slots.map(
        (slot_time) => ({
          appointment_type,
          slot_date: date,
          slot_time,
        })
      )

      const { error } = await supabase
        .from('special_schedule_slots')
        .insert(rows)

      if (error) throw error
    }

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(
      'Save date schedule error:',
      error
    )

    res.status(500).json({
      error: 'Failed to save special schedule',
    })
  }
})


// --------------------------------------------------
// CUSTOMER AVAILABILITY
// --------------------------------------------------

app.get('/api/availability', async (req, res) => {
  try {
    const {
      date,
      appointment_type,
    } = req.query

    if (!date) {
      return res.status(400).json({
        error: 'Date is required',
      })
    }

    if (
      !['nails', 'lashes'].includes(
        appointment_type
      )
    ) {
      return res.status(400).json({
        error: 'Invalid appointment type',
      })
    }

    const [
      year,
      month,
      day,
    ] = date.split('-').map(Number)

    const selectedDate =
      new Date(year, month - 1, day)

    const dayOfWeek =
      selectedDate.getDay()

    const {
      data: override,
      error: overrideError,
    } = await supabase
      .from('schedule_day_overrides')
      .select('*')
      .eq('slot_date', date)
      .eq(
        'appointment_type',
        appointment_type
      )
      .maybeSingle()

    if (overrideError) {
      throw overrideError
    }

    const mode =
      override?.mode || 'weekly'

    if (mode === 'closed') {
      return res.json({
        mode: 'closed',
        slots: [],
      })
    }

    let slotTimes = []

    if (mode === 'override') {
      const { data, error } =
        await supabase
          .from('special_schedule_slots')
          .select('slot_time')
          .eq('slot_date', date)
          .eq(
            'appointment_type',
            appointment_type
          )

      if (error) throw error

      slotTimes = data.map(
        (row) => row.slot_time
      )
    } else {
      const { data, error } =
        await supabase
          .from('weekly_schedule')
          .select('slot_time')
          .eq(
            'appointment_type',
            appointment_type
          )
          .eq(
            'day_of_week',
            dayOfWeek
          )

      if (error) throw error

      slotTimes = data.map(
        (row) => row.slot_time
      )
    }

    const {
      data: blocked,
      error: blockedError,
    } = await supabase
      .from('blocked_schedule_slots')
      .select('slot_time')
      .eq('slot_date', date)
      .eq(
        'appointment_type',
        appointment_type
      )

    if (blockedError) {
      throw blockedError
    }

    const blockedTimes =
      new Set(
        blocked.map(
          (row) => row.slot_time
        )
      )

    const {
  data: reservations,
  error: reservationError,
} = await supabase
  .from('reservations')
  .select(
    'reservation_time, duration_minutes, service_type'
  )
  .eq(
    'appointment_type',
    appointment_type
  )
  .eq(
    'reservation_date',
    date
  )
  .neq(
    'status',
    'cancelled'
  )

if (reservationError) {
  throw reservationError
}

/*
 * Temporary requested duration.
 *
 * Later the frontend will send service_type
 * to this endpoint so Nail Removal can use
 * 60 minutes while Nails uses 120.
 */
const requestedService =
  req.query.service_type ||
  appointment_type

const requestedDuration =
  getServiceDuration(
    requestedService
  ) ||
  120

const slots = slotTimes.map(
  (time) => {
    const overlapsReservation =
      reservations.some(
        (reservation) => {
          const existingDuration =
            Number(
              reservation.duration_minutes
            ) ||
            getServiceDuration(
              reservation.service_type
            ) ||
            120

          return timesOverlap(
            time,
            requestedDuration,
            reservation.reservation_time,
            existingDuration
          )
        }
      )

    return {
      time,

      status:
        overlapsReservation
          ? 'booked'
          : blockedTimes.has(time)
            ? 'blocked'
            : 'available',
    }
  }
)

    res.json({
      mode,
      slots,
    })
  } catch (error) {
    console.error(
      'Availability error:',
      error
    )

    res.status(500).json({
      error: 'Failed to load availability',
    })
  }
})

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'She Said Pretty API is running',
    database: 'supabase',
  })
})

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log('')
  console.log(`✅ Backend API running on http://localhost:${PORT}`)
  console.log('🗄️ Database: Supabase')
  console.log('')
  console.log('📚 API Endpoints:')
  console.log(`   GET    http://localhost:${PORT}/api/reservations`)
  console.log(`   GET    http://localhost:${PORT}/api/reservations/:id`)
  console.log(`   POST   http://localhost:${PORT}/api/reservations`)
  console.log(`   PUT    http://localhost:${PORT}/api/reservations/:id`)
  console.log(`   DELETE http://localhost:${PORT}/api/reservations/:id`)
  console.log(`   GET    http://localhost:${PORT}/api/health`)
  console.log('')
})