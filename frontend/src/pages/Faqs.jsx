import { useState } from 'react'
import { Layout } from '../components/shared'

const faqSections = [
  {
    title: 'Orders and Purchases',
    questions: [
      ['How do I place an order?', 'Open a product, choose a quantity, add it to cart, then proceed to checkout.'],
      ['What modes of payment do you accept?', 'You can record Cash on Delivery, GCash, PayPal, card, or bank transfer for v1 orders.'],
      ['Can I still cancel my order?', 'Pending orders can be cancelled from My Cancellations. Processing and shipped orders need support review.'],
      ['Where can I track my order?', 'Go to your account, open My Orders, and check the order status tab.'],
    ],
  },
  {
    title: 'Delivery',
    questions: [
      ['Can KPC deliver to my location?', 'Delivery is available nationwide for supported addresses entered during checkout.'],
      ['How much is the shipping fee?', 'Shipping fees are calculated during checkout based on the selected delivery option.'],
      ['How long will my order take to arrive?', 'Standard delivery timing depends on destination and order status.'],
      ['What should I do if my order is delayed?', 'Submit a support request with your order number so the team can check it.'],
    ],
  },
  {
    title: 'Returns and Warranty',
    questions: [
      ['How do I request a return?', 'Open My Returns from your account and submit the product and order details.'],
      ['Are all items covered by warranty?', 'Warranty coverage depends on the product and is shown on the product detail page.'],
      ['What should I prepare for warranty claims?', 'Keep your order number, product photos, and a clear description of the issue.'],
    ],
  },
  {
    title: 'Products and Stock',
    questions: [
      ['What does sold out mean?', 'Sold out products are kept for order history but hidden or disabled from new purchases.'],
      ['Can I request a product that is not listed?', 'Yes. Send the product name and details through the Support page.'],
      ['Are specifications different per category?', 'Yes. CPUs, graphics cards, memory, storage, and peripherals can have category-specific specs.'],
    ],
  },
]

export function Faqs({ store }) {
  const [openKey, setOpenKey] = useState('Orders and Purchases-0')

  return (
    <Layout store={store}>
      <section className="faq-page">
        <div className="support-heading">
          <p>Help center</p>
          <h1>Frequently Asked Questions</h1>
          <span>Quick answers for orders, delivery, warranty, and product questions.</span>
        </div>

        {faqSections.map((section) => (
          <div className="faq-section" key={section.title}>
            <h2>{section.title}</h2>
            {section.questions.map(([question, answer], index) => {
              const key = `${section.title}-${index}`
              const isOpen = openKey === key

              return (
                <div className="faq-item" key={key}>
                  <button type="button" onClick={() => setOpenKey(isOpen ? '' : key)}>
                    <span>{question}</span>
                    <strong>{isOpen ? '-' : '+'}</strong>
                  </button>
                  {isOpen && <p>{answer}</p>}
                </div>
              )
            })}
          </div>
        ))}
      </section>
    </Layout>
  )
}
