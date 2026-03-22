import { useState } from 'react';
import { getInspectors, upsertInspector, deleteInspector } from '../utils/storage';
import { generateId } from '../utils/helpers';
import type { Inspector } from '../types';

const EMPTY: Omit<Inspector, 'id'> = { name: '', email: '', phone: '' };

export default function InspectorsList() {
  const [inspectors, setInspectors] = useState<Inspector[]>(() => getInspectors());
  const [editing, setEditing]       = useState<Inspector | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState<typeof EMPTY>({ ...EMPTY });
  const [errors, setErrors]         = useState<Partial<Record<keyof typeof EMPTY, string>>>({});

  const refresh = () => setInspectors(getInspectors());

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (i: Inspector) => {
    setEditing(i);
    setForm({ name: i.name, email: i.email, phone: i.phone });
    setErrors({});
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditing(null); };

  const set = <K extends keyof typeof EMPTY>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim())  e.name  = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const inspector: Inspector = editing
      ? { ...form, id: editing.id }
      : { ...form, id: generateId() };
    upsertInspector(inspector);
    refresh();
    cancelForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this inspector?')) {
      deleteInspector(id);
      refresh();
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Inspectors</h2>
          <p>Manage inspectors assigned to building orders</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Add Inspector</button>
      </div>

      {showForm && (
        <div className="card mt-8" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <span className="card-title">{editing ? 'Edit Inspector' : 'New Inspector'}</span>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="iName">Full Name *</label>
                  <input
                    id="iName"
                    className="form-control"
                    placeholder="Maria Santos"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                  {errors.name && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="iEmail">Email *</label>
                  <input
                    id="iEmail"
                    type="email"
                    className="form-control"
                    placeholder="inspector@toronto.ca"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                  {errors.email && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="iPhone">Phone</label>
                  <input
                    id="iPhone"
                    className="form-control"
                    placeholder="416-555-0100"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editing ? 'Save Changes' : 'Add Inspector'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          {inspectors.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <p>No inspectors yet. Add one above.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inspectors.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 500 }}>{i.name}</td>
                    <td>
                      <a href={`mailto:${i.email}`} style={{ color: 'var(--color-primary)' }}>{i.email}</a>
                    </td>
                    <td>{i.phone || <span className="text-muted">—</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-icon" title="Edit" onClick={() => openEdit(i)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="btn btn-icon danger" title="Delete" onClick={() => handleDelete(i.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
