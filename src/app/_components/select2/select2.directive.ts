import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import 'select2';

declare var $: any;

@Directive({
  selector: '[appSelect2]',
  standalone: true
})
export class Select2Directive implements OnInit{
  @Input('appSelect2') options: any;

  constructor(private el: ElementRef, private control: NgControl) {}

  ngOnInit(): void {
    const selectElement = $(this.el.nativeElement);
    selectElement.select2(this.options);

    // Atualiza o FormControl quando o select2 muda
    selectElement.on('change', () => {
      const value = selectElement.val();
      this.control.control?.setValue(value);
      this.control.control?.markAsDirty();
      this.control.control?.markAsTouched();
    });
  }
}
