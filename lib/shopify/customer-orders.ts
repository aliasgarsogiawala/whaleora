import { customerAccountOrdersUrl, customerQuery } from './customer';

/**
 * Orders as the account page needs them. Split into two field sets: the return
 * fields are newer, so if this store's API version rejects them the basic query
 * still renders the orders list rather than blanking it.
 */
const ORDER_FIELDS = /* GraphQL */ `
  id
  name
  processedAt
  financialStatus
  fulfillments(first: 1) {
    nodes { status trackingInformation { number url } }
  }
  totalPrice { amount currencyCode }
  lineItems(first: 20) { nodes { id title quantity } }
`;

/**
 * Shopify decides what is returnable, from the Return rules set in the admin —
 * so the 7-day window lives there, counted from delivery, and we never do the
 * date maths ourselves. Change the window in Shopify and this follows.
 */
const RETURN_FIELDS = /* GraphQL */ `
  statusPageUrl
  returnInformation {
    returnableLineItems(first: 25) { nodes { quantity lineItem { id } } }
  }
`;

const ordersQuery = (extra: string) => /* GraphQL */ `
  query CustomerOrders($first: Int!) {
    customer {
      emailAddress { emailAddress }
      firstName
      lastName
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes { ${ORDER_FIELDS} ${extra} }
      }
    }
  }
`;

export type CustomerOrderLine = { id: string; title: string; quantity: number; returnable: boolean };

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
  statusPageUrl: string | null;
  lineItems: CustomerOrderLine[];
};

export type CustomerProfile = {
  email: string | null;
  name: string | null;
  /** Shopify's hosted orders list, used when an order has no status page of its own. */
  ordersUrl: string | null;
  orders: CustomerOrder[];
};

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
        statusPageUrl?: string | null;
        returnInformation?: { returnableLineItems: { nodes: { quantity: number; lineItem: { id: string } }[] } } | null;
        fulfillments: { nodes: { status: string | null; trackingInformation: { number: string | null; url: string | null }[] }[] };
        totalPrice: { amount: string; currencyCode: string };
        lineItems: { nodes: { id: string; title: string; quantity: number }[] };
      }[];
    } | null;
  } | null;
};

/** The signed-in customer and their orders, straight from Shopify. */
export async function customerProfile(): Promise<CustomerProfile | null> {
  const data = await customerQuery<Raw>(ordersQuery(RETURN_FIELDS), { first: 25 })
    ?? await customerQuery<Raw>(ordersQuery(''), { first: 25 });
  if (!data?.customer) return null;
  const { customer } = data;
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ').trim();
  const ordersUrl = await customerAccountOrdersUrl();
  return {
    email: customer.emailAddress?.emailAddress ?? null,
    name: name || null,
    ordersUrl,
    orders: (customer.orders?.nodes ?? []).map((order) => {
      const fulfillment = order.fulfillments.nodes[0];
      const tracking = fulfillment?.trackingInformation?.[0];
      const returnable = new Set(
        (order.returnInformation?.returnableLineItems.nodes ?? [])
          .filter((node) => node.quantity > 0)
          .map((node) => node.lineItem.id),
      );
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
        statusPageUrl: order.statusPageUrl ?? null,
        lineItems: order.lineItems.nodes.map((item) => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          returnable: returnable.has(item.id),
        })),
      };
    }),
  };
}
