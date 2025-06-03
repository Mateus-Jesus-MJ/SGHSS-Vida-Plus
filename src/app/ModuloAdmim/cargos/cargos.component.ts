import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Cargo } from '../../_models/cargo';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CargosService } from '../../_services/cargos.service';
import { NgxMaskPipe } from 'ngx-mask';
import { showAlert } from '../../_util.ts/sweetalert-util';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-cargos',
  imports: [RouterModule, CommonModule, NgxMaskPipe],
  templateUrl: './cargos.component.html',
  styleUrl: './cargos.component.scss'
})
export class CargosComponent implements OnInit {
  rotaFilhaAtiva = false;
  cargos: Cargo[] = [];
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private cargoService: CargosService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarCargos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarCargos();
      this.userPermissoes();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('cargos', 'incluir');
    this.userPodeEditar = this.temPermissao('cargos', 'editar');
    this.userPodeExcluir = this.temPermissao('cargos', 'excluir');
  }

  temPermissao(funcionalidade: string, permissao: string): boolean {
    const user = this.authService.getUsuario();

    const admin = user?.autorizacoes?.some(aut =>
      aut.funcionalidade === 'admin' &&
      aut.acesso?.toLowerCase().includes('admin')
    );

    if (admin) return true

    return !!user?.autorizacoes?.some(aut =>
      aut.funcionalidade === funcionalidade &&
      aut.acesso?.toLowerCase().split(',').includes(permissao.toLowerCase())
    );
  }

  buscarCargos() {
    if (this.rotaFilhaAtiva) return
    this.ngxUiLoaderService.start();

    this.cargoService.buscarCargos().subscribe({
      next: (cargos: Cargo[]) => {
        this.cargos = cargos;
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar cargos! Tente novamente mais tarde", "", { "progressBar": true })
        this.ngxUiLoaderService.stop();
      }
    });
  }

  visualizar(id: string) {
    this.router.navigate(['admin/cargos/visualizar', id]);
  }

  editar(id: string) {
    this.router.navigate(['admin/cargos/editar', id]);
  }

  excluir(cargo: Cargo) {

    if (this.userPodeExcluir) {
      this.toastr.error("Você não tem permissão para excluir um cargo.", "", { progressBar: true });
      return;
    }

    showAlert('Tem certeza?', `Deseja excluir o cargo de ${cargo.cargo}?`, 'question', 'danger')
      .then((result) => {
        if (result.isConfirmed) {
          this.ngxUiLoaderService.start();
          this.cargoService.excluirCargo(cargo.id!).subscribe({
            next: (res: any) => {
              this.buscarCargos();
              this.toastr.success(res);
            },
            error: (err: any) => {
              this.toastr.error(err);
              this.ngxUiLoaderService.stop();
            }
          });
        }
      });
  }
}
