import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, CollectionReference, deleteDoc, doc, Firestore, getDocs, orderBy, query, Timestamp, where } from '@angular/fire/firestore';
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
      }),
      map((turnosComColaborador: Turno[]) =>
        // turnosComColaborador.sort((a, b) => a.data.localeCompare(b.data)) // crescente
        turnosComColaborador.sort((a, b) => b.data.localeCompare(a.data)) // decrescente
      )
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

      console.log('Turnos recebidos para inclusão:', turnos);


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

  excluir(turno: Turno): Observable<string> {
    return this.buscarTurnoMesPorTurnoParametro(turno).pipe(
      switchMap(async (turnos: Turno[]) => {
        try {
          for (const t of turnos) {
            const ref = doc(this.firestore, `turnos/${t.id}`);
            await deleteDoc(ref); // exclui um por vez
          }
          return 'Todos os turnos do mês foram excluídos com sucesso.';
        } catch (err) {
          throw new Error('Erro ao excluir os turnos do mês. Nenhum turno foi removido.');
        }
      }),
      catchError(error => of(error.message || 'Erro desconhecido ao excluir os turnos.'))
    );
  }

  buscarTurnoPorColaboradorEMenorData(idColaborador: string, data: Date): Observable<Turno[]> {
    const dataISO = data.toISOString().slice(0, 10);
    const q = query(
      this.turnosCollection,
      where('idColaborador', '==', idColaborador),
      where('data', '>=', dataISO)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Turno)))
    );
  }
}
