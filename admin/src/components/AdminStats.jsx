import { Calendar, Clock, Check, X } from 'lucide-react'

export default function AdminStats({ stats }) {
  const statCards = [
    {
      icon: Calendar,
      label: "Today's Reservations",
      value: stats.todayCount,
      color: 'stat-blue',
    },
    {
      icon: Clock,
      label: 'Pending',
      value: stats.pendingCount,
      color: 'stat-yellow',
    },
    {
      icon: Check,
      label: 'Confirmed',
      value: stats.confirmedCount,
      color: 'stat-green',
    },
    {
      icon: X,
      label: 'Cancelled',
      value: stats.cancelledCount,
      color: 'stat-red',
    },
  ]

  return (
    <div className="stats-grid">
      {statCards.map((card) => (
        <div key={card.label} className={`stat-card ${card.color}`}>
          <div className="stat-icon">
            <card.icon size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
