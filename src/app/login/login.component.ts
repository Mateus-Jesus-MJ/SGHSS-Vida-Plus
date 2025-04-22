import { Component, OnInit } from '@angular/core';
import { User } from '../_models/User';
import { UserServiceService } from '../_services/user-service.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Login } from '../_models/Login';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [  CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public user! :User;
  form: FormGroup = new FormGroup({});

  labelUser: string = "Email";
  placeHolderUser: string = "Email";


constructor(private fb: FormBuilder, private userService: UserServiceService){}

  ngOnInit(): void {
    this.user = new User();
    this.inicializarFormulario();
  }


  inicializarFormulario(): void {
    this.form = this.fb.group({
      tipoUsuario : ['', [Validators.required]],
      usuario : ['', [Validators.required]],
      senha : ['', [Validators.required]]
    });
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

  logar(): void{
    if(this.form.invalid){
      alert("usuario ou senha incorretos");
      return;
    }

    const login: Login = {
      usuario: this.form.value.usuario,
      senha: this.form.value.senha,
      tipoUsuario: this.form.value.tipoUsuario
    };

    var user = this.userService.buscaLogin(login);

    alert(user);
  }
}
