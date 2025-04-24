import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Paciente } from '../_models/Paciente';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private firestore = inject(Firestore);


  novoPaciente(paciente: Paciente) {
    const pacientesCollection = collection(this.firestore, 'pacientes');
    return addDoc(pacientesCollection, structuredClone(paciente));
  }
}
