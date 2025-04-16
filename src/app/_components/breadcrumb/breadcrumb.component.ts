import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
    standalone: true,
    selector: 'app-breadcrumb',
    imports: [RouterModule, CommonModule],
    templateUrl: './breadcrumb.component.html',
    styleUrl: './breadcrumb.component.scss'
})
export class BreadcrumbComponent {
  breadcrumbService = inject(BreadcrumbService);
  constructor(){}
}
