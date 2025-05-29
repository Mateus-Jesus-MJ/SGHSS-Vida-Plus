import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginacao',
  imports: [CommonModule],
  templateUrl: './paginacao.component.html',
  styleUrl: './paginacao.component.scss'
})
export class PaginacaoComponent {
  @Input() totalItems = 0;
  @Input() itemsPerPage = 25;
  @Input() currentPage = 1;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  }


  mudarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPages || pagina === this.currentPage) return;
    this.pageChange.emit(pagina);
  }
}
