import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../ModuloAdmim/_components/breadcrumb/breadcrumb.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-mobile',
  imports: [RouterModule, CommonModule],
  templateUrl: './top-mobile.component.html',
  styleUrl: './top-mobile.component.scss'
})
export class TopMobileComponent {
  breadcrumbService = inject(BreadcrumbService);
}
