import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/service/toast-service';

@Component({
  selector: 'app-toast',
  styleUrl: './toast.css',
  templateUrl: './toast.html',
})
export class Toast {
  protected readonly toast = inject(ToastService).toast;
}
