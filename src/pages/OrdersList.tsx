import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getOrders, getInspectors, deleteOrder } from '../utils/storage';
import { formatDate, isOverdue, STATUS_LABELS } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';
import type { Order, Inspector, EnforcementStatus } from '../types';

const ALL_STATUSES: EnforcementStatus[] = ['open', 'in_progress', 'enforcement_required', 'closed'];

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [inspectors, setInspectors] = useState<Inspector[]>(() => getInspectors());
  const [search, setSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get('status') ?? '') as EnforcementStatus | '';

  const refresh = () => {
    setOrders(getOrders());
    setInspectors(getInspectors());
  };

  const inspectorMap = Object.fromEntries(inspectors.map((i) => [i.id, i]));

  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.propertyAddress.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      (inspectorMap[o.inspectorId]?.name ?? '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => b.dateIssued.localeCompare(a.dateIssued));

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this order?')) {
      deleteOrder(id);
      refresh();
    }
  };

  const setStatus = (v: string) => {
    if (v) {
      setSearchParams({ status: v });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>All building orders issued to Toronto properties</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          + New Order
        </Link>
      </div>

      <div className="filters-row">
        <input
          className="form-control search-input"
          placeholder="Search by address, description or inspector…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-control"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {sorted.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>No orders found.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Property Address</th>
                  <th>Description</th>
                  <th>Date Issued</th>
                  <th>Due Date</th>
                  <th>Inspector</th>
                  <th>Status</th>
                  <th>Enforcement</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((o) => (
                  <tr
                    key={o.id}
                    className={o.enforcementRequired || o.status === 'enforcement_required' ? 'enforcement-row' : ''}
                  >
                    <td>
                      <Link to={`/orders/${o.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        {o.propertyAddress}
                      </Link>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.description}
                    </td>
                    <td>{formatDate(o.dateIssued)}</td>
                    <td className={isOverdue(o.dueDate) && o.status !== 'closed' ? 'overdue-text' : ''}>
                      {formatDate(o.dueDate)}
                      {isOverdue(o.dueDate) && o.status !== 'closed' && ' ⚠'}
                    </td>
                    <td>{inspectorMap[o.inspectorId]?.name ?? <span className="text-muted">—</span>}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>
                      {(o.enforcementRequired || o.status === 'enforcement_required') ? (
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: 12 }}>
                          ● Required
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to={`/orders/${o.id}/edit`} className="btn btn-icon" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </Link>
                        <button className="btn btn-icon danger" title="Delete" onClick={() => handleDelete(o.id)}>
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
