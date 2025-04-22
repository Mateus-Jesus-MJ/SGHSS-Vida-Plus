import { Component, OnInit } from '@angular/core';
import { User } from '../_models/User';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../_services/login.service';
import { Login } from '../_models/Login';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [LoginService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  labelUser: string = "Email";
  placeHolderUser: string = "Email";
  user!: User;
  // form: FormGroup = new FormGroup({});
  loginForm!: FormGroup;


  constructor(private loginService: LoginService, private router: Router, private toastService: ToastrService) {
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
      usuario: this.loginForm.value.usuario,
      senha: this.loginForm.value.senha,
      tipoUsuario: this.loginForm.value.tipoUsuario
    };

    this.loginService.login(login).subscribe({
      next: (user: User | null) => {
        if (!user) {
          this.toastService.error("Usuário, senha ou tipo de usuário incorreto");
        } else {
          console.log("Tipo de usuário: ", user.tipoUsuario);  // Verifique o valor aqui

          switch (user.tipoUsuario.trim().toLowerCase()) {
            case 'ps':
              this.toastService.success("Login feito com sucesso!");
              console.log("Redirecionando para a página inicial...");
              setTimeout(() => this.navigate(''), 0);  // Atrasar a navegação por um ciclo de evento
              break;
            case 'pc':
              console.log("Redirecionando para admin/inicio...");
              this.navigate('admin/inicio');
              break;
            case 'pa':
              console.log("Redirecionando para admin/inicio...");
              this.navigate('admin/inicio');
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
