import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Turno } from '../../_models/Turno';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

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
  ) { }

  ngOnInit(): void {
    this.loaderSercice.start();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {
          // this.buscarColaboradores();
        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {

      let turno: Turno = {
        idColaborador: "teste",
        idHospital: "teste",
        data: "2025-05-22",
        horarioInicio: "08:15:12",
        horarioInicioIntervalo: "12:00:00",
        horarioTerminoIntervalo: "14:00:00",
        horarioTermino: "18:00:00",
        numeroAtendimento: "10",
      }

      this.turnos!.push(turno);
    }
    this.loaderSercice.stop();
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }

  horarioParaSegundos(horario: string): number {
    const [h, m, s] = horario.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  }

  segundosParaHorario(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const seg = segundos % 60;

    return `${this.padZero(horas)}:${this.padZero(minutos)}:${this.padZero(seg)}`;
  }

  calcularCargaHoraria(turno: Turno): string {
    const inicio = this.horarioParaSegundos(turno.horarioInicio);
    const termino = this.horarioParaSegundos(turno.horarioTermino);
    const inicioIntervalo = this.horarioParaSegundos(turno.horarioInicioIntervalo);
    const terminoIntervalo = this.horarioParaSegundos(turno.horarioTerminoIntervalo);

    const duracaoTotal = termino - inicio;
    const duracaoIntervalo = terminoIntervalo - inicioIntervalo;
    const duracaoLiquida = duracaoTotal - duracaoIntervalo;

    return this.segundosParaHorario(duracaoLiquida);
  }

  padZero(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

}
