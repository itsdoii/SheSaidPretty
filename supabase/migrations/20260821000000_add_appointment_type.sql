-- Preserve existing reservations by treating legacy rows as nail appointments.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'nails';

UPDATE public.reservations
SET appointment_type = 'nails'
WHERE appointment_type IS NULL;

ALTER TABLE public.reservations
  ALTER COLUMN appointment_type SET DEFAULT 'nails',
  ALTER COLUMN appointment_type SET NOT NULL;

ALTER TABLE public.reservations
  DROP CONSTRAINT IF EXISTS reservations_appointment_type_check;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_appointment_type_check
  CHECK (appointment_type IN ('nails', 'lashes'));

CREATE UNIQUE INDEX IF NOT EXISTS reservations_active_slot_by_type
  ON public.reservations (appointment_type, reservation_date, reservation_time)
  WHERE status <> 'cancelled';
