import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/service/toast-service';

@Component({
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  private readonly toastService = inject(ToastService);
  protected readonly toast = this.toastService.toast;

  close() {
    this.toastService.hide();
  }
}
