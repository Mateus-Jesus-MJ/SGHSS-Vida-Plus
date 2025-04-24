import { inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { User } from '../_models/User';
import { Login } from '../_models/Login';
import { from, map, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { Firestore, collection, query, where, getDocs, CollectionReference } from '@angular/fire/firestore';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';





@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService {
  private authService = inject(AuthService)
  private firestore = inject(Firestore);
  private auth = inject(Auth);


  login(login: Login): Observable<User | null> {
    const usersRef = collection(this.firestore, 'usuarios') as CollectionReference<User>;
    const q = query(
      usersRef,
      where('usuario', '==', login.usuario.trim()),
      where('senha', '==', String(login.senha).trim()),
      where('tipoUsuario', '==', login.tipoUsuario.trim()),
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const users: User[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return data;
        });
        const user = users.length > 0 ? users[0] : null;
        return user;
      })
    );
  }
}
