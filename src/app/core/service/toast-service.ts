import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastState = signal<ToastMessage | null>(null);
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  readonly toast = this.toastState.asReadonly();

  show(message: string, type: 'success' | 'error' = 'success', duration = 3000) {
    // Reset the previous timer so it doesn't hide the new toast too early
    clearTimeout(this.hideTimer);
    this.toastState.set({ text: message, type });
    this.hideTimer = setTimeout(() => this.toastState.set(null), duration);
  }
}
