/**
 * Store policies, shown in footer dialogs rather than on their own pages.
 * A block is either a paragraph or a bullet list. Copy carries `**emphasis**`
 * and bare email addresses; components/policy-dialog.tsx turns those into
 * <strong> and mailto links.
 */
export type PolicyBlock = string | string[];
export type PolicySection = { title: string; body: PolicyBlock[] };
export type Policy = { title: string; updated: string; intro: string; sections: PolicySection[] };

const shipping: Policy = {
  title: 'Shipping Policy',
  updated: 'September 2026',
  intro: 'At Whaleora, we believe safety essentials should reach you simply and reliably. Here’s everything you need to know about our shipping.',
  sections: [
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
  ],
};

const returns: Policy = {
  title: 'Returns & Refunds Policy',
  updated: 'September 2026',
  intro: 'At Whaleora, we want you to feel confident about your purchase. If something isn’t right, we’re here to help.',
  sections: [
    {
      title: '7-Day Return Window',
      body: [
        'You may request a return within **7 days from the date of delivery** of your order.',
        'This includes:',
        [
          'Change-of-mind returns, where you simply decide that the product isn’t right for you.',
          'Products that arrive damaged.',
          'Products that are defective or not functioning as intended.',
          'Products that are incorrect or materially different from what was ordered.',
        ],
      ],
    },
    {
      title: 'Conditions for Change-of-Mind Returns',
      body: [
        'For a change-of-mind return, the product should be returned in a condition that allows us to reasonably verify the product and process the return.',
        'Where applicable, please ensure that:',
        [
          'The product is not damaged due to misuse, negligence or improper handling.',
          'All original components and accessories are included.',
          'The original packaging is retained where reasonably possible.',
          'The product has not been modified, tampered with or damaged after delivery.',
        ],
        'A change-of-mind return may be rejected where the product has been damaged, altered or rendered unusable due to customer handling beyond what is reasonably necessary to inspect the product.',
        '**These conditions do not limit your rights in relation to products that are defective, damaged on arrival, incorrect, deficient, or materially different from what was advertised or agreed.**',
      ],
    },
    {
      title: 'How to Request a Return',
      body: [
        'To request a return, contact us at hello@whaleora.com within 7 days of delivery.',
        'Please provide:',
        [
          'Order number',
          'Name used for the order',
          'Reason for return',
          'Photographs/videos where relevant, particularly for damaged or defective products',
        ],
        'We may request reasonable information or evidence to help us assess the return request.',
        'Once your request is reviewed, we will provide instructions for returning the product, where applicable.',
      ],
    },
    {
      title: 'Return Shipping',
      body: [
        'For products that are defective, damaged, incorrect, or materially different from what was ordered, Whaleora will arrange or bear the reasonable cost of return shipping, subject to verification.',
        'For a change-of-mind return, **return shipping charges will be deducted from the refund**.',
        'Any applicable return shipping charges will be communicated to you before the return is processed.',
      ],
    },
    {
      title: 'Inspection of Returned Products',
      body: [
        'Returned products may be inspected after they are received by Whaleora.',
        'We will assess the condition of the product and the reason for return before processing the applicable refund.',
        'Where a return is accepted, the refund will be processed to the original payment method, subject to the payment provider’s processing timelines.',
      ],
    },
    {
      title: 'Refunds',
      body: [
        'Once an eligible return has been received and approved, Whaleora will initiate the applicable refund.',
        'Refunds will generally be initiated within **7 business days** of approval of the return.',
        'The time taken for the refunded amount to reflect in your account may vary depending on your bank, card issuer, payment gateway or other payment service provider.',
      ],
    },
    {
      title: 'Defective or Damaged Products',
      body: [
        'If your product is defective, damaged during delivery, incorrect, or materially different from what was advertised or ordered, please contact us within 7 days of delivery.',
        'Depending on the circumstances and availability, Whaleora may provide:',
        [
          'A replacement; or',
          'A refund; or',
          'Another appropriate remedy permitted under applicable law.',
        ],
        'We will not refuse an applicable remedy merely because a product is outside the normal change-of-mind return conditions where the product is defective, deficient, spurious, materially different from what was advertised/agreed, or otherwise attracts a remedy under applicable law.',
      ],
    },
    {
      title: 'Products Damaged After Delivery',
      body: [
        'Products damaged due to misuse, accidental damage, unauthorized modification, improper installation/use, or handling contrary to the product instructions may not qualify for a change-of-mind return or replacement.',
        'This does not affect any rights you may have under applicable law in relation to manufacturing defects or other legally recognized deficiencies.',
      ],
    },
    {
      title: 'Non-Returnable Situations',
      body: [
        'A return may not be accepted where:',
        [
          'The 7-day return period has expired, except where a longer period or remedy is required under applicable law.',
          'The product has been intentionally damaged or materially altered after delivery.',
          'The product is returned incomplete or missing essential components, where the missing components are attributable to the customer.',
          'The product has been damaged due to misuse or improper handling.',
        ],
        'Nothing in this section limits any rights or remedies available to consumers under applicable Indian law.',
      ],
    },
    {
      title: 'Cancellation',
      body: [
        'You may request cancellation of an order before it is dispatched by contacting us as soon as possible.',
        'If an order has already been dispatched, cancellation may not be possible and you may instead use the applicable return process after delivery.',
        'Where cancellation is required or permitted under applicable law, Whaleora will process the applicable refund.',
      ],
    },
    {
      title: 'Contact Us',
      body: [
        'For returns, refunds or product-related concerns, please contact:',
        '**Email:** hello@whaleora.com',
        '**Business hours:** 10am – 6pm',
        'Please include your order number in all communications.',
      ],
    },
  ],
};

export const POLICIES = { shipping, returns };
export type PolicyKey = keyof typeof POLICIES;
