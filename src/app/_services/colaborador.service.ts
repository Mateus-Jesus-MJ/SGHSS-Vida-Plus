import { Injectable } from '@angular/core';
import { GenericBaseService } from './generic.base.service';
import { Observable, throwError } from 'rxjs';
import { Colaborador } from '../_models/colaborador';
import { Firestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService extends GenericBaseService<Colaborador> {
  protected override collectionName = 'colaboradores';

  incluir(){

  }

  // override editar(colaborador: Colaboradores): Observable<any> {
  //   // 🔍 Validação personalizada
  //   if (!colaborador.nome || colaborador.nome.trim().length < 3) {
  //     return throwError(() => new Error('Nome do colaborador é obrigatório e deve ter pelo menos 3 caracteres.'));
  //   }

  //   // ✅ Chamada do método genérico
  //   return super.editar(colaborador);
  // }
}
