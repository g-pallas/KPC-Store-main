import { useState } from 'react'
import { Headphones, Mail, MapPin, Phone } from 'lucide-react'
import { Layout } from '../components/shared'

export function Support({ store }) {
  const [submitted, setSubmitted] = useState(false)

  function submitRequest(event) {
    event.preventDefault()
    setSubmitted(true)
    event.currentTarget.reset()
  }

  return (
    <Layout store={store}>
      <section className="support-page">
        <div className="support-heading">
          <p>Support center</p>
          <h1>Submit Your Request</h1>
          <span>Send us product, order, payment, warranty, or troubleshooting concerns.</span>
        </div>

        <div className="support-panel">
          <div className="support-copy">
            <Headphones size={34} />
            <h2>Need Technical Assistance?</h2>
            <p>
              Include the product name, order number if available, issue details, and steps you
              already tried. Our team will review the request and get back to you with next steps.
            </p>
          </div>

          <form className="support-form" onSubmit={submitRequest}>
            <label>
              Name
              <input required name="name" placeholder="Your full name" />
            </label>
            <label>
              Email
              <input required type="email" name="email" placeholder="you@example.com" />
            </label>
            <label>
              Preferred platform to contact
              <select required name="platform" defaultValue="">
                <option value="" disabled>
                  Please select
                </option>
                <option>Email</option>
                <option>Phone call</option>
                <option>SMS</option>
                <option>Messenger</option>
              </select>
            </label>
            <label>
              Do you have an existing order?
              <select required name="has_order" defaultValue="">
                <option value="" disabled>
                  Please select
                </option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </label>
            <label>
              Request details
              <textarea required name="message" rows="5" placeholder="Tell us what happened" />
            </label>
            {submitted && <div className="support-success">Support request saved for review.</div>}
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="support-contact-grid">
          <div className="support-card">
            <Phone size={20} />
            <strong>Website Orders</strong>
            <span>+63 998 5363 995</span>
          </div>
          <div className="support-card">
            <Headphones size={20} />
            <strong>Technical Support</strong>
            <span>support@kpc.test</span>
          </div>
          <div className="support-card">
            <Mail size={20} />
            <strong>Sales</strong>
            <span>sales@kpc.test</span>
          </div>
          <div className="support-card">
            <MapPin size={20} />
            <strong>Store Location</strong>
            <span>Cebu, Philippines</span>
          </div>
        </div>
      </section>
    </Layout>
  )
}
