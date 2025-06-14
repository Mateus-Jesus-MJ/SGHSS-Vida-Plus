import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Paciente } from '../_models/Paciente';
import { addDoc, collection, CollectionReference, Firestore, getDoc, getDocs, query, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { error } from 'jquery';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private pacienteCollection = collection(this.firestore, 'pacientes') as CollectionReference<Paciente>

  buscarPacienteLogado(): Observable<Paciente> {
    const user = this.authService.getUsuario();
    const q = query(this.pacienteCollection, where('email', '==', user!.usuario));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data() as Paciente;
          return { id: doc.id, ...data };
        } else {
          throw new Error('Paciente não encontrado');
        }
      }),
      catchError(error => {
        throw new Error('Paciente não encontrado');
      })
    );
  }


  novoPaciente(paciente: Paciente) {
    const pacientesCollection = collection(this.firestore, 'pacientes');
    return addDoc(pacientesCollection, structuredClone(paciente));
  }
}
