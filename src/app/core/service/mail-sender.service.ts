
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable, Subject, switchMap } from 'rxjs';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { MailMessageModel } from '../../model/mail-message';
import { MailImportResult } from '../../model/mail-import-result';

@Injectable({
    providedIn: 'root'
})


export class MailSenderService {

    private apiUrl = 'https://localhost:7191/api/File/MessageData';
    private templateUrl = 'https://localhost:7191/api/File/Template';
    private sendMessagesUrl = 'https://localhost:7191/api/MailDelivery/SendMailMessages';
    private hubUrl = 'https://localhost:7191/hubs/mail-status';

    private http = inject(HttpClient);

    private hubConnection: HubConnection = new HubConnectionBuilder().withUrl(this.hubUrl).build();

    mailStatus$ = new Subject<unknown>();

    constructor() {
        this.hubConnection.on('MailStatus', (result: unknown) => this.mailStatus$.next(result));
    }

    UploadFile(file: File): Observable<MailImportResult> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        return this.http.post<MailImportResult>(this.apiUrl, formData);

    }


    DownloadTemplate(): Observable<Blob> {
        return this.http.get(this.templateUrl, { responseType: 'blob' });
    }


    SendMailMessages(messages: MailMessageModel[]): Observable<string> {
        return from(this.GetConnectionId()).pipe(
            switchMap((connectionId) =>
                this.http.post(this.sendMessagesUrl, messages, { params: { connectionId }, responseType: 'text' })
            )
        );
    }


    private async GetConnectionId(): Promise<string> {
        if (this.hubConnection.state === HubConnectionState.Disconnected) {
            await this.hubConnection.start();
        }

        return this.hubConnection.connectionId!;
    }

}