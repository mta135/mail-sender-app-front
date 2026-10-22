import { Routes } from '@angular/router';
import { MailSender } from '../components/mail-sender/mail-sender';

export const routes: Routes = [
  { path: '', redirectTo: 'mail-sender', pathMatch: 'full' },
  { path: 'mail-sender', component: MailSender },
];
