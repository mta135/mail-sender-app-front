import { MailSettingModel } from './mail-setting';

export interface MailMessageModel {

    mailFrom: string;
    toRecipients: string;

    subject: string;
    body: string;

    attachmentPath: string;
    ccRecipients: string;

    status: string;
    header: string;

    footer: string;
    setting: MailSettingModel;

    bodyAsHtml: string;
    errorMessage: string | null;
    hasError: boolean;

}
