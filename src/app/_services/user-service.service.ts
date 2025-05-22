import { inject, Injectable } from '@angular/core';
import { User } from '../_models/User';
import { BaseService } from './base.service';
import { addDoc, collection, doc, Firestore, getDocs, query, where, getDoc, updateDoc } from '@angular/fire/firestore';
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
      where('tipoUsuario', '==', usuario.tipoUsuario)
    );
    // Query para procurar pelo mesmo email
    const qEmail = query(userCollection, where('email', '==', usuario.email),
      where('tipoUsuario', '==', usuario.tipoUsuario)
    );

    const qColaborador = query(userCollection, where('colaborador', '==', usuario.colaborador))

    return new Observable(observer => {
      Promise.all([
        getDocs(qUsuario),
        getDocs(qEmail),
        getDocs(qColaborador)
      ])
        .then(([snapshotUsuario, snapshotEmail, snapshotColaborador]) => {
          if (!snapshotUsuario.empty) {
            observer.error('Já existe um usuário com este nome de usuário.');
            return; // <-- ADICIONADO
          }
          if (!snapshotEmail.empty) {
            observer.error('Já existe um usuário com este e-mail.');
            return; // <-- ADICIONADO
          }
          if (!snapshotColaborador.empty) {
            observer.error('Já existe um usuário associado a este colaborador.');
            return;
          }

          addDoc(userCollection, structuredClone(usuario))
            .then(() => {
              observer.next('Usuário criado com sucesso.');
              observer.complete();
            })
            .catch(error => {
              observer.error(`Erro ao criar usuário. motivo: ${error.message}`);
            });

        })
        .catch(error => {
          observer.error(`Erro ao verificar usuário ou email. motivo: ${error.message}`);
        });
    });
  }

  editarUser(usuario: User): Observable<any> {
    const userCollection = collection(this.firestore, this.tabelaUsuarios);

    const qUsuario = query(userCollection,
      where('usuario', '==', usuario.usuario),
      where('tipoUsuario', '==', usuario.tipoUsuario)
    );

    const qEmail = query(userCollection,
      where('email', '==', usuario.email),
      where('tipoUsuario', '==', usuario.tipoUsuario)
    );

    const qColaborador = query(userCollection, where('colaborador', '==', usuario.colaborador))

    return new Observable(observer => {
      Promise.all([
        getDocs(qUsuario),
        getDocs(qEmail),
        getDocs(qColaborador)
      ])
        .then(([snapshotUsuario, snapshotEmail, snapshotColaborador]) => {
          const outroUsuarioMesmoNome = snapshotUsuario.docs.find(doc => doc.id !== usuario.id);
          if (outroUsuarioMesmoNome) {
            observer.error('Já existe outro usuário com este nome de usuário.');
            return;
          }
          const outroUsuarioMesmoEmail = snapshotEmail.docs.find(doc => doc.id !== usuario.id);
          if (outroUsuarioMesmoEmail) {
            observer.error('Já existe outro usuário com este e-mail.');
            return;
          }
          if (!snapshotColaborador.empty) {
            observer.error('Já existe um usuário associado a este colaborador.');
            return;
          }

          const userDocRef = doc(this.firestore, this.tabelaUsuarios, usuario.id!);

          const { id, ...dadosParaAtualizar } = usuario;

          from(updateDoc(userDocRef, structuredClone(dadosParaAtualizar)))
            .subscribe({
              next: () => {
                observer.next('Usuário atualizado com sucesso.');
                observer.complete();
              },
              error: (error) => {
                observer.error(`Erro ao atualizar usuário. motivo: ${error.message}`);
              }
            });

        })
        .catch(error => {
          observer.error(`Erro ao verificar usuário ou email. motivo: ${error.message}`);
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

  buscarUsuarioPorId(id: string): Observable<User | null> {
    const userRef = doc(this.firestore, `${this.tabelaUsuarios}/${id}`);
    return from(getDoc(userRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as User;
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
}
