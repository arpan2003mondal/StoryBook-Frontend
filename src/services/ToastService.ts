export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number; // in milliseconds
}

export class ToastService {
  private static listeners: ((toasts: Toast[]) => void)[] = [];
  private static toasts: Toast[] = [];
  private static nextId = 0;

  static subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  static showSuccess(message: string, duration: number = 3000) {
    this.addToast({ type: 'success', message, duration });
  }

  static showError(message: string, duration: number = 4000) {
    this.addToast({ type: 'error', message, duration });
  }

  static showInfo(message: string, duration: number = 3000) {
    this.addToast({ type: 'info', message, duration });
  }

  static showWarning(message: string, duration: number = 3500) {
    this.addToast({ type: 'warning', message, duration });
  }

  private static addToast(toast: Omit<Toast, 'id'>) {
    const id = `toast-${this.nextId++}`;
    const newToast: Toast = { ...toast, id };
    this.toasts.push(newToast);
    this.notifyListeners();

    // Auto-remove toast after duration
    if (toast.duration) {
      setTimeout(() => {
        this.removeToast(id);
      }, toast.duration);
    }
  }

  static removeToast(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.notifyListeners();
  }

  static clear() {
    this.toasts = [];
    this.notifyListeners();
  }
}
