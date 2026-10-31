import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MailSenderService } from '../../core/service/mail-sender.service';
import { MailStatusHubService } from '../../core/service/mail-status-hub.service';
import { ToastService } from '../../core/service/toast-service';
import { FileUpload } from '../../shared/file-upload/file-upload';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { MailImportResult } from '../../model/mail-import-result';
import { MailMessageModel as MailMessages } from '../../model/mail-message';
import { MailDeliveryResult } from '../../model/mail-delivery-result';


@Component({
  imports: [MatTableModule, MatProgressSpinnerModule, FileUpload],
  selector: 'app-mail-sender',
  styleUrl: './mail-sender.css',
  templateUrl: './mail-sender.html',
})
export class MailSender implements OnInit {

  displayedColumns: string[] = [];
  dataSource = signal<MailMessages[]>([]);
  columnWidths = signal<Record<string, number>>({});

  private toastService = inject(ToastService);
  private mailSenderService = inject(MailSenderService);
  private mailStatusHubService = inject(MailStatusHubService);
  private destroyRef = inject(DestroyRef);

  selectedFile = signal<File | null>(null);

  isUploading = signal(false);
  isLoading = signal(false);
  hasErrors = signal(false);

  error = signal<string | null>(null);

  constructor() {
  }


  ngOnInit(): void {

    this.mailStatusHubService.mailStatus$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => this.updateRowStatus(result));

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files?.[0] ?? null);
    }

    this.ClearGrid();
    input.value = '';
    this.GetMessage();
  }


  cancel(): void {
    this.selectedFile.set(null);
    this.error.set(null);
    this.hasErrors.set(false);
  }

  async SendMailMessages(): Promise<void> {
    this.isUploading.set(true);

    try {
      debugger
      const connectionId = await this.mailStatusHubService.connect();

      this.mailSenderService.SendMailMessages(this.dataSource(), connectionId).subscribe({
        next: text => console.log(text),
        error: err => {
          console.error(err);

          this.toastService.show(`Eroare la trimitere${err?.error ?? ''}`, 'error');
          this.isUploading.set(false);
        },
        complete: () => this.isUploading.set(false),
      });
    } catch (err) {
      console.error('Nu m-am putut conecta la SignalR', err);


      this.isUploading.set(false);
    }
  }


  GetMessage(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.isLoading.set(true);
    this.hasErrors.set(false);

    this.mailSenderService.UploadFile(file).pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (result: MailImportResult) => {
        console.log(result);

        if (result.isSucces) {

          this.BindMessagesGrid(result.value);

          if (result.value.some(x => x.hasError == true)) {

            this.toastService.show("În fișier sunt erori. Pentru a transmite e-mailurile, corectați erorile.", 'error');
            this.hasErrors.set(true);

            return;
          }

          this.toastService.show('Fisierul este valid.');

        } else {
          this.toastService.show(result.message, 'error');
        }
      },
      error: (err) => {
        this.toastService.show(typeof err.error === 'string' ? err.error : 'Eroare la procesarea fișierului.', 'error',);
      }
    });
  }


  private BindMessagesGrid(value: MailMessages[]): void {

    this.displayedColumns = ['Number', 'From', 'To', 'Subject', 'Body', 'Attachments', 'Cc', 'Header', 'Footer', 'BodyAsHtml', 'Status', 'Error'];
    this.dataSource.set(value ?? []);
  }


  columnWidth(column: string): number | null {
    return this.columnWidths()[column] ?? null;
  }

  startResize(event: MouseEvent, column: string): void {
    // Keeps the drag from selecting the header text
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = (event.target as HTMLElement).parentElement!.offsetWidth;

    const onMove = (move: MouseEvent) => {
      const width = Math.max(80, startWidth + move.clientX - startX);
      this.columnWidths.update((widths) => ({ ...widths, [column]: width }));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  private ClearGrid(): void {
    if (this.dataSource().length > 0) {
      this.dataSource.set([]);
    }
  }


  private updateRowStatus(result: MailDeliveryResult): void {
    this.dataSource.update(rows =>
      rows.map(r => (r.id === result.id ? { ...r, status: result.status, errorMessage: result.error ?? null } : r))
    );
  }

}


