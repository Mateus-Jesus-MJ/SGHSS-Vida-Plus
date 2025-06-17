import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Procedimento } from '../_models/procedimento';
import { catchError, from, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})

export class ProcedimentoService {
  private firestore = inject(Firestore);
  private procedimentoCollection = collection(this.firestore, 'procedimentos') as CollectionReference<Procedimento>;
  private authService = inject(AuthService);

  buscarProcedimentos() {
    const q = query(this.procedimentoCollection);

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const procedimentos: Procedimento[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          }
        });
        return procedimentos;
      })
    );
  }

  buscarProcedimentoPorId(id: string): Observable<Procedimento | null> {
    const procedimentoRef = doc(this.firestore, `procedimentos/${id}`);
    return from(getDoc(procedimentoRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Procedimento;
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

  novoProcedimento(procedimento: Procedimento): Observable<any> {
    const qProcedimento = query(this.procedimentoCollection, where('nome', '==', procedimento.nome));
    const user = this.authService.getUsuario();

    procedimento.userCriacao = user?.usuario;
    procedimento.momentoCricao = Date();

    return new Observable(observer => {
      Promise.all([
        getDocs(qProcedimento)
      ]).then(([snapshot]) => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar procedimento. Motivo: Esse procedimento já foi cadastrado!");
          observer.complete();
        }

        addDoc(this.procedimentoCollection, structuredClone(procedimento)).then(() => {
          observer.next("Procedimento adicionado com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao cadastrar procedimento. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao cadastrar procedimento. Motivo: ${error}`);
      });
    });
  }

  editarProcedimento(procedimento: Procedimento): Observable<any> {
    const qProcedimento = query(this.procedimentoCollection, where('nome', '==', procedimento.nome));

    return new Observable(observer => {
      Promise.all([
        getDocs(qProcedimento)
      ]).then(([snapshot]) => {
        const outroProcedimentoMesmoNome = snapshot.docs.find(doc => doc.id !== procedimento.id);

        if (outroProcedimentoMesmoNome) {
          observer.error("Erro ao editar Procedimento. Motivo: Esse procedimento já foi cadastrado em outro registro!");
          return;
        }

        const user = this.authService.getUsuario();
        procedimento.userEdicao = user?.usuario;
        procedimento.momentoEdicao = Date();

        const procedimentoDocRef = doc(this.firestore, 'procedimentos', procedimento.id!);
        const { id, ...dadosParaAtualizar } = procedimento;

        from(updateDoc(procedimentoDocRef, structuredClone(dadosParaAtualizar))).subscribe({
          next: () => {
            observer.next("Procedimento editado com sucesso!");
            observer.complete();
          },
          error: (error) => {
            observer.error(`Erro ao editar procedimento. Motivo: ${error}`);
            observer.complete();
          }
        })
      }).catch(error => {
        observer.error(`Erro ao editar procedimento. Motivo: ${error}`);
      });
    });
  }


}
