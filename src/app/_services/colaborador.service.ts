import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Colaborador } from '../_models/colaborador';
import { CargosService } from './cargos.service';
import { addDoc, collection, CollectionReference, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Cargo } from '../_models/cargo';
import { Firestore } from '@angular/fire/firestore';
import { snapshotEqual } from 'firebase/firestore/lite';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  private firestore = inject(Firestore);
  private colaboradoresCollection = collection(this.firestore, 'colaboradores');

  private cargoService = inject(CargosService);

  buscarColaboradoresComCargo(): Observable<Colaborador[]> {
    const q = query(
      this.colaboradoresCollection
    ) as CollectionReference<Colaborador>;

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      ),
      switchMap((colaboradores: Colaborador[]) => {
        if (colaboradores.length === 0) return of([]);

        const colaboradoresComCargo$ = colaboradores.map(colaborador =>
          this.cargoService.buscarCargoPorId(colaborador.cargoId).pipe(
            map(cargo => ({
              ...colaborador,
              cargo: cargo ?? undefined
            }))
          )
        );

        return forkJoin(colaboradoresComCargo$);
      })
    );
  }




  buscarPorId(id: string): Observable<Colaborador | null> {
    const colaboradorRef = doc(this.firestore, `colaboradores/${id}`);

    return from(getDoc(colaboradorRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) return of(null);

        const data = snapshot.data() as Colaborador;
        const colaboradorComId: Colaborador = { id: snapshot.id, ...data };

        const cargoRef = doc(this.firestore, `cargos/${data.cargoId}`);

        return from(getDoc(cargoRef)).pipe(
          map(cargoSnap => {
            const cargoData = cargoSnap.exists() ? cargoSnap.data() as Cargo : undefined;
            const cargoCompleto = cargoData ? { id: cargoSnap.id, ...cargoData } : undefined;
            return { ...colaboradorComId, cargo: cargoCompleto } as Colaborador;
          })
        );
      })
    );
  }

  incluir(colaborador: Colaborador): Observable<any> {
    const qcolaboradorComMesmoCPF = query(this.colaboradoresCollection, where('cpf', '==', colaborador.cpf));

    return new Observable(observer => {
      Promise.all([
        getDocs(qcolaboradorComMesmoCPF)
      ]).then(([snapshot]) => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar colaborador. Motivo: Já existe um colaborador com esse CPF");
          observer.complete();
        }

        addDoc(this.colaboradoresCollection, structuredClone(colaborador)).then(() => {
          observer.next("Colaborador cadastrado com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao cadastrar cargo. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao cadastrar cargo. Motivo: ${error}`);
      });
    })
  }



  editar(colaborador: Colaborador): Observable<any> {
    const qcolaboradorComMesmoCPF = query(this.colaboradoresCollection, where('cpf', '==', colaborador.cpf));

    return new Observable(observer => {
      Promise.all([
        getDocs(qcolaboradorComMesmoCPF)
      ]).then(([snapshot]) => {
        const outroColaboradorMesmoCpf = snapshot.docs.find(doc => doc.id !== colaborador.id)

        if (outroColaboradorMesmoCpf) {
          observer.error("Erro ao editar colaborador. Motivo: Já existe um colaborador com  esse CPF");
          return;
        }

        const colaboradorDocRef = doc(this.firestore, "colaboradores", colaborador.id!);
        const { id, ...dadosParaAtualizar } = colaborador;

        from(updateDoc(colaboradorDocRef, structuredClone(dadosParaAtualizar)))
          .subscribe({
            next: () => {
              observer.next("Colaborador editado com sucesso!");
              observer.complete();
            },
            error: (error) => {
              observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
              observer.complete();
            }
          })
      }).catch(error => {
        observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
      });
    });
  }

  excluir(id: string): Observable<any>{
    const colaboradorRef = doc(this.firestore, `colaboradores/${id}`);

    return from(deleteDoc(colaboradorRef)).pipe(
      map(() => 'Colaborador Excluido com Sucesso!'),
      catchError(error => {
        return of(`Erro ao excluir o colaborador. Motivo: ${error}`);
      })
    );
  }
}
