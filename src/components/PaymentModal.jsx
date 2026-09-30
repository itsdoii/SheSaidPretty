import { useState } from 'react'

export default function PaymentModal({
  reservation,
  onDone,
  onClose,
}) {
  const [paymentMethod, setPaymentMethod] = useState(null)

  if (!reservation) return null

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button
          type="button"
          className="payment-modal-close"
          onClick={onClose}
          aria-label="Close payment window"
        >
          ×
        </button>

        <div className="payment-modal-header">
          <p className="eyebrow">PAYMENT</p>
          <h2>Secure your appointment</h2>

          <p>
            Your reservation has been submitted. Please send the required
            deposit using one of the payment methods below.
          </p>
        </div>

        {!paymentMethod ? (
          <>
            <p className="payment-choice-label">
              Choose your payment method
            </p>

            <div className="payment-method-buttons">
              <button
                type="button"
                className="payment-method-button"
                onClick={() => setPaymentMethod('gcash')}
              >
                <span className="payment-method-name">GCash</span>
                <span className="payment-method-action">View QR →</span>
              </button>

              <button
                type="button"
                className="payment-method-button"
                onClick={() => setPaymentMethod('bpi')}
              >
                <span className="payment-method-name">BPI</span>
                <span className="payment-method-action">View QR →</span>
              </button>
            </div>
          </>
        ) : (
          <div className="payment-qr-section">
            <button
              type="button"
              className="payment-back-button"
              onClick={() => setPaymentMethod(null)}
            >
              ← Change payment method
            </button>

            <p className="eyebrow">
              {paymentMethod === 'gcash' ? 'GCASH' : 'BPI'}
            </p>

            <h3>
              Scan to pay
            </h3>

            <div className="payment-qr-frame">
              <img
                src={
                  paymentMethod === 'gcash'
                    ? '/payments/gcash-qr.jpg'
                    : '/payments/bpi-qr.jpg'
                }
                alt={
                  paymentMethod === 'gcash'
                    ? 'GCash payment QR code'
                    : 'BPI payment QR code'
                }
              />
            </div>

            <p className="payment-note">
              Please double-check the recipient details in your payment app
              before sending your deposit.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={onDone}
            >
              I'VE SENT MY PAYMENT
            </button>

            <p className="payment-verification-note">
              Your appointment remains pending until the payment is manually
              verified by She Said Pretty.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}