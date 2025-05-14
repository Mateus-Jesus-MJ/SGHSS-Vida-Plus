import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationCancel, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ColaboradorService } from '../../_services/colaborador.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { showAlert } from '../../_util.ts/sweetalert-util';
import { Colaborador } from '../../_models/colaborador';

@Component({
  selector: 'app-colaboradores',
  imports: [RouterModule, CommonModule],
  templateUrl: './colaboradores.component.html',
  styleUrl: './colaboradores.component.scss'
})
export class ColaboradoresComponent implements OnInit {
  rotaFilhaAtiva = false;
  colaboradores: Colaborador[] | null = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private colaboradorService: ColaboradorService
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarColaboradores();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarColaboradores();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  buscarColaboradores() {
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
