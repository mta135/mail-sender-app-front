import { DestroyRef, Directive, ElementRef, inject, Renderer2, signal } from '@angular/core';

const MIN_WIDTH = 80;

@Directive({
  selector: 'th[appColumnResize]',

  host: {
    '[style.width.px]': 'width()',
    '[style.min-width.px]': 'width()',
  },
})
export class ColumnResize {

  width = signal<number | null>(null);

  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);

  private stopDrag: (() => void) | null = null;

  constructor() {
    const handle = this.renderer.createElement('span');
    this.renderer.addClass(handle, 'resize_handle');
    this.renderer.appendChild(this.element.nativeElement, handle);

    const stopListening = this.renderer.listen(handle, 'mousedown', (event: MouseEvent) =>
      this.startResize(event),
    );

    inject(DestroyRef).onDestroy(() => {
      stopListening();
      this.stopDrag?.();
    });
  }

  private startResize(event: MouseEvent): void {
    // Keeps the drag from selecting the header text
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = this.element.nativeElement.offsetWidth;

    const stopMove = this.renderer.listen('document', 'mousemove', (move: MouseEvent) => {
      this.width.set(Math.max(MIN_WIDTH, startWidth + move.clientX - startX));
    });
    const stopUp = this.renderer.listen('document', 'mouseup', () => this.stopDrag?.());

    this.stopDrag = () => {
      stopMove();
      stopUp();
      this.stopDrag = null;
    };
  }
}
