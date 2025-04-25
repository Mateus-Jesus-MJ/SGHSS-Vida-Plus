import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../_services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  nomeUsuario! : string | null;
  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
    this.nomeUsuario = this.authService.getNome();
  }

  sair(){
    this.authService.logout();
    this.router.navigateByUrl('./');
  }
}
