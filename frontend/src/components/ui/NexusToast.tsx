/**
 * NexusToast — thin wrapper around react-hot-toast.
 *
 * Usage:
 *   nexusToast('message')              → info
 *   nexusToast('message', 'success')   → success
 *   nexusToast.success('message')      → success (shorthand)
 *   nexusToast.error('message')        → error
 *   nexusToast.warning('message')      → warning
 */

import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import React from 'react';

type ToastTone = 'success' | 'warning' | 'error' | 'info';

const ICONS: Record<ToastTone, React.ElementType> = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
};

const DURATIONS: Record<ToastTone, number> = {
  success: 3500,
  warning: 5000,
  error: 6000,
  info: 4000,
};

function show(message: string, tone: ToastTone = 'info') {
  const Icon = ICONS[tone];
  toast.custom(
    (t) => (
      <div
        className={`nexus-toast nexus-toast-${tone} ${t.visible ? 'toast-in' : 'toast-out'}`}
        role="alert"
        aria-live="polite"
      >
        <Icon size={18} aria-hidden="true" />
        <span>{message}</span>
      </div>
    ),
    { duration: DURATIONS[tone] }
  );
}

// Allow both nexusToast('msg') and nexusToast.success('msg')
export const nexusToast = Object.assign(
  (message: string, tone: ToastTone = 'info') => show(message, tone),
  {
    success: (message: string) => show(message, 'success'),
    error:   (message: string) => show(message, 'error'),
    warning: (message: string) => show(message, 'warning'),
    info:    (message: string) => show(message, 'info'),
  }
);
