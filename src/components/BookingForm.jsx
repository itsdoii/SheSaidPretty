export default function BookingForm({ form, onChange, onSubmit, isSubmitting, isValid }) {
  return <form className="booking-form" onSubmit={onSubmit}>
    <div className="section-heading-row form-heading"><div><p className="eyebrow">YOUR DETAILS</p><h2>Make it yours</h2></div><span className="required-note">All fields required</span></div>
    <label>Full name<input name="customer_name" value={form.customer_name} onChange={onChange} placeholder="Your full name" autoComplete="name" required /></label>
    <label>Social media name<input name="social_media_name" value={form.social_media_name} onChange={onChange} placeholder="@username" required /><span className="helper-text">Please enter the name or username you use on social media.</span></label>
    <button className="primary-button" type="submit" disabled={!isValid || isSubmitting}>{isSubmitting ? 'RESERVING...' : 'BOOK RESERVATION'} <span aria-hidden="true">↗</span></button>
  </form>
}
