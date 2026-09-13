import { customerQuery } from './customer';

const ORDERS_QUERY = /* GraphQL */ `
  query CustomerOrders($first: Int!) {
    customer {
      emailAddress { emailAddress }
      firstName
      lastName
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillments(first: 1) {
            nodes { status trackingInformation { number url } }
          }
          totalPrice { amount currencyCode }
          lineItems(first: 20) { nodes { title quantity } }
        }
      }
    }
  }
`;

export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string | null;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  total: string;
  currencyCode: string;
  lineItems: { title: string; quantity: number }[];
};

export type CustomerProfile = { email: string | null; name: string | null; orders: CustomerOrder[] };

type Raw = {
  customer: {
    emailAddress: { emailAddress: string | null } | null;
    firstName: string | null;
    lastName: string | null;
    orders: {
      nodes: {
        id: string;
        name: string;
        processedAt: string | null;
        financialStatus: string | null;
        fulfillments: { nodes: { status: string | null; trackingInformation: { number: string | null; url: string | null }[] }[] };
        totalPrice: { amount: string; currencyCode: string };
        lineItems: { nodes: { title: string; quantity: number }[] };
      }[];
    } | null;
  } | null;
};

/** The signed-in customer and their orders, straight from Shopify. */
export async function customerProfile(): Promise<CustomerProfile | null> {
  const data = await customerQuery<Raw>(ORDERS_QUERY, { first: 25 });
  if (!data?.customer) return null;
  const { customer } = data;
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  return {
    email: customer.emailAddress?.emailAddress ?? null,
    name: name || null,
    orders: (customer.orders?.nodes ?? []).map((order) => {
      const fulfillment = order.fulfillments.nodes[0];
      const tracking = fulfillment?.trackingInformation?.[0];
      return {
        id: order.id,
        name: order.name,
        processedAt: order.processedAt,
        financialStatus: order.financialStatus,
        fulfillmentStatus: fulfillment?.status ?? null,
        trackingNumber: tracking?.number ?? null,
        trackingUrl: tracking?.url ?? null,
        total: order.totalPrice.amount,
        currencyCode: order.totalPrice.currencyCode,
        lineItems: order.lineItems.nodes.map((item) => ({ title: item.title, quantity: item.quantity })),
      };
    }),
  };
}
