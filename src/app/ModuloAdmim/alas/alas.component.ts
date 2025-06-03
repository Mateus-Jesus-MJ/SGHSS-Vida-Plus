import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Ala } from '../../_models/ala';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { AlasService } from '../../_services/alas.service';

@Component({
  selector: 'app-alas',
  imports: [CommonModule, RouterModule],
  templateUrl: './alas.component.html',
  styleUrl: './alas.component.scss'
})
export class AlasComponent implements OnInit {
  rotaFilhaAtiva = false;
  alas: Ala[] = [];


  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private alasService: AlasService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarAlas();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarAlas();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  buscarAlas() {
    if (this.rotaFilhaAtiva) return
    this.ngxUiLoaderService.start();

    this.alasService.buscarAlas().subscribe({
      next: (alas: Ala[]) => {
        this.alas = alas;
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar alas! Tente novamente mais tarde", "", { progressBar: true })
        this.ngxUiLoaderService.stop();
      }
    });
  }

  visualizar(id: string) {
      this.router.navigate(['admin/alas/visualizar', id]);
  }

  editar(id: string) {

  }

  excluir(ala: Ala) {

  }

}
