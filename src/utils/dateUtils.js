const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' })
const monthYearFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function getStartOfWeek(date) {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1))
  result.setHours(0, 0, 0, 0)
  return result
}

export function getWeekDates(startDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(date.getDate() + index)
    return date
  })
}

export function getMonthDates(date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
  return getWeekDates(getStartOfWeek(monthStart)).concat(
    ...Array.from({ length: 5 }, (_, weekIndex) => getWeekDates(new Date(getStartOfWeek(monthStart).getFullYear(), getStartOfWeek(monthStart).getMonth(), getStartOfWeek(monthStart).getDate() + (weekIndex + 1) * 7)))
  )
}

export function formatWeekRange(startDate) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  return `${dateFormatter.format(startDate)} - ${dateFormatter.format(endDate)}`
}

export function formatMonthYear(date) {
  return monthYearFormatter.format(date)
}

export function formatLongDate(dateKey) {
  return dateFormatter.format(parseDateKey(dateKey))
}

export function getDateParts(date) {
  return { day: dayFormatter.format(date).slice(0, 3), number: date.getDate(), month: monthFormatter.format(date).slice(0, 3) }
}
