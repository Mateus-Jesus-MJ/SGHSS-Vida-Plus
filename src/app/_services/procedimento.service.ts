import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query, where } from 'firebase/firestore';
import { Procedimento } from '../_models/procedimento';
import { from, map, Observable } from 'rxjs';
import { error } from 'jquery';

@Injectable({
  providedIn: 'root'
})

export class ProcedimentoService {
  private firestore = inject(Firestore);
  private procedimentoCollection = collection(this.firestore, 'procedimentos') as CollectionReference<Procedimento>;

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

  novoProcedimento(procedimento: Procedimento): Observable<any> {
    const qProcedimento = query(this.procedimentoCollection, where('nome', '==', procedimento.nome));

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

}
