import { inject, Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, CollectionReference, deleteDoc, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Ala } from '../_models/ala';
import { from, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlasService {
  private firestore = inject(Firestore);
  private tabelaAlas = 'alas';

  buscarAlas() {
    const usersRef = collection(this.firestore, this.tabelaAlas) as CollectionReference<Ala>
    const q = query(
      usersRef
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const alas: Ala[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          }
        });
        return alas;
      })
    )
  }

  //Buscar por id

  novaAla(ala: Ala): Observable<any> {
    const cargoCollection = collection(this.firestore, this.tabelaAlas);
    const qala = query(cargoCollection, where('nome', '==', ala.nome));

    return new Observable(observer => {
      getDocs(qala).then(snapshot => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar ala. Motivo: Essa ala já foi cadastrada!");
          observer.complete();
          return;
        }

        const alaClone = structuredClone(ala);
        delete alaClone.hospitais;

        addDoc(cargoCollection, alaClone).then((docRef) => {
          const alaId = docRef.id;
          const updatePromises = (ala.hospitais || []).map(hospital => {
            const hospitalId = typeof hospital === 'string' ? hospital : hospital?.id;
            if (!hospitalId) return Promise.resolve();

            const hospitalRef = doc(this.firestore, `hospitais/${hospitalId}`);
            return updateDoc(hospitalRef, {
              alas: arrayUnion(alaId)
            });
          });

          Promise.all(updatePromises).then(() => {
            observer.next("Ala adicionada e hospitais atualizados com sucesso!");
            observer.complete();
          }).catch(error => {
            observer.error(`Erro ao atualizar hospitais. Motivo: ${error}`);
          });

        }).catch(error => {
          observer.error(`Erro ao cadastrar ala. Motivo: ${error}`);
        });

      }).catch(error => {
        observer.error(`Erro ao consultar alas. Motivo: ${error}`);
      });
    });
  }


}
