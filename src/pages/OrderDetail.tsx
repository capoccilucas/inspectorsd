import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrderById, getInspectorById, deleteOrder } from '../utils/storage';
import { formatDate, isOverdue } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const order    = id ? getOrderById(id) : undefined;
  const inspector = order ? (getInspectorById(order.inspectorId) ?? null) : null;

  useEffect(() => {
    if (id && !order) navigate('/orders', { replace: true });
  }, [id, order, navigate]);

  if (!order) return null;

  const overdue = isOverdue(order.dueDate) && order.status !== 'closed';

  const handleDelete = () => {
    if (window.confirm('Delete this order?')) {
      deleteOrder(order.id);
      navigate('/orders');
    }
  };

  return (
    <div className="page-body">
      <div className="breadcrumb">
        <Link to="/orders">Orders</Link>
        <span>›</span>
        <span style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.propertyAddress}
        </span>
      </div>

      {(order.enforcementRequired || order.status === 'enforcement_required') && (
        <div className="alert-banner danger">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>Further enforcement is required for this order.</strong>
        </div>
      )}

      {overdue && (
        <div className="alert-banner warning">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <strong>This order is past its due date.</strong>
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>{order.propertyAddress}</h2>
          <p>Order #{order.id}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/orders/${order.id}/edit`} className="btn btn-secondary">Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Order Details</span>
          <StatusBadge status={order.status} />
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label>Property Address</label>
              <p>{order.propertyAddress}</p>
            </div>
            <div className="detail-item">
              <label>Inspector Assigned</label>
              <p>
                {inspector ? (
                  <Link to={`/inspectors`} style={{ color: 'var(--color-primary)' }}>
                    {inspector.name}
                  </Link>
                ) : '—'}
              </p>
            </div>
            <div className="detail-item">
              <label>Date Issued</label>
              <p>{formatDate(order.dateIssued)}</p>
            </div>
            <div className="detail-item">
              <label>Compliance Due Date</label>
              <p className={overdue ? 'overdue-text' : ''}>
                {formatDate(order.dueDate)} {overdue && '⚠ Overdue'}
              </p>
            </div>
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <p>{order.description}</p>
            </div>
            <div className="detail-item">
              <label>Enforcement Required</label>
              <p>
                {order.enforcementRequired || order.status === 'enforcement_required'
                  ? <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>🚨 Yes</span>
                  : <span className="text-muted">No</span>
                }
              </p>
            </div>
            <div className="detail-item">
              <label>Inspector Contact</label>
              <p>
                {inspector ? (
                  <>
                    <a href={`mailto:${inspector.email}`} style={{ color: 'var(--color-primary)' }}>{inspector.email}</a>
                    {' · '}{inspector.phone}
                  </>
                ) : '—'}
              </p>
            </div>
            {order.notes && (
              <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                <label>Internal Notes</label>
                <p style={{ whiteSpace: 'pre-wrap' }}>{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
