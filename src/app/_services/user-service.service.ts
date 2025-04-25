import { inject, Injectable } from '@angular/core';
import { User } from '../_models/User';
import { BaseService } from './base.service';
import { addDoc, collection, Firestore, getDocs, query } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService extends BaseService {
  private firestore = inject(Firestore);
  tabelaUsuarios = 'usuarios';

  novouser(usuario: User) {
    const userCollection = collection(this.firestore, this.tabelaUsuarios);
    return addDoc(userCollection, structuredClone(usuario));
  }

  buscarUsuarios() {
    const usersRef = collection(this.firestore, this.tabelaUsuarios);
    const q = query(usersRef);

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const users: User[] = snapshot.docs.map(doc => {
          const data = doc.data() as User;
          return {
            id: doc.id,
            ...data
          };
        });
        return users;
      })
    );
  }
}
