import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Estado, Municipo } from '../_models/Estado';
import { catchError, map, of } from 'rxjs';
import { BaseService } from './base.service';
import { Endereco } from '../_models/endereco';

@Injectable({
  providedIn: 'root'
})
export class ConsultaEstadosMunicipiosService extends BaseService{
  baseUrl: string = environment.apiConsultaEstadosMunicipios;
  baseUrlCEP: string = environment.apiConsultaCEP;
  private http = inject(HttpClient);


  buscaEstados() {
    return this.http.get<Estado[]>(`${this.baseUrl}`).pipe(
      catchError((error) => {
        const estadosComId = environment.estados.map((estado, index) => {
          return { 
            ...estado, 
            id: index + 1
          };
        });
        return of(estadosComId);
      }),
      map((response: Estado[]) => {
        return response.sort((a, b) => a.nome.localeCompare(b.nome));
      })
    );
  }

  buscaMunicipios(estado: Estado){
    return this.http.get<Municipo[]>(`${this.baseUrl}/${estado.sigla}/municipios`).pipe(
      catchError(this.ServiceError),
      map((response: Municipo[]) => {
        return response.sort((a, b) => a.nome.localeCompare(b.nome));;
      })
    )
  }

  buscaMunicipioCEP(cep: string){
    const cepNumeric = cep.replace(/\D/g, '');

    return this.http.get<Endereco>(`${this.baseUrlCEP}${cep}/json/`).pipe(
      catchError(this.ServiceError),
      map((response) => {
        return response
      })
    )
  }
}
