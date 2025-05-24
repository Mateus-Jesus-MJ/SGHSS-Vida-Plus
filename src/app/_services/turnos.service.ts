import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Turno } from '../_models/Turno';
import { ColaboradorService } from './colaborador.service';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private firestore = inject(Firestore);
  private turnosCollection = collection(this.firestore, 'turnos');
  private colaboradorService = inject(ColaboradorService)

  buscarTurnos(): Observable<Turno[]> {
    const q = query(this.turnosCollection) as CollectionReference<Turno>;

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      ),
      switchMap((turnos: Turno[]) => {
        if (turnos.length === 0) return of([]);

        const turnoComColaborador$ = turnos.map(turno => this.colaboradorService.buscarPorId(turno.idColaborador).pipe(
          map(colaborador => ({
            ...turno,
            colaborador: colaborador ?? undefined
          }))
        )
        );

        return forkJoin(turnoComColaborador$);
      })
    )
  }

  buscarTurnoMesPorTurnoParametro(turno: Turno): Observable<Turno[]> {
    const extrairAnoMes = (data: string) => data.slice(0, 7);
    const mes = extrairAnoMes(turno.data);
    const q = query(
      this.turnosCollection,
      where('idColaborador', '==', turno.idColaborador),
      where('data', '>=', `${mes}-01`),
      where('data', '<=', `${mes}-31`)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Turno));
      })
    );
  }

  incluir(turnos: Turno[]): Observable<string> {
    const extrairAnoMes = (data: string) => data.slice(0, 7);

    const verificacoes$ = turnos.map(turno => {
      const mes = extrairAnoMes(turno.data);

      const q = query(
        this.turnosCollection,
        where('idColaborador', '==', turno.idColaborador),
        where('data', '>=', `${mes}-01`),
        where('data', '<=', `${mes}-31`)
      );

      return from(getDocs(q)).pipe(
        map(snapshot => ({
          existe: !snapshot.empty,
          turno
        }))
      );
    });

    return forkJoin(verificacoes$).pipe(
      switchMap(resultados => {
        const algumJaExiste = resultados.some(r => r.existe);

        if (algumJaExiste) {
          const colaborador = resultados.find(r => r.existe)?.turno.colaborador?.nome;
          return throwError(() => `Erro ao incluir turno. Motivo: O colaborador já possui turno cadastrado neste mês.`);
        }

        const inclusoes$ = turnos.map(turno =>
          from(addDoc(this.turnosCollection, turno))
        );

        return forkJoin(inclusoes$).pipe(
          map(() => `${turnos.length} turno${turnos.length > 1 ? 's' : ''} incluído${turnos.length > 1 ? 's' : ''} com sucesso.`)
        );
      }),
      catchError(erro => {
        return throwError(() => `Erro ao incluir turno. Motivo: ${erro}`);
      })
    );
  }
}
