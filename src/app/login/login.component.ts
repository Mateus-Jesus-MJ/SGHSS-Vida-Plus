import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  labelUser: string = "Email";
  placeHolderUser: string = "Email";


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

}
