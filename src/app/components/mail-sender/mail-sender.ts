import { Component, inject, signal } from '@angular/core';
import { MailSenderService } from '../../core/service/mail-sender.service';
import { ToastService } from '../../core/service/toast-service';
import { MatTableModule } from '@angular/material/table';
import { MailImportResult } from '../../model/mail-import-result';
import { MailMessageModel as MailMessages } from '../../model/mail-message';


@Component({
  imports: [MatTableModule],
  selector: 'app-mail-sender',
  styleUrl: './mail-sender.css',
  templateUrl: './mail-sender.html',

  host: {
    '(window:dragover)': '$event.preventDefault()',
    '(window:drop)': '$event.preventDefault()',
  },
})
export class MailSender {

  displayedColumns: string[] = [];
  dataSource = signal<MailMessages[]>([]);

  private toastService = inject(ToastService);
  private mailSenderService = inject(MailSenderService);

  selectedFile = signal<File | null>(null);

  isUploading = signal(false);
  isDragging = signal(false);

  private dragDepth = 0;
  error = signal<string | null>(null);


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files?.[0] ?? null);
    }

    input.value = '';
    this.GetMessage();
  }


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
    if (file) {
      this.selectedFile.set(file);
    }
  }

  cancel(): void {
    this.selectedFile.set(null);
    this.error.set(null);
  }

  UploadTempalteFile(): void {

  }


  GetMessage(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.mailSenderService.UploadFile(file).subscribe({
      next: (result: MailImportResult) => {
        console.log(result);

        debugger;
        if (result.IsSucces) {

          this.BindMessagesGrid(result.MailMessages);
          this.toastService.show('Mesajul a fost transmis');

        } else {
          this.toastService.show(result.Message, 'error');
        }
      },
      error: (err) => {
        this.toastService.show(typeof err.error === 'string' ? err.error : 'Eroare la procesarea fișierului.', 'error',);
      }
    });
  }


  private BindMessagesGrid(mailmessages: MailMessages[]): void {

    this.displayedColumns = ['From', 'To', 'Subject', 'Body', 'Attachments', 'Cc', 'Header', 'Footer', 'BodyAsHtml', 'Status',];
    this.dataSource.set(mailmessages ?? []);
  }

}


