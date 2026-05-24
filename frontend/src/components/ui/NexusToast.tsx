import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

type ToastTone = 'success' | 'warning' | 'error' | 'info';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info
};

export function nexusToast(message: string, tone: ToastTone = 'info') {
  const Icon = icons[tone];
  toast.custom(
    (t) => (
      <div className={`nexus-toast nexus-toast-${tone} ${t.visible ? 'toast-in' : 'toast-out'}`}>
        <Icon size={18} />
        <span>{message}</span>
      </div>
    ),
    { duration: 4000 }
  );
}
