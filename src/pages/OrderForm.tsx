import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getOrderById, getInspectors, upsertOrder } from '../utils/storage';
import { generateId, STATUS_LABELS } from '../utils/helpers';
import type { Order, Inspector, EnforcementStatus } from '../types';

const STATUSES: EnforcementStatus[] = ['open', 'in_progress', 'enforcement_required', 'closed'];

const EMPTY: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
  propertyAddress: '',
  description: '',
  dateIssued: new Date().toISOString().split('T')[0],
  dueDate: '',
  inspectorId: '',
  status: 'open',
  enforcementRequired: false,
  notes: '',
};

export default function OrderForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [inspectors] = useState<Inspector[]>(() => getInspectors());
  const [form, setForm] = useState<typeof EMPTY>(() => {
    if (!isNew && id) {
      const existing = getOrderById(id);
      if (existing) {
        return {
          propertyAddress: existing.propertyAddress,
          description:     existing.description,
          dateIssued:      existing.dateIssued,
          dueDate:         existing.dueDate,
          inspectorId:     existing.inspectorId,
          status:          existing.status,
          enforcementRequired: existing.enforcementRequired,
          notes:           existing.notes,
        };
      }
    }
    return { ...EMPTY };
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.propertyAddress.trim()) e.propertyAddress = 'Required';
    if (!form.description.trim())     e.description     = 'Required';
    if (!form.dateIssued)             e.dateIssued      = 'Required';
    if (!form.dueDate)                e.dueDate         = 'Required';
    if (!form.inspectorId)            e.inspectorId     = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date().toISOString();
    const order: Order = isNew
      ? { ...form, id: generateId(), createdAt: now, updatedAt: now }
      : { ...form, id: id!, createdAt: now, updatedAt: now };

    upsertOrder(order);
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="page-body">
      <div className="breadcrumb">
        <Link to="/orders">Orders</Link>
        <span>›</span>
        <span>{isNew ? 'New Order' : 'Edit Order'}</span>
      </div>

      <div className="page-header">
        <div>
          <h2>{isNew ? 'New Order' : 'Edit Order'}</h2>
          <p>{isNew ? 'Create a new building order' : 'Update the details of this order'}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="propertyAddress">Property Address *</label>
              <input
                id="propertyAddress"
                className="form-control"
                placeholder="e.g. 123 King St W, Toronto, ON M5H 1J9"
                value={form.propertyAddress}
                onChange={(e) => set('propertyAddress', e.target.value)}
              />
              {errors.propertyAddress && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.propertyAddress}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description / Order Details *</label>
              <textarea
                id="description"
                className="form-control"
                placeholder="Describe the violation or issue…"
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
              {errors.description && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.description}</div>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="dateIssued">Date Issued *</label>
                <input
                  id="dateIssued"
                  type="date"
                  className="form-control"
                  value={form.dateIssued}
                  onChange={(e) => set('dateIssued', e.target.value)}
                />
                {errors.dateIssued && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.dateIssued}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dueDate">Compliance Due Date *</label>
                <input
                  id="dueDate"
                  type="date"
                  className="form-control"
                  value={form.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                />
                {errors.dueDate && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.dueDate}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="inspectorId">Assigned Inspector *</label>
                <select
                  id="inspectorId"
                  className="form-control"
                  value={form.inspectorId}
                  onChange={(e) => set('inspectorId', e.target.value)}
                >
                  <option value="">— Select inspector —</option>
                  {inspectors.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
                {errors.inspectorId && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.inspectorId}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="form-control"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as EnforcementStatus)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="toggle-row">
              <input
                id="enforcementRequired"
                type="checkbox"
                checked={form.enforcementRequired}
                onChange={(e) => set('enforcementRequired', e.target.checked)}
              />
              <label htmlFor="enforcementRequired" className="toggle-label">
                🚨 Flag for Further Enforcement
              </label>
            </div>

            <div className="form-group mt-16">
              <label className="form-label" htmlFor="notes">Internal Notes</label>
              <textarea
                id="notes"
                className="form-control"
                placeholder="Any additional notes for this order…"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {isNew ? 'Create Order' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
