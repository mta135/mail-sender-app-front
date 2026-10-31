import { Directive, inject, output, signal } from '@angular/core';
import { ToastService } from '../../core/service/toast-service';

@Directive({
  selector: '[appFileUpload]',

  host: {
    '[class.dragging]': 'isDragging()',
    '(dragenter)': 'onDragEnter($event)',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
    '(window:dragover)': '$event.preventDefault()',
    '(window:drop)': '$event.preventDefault()',
  },
})
export class FileUpload {

  fileDropped = output<File>();

  isDragging = signal(false);

  private toastService = inject(ToastService);

  private dragDepth = 0;


  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth++;
    this.isDragging.set(true);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }


  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) {
      this.isDragging.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragDepth = 0;
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (!file) return;

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      this.toastService.show('Sunt acceptate doar fișiere Excel (.xlsx, .xls).', 'error');
      return;
    }

    this.fileDropped.emit(file);
  }
}
