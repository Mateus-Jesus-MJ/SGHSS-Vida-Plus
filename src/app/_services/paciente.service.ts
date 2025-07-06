import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Paciente, ProcedimentoProntuario } from '../_models/Paciente';
import { addDoc, collection, collectionData, CollectionReference, doc, Firestore, getDoc, getDocs, query, snapToData, updateDoc, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { error } from 'jquery';
import { Procedimento } from '../_models/procedimento';

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

  buscarPacientesPorCriterios(filtros: { [chave: string]: any }): Observable<Paciente[]> {
    let q = query(this.pacienteCollection);

    for (const campo in filtros) {
      const valor = filtros[campo];
      if (valor !== null && valor !== undefined && valor !== '') {
        q = query(q, where(campo, '==', valor));
      }
    }

    return collectionData(q, { idField: 'id' }) as Observable<Paciente[]>;
  }

  buscarPacientePeloId(id: string) {
    const cargoRef = doc(this.firestore, `pacientes/${id}`);
    return from(getDoc(cargoRef)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Paciente;
          return { id: snapshot.id, ...data }
        } else {
          return null;
        }
      }),
      catchError(error => {
        return of(null)
      })
    );
  }


  novoPaciente(paciente: Paciente) {
    const pacientesCollection = collection(this.firestore, 'pacientes');
    return addDoc(pacientesCollection, structuredClone(paciente));
  }

  novoProcedimentoPaciente(procedimento: ProcedimentoProntuario): Observable<any> {
    const data = new Date(procedimento.data);
    if (isNaN(data.getTime())) {
      return throwError(() => new Error('Data de marcação inválida.'));
    }

    const diaSemana = data.getDay();
    const horarioMarcacao = data.toTimeString().slice(0, 5);

    const funcionamento = procedimento.procedimento.funcionamento.find(f => f.numeroDiaSemana === diaSemana);

    if (!funcionamento) {
      return throwError(() => new Error('Procedimento não funciona nesse dia.'));
    }

    const dentroDoHorario =
      (horarioMarcacao >= funcionamento.horarioInicio && horarioMarcacao < funcionamento.horarioInicioIntervalo) ||
      (horarioMarcacao >= funcionamento.horarioTerminoIntervalo && horarioMarcacao < funcionamento.horarioTermino);

    if (!dentroDoHorario) {
      return throwError(() => new Error('Horário fora do período de funcionamento.'));
    }

    const user = this.authService.getUsuario();
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    procedimento.usuarioMarcacao = user?.usuario;
    procedimento.momentoMarcacao = momentoCriacao;

    return this.buscarPacienteLogado().pipe(
      switchMap(paciente => {
        if (!paciente.prontuario) {
          paciente.prontuario = {
            consultas: [],
            procedimentos: []
          };
        }

        if (!paciente.prontuario.procedimentos) {
          paciente.prontuario.procedimentos = [];
        }

        paciente.prontuario.procedimentos.push(procedimento);

        const pacienteDocRef = doc(this.pacienteCollection, paciente.id!);

        return from(updateDoc(pacienteDocRef, {
          prontuario: paciente.prontuario
        })).pipe(
          map(() => 'Procedimento marcado com sucesso!')
        );
      }),
      catchError(() => throwError(() => new Error('Erro ao consultar ou atualizar os dados do paciente.')))
    );
  }


}
