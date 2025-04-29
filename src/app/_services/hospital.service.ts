import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, doc, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { Hospital } from '../_models/Hospital';
import { catchError, from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private firestore = inject(Firestore);
  tabelaHospitais = 'hospitais';

  buscarHospitais() {
    const usersRef = collection(this.firestore, this.tabelaHospitais) as CollectionReference<Hospital>;
    const q = query(
      usersRef,
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const hospitais: Hospital[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          }
        });
        return hospitais;
      })
    );
  }

  buscarHospitalPorId(id: string): Observable<Hospital | null> {
    const hospitalRef = doc(this.firestore, `${this.tabelaHospitais}/${id}`);
    return from(getDoc(hospitalRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Hospital;
          return { id: snapshot.id, ...data };
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error(error);
        return of(null);
      })
    );
  }

  novoHospital(hospital: Hospital): Observable<any> {
    const hospitalCollection = collection(this.firestore, this.tabelaHospitais);
    const qcnpj = query(hospitalCollection, where('cnpj', "==", hospital.cnpj));

    return new Observable(observer => {
      Promise.all([
        getDocs(qcnpj)
      ]).then(([snapshotHospital]) => {
        if (!snapshotHospital.empty) {
          observer.error("Já existe um hospital cadastrado para esse CNPJ");
          observer.complete();

        }

        addDoc(hospitalCollection, structuredClone(hospital)).then(() => {
          observer.next("Hospital adicionado com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao adicioanr hospital. motivo: ${error.message}`);
        });
      }).catch(error => {
        observer.error(`Erro ao verificar disponibilidade do cnpj. motivo: ${error.message}`);
      });
    });
  }
}
