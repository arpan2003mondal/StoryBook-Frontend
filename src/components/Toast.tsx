import React, { useEffect, useState } from 'react';
import type { Toast as ToastType } from '../services/ToastService';
import { ToastService } from '../services/ToastService';
import '../styles/Toast.css';

const Toast: React.FC = () => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const unsubscribe = ToastService.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
              {toast.type === 'warning' && '⚠'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close"
            onClick={() => ToastService.removeToast(toast.id)}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
