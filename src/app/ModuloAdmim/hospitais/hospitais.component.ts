import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Importe OnInit
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { HospitalService } from '../../_services/hospital.service';
import { Hospital } from '../../_models/Hospital';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { showAlert } from '../../_util.ts/sweetalert-util';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';



@Component({
  selector: 'app-hospitais',
  imports: [RouterModule, CommonModule, SweetAlert2Module, NgxMaskPipe],
  templateUrl: './hospitais.component.html',
  styleUrl: './hospitais.component.scss',
  providers: [NgxMaskPipe]
})
export class HospitaisComponent implements OnInit {
  rotaFilhaAtiva = false;
  hospitais!: Hospital[] | null;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private hospitalService: HospitalService,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,
    private maskPipe: NgxMaskPipe
  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.listaHospitais();
        }
      });
      this.verificarRotaFilhaAtiva();

      if (!this.rotaFilhaAtiva) {
        this.listaHospitais();
      }
    

  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  listaHospitais() {
    this.ngxUiLoaderService.start();
    if (this.rotaFilhaAtiva) return

    this.hospitalService.buscarHospitais().subscribe({
      next: (hospitais: Hospital[] | null) => {
        this.hospitais = hospitais;
        this.ngxUiLoaderService.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar hospitais! Tente novamente mais tarde","",{"progressBar": true})
        this.ngxUiLoaderService.stop();
      }
    });
  }

  visualizar(id: string) {
    this.router.navigate(['/admin/hospitais/visualizar', id])
  }
  editar(id: string) {
    this.router.navigate(['/admin/hospitais/editar', id])
  }

  excluir(hospital: Hospital) {
    showAlert('Tem certeza?', `Deseja excluir o hspital:<br />
      <b>Razão Social: </b>${hospital.razaoSocial} <br />
      <b>CNPJ: <b/>${this.maskPipe.transform(hospital.cnpj, '00.000.000/0000-00')}?`, 'question', 'danger')
      .then((result) => {
        if (result.isConfirmed) {
          this.ngxUiLoaderService.start();
          this.hospitalService.excluirHospital(hospital.id!).subscribe({
            next: (res: any) => {
              this.listaHospitais();
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

