import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateKey, formatMonthYear, formatWeekRange, getDateParts, getMonthDates, getWeekDates } from '../utils/dateUtils'

export default function WeekNavigator({ weekStart, selectedDate, onWeekChange, onMonthChange, onToday, onDateChange }) {
  const [viewMode, setViewMode] = useState('week')
  const isMonthView = viewMode === 'month'
  const dates = isMonthView ? getMonthDates(weekStart) : getWeekDates(weekStart)
  return <section className="calendar-section" aria-labelledby="calendar-title">
    <div className="section-heading-row">
      <div><p className="eyebrow" id="calendar-title">CALENDAR {isMonthView ? 'MONTH' : 'WEEK'}</p><h2>{isMonthView ? formatMonthYear(weekStart) : formatWeekRange(weekStart)}</h2></div>
      <div className="week-actions">
        <button className="view-toggle" type="button" onClick={() => setViewMode('week')} aria-pressed={!isMonthView}>WEEK</button>
        <button className="view-toggle" type="button" onClick={() => setViewMode('month')} aria-pressed={isMonthView}>MONTH</button>
        <button className="icon-button" type="button" onClick={() => (isMonthView ? onMonthChange(-1) : onWeekChange(-1))} aria-label={`Previous ${isMonthView ? 'month' : 'week'}`}><ChevronLeft size={18} /></button>
        <button className="today-button" type="button" onClick={onToday}>TODAY</button>
        <button className="icon-button" type="button" onClick={() => (isMonthView ? onMonthChange(1) : onWeekChange(1))} aria-label={`Next ${isMonthView ? 'month' : 'week'}`}><ChevronRight size={18} /></button>
      </div>
    </div>
    {isMonthView && <div className="month-weekdays" aria-hidden="true">{['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => <span key={day}>{day}</span>)}</div>}
    <div className={isMonthView ? 'calendar-grid' : 'date-scroller'} role="group" aria-label="Choose an appointment date">
      {dates.map((date) => {
        const dateKey = formatDateKey(date)
        const parts = getDateParts(date)
        const isSelected = dateKey === selectedDate
        const isOutsideMonth = isMonthView && date.getMonth() !== weekStart.getMonth()
        return <button key={dateKey} type="button" className={`date-card ${isSelected ? 'selected' : ''} ${isOutsideMonth ? 'outside-month' : ''}`} onClick={() => onDateChange(dateKey)} aria-pressed={isSelected}>
          <span>{parts.day}</span><strong>{parts.number}</strong><span>{parts.month}</span>
        </button>
      })}
    </div>
  </section>
}
