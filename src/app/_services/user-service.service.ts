import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Login } from '../_models/Login';
import { User } from '../_models/User';
import { BaseService } from './base.service';
import { catchError, map } from 'rxjs';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService extends BaseService {
  private firestore = inject(Firestore);

  novouser(usuario :User){
    const userCollection = collection(this.firestore, 'usuarios');
    return addDoc(userCollection, structuredClone(usuario));
  }
}
