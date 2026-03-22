import type { Order, Inspector } from '../types';

const ORDERS_KEY = 'inspectorsd_orders';
const INSPECTORS_KEY = 'inspectorsd_inspectors';

// ---------- Orders ----------

export function getOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]): void {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function getOrderById(id: string): Order | undefined {
  return getOrders().find((o) => o.id === id);
}

export function upsertOrder(order: Order): void {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = { ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.push(order);
  }
  saveOrders(orders);
}

export function deleteOrder(id: string): void {
  saveOrders(getOrders().filter((o) => o.id !== id));
}

// ---------- Inspectors ----------

export function getInspectors(): Inspector[] {
  try {
    const raw = localStorage.getItem(INSPECTORS_KEY);
    return raw ? (JSON.parse(raw) as Inspector[]) : [];
  } catch {
    return [];
  }
}

export function saveInspectors(inspectors: Inspector[]): void {
  localStorage.setItem(INSPECTORS_KEY, JSON.stringify(inspectors));
}

export function getInspectorById(id: string): Inspector | undefined {
  return getInspectors().find((i) => i.id === id);
}

export function upsertInspector(inspector: Inspector): void {
  const list = getInspectors();
  const idx = list.findIndex((i) => i.id === inspector.id);
  if (idx >= 0) {
    list[idx] = inspector;
  } else {
    list.push(inspector);
  }
  saveInspectors(list);
}

export function deleteInspector(id: string): void {
  saveInspectors(getInspectors().filter((i) => i.id !== id));
}

// ---------- Seed data ----------

export function seedIfEmpty(): void {
  if (getInspectors().length === 0) {
    const inspectors: Inspector[] = [
      { id: 'i1', name: 'Maria Santos', email: 'msantos@toronto.ca', phone: '416-555-0101' },
      { id: 'i2', name: 'James Kim',    email: 'jkim@toronto.ca',    phone: '416-555-0102' },
      { id: 'i3', name: 'Priya Patel',  email: 'ppatel@toronto.ca',  phone: '416-555-0103' },
    ];
    saveInspectors(inspectors);
  }

  if (getOrders().length === 0) {
    const now = new Date().toISOString();
    const orders: Order[] = [
      {
        id: 'o1',
        propertyAddress: '123 King St W, Toronto, ON M5H 1J9',
        description: 'Unsafe balcony railings on floors 3–5',
        dateIssued: '2025-02-10',
        dueDate: '2025-03-10',
        inspectorId: 'i1',
        status: 'enforcement_required',
        enforcementRequired: true,
        notes: 'Owner notified twice. No compliance. Refer to legal.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'o2',
        propertyAddress: '456 Queen St E, Toronto, ON M5A 1T6',
        description: 'Exterior cladding deterioration',
        dateIssued: '2025-03-01',
        dueDate: '2025-04-01',
        inspectorId: 'i2',
        status: 'in_progress',
        enforcementRequired: false,
        notes: 'Contractor hired. Work scheduled.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'o3',
        propertyAddress: '789 Yonge St, Toronto, ON M4W 2G8',
        description: 'Blocked emergency exit on ground floor',
        dateIssued: '2025-01-15',
        dueDate: '2025-01-22',
        inspectorId: 'i3',
        status: 'closed',
        enforcementRequired: false,
        notes: 'Issue resolved. Exit cleared.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'o4',
        propertyAddress: '22 Front St W, Toronto, ON M5J 1C4',
        description: 'Water damage to load-bearing structure',
        dateIssued: '2025-03-15',
        dueDate: '2025-04-15',
        inspectorId: 'i1',
        status: 'open',
        enforcementRequired: false,
        notes: '',
        createdAt: now,
        updatedAt: now,
      },
    ];
    saveOrders(orders);
  }
}
