import { MailSettingModel } from './mail-setting';

export interface MailMessageModel {

    MailFrom: string;
    ToRecipients: string;

    Subject: string;
    Body: string;

    AttachmentPath: string;
    CcRecipients: string;

    Status: string;
    Header: string;

    Footer: string;
    Setting: MailSettingModel;

    BodyAsHtml: string;
    ErrorMessage: string | null;
    HasError: boolean;

}
