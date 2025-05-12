import { inject, Injectable } from '@angular/core';
import { GenericBaseService } from './generic.base.service';
import { forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Colaborador } from '../_models/colaborador';
import { CargosService } from './cargos.service';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService extends GenericBaseService<Colaborador> {
  protected override collectionName = 'colaboradores';
  private cargoService = inject(CargosService);

  incluir(colaborador: Colaborador): Observable<any> {
    return super.buscarComFiltros([['cpf', '==', colaborador.cpf]]).pipe(
      map(resultados => resultados.length > 0),
      switchMap((existe) => {
        if (existe) {
          return throwError(() => new Error('Já existe um colaborador com esse CPF.'));
        }
        return super.adicionar(colaborador).pipe(
          map(() => 'Colaborador incluído com sucesso.')
        );
      })
    );
  }

  buscarColaboradoresComCargo(): Observable<Colaborador[]> {
  return this.buscarTodos().pipe(
    switchMap((colaboradores) => {
      if (colaboradores.length === 0) return of([]);

      const colaboradoresComCargo$ = colaboradores.map(colaborador =>
        this.cargoService.buscarCargoPorId(colaborador.cargoId).pipe(
          map(cargo => ({
            ...colaborador,
            cargo: cargo!
          }))
        )
      );

      return forkJoin(colaboradoresComCargo$);
    })
  );
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
