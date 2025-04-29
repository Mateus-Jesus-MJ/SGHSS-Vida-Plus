import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserServiceService } from '../../_services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { User } from '../../_models/User';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-meuperfil',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './meuperfil.component.html',
  styleUrl: './meuperfil.component.scss'
})
export class MeuperfilComponent implements OnInit {
  emailForm!: FormGroup;
  senhaForm!: FormGroup;
  usuario!: User;
  fromAlterar: string = "email";

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private userService: UserServiceService,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService
  ) {
    this.emailForm = new FormGroup({
      email: new FormControl('', [Validators.required]),
    });
    this.senhaForm = new FormGroup({
      senhaAtual: new FormControl('', [Validators.required, Validators.minLength(8)]),
      novaSenha: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)]),
      confirmarSenha: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)])
    });
  }
  ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id')!;

      if (id == null || id == "") {
        this.toastr.error("Usuário inválido ou não encontrado");
        this.router.navigateByUrl('/admin/usuarios');
        return
      }
      this.buscarDadosUsuario(id);
      this.ngxUiLoaderService.stop();
    });
  }

  buscarDadosUsuario(id: string) {
    this.userService.buscarUsuarioPorId(id).subscribe(
      (user) => {
        if (user) {
          this.usuario = user;
          this.emailForm.get("email")!.setValue(user.email)
        } else {
          this.toastr.error("Usuário inválido ou não encontrado");
          this.router.navigateByUrl('/admin/usuarios');
        }
      }
    )
  }

  senhasIguais() {

    const senha = this.senhaForm.get('novaSenha')?.value;
    const confirmar =this.senhaForm.get('confirmarSenha')?.value;

    if(confirmar == "" || confirmar== null) return

    if(senha == confirmar){

    }else{
      this.senhaForm.get('confirmarSenha')!.setErrors({ divergente: true });
    }

  }

  mudaForm(form: string) {
    this.fromAlterar = form;
  }

  submit() {
    let usuarioEditar: User = {
      id: this.usuario.id,
      nome: this.usuario.nome,
      usuario: this.usuario.usuario,
      email: this.usuario.email,
      senha: this.usuario.senha,
      tipoUsuario: this.usuario.tipoUsuario,
      cargo: this.usuario.cargo || '',
      autorizacoes: this.usuario.autorizacoes ,
      colaborador: this.usuario.colaborador || '',
      paciente: this.usuario.paciente,
      status: this.usuario.status
    };

    function removerCamposUndefined(obj: any): any {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined)
      );
    }

    usuarioEditar = removerCamposUndefined(usuarioEditar);

    if (this.fromAlterar == "email") {
      if (this.emailForm.invalid) {
        this.emailForm.markAllAsTouched();
        return;
      }
      usuarioEditar.email = this.emailForm.get('email')!.value

    } else if (this.fromAlterar == "senha") {
      if (this.senhaForm.invalid) {
        this.senhaForm.markAllAsTouched();
        return;
      }

      if(this.senhaForm.get('senhaAtual')!.value != this.usuario.senha){
        this.toastr.error("A senha atual informada está incorreta");
        return
      }

      usuarioEditar.senha = this.senhaForm.get('novaSenha')!.value
    }
    this.ngxUiLoaderService.start();

    this.userService.editarUser(usuarioEditar).subscribe({
      next: (res: any) => {
        this.senhaForm.reset();
        this.toastr.success(res);
        this.buscarDadosUsuario(this.usuario!.id!);
      },
      error: (err: any) => {
        this.toastr.error(err);
      }
    });
     this.ngxUiLoaderService.stop();
  }
}




