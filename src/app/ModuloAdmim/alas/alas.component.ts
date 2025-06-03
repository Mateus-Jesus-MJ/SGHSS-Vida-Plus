import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Ala } from '../../_models/ala';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';
import { AlasService } from '../../_services/alas.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-alas',
  imports: [CommonModule, RouterModule],
  templateUrl: './alas.component.html',
  styleUrl: './alas.component.scss'
})
export class AlasComponent implements OnInit {
  rotaFilhaAtiva = false;
  alas: Ala[] = [];
  userPodeIncluir = false;
  userPodeEditar = false;


  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private alasService: AlasService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarAlas();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarAlas();
      this.userPermissoes();
    }
  }

  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('alas', 'incluir');
    this.userPodeEditar = this.temPermissao('alas', 'editar');
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
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
    this.router.navigate(['admin/alas/editar', id]);
  }

  excluir(ala: Ala) {

  }

}
