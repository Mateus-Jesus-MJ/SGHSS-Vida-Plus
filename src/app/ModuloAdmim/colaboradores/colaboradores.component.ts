import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationCancel, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../_services/colaborador.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { showAlert } from '../../_util.ts/sweetalert-util';
import { Colaborador } from '../../_models/colaborador';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-colaboradores',
  imports: [RouterModule, CommonModule],
  templateUrl: './colaboradores.component.html',
  styleUrl: './colaboradores.component.scss'
})
export class ColaboradoresComponent implements OnInit {
  rotaFilhaAtiva = false;
  colaboradores: Colaborador[] | null = [];
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private colaboradorService: ColaboradorService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarColaboradores();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarColaboradores();
      this.userPermissoes();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('colaboradores', 'incluir');
    this.userPodeEditar = this.temPermissao('colaboradores', 'editar');
    this.userPodeExcluir = this.temPermissao('colaboradores', 'excluir');
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

  buscarColaboradores() {
    this.loaderSercice.start();
    if (this.rotaFilhaAtiva) return

    this.colaboradorService.buscarColaboradoresComCargo().subscribe({
      next: (colaboradores: Colaborador[] | null) => {
        this.colaboradores = colaboradores;
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar colaboradores! Tente novamente mais tarde", "", { "progressBar": true })
        this.loaderSercice.stop();
      }
    })
  }
  visualizar(id: string) {
    this.router.navigate(['admin/colaboradores/visualizar', id]);
  }

  editar(id: string) {
    this.router.navigate(['admin/colaboradores/editar', id]);
  }

  excluir(colaborador: Colaborador) {

    if (this.userPodeExcluir) {
      this.toastr.error("Você não tem permissão para excluir um cargo.", "", { progressBar: true });
      return;
    }

    showAlert('Tem certeza?', `Deseja excluir o cargo de ${colaborador.nome}?`, 'question', 'danger')
      .then((result) => {
        if (result.isConfirmed) {
          this.loaderSercice.start();
          this.colaboradorService.excluir(colaborador.id!).subscribe({
            next: (res: any) => {
              this.buscarColaboradores();
              this.toastr.success(res);
            },
            error: (err: any) => {
              this.toastr.error(err);
              this.loaderSercice.stop();
            }
          });
        }
      });
  }


}
