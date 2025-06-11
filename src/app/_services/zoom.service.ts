import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { Consulta } from '../_models/consulta';
import { Colaborador } from '../_models/colaborador';

@Injectable({
  providedIn: 'root'
})
export class ZoomService {
  private zoomUrl = environment.apiZoom;

  constructor(private http: HttpClient) { }

  createMeetingConsulta(consulta: Consulta): Observable<any> {

    const data = consulta.data + "T" + consulta.hora + ":00Z";
    const meetingData = {
      topic: `Consulta do paciente ${consulta.paciente!.nome} com o doutor ${consulta.medico?.nome}`,
      start_time: data,
      duration: 30,
      timezone: "America/Sao_Paulo",
      settings: {
        host_video: false,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        auto_end_meeting: true
      },
      hostEmail: 'me'
    };

    // Chama seu backend (que já tem o client secret e faz a chamada Zoom)
    return this.http.post(`${this.zoomUrl}create-meeting`, meetingData);
  }

  createZoomUser(colaborador: Colaborador): Observable<any> {


    return of({ success: true });

    const email = colaborador.contato.email;

    if (email == "") {
      return throwError(() => new Error('E-mail inválido para criação de usuário Zoom.'));
    }

    const partesNome = colaborador.nome.trim().split(/\s+/); // Divide por espaço
    const firstName = partesNome[0];
    const lastName = partesNome.slice(1).join(' ') || ' ';


    const payload = {
      email,
      firstName,
      lastName
    };

    return this.http.post(`${this.zoomUrl}create-user`, payload);
  }
}
