import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../../_services/auth.service';
import { filter } from 'rxjs';
import { IntenamentoService } from '../../_services/intenamento.service';
import { Internamento } from '../../_models/internamento';

@Component({
  selector: 'app-internamentos',
  imports: [RouterModule, CommonModule],
  templateUrl: './internamentos.component.html',
  styleUrl: './internamentos.component.scss'
})
export class InternamentosComponent implements OnInit {
  rotaFilhaAtiva = false;
  userPodeIncluir = false;
  userPodeEditar = false;
  userPodeExcluir = false;
  internamentos: Internamento[] = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private authService: AuthService,
    private internamentoService: IntenamentoService
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.buscarInternamentos();
          this.userPermissoes();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.buscarInternamentos();
      this.userPermissoes();
    }


  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }
  
  userPermissoes() {
    this.userPodeIncluir = this.temPermissao('hospitais', 'incluir');
    this.userPodeEditar = this.temPermissao('hospitais', 'editar');
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

  buscarInternamentos(){
    this.ngxUiLoaderService.start();
    this.internamentoService.buscarIntenamentos().subscribe({
      next:(internamentos: Internamento[]) => {
        this.internamentos = internamentos;
        this.ngxUiLoaderService.stop();
      },
      error:()=>{
        this.toastr.error("Erro ao consulta internamentos. Tente novamente mais tarde!","",{progressBar: true});
        this.ngxUiLoaderService.stop();
      }
    })
  }

}
