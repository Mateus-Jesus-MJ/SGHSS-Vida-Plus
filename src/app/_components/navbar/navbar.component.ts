import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  nomeUsuario! : string | null;

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
    this.nomeUsuario = sessionStorage.getItem("nome");
  }


  sair(){
    console.log("aqui");
    this.authService.clear();
    this.router.navigateByUrl('./');
  }

}
