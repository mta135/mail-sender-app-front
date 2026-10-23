import { Component, inject, signal } from '@angular/core';
import { MailSenderService } from '../../core/service/mail-sender.service';
import { ToastService } from '../../core/service/toast-service';

@Component({
  imports: [],
  selector: 'app-mail-sender',
  styleUrl: './mail-sender.css',
  templateUrl: './mail-sender.html',
})
export class MailSender {


  private toastService = inject(ToastService);

  private mailSenderService = inject(MailSenderService);
  selectedFile = signal<File | null>(null);


  isUploading = signal(false);
  isDragging = signal(false);
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
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }


  onDragLeave(event: DragEvent): void {
    // dragleave also fires when moving onto the icon or text inside the drop zone
    const target = event.currentTarget as HTMLElement;
    if (!target.contains(event.relatedTarget as Node)) {
      this.isDragging.set(false);
    }
  }


  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile.set(file);
    }
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
