import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import 'select2';

declare var $: any;

@Directive({
  selector: '[appSelect2]',
  standalone: true
})
export class Select2Directive implements OnInit, OnDestroy {
  @Input('appSelect2') options: any;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    ($(this.el.nativeElement) as any).select2(this.options);
  }

  ngOnDestroy() {
    ($(this.el.nativeElement) as any).select2('destroy');
  }
}
