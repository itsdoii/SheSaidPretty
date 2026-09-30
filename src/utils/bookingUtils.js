export function timeToMinutes(time) {
  const [clock, meridiem] = time.split(' ')
  let [hours, minutes] = clock.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

export function minutesToTime(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const meridiem = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 || 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

export function generateTimeSlots(startTime, endTime, durationMinutes) {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const slots = []
  for (let time = start; time + durationMinutes <= end; time += durationMinutes) {
    slots.push(minutesToTime(time))
  }
  return slots
}
