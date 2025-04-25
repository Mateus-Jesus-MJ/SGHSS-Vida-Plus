import { Component, OnInit } from '@angular/core';
import { User } from '../../_models/User';
import { UserServiceService } from '../../_services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  imports: [RouterModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  rotaFilhaAtiva = false;
  usuarios!: User[] | null;

  constructor(private router: Router, private route: ActivatedRoute, private userService: UserServiceService, private toastr: ToastrService) { }
  ngOnInit(): void {
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.verificarRotaFilhaAtiva();
    });

    this.verificarRotaFilhaAtiva();

    this.buscarUsuarios();
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  buscarUsuarios() {
    this.userService.buscarUsuarios().subscribe({
      next: (users: User[] | null) => {
        this.usuarios = users;
      },
      error: () => this.toastr.error("Erro inesperado ao buscar hospitais! Tente novamente mais tarde")
    });
  }
}

