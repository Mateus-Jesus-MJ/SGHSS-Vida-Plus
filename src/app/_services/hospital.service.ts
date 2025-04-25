import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query } from '@angular/fire/firestore';
import { Hospital } from '../_models/Hospital';
import { from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private firestore = inject(Firestore)

  buscarHospitais() {
    const usersRef = collection(this.firestore, 'hospitais') as CollectionReference<Hospital>;
    const q = query(
      usersRef,
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const hospitais: Hospital[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return data;
        });
        return hospitais;
      })
    );
  }

  novoHospital(hospital: Hospital) {
    const hospitalCollection = collection(this.firestore, 'hospitais');
    return addDoc(hospitalCollection, structuredClone(hospital));
  }
}
