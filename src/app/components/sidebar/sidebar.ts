import { Component, inject } from '@angular/core';
import { MailSenderService } from '../../core/service/mail-sender.service';

@Component({
  imports: [],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private mailSenderService = inject(MailSenderService);

  downloadTemplate(event: MouseEvent): void {

    event.preventDefault();
    console.log('Sablon click', event);

    this.mailSenderService.DownloadTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sablon.xlsx';
        link.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => console.error('Template download failed', err),
    });
  }
}
