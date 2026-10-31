import { Injectable, signal } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { MailDeliveryResult } from '../../model/mail-delivery-result';

@Injectable({ providedIn: 'root' })

export class MailStatusHubService {

    private readonly hub: HubConnection = new HubConnectionBuilder()
        .withUrl(`${environment.apiUrl}/hubs/mail-status`)
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Warning)
        .build();

    readonly mailStatus$ = new Subject<MailDeliveryResult>();
    readonly isConnected = signal(false);

    constructor() {
        // același nume ca pe server: SendAsync("MailStatus", result)
        this.hub.on('MailStatus', (result: MailDeliveryResult) => this.mailStatus$.next(result));

        this.hub.onreconnecting(() => this.isConnected.set(false));
        this.hub.onreconnected(() => this.isConnected.set(true));
        this.hub.onclose(() => this.isConnected.set(false));
    }

    async connect(): Promise<string> {
        if (this.hub.state === HubConnectionState.Disconnected) {
            await this.hub.start();
            this.isConnected.set(true);
        }
        return this.hub.connectionId!;
    }
}