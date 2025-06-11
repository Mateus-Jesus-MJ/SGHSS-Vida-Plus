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
import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,NgxUiLoaderModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  version = "v1.1";
  labelUser: string = "Email";
  placeHolderUser: string = "Email";
  rotaPaciente = "paciente";
  rotaAdmin = "admin";
  rotaAtendimento = "atendimento";
  buscandoLogin: boolean = false;
  user!: User;
  loginForm!: FormGroup;


  constructor(private loginService: LoginService, private router: Router, private toastService: ToastrService, private authService: AuthService, private ngxUiLoaderService: NgxUiLoaderService) {
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
    this.ngxUiLoaderService.start();
    const login: Login = {
      usuario: this.loginForm.value.usuario.trim(),
      senha: this.loginForm.value.senha,
      tipoUsuario: this.loginForm.value.tipoUsuario.trim()
    };

    this.loginService.login(login).subscribe({
      next: (response: { canLogin: boolean, tipoUsuario?: string, message?: string }) => {
        if (!response.canLogin) {
          this.toastService.error(response.message || "Usuário, senha ou tipo de usuário incorreto", "", { progressBar: true });
          return;
        }

        const user = this.authService.getUsuario();
        if (!user) {
          this.toastService.error("Erro ao recuperar usuário logado", "", { progressBar: true });

          return;
        }

        this.toastService.info("Seja bem vindo ao SGHSS Vida Plus!", "", { progressBar: true });

        switch (response.tipoUsuario) {
          case 'ps':
            this.navigate('atendimento');
            break;
          case 'pc':
            this.navigate('paciente');
            break;
          case 'pa':
            this.navigate('admin');
            break;
          default:
            this.toastService.error("Tipo de usuário desconhecido, tente novamente mais tarde!", "", { progressBar: true });

            break;
        }
      },
      error: () => this.toastService.error("Erro inesperado! Tente novamente mais tarde", "", { progressBar: true })
    });
    this.ngxUiLoaderService.stop();
  }



  navigate(rota: string) {
    this.router.navigateByUrl(`/${rota}`);
  }
}
