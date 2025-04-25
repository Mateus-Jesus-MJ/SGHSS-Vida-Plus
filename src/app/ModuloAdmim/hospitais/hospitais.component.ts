import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Importe OnInit
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { HospitalService } from '../../_services/hospital.service';
import { Hospital } from '../../_models/Hospital';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hospitais',
  imports: [RouterModule, CommonModule],
  templateUrl: './hospitais.component.html',
  styleUrl: './hospitais.component.scss'
})
export class HospitaisComponent implements OnInit { // Implemente OnInit
  rotaFilhaAtiva = false;
  hospitais!: Hospital[] | null;

  constructor(private router: Router, private route: ActivatedRoute, private hospitalService: HospitalService, private toastr: ToastrService) { }

  ngOnInit(): void { // Use o ngOnInit para a lógica inicial
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva(); // Chame a função de verificação
      });

    this.verificarRotaFilhaAtiva(); // Verifique na inicialização também

    this.listaHospitais()
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  listaHospitais() {
    if (this.rotaFilhaAtiva) return

    this.hospitalService.buscarHospitais().subscribe({
      next: (hospitais: Hospital[] | null) => {
        this.hospitais = hospitais;
      },
      error: () => this.toastr.error("Erro inesperado ao buscar hospitais! Tente novamente mais tarde")
    });
  }
}
