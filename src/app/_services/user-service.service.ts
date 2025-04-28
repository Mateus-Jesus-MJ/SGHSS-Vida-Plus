import { inject, Injectable } from '@angular/core';
import { User } from '../_models/User';
import { BaseService } from './base.service';
import { addDoc, collection, Firestore, getDocs, query, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService extends BaseService {
  private firestore = inject(Firestore);
  tabelaUsuarios = 'usuarios';

  novouser(usuario: User): Observable<any> {
    const userCollection = collection(this.firestore, this.tabelaUsuarios);

    // Query para procurar pelo mesmo usuario
    const qUsuario = query(userCollection, where('usuario', '==', usuario.usuario),
      where('tipoUsuario','==',usuario.tipoUsuario)
    );
    // Query para procurar pelo mesmo email
    const qEmail = query(userCollection, where('email', '==', usuario.email),
      where('tipoUsuario','==',usuario.tipoUsuario)
    );

    return new Observable(observer => {
      Promise.all([
        getDocs(qUsuario),
        getDocs(qEmail)
      ])
      .then(([snapshotUsuario, snapshotEmail]) => {
        if (!snapshotUsuario.empty) {
          observer.error('Já existe um usuário com este nome de usuário.');
          return; // <-- ADICIONADO
        }
        if (!snapshotEmail.empty) {
          observer.error('Já existe um usuário com este e-mail.');
          return; // <-- ADICIONADO
        }

        addDoc(userCollection, structuredClone(usuario))
          .then(() => {
            observer.next('Usuário criado com sucesso.');
            observer.complete();
          })
          .catch(error => {
            observer.error('Erro ao criar usuário: ' + error.message);
          });

      })
      .catch(error => {
        observer.error('Erro ao verificar usuário ou email: ' + error.message);
      });
    });
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
