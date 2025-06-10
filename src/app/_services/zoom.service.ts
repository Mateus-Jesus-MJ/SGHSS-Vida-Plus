import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Consulta } from '../_models/consulta';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
  private zoomUrl = environment.apiZoom;

  constructor(private http: HttpClient) { }

  createMeeting(consulta: Consulta): Observable<any> {

  const data = consulta.data + "T" + consulta.hora + ":00Z";
  const meetingData = {
    topic: `Consulta do paciente ${consulta.paciente!.nome} com o doutor ${consulta.medico?.nome}`,
    start_time: data,
    duration: 30,
    timezone: "America/Sao_Paulo"
  };

  console.log(this.zoomUrl);

  // Chama seu backend (que já tem o client secret e faz a chamada Zoom)
  return this.http.post(`${this.zoomUrl}create-meeting`, meetingData);
}

}
