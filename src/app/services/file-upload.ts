import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Service()
export class FileUploadService {

    private baseUrl = 'https://localhost:7191/api/File/MessageData';
    private http = inject(HttpClient);

    uploadFile(file: File): Observable<any> {

        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post(this.baseUrl, formData);

    }


}
