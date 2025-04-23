import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Paciente } from '../_models/Paciente';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private api = environment.apiPrincipal;
  private http = inject(HttpClient);
  
  novoPaciente(paciente : Paciente){
    return this.http.post(`${this.api}/pacientes`, paciente);
  }
}
