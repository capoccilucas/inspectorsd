import { Link } from 'react-router-dom';
import { getOrders, getInspectors } from '../utils/storage';
import { isOverdue, formatDate } from '../utils/helpers';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard() {
  const orders     = getOrders();
  const inspectors = getInspectors();

  const enforcementOrders = orders.filter((o) => o.enforcementRequired || o.status === 'enforcement_required');
  const overdueOrders     = orders.filter((o) => o.status !== 'closed' && isOverdue(o.dueDate));
  const openOrders        = orders.filter((o) => o.status === 'open');
  const closedOrders      = orders.filter((o) => o.status === 'closed');

  const inspectorMap = Object.fromEntries(inspectors.map((i) => [i.id, i]));

  const recentOrders = [...orders]
    .sort((a, b) => b.dateIssued.localeCompare(a.dateIssued))
    .slice(0, 5);

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of all orders issued to Toronto properties</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          + New Order
        </Link>
      </div>

      {enforcementOrders.length > 0 && (
        <div className="alert-banner danger">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <strong>{enforcementOrders.length} order{enforcementOrders.length > 1 ? 's' : ''} require further enforcement.</strong>
            {' '}
            <Link to="/orders?status=enforcement_required" style={{ textDecoration: 'underline' }}>
              View orders →
            </Link>
          </div>
        </div>
      )}

      {overdueOrders.length > 0 && (
        <div className="alert-banner warning">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>{overdueOrders.length} order{overdueOrders.length > 1 ? 's' : ''} past due date.</strong>
            {' '}
            <Link to="/orders" style={{ textDecoration: 'underline' }}>
              Review orders →
            </Link>
          </div>
        </div>
      )}

      <div className="stats-row">
        <div className="stat-card info">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Open</div>
          <div className="stat-value">{openOrders.length}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Enforcement</div>
          <div className="stat-value">{enforcementOrders.length}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Overdue</div>
          <div className="stat-value">{overdueOrders.length}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Closed</div>
          <div className="stat-value">{closedOrders.length}</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Inspectors</div>
          <div className="stat-value">{inspectors.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Orders</span>
          <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
        </div>
        <div className="table-wrapper">
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet. <Link to="/orders/new">Create one →</Link></p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Property Address</th>
                  <th>Date Issued</th>
                  <th>Due Date</th>
                  <th>Inspector</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className={o.enforcementRequired || o.status === 'enforcement_required' ? 'enforcement-row' : ''}>
                    <td>
                      <Link to={`/orders/${o.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        {o.propertyAddress}
                      </Link>
                    </td>
                    <td>{formatDate(o.dateIssued)}</td>
                    <td className={isOverdue(o.dueDate) && o.status !== 'closed' ? 'overdue-text' : ''}>
                      {formatDate(o.dueDate)}
                      {isOverdue(o.dueDate) && o.status !== 'closed' && ' ⚠'}
                    </td>
                    <td>{inspectorMap[o.inspectorId]?.name ?? '—'}</td>
                    <td><StatusBadge status={o.status} /></td>
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
