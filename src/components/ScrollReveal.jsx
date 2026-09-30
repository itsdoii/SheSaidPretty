import { useEffect, useRef } from 'react'

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('is-visible')
        } else {
          element.classList.remove('is-visible')
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {children}
    </div>
  )
}