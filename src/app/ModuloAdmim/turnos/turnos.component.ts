import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Turno } from '../../_models/Turno';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TurnosService } from '../../_services/turnos.service';

@Component({
  selector: 'app-turnos',
  imports: [RouterModule, CommonModule],
  templateUrl: './turnos.component.html',
  styleUrl: './turnos.component.scss'
})
export class TurnosComponent implements OnInit {
  rotaFilhaAtiva = false;
  turnos: Turno[] | null = [];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private loaderSercice: NgxUiLoaderService,
    private turnosService: TurnosService
  ) { }

  ngOnInit(): void {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          this.loaderSercice.start();
          this.buscarTurnos();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {
      this.loaderSercice.start();
      this.buscarTurnos();
    }
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  buscarTurnos() {
    this.turnosService.buscarTurnos().subscribe({
      next: (turnos: Turno[]) => {
        this.turnos = turnos;
        this.loaderSercice.stop();
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar Turnos! /n Tente novamente mais tarde.", "", { progressBar: true });
        this.loaderSercice.stop();
      }
    })
  }


  calcularCargaHoraria(turno: Turno): string {
    const minutosTrabalhados = this.calcularMinutos(turno.horarioInicio, turno.horarioTermino);
    const minutosIntervalo = this.calcularMinutos(turno.horarioInicioIntervalo, turno.horarioTerminoIntervalo);

    const minutosTotais = minutosTrabalhados - minutosIntervalo;
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;

    return `${this.padZero(horas)}:${this.padZero(minutos)}`;
  }

  calcularMinutos(inicio: string, fim: string): number {
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  }

  padZero(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  copiar(turno: Turno) {

    this.loaderSercice.start();

    this.turnosService.buscarTurnoMesPorTurnoParametro(turno).subscribe({
      next: (turnos: Turno[]) => {
        this.router.navigate(['admin/turnos/incluir'], {
          state: {
            turnosSemana: turnos
          }
        });
      },
      error: () => {
        this.toastr.error("Erro inesperado ao buscar Turnos! /n Tente novamente mais tarde.", "", { progressBar: true });
        this.loaderSercice.stop();
      }
    })
  }
}

