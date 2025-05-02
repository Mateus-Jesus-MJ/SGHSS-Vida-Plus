import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Cargo } from '../../_models/cargo';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CargosService } from '../../_services/cargos.service';
import { NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-cargos',
  imports: [RouterModule, CommonModule, NgxMaskPipe],
  templateUrl: './cargos.component.html',
  styleUrl: './cargos.component.scss'
})
export class CargosComponent implements OnInit {
  rotaFilhaAtiva = false;
  cargos!: Cargo[] | null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private cargoService: CargosService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarCargos();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarCargos();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  buscarCargos() {
    this.ngxUiLoaderService.start();
    if (this.rotaFilhaAtiva) return

    this.cargoService.buscarCargos().subscribe({
      next: (cargos: Cargo[] | null) => {
        this.cargos = cargos;
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar hospitais! Tente novamente mais tarde", "", { "progressBar": true })
        this.ngxUiLoaderService.stop();
      }
    });
  }

  visualizar(id:string){

  }

  editar(id: string){
    this.router.navigate(['admin/cargos/editar',id]);
  }

  excluir(cargo: Cargo){

  }

}
