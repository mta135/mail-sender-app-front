import { Component, signal } from '@angular/core';
import { FileUploadService } from '../../services/file-upload';

@Component({
  imports: [],
  selector: 'app-mailform',
  styleUrl: './mailform.css',
  templateUrl: './mailform.html',
})
export class Mailform {

  // Signals so the view updates from the HTTP callback (no zone.js to trigger change detection)
  selectedFile = signal<File | null>(null);
  isUploading = signal(false);

  constructor(private fileUploadService: FileUploadService) { }


  onFileSelected(event: Event): void {
    debugger;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
    // Clear the input so picking the same file again still fires (change)
    input.value = '';
  }



  onUpload(): void {
    const file = this.selectedFile();
    if (!file) return;

    debugger
    this.isUploading.set(true);
    this.fileUploadService.uploadFile(file).subscribe({

      next: (response) => {
        console.log('Upload successful', response);
        this.isUploading.set(false);
        this.selectedFile.set(null);
      },
      error: (error) => {
        console.error('Upload failed', error);
        this.isUploading.set(false);
      }
    });
  }

}
