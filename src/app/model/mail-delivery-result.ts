export interface MailDeliveryResult {
    id: string;          // ca să găsești rândul din grid
    status: string;      // ex. 'Sent' | 'Failed'
    error?: string;
}
