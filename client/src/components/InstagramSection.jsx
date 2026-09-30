import { Camera, Sparkles } from 'lucide-react'
import { instagramUrl } from '../data/config'

const socialCards = [
  {
    label: 'NAILS',
    title: 'Fresh sets, clean details.',
    url: 'https://www.instagram.com/stories/highlights/17934372192128009/'
  },
  {
    label: 'LASHES',
    title: 'Soft glam, made pretty.',
    url: 'https://www.instagram.com/stories/highlights/17909722173123919/'
    
  },
  {
    label: 'STUDIO',
    title: 'A little glimpse behind the scenes.',
  },
]

export default function InstagramSection() {
  return (
    <section
      className="instagram-section social-showcase"
      aria-labelledby="instagram-title"
    >
      <div className="social-showcase-header">
        <div>
          <p className="eyebrow" id="instagram-title">
            FOLLOW THE PRETTY
          </p>

          <h2>@she.said.pretty</h2>

          <p className="social-showcase-copy">
            Fresh sets, lash moments, and a little behind-the-scenes from
            She Said Pretty.
          </p>
        </div>

        <div className="social-showcase-icon">
          <Camera size={24} strokeWidth={1.5} />
        </div>
      </div>

      <div className="social-showcase-grid">
        {socialCards.map((card) => (
          <a
            key={card.label}
            href={card.url}
            target="_blank"
            rel="noreferrer"
            className="social-card"
          >
            <div className="social-card-top">
              <span>{card.label}</span>
              <span aria-hidden="true">↗</span>
            </div>

            <div className="social-card-content">
              <Sparkles size={18} strokeWidth={1.5} />

              <h3>{card.title}</h3>
            </div>
          </a>
        ))}
      </div>

      <div className="social-showcase-footer">
        <div className="social-mini-note">
          <Camera size={16} strokeWidth={1.5} />
          <span>Latest looks • Client sets • Studio moments</span>
        </div>

        <a
          className="social-instagram-button"
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
        >
          VIEW INSTAGRAM
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  )
}