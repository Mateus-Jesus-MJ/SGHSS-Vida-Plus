import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Importe OnInit
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { HospitalService } from '../../_services/hospital.service';
import { Hospital } from '../../_models/Hospital';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-hospitais',
  imports: [RouterModule, CommonModule],
  templateUrl: './hospitais.component.html',
  styleUrl: './hospitais.component.scss'
})
export class HospitaisComponent implements OnInit {
  rotaFilhaAtiva = false;
  hospitais!: Hospital[] | null;

  constructor(private router: Router, private route: ActivatedRoute, private hospitalService: HospitalService, private toastr: ToastrService, private ngxUiLoaderService: NgxUiLoaderService) { }

  ngOnInit(): void {
    this.ngxUiLoaderService.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
      });
    this.verificarRotaFilhaAtiva();

    if(!this.rotaFilhaAtiva){
      this.listaHospitais();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  listaHospitais() {
    if (this.rotaFilhaAtiva) return

    this.hospitalService.buscarHospitais().subscribe({
      next: (hospitais: Hospital[] | null) => {
        this.hospitais = hospitais;
        this.ngxUiLoaderService.stop();
      },
      error: () => {this.toastr.error("Erro inesperado ao buscar hospitais! Tente novamente mais tarde");
        this.ngxUiLoaderService.stop();
      }
    });
  }
}
