import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../_components/navbar/navbar.component';
import { SidebarComponent } from '../../_components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../_components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-tela-admin',
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule, BreadcrumbComponent],
  templateUrl: './tela-admin.component.html',
  styleUrl: './tela-admin.component.scss'
})
export class TelaAdminComponent {
  
}
