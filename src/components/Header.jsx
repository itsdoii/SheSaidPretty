import { Sparkles } from 'lucide-react'

export default function Header() {
  return <header className="site-header">
    <a className="brand" href="/" aria-label="She Said Pretty home">
      <span className="brand-name">SHE SAID PRETTY</span>
      <span className="brand-subtitle">NAILS &amp; LASHES STUDIO</span>
    </a>
    <div className="booking-status"><span className="status-dot" /> <span>BOOKING</span> <Sparkles size={14} strokeWidth={1.5} /></div>
  </header>
}
