import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, from, map, Observable, of, switchMap, throwError } from 'rxjs';
import { Colaborador } from '../_models/colaborador';
import { CargosService } from './cargos.service';
import { addDoc, collection, CollectionReference, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { Cargo, Especialidade } from '../_models/cargo';
import { Firestore } from '@angular/fire/firestore';
import { snapshotEqual } from 'firebase/firestore/lite';
import { ZoomService } from './zoom.service';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  private firestore = inject(Firestore);
  private colaboradoresCollection = collection(this.firestore, 'colaboradores');
  private cargoService = inject(CargosService);
  private zoomService = inject(ZoomService);

  buscarColaboradoresComCargo(): Observable<Colaborador[]> {
    const q = query(
      this.colaboradoresCollection
    ) as CollectionReference<Colaborador>;

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      ),
      switchMap((colaboradores: Colaborador[]) => {
        if (colaboradores.length === 0) return of([]);

        const colaboradoresComCargo$ = colaboradores.map(colaborador =>
          this.cargoService.buscarCargoPorId(colaborador.cargoId).pipe(
            map(cargo => ({
              ...colaborador,
              cargo: cargo ?? undefined
            }))
          )
        );

        return forkJoin(colaboradoresComCargo$);
      })
    );
  }




  buscarPorId(id: string): Observable<Colaborador | null> {
    const colaboradorRef = doc(this.firestore, `colaboradores/${id}`);

    return from(getDoc(colaboradorRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) return of(null);

        const data = snapshot.data() as Colaborador;
        const colaboradorComId: Colaborador = { id: snapshot.id, ...data };

        const cargoRef = doc(this.firestore, `cargos/${data.cargoId}`);

        return from(getDoc(cargoRef)).pipe(
          map(cargoSnap => {
            const cargoData = cargoSnap.exists() ? cargoSnap.data() as Cargo : undefined;
            const cargoCompleto = cargoData ? { id: cargoSnap.id, ...cargoData } : undefined;
            return { ...colaboradorComId, cargo: cargoCompleto } as Colaborador;
          })
        );
      })
    );
  }

  incluir(colaborador: Colaborador): Observable<any> {
    const qcolaboradorComMesmoCPF = query(this.colaboradoresCollection, where('cpf', '==', colaborador.cpf));

    return new Observable(observer => {
      getDocs(qcolaboradorComMesmoCPF).then(snapshot => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar colaborador. Motivo: Já existe um colaborador com esse CPF");
          observer.complete();
          return; // <- importante!
        }

        addDoc(this.colaboradoresCollection, structuredClone(colaborador)).then(() => {
          this.zoomService.createZoomUser(colaborador).subscribe({
            next: () => {
              observer.next("Colaborador cadastrado com sucesso e usuário Zoom criado!");
              observer.complete();
            },
            error: zoomError => {
              observer.error(`Colaborador salvo, mas houve erro ao criar usuário Zoom: ${zoomError.error || zoomError.message}`);
              observer.complete();
            }
          });
        }).catch(error => {
          observer.error(`Erro ao cadastrar colaborador. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao verificar CPF. Motivo: ${error}`);
      });
    });
  }



  // editar(colaborador: Colaborador): Observable<any> {
  //   const qcolaboradorComMesmoCPF = query(this.colaboradoresCollection, where('cpf', '==', colaborador.cpf));

  //   return new Observable(observer => {
  //     Promise.all([
  //       getDocs(qcolaboradorComMesmoCPF)
  //     ]).then(([snapshot]) => {
  //       const outroColaboradorMesmoCpf = snapshot.docs.find(doc => doc.id !== colaborador.id)

  //       if (outroColaboradorMesmoCpf) {
  //         observer.error("Erro ao editar colaborador. Motivo: Já existe um colaborador com  esse CPF");
  //         return;
  //       }

  //       const colaboradorDocRef = doc(this.firestore, "colaboradores", colaborador.id!);
  //       const { id, ...dadosParaAtualizar } = colaborador;

  //       from(updateDoc(colaboradorDocRef, structuredClone(dadosParaAtualizar)))
  //         .subscribe({
  //           next: () => {
  //             observer.next("Colaborador editado com sucesso!");
  //             observer.complete();
  //           },
  //           error: (error) => {
  //             observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
  //             observer.complete();
  //           }
  //         })
  //     }).catch(error => {
  //       observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
  //     });
  //   });
  // }
  editar(colaborador: Colaborador): Observable<any> {
  const qcolaboradorComMesmoCPF = query(this.colaboradoresCollection, where('cpf', '==', colaborador.cpf));

  return new Observable(observer => {
    getDocs(qcolaboradorComMesmoCPF).then(snapshot => {
      const outroColaboradorMesmoCpf = snapshot.docs.find(doc => doc.id !== colaborador.id);

      if (outroColaboradorMesmoCpf) {
        observer.error("Erro ao editar colaborador. Motivo: Já existe um colaborador com esse CPF");
        return;
      }

      const colaboradorDocRef = doc(this.firestore, "colaboradores", colaborador.id!);
      const { id, ...dadosParaAtualizar } = colaborador;

      updateDoc(colaboradorDocRef, structuredClone(dadosParaAtualizar)).then(() => {
        // Após atualizar o colaborador no Firebase, tenta criar o usuário Zoom
        this.zoomService.createZoomUser(colaborador).subscribe({
          next: () => {
            observer.next("Colaborador editado com sucesso e usuário Zoom atualizado/criado!");
            observer.complete();
          },
          error: zoomError => {
            observer.error(`Colaborador editado, mas houve erro ao criar/atualizar usuário Zoom: ${zoomError.error || zoomError.message}`);
            observer.complete();
          }
        });
      }).catch(error => {
        observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
        observer.complete();
      });
    }).catch(error => {
      observer.error(`Erro ao editar colaborador. Motivo: ${error}`);
    });
  });
}

  excluir(id: string): Observable<any> {
    const colaboradorRef = doc(this.firestore, `colaboradores/${id}`);

    return from(deleteDoc(colaboradorRef)).pipe(
      map(() => 'Colaborador Excluido com Sucesso!'),
      catchError(error => {
        return of(`Erro ao excluir o colaborador. Motivo: ${error}`);
      })
    );
  }

  BuscarEspecialidadesPorCargoMedico(): Observable<Especialidade[]> {
    const cargosRef = collection(this.firestore, 'cargos');
    const qCargoMedico = query(cargosRef, where('cargo', '==', 'MÉDICO'));

    return from(getDocs(qCargoMedico)).pipe(
      switchMap(cargosSnapshot => {
        if (cargosSnapshot.empty) {
          return of([]);
        }

        const cargoMedicoId = cargosSnapshot.docs[0].id;

        const colaboradoresRef = collection(this.firestore, 'colaboradores');
        const qColaboradoresMedicos = query(colaboradoresRef, where('cargoId', '==', cargoMedicoId));

        return from(getDocs(qColaboradoresMedicos)).pipe(
          map(colaboradoresSnapshot => {
            if (colaboradoresSnapshot.empty) {
              return [];
            }

            const especialidadesSet = new Set<string>();
            const especialidadesArray: Especialidade[] = [];

            colaboradoresSnapshot.forEach(doc => {
              const data = doc.data() as any;
              const especialidadesDoColaborador: any[] = Array.isArray(data.especialidades) ? data.especialidades : [];

              especialidadesDoColaborador.forEach(item => {
                const nome = typeof item === 'string' ? item : item?.especialidade;

                if (nome && !especialidadesSet.has(nome)) {
                  especialidadesSet.add(nome);
                  especialidadesArray.push({
                    especialidade: nome,
                    cargoId: cargoMedicoId
                  });
                }
              });
            });

            return especialidadesArray;
          })
        );
      })
    );
  }

  BuscarMedicoPorEspecialidade(especialidadeBuscada: string): Observable<Colaborador[]> {
    const cargosRef = collection(this.firestore, 'cargos');
    const qCargoMedico = query(cargosRef, where('cargo', '==', 'MÉDICO'));

    return from(getDocs(qCargoMedico)).pipe(
      switchMap(cargosSnapshot => {
        if (cargosSnapshot.empty) {
          return of([]);
        }
        const cargoMedicoId = cargosSnapshot.docs[0].id;
        const colaboradoresRef = collection(this.firestore, 'colaboradores');
        const qColaboradores = query(colaboradoresRef, where('cargoId', '==', cargoMedicoId));

        return from(getDocs(qColaboradores)).pipe(
          map(snapshot => {
            if (snapshot.empty) {
              return [];
            }
            const colaboradores: Colaborador[] = [];
            snapshot.forEach(doc => {
              colaboradores.push({ id: doc.id, ...(doc.data() as any) });
            });

            // Filtra aqui no código a especialidade desejada dentro do array de objetos
            return colaboradores.filter(c =>
              Array.isArray(c.especialidades) &&
              c.especialidades.some((e: any) => e.especialidade === especialidadeBuscada)
            );
          })
        );
      })
    );
  }

}

