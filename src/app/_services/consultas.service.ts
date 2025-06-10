import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { catchError, Cons, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { Consulta } from '../_models/consulta';
import { HospitalService } from './hospital.service';
import { Turno } from '../_models/Turno';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private firestore = inject(Firestore);
  private consultaCollection = collection(this.firestore, 'consultas') as CollectionReference<Consulta>;
  private hospitalService = inject(HospitalService);

  buscarConsultasDoMedicoPorData(idMedico: string, data: string): Observable<Consulta[]> {

    const q = query(
      this.consultaCollection,
      where('idMedico', '==', idMedico),
      where('data', '==', data)
    );

    return from(getDocs(q)).pipe(
      map((snapshot: { docs: any[]; }) =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      ),
      switchMap((consultas: Consulta[]) => {
        if (consultas.length === 0) return of([]);

        const consultasComDetalhes$ = consultas.map(consulta =>
          forkJoin({
            //paciente: this.pacienteService.buscarPorId(consulta.idPaciente),
            hospital: this.hospitalService.buscarHospitalPorId(consulta.idHospital)
          }).pipe(
            map(({
              //paciente,
              hospital }) => ({
                ...consulta,
                //paciente: paciente ?? undefined,
                hospital: hospital ?? undefined
              }))
          )
        );

        return forkJoin(consultasComDetalhes$);
      }),
      map((consultasComDetalhes: Consulta[]) =>
        consultasComDetalhes.sort((a, b) => a.hora.localeCompare(b.hora))
      )
    );
  }

  buscarHorariosDisponiveisMedicoData(medicoId: string, turno: Turno): Observable<string[]> {
    return this.buscarConsultasDoMedicoPorData(medicoId, turno.data).pipe(
      catchError(() => of([])), // Se a coleção ainda não existir ou falhar, trata como sem consultas
      map((consultas: Consulta[]) => {
        const horariosConsultados = consultas.map(c => c.hora);

        const gerarHorariosIntervalados = (inicio: string, fim: string): string[] => {
          const horarios: string[] = [];
          const [inicioHora, inicioMin] = inicio.split(':').map(Number);
          const [fimHora, fimMin] = fim.split(':').map(Number);

          let atual = new Date();
          atual.setHours(inicioHora, inicioMin, 0, 0);

          const fimTotal = new Date();
          fimTotal.setHours(fimHora, fimMin, 0, 0);

          while (atual < fimTotal) {
            const horaFormatada = atual.toTimeString().substring(0, 5);
            horarios.push(horaFormatada);
            atual.setMinutes(atual.getMinutes() + 30);
          }

          return horarios;
        };

        const todosHorarios = gerarHorariosIntervalados(turno.horarioInicio, turno.horarioTermino);

        const horariosSemIntervalo = todosHorarios.filter(horario => {
          if (!turno.horarioInicioIntervalo || !turno.horarioTerminoIntervalo) return true;

          return horario < turno.horarioInicioIntervalo || horario >= turno.horarioTerminoIntervalo;
        });

        const horariosDisponiveis = horariosSemIntervalo.filter(h => !horariosConsultados.includes(h));

        return horariosDisponiveis;
      })
    );
  }

  novaConsulta(consulta: Consulta) : Observable<any>{
    const qConsultaMarcada = query(this.consultaCollection, 
      where('idMedico','==',consulta.idMedico),
      where('data','==',consulta.data),
      where('hora','==',consulta.hora),
    );

    return new Observable(observer => {
      Promise.all([
        getDocs(qConsultaMarcada)
      ]).then(([snapshot]) => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar consulta. Motivo: Já existe uma consulta marcada para essa data e horário.");
          observer.complete();
        }

        addDoc(this.consultaCollection, structuredClone(consulta)).then(() => {
          observer.next("Consulta marcada com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao cadastrar consulta. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao cadastrar consulta. Motivo: ${error}`);
      });
    })

  }
}

