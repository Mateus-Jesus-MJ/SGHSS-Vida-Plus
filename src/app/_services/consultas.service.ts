import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, deleteDoc, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { catchError, Cons, forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { Consulta } from '../_models/consulta';
import { HospitalService } from './hospital.service';
import { Turno } from '../_models/Turno';
import { Paciente } from '../_models/Paciente';
import { ZoomService } from './zoom.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private firestore = inject(Firestore);
  private consultaCollection = collection(this.firestore, 'consultas') as CollectionReference<Consulta>;
  private hospitalService = inject(HospitalService);
  private zoomService = inject(ZoomService);

  buscarConsultaPorId(id: string): Observable<Consulta | null> {
    const consultaRef = doc(this.firestore, `consultas/${id}`);

    return from(getDoc(consultaRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Consulta;
          return { id: snapshot.id, ...data }
        } else {
          return null;
        }
      }),
      catchError(error => {
        return of(null)
      })
    );
  }

  buscarConsultasDoMedicoPorData(idMedico: string, data?: string): Observable<Consulta[]> {
    const filtros: any[] = [where('idMedico', '==', idMedico)];

    if (data) {
      filtros.push(where('data', '==', data));
    }

    const q = query(this.consultaCollection, ...filtros);

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
      catchError(() => of([])),
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


        let horariosDisponiveis = horariosSemIntervalo.filter(h => !horariosConsultados.includes(h));


        const hoje = new Date().toISOString().split('T')[0];
        if (turno.data === hoje) {
          const agora = new Date();
          const horaAtual = agora.toTimeString().substring(0, 5); // 'HH:mm'

          horariosDisponiveis = horariosDisponiveis.filter(h => h > horaAtual);
        }

        return horariosDisponiveis;
      })
    );
  }

  buscarConsultaPorPaciente(paciente: Paciente): Observable<Consulta[]> {
    const qConsultasPaciente = query(this.consultaCollection,
      where('idPaciente', '==', paciente.id)
    )

    return from(getDocs(qConsultasPaciente)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))));
  }


  novaConsulta(consulta: Consulta): Observable<any> {
    const qConsultaMarcada = query(this.consultaCollection,
      where('idMedico', '==', consulta.idMedico),
      where('data', '==', consulta.data),
      where('hora', '==', consulta.hora),
    );

    return new Observable(observer => {
      getDocs(qConsultaMarcada).then(snapshot => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar consulta. Motivo: Já existe uma consulta marcada para essa data e horário.");
          observer.complete();
          return;
        }


        this.zoomService.createMeetingConsulta(consulta).subscribe({
          next: (res) => {

            consulta.link = res.join_url;


            addDoc(this.consultaCollection, structuredClone(consulta)).then(() => {
              observer.next("Consulta marcada com sucesso e reunião criada!");
              observer.complete();
            }).catch(error => {
              observer.error(`Erro ao cadastrar consulta. Motivo: ${error}`);
            });
          },
          error: (errorZoom) => {
            observer.error(`Erro ao criar reunião no Zoom. Motivo: ${errorZoom.error?.message || errorZoom.message || errorZoom}`);
          }
        });
      }).catch(error => {
        observer.error(`Erro ao verificar consultas existentes. Motivo: ${error}`);
      });
    });
  }

  excluirConsulta(consulta: Consulta) {
    const consultaRef = doc(this.firestore, `consultas/${consulta.id}`);

    return from(deleteDoc(consultaRef)).pipe(
      map(() => 'consulta desmarcada com sucesso!'),
      catchError(error => {
        return of(`Erro ao desmarcada o consulta. Motivo: ${error}`)
      })
    );
  }
}

