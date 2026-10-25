import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../../model/toast.message';


@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private readonly toastState = signal<ToastMessage | null>(null);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  readonly toast = this.toastState.asReadonly();

  show(message: string, type: 'success' | 'error' = 'success', duration = 3000) {

    clearTimeout(this.hideTimer);
    this.toastState.set({ text: message, type, duration });
    this.hideTimer = setTimeout(() => this.toastState.set(null), duration);
  }

  hide() {
    clearTimeout(this.hideTimer);
    this.toastState.set(null);
  }
}
