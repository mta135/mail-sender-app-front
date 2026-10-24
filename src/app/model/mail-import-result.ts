import { MailMessageModel } from "./mail-message";

export interface MailImportResult {

    isSucces: boolean;
    message: string;

    mailMessages: MailMessageModel[];
}