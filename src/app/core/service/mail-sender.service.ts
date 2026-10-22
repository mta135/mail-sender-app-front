
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})


export class MailSenderService {

    private apiUrl = 'https://localhost:7191/api/File/MessageData';
    private templateUrl = 'https://localhost:7191/api/File/Template';

    private http = inject(HttpClient);


    UploadFile(file: File): Observable<any> {

        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<any>(this.apiUrl, formData);


    }


    DownloadTemplate(): Observable<Blob> {
        return this.http.get(this.templateUrl, { responseType: 'blob' });
    }

}