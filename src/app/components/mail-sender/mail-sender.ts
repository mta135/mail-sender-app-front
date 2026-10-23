import { Component, inject, signal } from '@angular/core';
import { MailSenderService } from '../../core/service/mail-sender.service';
import { ToastService } from '../../core/service/toast-service';
import { MatTableModule } from '@angular/material/table';


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];


@Component({
  imports: [MatTableModule],
  selector: 'app-mail-sender',
  styleUrl: './mail-sender.css',
  templateUrl: './mail-sender.html',
  // A file dropped just outside the drop zone would otherwise be opened by the browser,
  // replacing the app (Firefox does this)
  host: {
    '(window:dragover)': '$event.preventDefault()',
    '(window:drop)': '$event.preventDefault()',
  },
})
export class MailSender {

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  private toastService = inject(ToastService);

  private mailSenderService = inject(MailSenderService);
  selectedFile = signal<File | null>(null);

  isUploading = signal(false);
  isDragging = signal(false);
  private dragDepth = 0;
  error = signal<string | null>(null);


  onFileSelected(event: Event): void {

    this.toastService.show('Mesajul a fost transmis');

    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {

      this.selectedFile.set(input.files?.[0] ?? null);


    }
    // Clear the input so picking the same file again still fires (change)
    input.value = '';
  }

  // preventDefault on dragover is what allows the drop; without it the browser opens the file
  // Firefox only allows the drop if dragenter is cancelled too, not just dragover
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

  // dragenter/dragleave also fire for the icon and text inside the drop zone, and Firefox
  // often reports relatedTarget as null, so count enters/leaves instead of checking it
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
    if (file) {
      this.selectedFile.set(file);
    }
  }

  cancel(): void {
    this.selectedFile.set(null);
    this.error.set(null);
  }

  UploadTempalteFile(): void {
    const file = this.selectedFile();
    if (!file) return;

    debugger

    this.isUploading.set(true);
    this.error.set(null);
    this.mailSenderService.UploadFile(file).subscribe({

      next: data => {
        this.isUploading.set(false);
        this.selectedFile.set(null);
      },
      error: err => {

        this.error.set(typeof err.error === 'string' ? err.error : 'Eroare la procesarea fișierului.');
        this.isUploading.set(false);

      }
    });
  }

}
