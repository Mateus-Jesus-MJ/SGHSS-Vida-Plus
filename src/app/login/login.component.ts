import { Component } from '@angular/core';
import { User } from '../_models/User';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../_services/login.service';
import { Login } from '../_models/Login';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../_services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  labelUser: string = "Email";
  placeHolderUser: string = "Email";
  rotaPaciente = "paciente";
  rotaAdmin = "admin";
  rotaAtendimento = "atendimento";
  buscandoLogin: boolean = false;
  user!: User;
  loginForm!: FormGroup;


  constructor(private loginService: LoginService, private router: Router, private toastService: ToastrService, private authService: AuthService) {
    this.loginForm = new FormGroup({
      tipoUsuario: new FormControl('', [Validators.required]),
      usuario: new FormControl('', [Validators.required]),
      senha: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  tipoUsuarioLabel(event: Event): void {
    const select = event.target as HTMLInputElement;
    const value = select.value;

    if (value == "pc") {
      this.labelUser = "Email";
      this.placeHolderUser = "Email";
    } else {
      this.labelUser = "Usuário";
      this.placeHolderUser = "Usuário";
    }
  }

  submit() {
    const login: Login = {
      usuario: this.loginForm.value.usuario.trim(),
      senha: this.loginForm.value.senha,
      tipoUsuario: this.loginForm.value.tipoUsuario.trim()
    };

    this.loginService.login(login).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.toastService.error("Usuário, senha ou tipo de usuário incorreto");
        } else {
          this.authService.login(user);
          switch (user.tipoUsuario) {
            case 'ps':
              this.toastService.success("Login feito com sucesso!");
              this.navigate('atendimento');
              break;
            case 'pc':
              this.navigate('paciente');
              break;
            case 'pa':
              this.navigate('admin');
              break;
            default:
              this.toastService.error("Tipo de usuário desconhecido, tente novamente mais tarde!");
              break;
          }
        }
      },
      error: () => this.toastService.error("Erro inesperado! Tente novamente mais tarde")
    });
  }



  navigate(rota: string) {
    this.router.navigateByUrl(`/${rota}`);
  }
}
