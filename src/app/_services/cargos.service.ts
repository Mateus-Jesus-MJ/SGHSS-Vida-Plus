import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, deleteDoc, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Cargo } from '../_models/cargo';
import { catchError, from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CargosService {
  private firestore = inject(Firestore);
  private tabelaCargos = 'cargos';

  buscarCargos() {
    const usersRef = collection(this.firestore, this.tabelaCargos) as CollectionReference<Cargo>
    const q = query(
      usersRef
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const cargos: Cargo[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          }
        });
        return cargos;
      })
    )
  }

  buscarCargoPorId(id: string): Observable<Cargo | null> {
    const cargoRef = doc(this.firestore, `${this.tabelaCargos}/${id}`);
    return from(getDoc(cargoRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Cargo;
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

  novoCargo(cargo: Cargo): Observable<any> {
    console.log('Firestore instance:', this.firestore);

    const cargoCollection = collection(this.firestore, this.tabelaCargos);
    const qcargo = query(cargoCollection, where('cargo', '==', cargo.cargo));

    return new Observable(observer => {
      Promise.all([
        getDocs(qcargo)
      ]).then(([snapshot]) => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar cargo. Motivo: Esse cargo já foi cadastrado!");
          observer.complete();
        }

        addDoc(cargoCollection, structuredClone(cargo)).then(() => {
          observer.next("Cargo adicionado com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao cadastrar cargo. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao cadastrar cargo. Motivo: ${error}`);
      });
    });
  }

  editarCargo(cargo: Cargo): Observable<any> {
    const cargoCollection = collection(this.firestore, this.tabelaCargos);
    const qcargo = query(cargoCollection, where('cargo', '==', cargo.cargo));

    return new Observable(observer => {
      Promise.all([
        getDocs(qcargo)
      ]).then(([snapshot]) => {
        const outroCargoMesmoNome = snapshot.docs.find(doc => doc.id !== cargo.id)

        if (outroCargoMesmoNome) {
          observer.error("Erro ao cadastrar cargo. Motivo: Esse cargo já foi cadastrado!");
          return;
        }

        const cargoDocRef = doc(this.firestore, this.tabelaCargos, cargo.id!);
        const { id, ...dadosParaAtualizar } = cargo;

        from(updateDoc(cargoDocRef, structuredClone(dadosParaAtualizar)))
          .subscribe({
            next: () => {
              observer.next("Cargo editado com sucesso!");
              observer.complete();
            },
            error: (error) => {
              observer.error(`Erro ao editar cargo. Motivo: ${error}`);
              observer.complete();
            }
          })
      }).catch(error => {
        observer.error(`Erro ao editar cargo. Motivo: ${error}`);
      });
    });
  }


  excluirCargo(id: string): Observable<any> {
    const cargoRef = doc(this.firestore, `${this.tabelaCargos}/${id}`);

    return from(deleteDoc(cargoRef)).pipe(
      map(() => 'Cargo Excluído com sucesso!'),
      catchError(error => {
        return of(`Erro ao excluir o cargo. Motivo: ${error}`)
      })
    );
  }
}
