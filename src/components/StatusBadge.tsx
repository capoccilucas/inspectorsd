import type { EnforcementStatus } from '../types';
import { STATUS_LABELS } from '../utils/helpers';

interface Props {
  status: EnforcementStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`badge badge-${status}`}>
      {status === 'enforcement_required' && (
        <span className="enforcement-dot" />
      )}
      {STATUS_LABELS[status]}
    </span>
  );
}
