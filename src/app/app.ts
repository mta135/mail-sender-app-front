import { Component, signal } from '@angular/core';
import { Sidebar } from './components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/toast/toast';

@Component({
  imports: [Sidebar, RouterOutlet, Toast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mail-sender-app');
}
