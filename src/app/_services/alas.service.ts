import { inject, Injectable } from '@angular/core';
import { addDoc, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Ala } from '../_models/ala';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Colaborador } from '../_models/colaborador';
import { Hospital } from '../_models/Hospital';

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
      switchMap(snapshot => {
        const alasRaw: Ala[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const alasComResponsaveis$ = alasRaw.map(async (ala) => {
          const idResponsavel = (ala as any).idResponsavel;
          if (idResponsavel) {
            const colaboradorRef = doc(this.firestore, `colaboradores/${idResponsavel}`);
            const colaboradorSnap = await getDoc(colaboradorRef);
            if (colaboradorSnap.exists()) {
              (ala as any).responsavel = {
                id: colaboradorSnap.id,
                ...colaboradorSnap.data()
              } as Colaborador;
            }
          }
          return ala;
        });
        return from(Promise.all(alasComResponsaveis$));
      })
    );
  }




  buscarAlaPorId(id: string): Observable<Ala> {
  const alaRef = doc(this.firestore, `${this.tabelaAlas}/${id}`) as DocumentReference<Ala>;

  return from(getDoc(alaRef)).pipe(
    switchMap(alaSnap => {
      if (!alaSnap.exists()) {
        throw new Error('Ala não encontrada.');
      }

      const alaData = { id: alaSnap.id, ...alaSnap.data() } as Ala;

      const idResponsavel = alaData.idResponsavel;

      const responsavel$ = idResponsavel
        ? from(getDoc(doc(this.firestore, `colaboradores/${idResponsavel}`))).pipe(
            map(colabSnap => {
              if (colabSnap.exists()) {
                alaData.responsavel = {
                  id: colabSnap.id,
                  ...colabSnap.data()
                } as Colaborador;
              }
              return alaData;
            })
          )
        : of(alaData);

      const hospitais$ = from(getDocs(
        query(
          collection(this.firestore, 'hospitais'),
          where('alas', 'array-contains', id)
        )
      )).pipe(
        map(snapshot => {
          const hospitais: Hospital[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }) as Hospital);

          alaData.hospitais = hospitais;
          return alaData;
        })
      );

      return responsavel$.pipe(
        switchMap(() => hospitais$)
      );
    })
  );
}



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
