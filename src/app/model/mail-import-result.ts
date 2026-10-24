import { MailMessageModel } from "./mail-message";

export interface MailImportResult {

    IsSucces: boolean;
    Message: string;

    MailMessages: MailMessageModel[];
}