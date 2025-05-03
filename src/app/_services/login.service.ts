import { inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Autorizacao, User } from '../_models/User';
import { Login } from '../_models/Login';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
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

  login1(login: Login): Observable<User | null> {
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

  login(login: Login): Observable<{ canLogin: boolean, tipoUsuario?: string, message?: string }> {
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
          const data = doc.data() as User;
          return {
            id: doc.id,
            ...data,
            autorizacoes: data.autorizacoes ? this.transformarAutorizacoes(data.autorizacoes, doc.id) : []
          };
        });

        const user = users.length > 0 ? users[0] : null;

        if (user) {
          // Verifica o status booleano do usuário
          if (user.status) {  // Se o status for verdadeiro (ativo)
            this.authService.login(user);
            return { canLogin: true, tipoUsuario: user.tipoUsuario }; // Login permitido
          } else {
            // Retorna uma mensagem indicando que o usuário está inativo
            return { canLogin: false, message: 'Seu acesso foi desativado. Entre em contato com o administrador.' };
          }
        }
        return { canLogin: false, message: 'Usuário ou senha inválidos.' };
      })
    );
  }


  private transformarAutorizacoes(autorizacoesMap: any, userId: string): Autorizacao[] {
    const autorizacoesArray: Autorizacao[] = [];

    if (Array.isArray(autorizacoesMap)) {
      autorizacoesMap.forEach((item: any) => {
        if (item.funcionalidade && item.acesso) {
          autorizacoesArray.push({
            userId: userId,
            funcionalidade: item.funcionalidade,
            acesso: item.acesso
          });
        }
      });
    }

    return autorizacoesArray;
  }
}
