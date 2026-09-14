/**
 * Shipping policy, shown in the footer dialog rather than on its own page.
 * Copy carries `**emphasis**` and bare email addresses; the renderer in
 * components/shipping-policy.tsx turns those into <strong> and mailto links.
 */
export type PolicySection = { title: string; body: string[] };

export const SHIPPING_POLICY_UPDATED = 'September 2026';

export const SHIPPING_POLICY_INTRO =
  'At Whaleora, we believe safety essentials should reach you simply and reliably. Here’s everything you need to know about our shipping.';

export const SHIPPING_POLICY: PolicySection[] = [
  {
    title: 'Where We Deliver',
    body: [
      'We currently ship across India.',
      'Orders are delivered to serviceable pin codes through our designated logistics partners.',
    ],
  },
  {
    title: 'Order Processing',
    body: [
      'Orders are generally processed within **1–2 business days** after successful payment confirmation.',
      'Orders placed on Sundays or public holidays will be processed on the next business day.',
      'Once your order has been shipped, you will receive a shipping confirmation and tracking details through the contact information provided at checkout.',
    ],
  },
  {
    title: 'Delivery Timelines',
    body: [
      'Estimated delivery time is generally **3–7 business days** from the date of dispatch.',
      'Delivery timelines may vary depending on your location, courier serviceability, weather conditions, public holidays, operational disruptions, or other circumstances beyond our reasonable control.',
      'Where there is an unexpected delay, we will make reasonable efforts to keep you informed.',
    ],
  },
  {
    title: 'Shipping Charges',
    body: [
      'Applicable shipping charges, if any, will be displayed clearly at checkout before you complete your purchase.',
      'Any applicable taxes or mandatory charges will be included in the final order value displayed at checkout.',
    ],
  },
  {
    title: 'Incorrect Address or Contact Details',
    body: [
      'Please make sure that your delivery address, phone number and other contact details are accurate before placing your order.',
      'If an order cannot be delivered because of an incorrect or incomplete address, incorrect contact information, or repeated unsuccessful delivery attempts attributable to the customer, additional shipping charges may apply for re-delivery.',
    ],
  },
  {
    title: 'Delayed or Undelivered Orders',
    body: [
      'If your order is significantly delayed or cannot be delivered, please contact us at hello@whaleora.com with your order number.',
      'If an order is cancelled because it cannot be fulfilled or is otherwise eligible for cancellation/refund under applicable law, we will process the applicable refund in accordance with our Refund Policy.',
    ],
  },
  {
    title: 'Damaged Packages',
    body: [
      'If your package appears visibly damaged at the time of delivery, we recommend refusing delivery where possible and contacting us immediately.',
      'If you receive a damaged, defective, incorrect or materially different product, please contact us within **7 days of delivery** in accordance with our Returns & Refunds Policy.',
    ],
  },
  {
    title: 'Force Majeure',
    body: [
      'Whaleora will not be responsible for delays caused by circumstances beyond our reasonable control, including natural disasters, extreme weather, strikes, government restrictions, transportation disruptions, or other events that materially affect logistics operations.',
      'However, nothing in this policy limits any consumer rights available to you under applicable Indian law.',
    ],
  },
  {
    title: 'Contact Us',
    body: [
      'For shipping-related questions, please contact:',
      '**Email:** hello@whaleora.com',
      'Please include your order number when contacting us so that we can assist you faster.',
    ],
  },
];
