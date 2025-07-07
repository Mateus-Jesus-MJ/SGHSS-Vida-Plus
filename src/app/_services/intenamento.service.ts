import { inject, Injectable } from "@angular/core";
import { addDoc, arrayRemove, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from "./auth.service";
import { Internamento } from "../_models/internamento";
import { catchError, forkJoin, from, lastValueFrom, map, Observable, of, switchMap, throwError } from "rxjs";
import { LeitosService } from "./leitos.service";
import { Paciente } from "../_models/Paciente";

@Injectable({
  providedIn: 'root'
})
export class IntenamentoService {
  private firestore = inject(Firestore);
  private tabela = 'internamentos';
  private collectionRef = collection(this.firestore, this.tabela) as CollectionReference<Internamento>
  private authService = inject(AuthService);
  private leitosService = inject(LeitosService);


  buscarIntenamentos(): Observable<Internamento[]> {
    const q = query(this.collectionRef);

    return from(getDocs(q)).pipe(
      switchMap(snapshot => {
        const dadosRaw: Internamento[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const dadosCompleto$ = dadosRaw.map(async (dado) => {
          const idPaciente = (dado as any).idPaciente;
          const idLeito = (dado as any).idLeito;

          if (idPaciente) {
            const pacienteRef = doc(this.firestore, `pacientes/${idPaciente}`);
            const pacienteSnap = await getDoc(pacienteRef);
            if (pacienteSnap.exists()) {
              (dado as any).paciente = {
                id: pacienteSnap.id,
                ...pacienteSnap.data()
              } as Paciente;
            }
          }

          if (idLeito) {
            const leitoCompleto = await lastValueFrom(this.leitosService.buscarPorId(idLeito));
            if (leitoCompleto) {
              (dado as any).leito = leitoCompleto;
            }
          }

          return dado;
        });

        return from(Promise.all(dadosCompleto$));
      })
    );
  }

  buscarPorId(id: string): Observable<Internamento | null> {
    const internamentoRef = doc(this.firestore, `${this.tabela}/${id}`);

    return from(getDoc(internamentoRef)).pipe(
      switchMap(async snapshot => {
        if (!snapshot.exists()) return null;

        const data = snapshot.data() as Internamento;
        const internamento: Internamento = { id: snapshot.id, ...data };

        if (internamento.idPaciente) {
          const pacienteRef = doc(this.firestore, `pacientes/${internamento.idPaciente}`);
          const pacienteSnap = await getDoc(pacienteRef);
          if (pacienteSnap.exists()) {
            (internamento as any).paciente = {
              id: pacienteSnap.id,
              ...pacienteSnap.data()
            } as Paciente;
          }
        }

        if (internamento.idLeito) {
          const leitoCompleto = await lastValueFrom(this.leitosService.buscarPorId(internamento.idLeito));
          if (leitoCompleto) {
            (internamento as any).leito = leitoCompleto;
          }
        }

        return internamento;
      })
    );
  }


  incluir(internamento: Internamento): Observable<any> {
    const conferencia = query(
      this.collectionRef,
      where('idPaciente', '==', internamento.idPaciente),
      where('status', '==', 'INTERNADO')
    );

    return new Observable(observer => {
      getDocs(conferencia).then(snapshot => {
        if (!snapshot.empty) {
          observer.error("Erro ao incluir internamento. Motivo: Esse paciente já está internado!");
          observer.complete();
          return;
        }

        const user = this.authService.getUsuario();
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        internamento.UsuarioInclusao = user?.usuario;
        internamento.momentoInclusao = momentoCriacao;

        addDoc(this.collectionRef, structuredClone(internamento))
          .then(() => {
            if (!internamento.idLeito) {
              observer.next("Internamento adicionado, mas nenhum leito foi vinculado.");
              observer.complete();
              return;
            }

            const leitoRef = doc(this.firestore, `leitos/${internamento.idLeito}`);
            updateDoc(leitoRef, { status: 'OCUPADO' })
              .then(() => {
                observer.next("Internamento adicionado e leito atualizado com sucesso!");
                observer.complete();
              })
              .catch(error => {
                observer.error(`Internamento incluído, mas erro ao atualizar leito. Entre me contato com o administrador do sistema para corrigir essa situação. Motivo: ${error}`);
              });

          }).catch(error => {
            observer.error(`Erro ao incluir internamento. Motivo: ${error}`);
          });
      }).catch(error => {
        observer.error(`Erro ao consultar internamentos existentes. Motivo: ${error}`);
      });
    });
  }

  atualizar(internamentoAtualizado: Internamento): Observable<any> {
    return new Observable(observer => {
      const internamentoRef = doc(this.firestore, `internamentos/${internamentoAtualizado.id}`) as DocumentReference<Internamento>;

      getDoc(internamentoRef).then(snapshot => {
        if (!snapshot.exists()) {
          observer.error("Internamento não encontrado.");
          return;
        }

        const internamentoOriginal = snapshot.data() as Internamento;
        const operacoes: Promise<any>[] = [];

        if (internamentoOriginal.idLeito !== internamentoAtualizado.idLeito) {
          if (internamentoOriginal.idLeito) {
            const leitoAntigoRef = doc(this.firestore, `leitos/${internamentoOriginal.idLeito}`);
            operacoes.push(updateDoc(leitoAntigoRef, { status: 'DISPONÍVEL' }));
          }

          if (internamentoAtualizado.idLeito) {
            const leitoNovoRef = doc(this.firestore, `leitos/${internamentoAtualizado.idLeito}`);
            operacoes.push(updateDoc(leitoNovoRef, { status: 'OCUPADO' }));
          }
        }

        const user = this.authService.getUsuario();
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const momentoEdicao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        internamentoAtualizado.UsuarioEdicao = user?.usuario;
        internamentoAtualizado.momentoEdicao = momentoEdicao;

        const dadosParaSalvar = structuredClone(internamentoAtualizado);
        delete (dadosParaSalvar as any).paciente;
        delete (dadosParaSalvar as any).leito;

        operacoes.push(updateDoc(internamentoRef, dadosParaSalvar as Record<string, any>));

        Promise.all(operacoes)
          .then(() => {
            observer.next("Internamento atualizado com sucesso.");
            observer.complete();
          })
          .catch(error => {
            observer.error(`Erro ao atualizar internamento. Motivo: ${error}`);
          });

      }).catch(error => {
        observer.error(`Erro ao buscar internamento original. Motivo: ${error}`);
      });
    });
  }

  // liberarInternamento(idInternamento: string): Observable<any> {
  //   const internamentoRef = doc(
  //     this.firestore,
  //     `${this.tabela}/${idInternamento}`
  //   ) as DocumentReference<{ idLeito?: string; status?: string }>;


  //   return from(getDoc(internamentoRef)).pipe(
  //     switchMap(snapshot => {
  //       if (!snapshot.exists()) {
  //         return throwError(() => new Error('Internamento não encontrado.'));
  //       }
  //       const data = snapshot.data();
  //       const idLeito = data.idLeito;

  //       const user = this.authService.getUsuario();
  //       const now = new Date();
  //       const pad = (n: number) => n.toString().padStart(2, '0');
  //       const momentoEdicao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  //       const updInternamento = updateDoc(internamentoRef, { status: 'LIBERADO', UsuarioEdicao: user?.usuario, momentoEdicao: momentoEdicao });

  //       if (idLeito) {
  //         const leitoRef = doc(this.firestore, `leitos/${idLeito}`);
  //         const updLeito = updateDoc(leitoRef, { status: 'DISPONIVEL' });
  //         return forkJoin([from(updInternamento), from(updLeito)]);
  //       } else {
  //         return forkJoin([from(updInternamento)]);
  //       }
  //     }),
  //     map(() => 'Internamento liberado e leito disponibilizado com sucesso.'),
  //     catchError(err =>
  //       of(`Erro ao liberar internamento: ${err.message || err}`)
  //     )
  //   );
  // }
  liberarInternamento(idInternamento: string): Observable<string> {
    const internamentoRef = doc(this.firestore, `${this.tabela}/${idInternamento}`);

    return from(getDoc(internamentoRef)).pipe(
      switchMap(snapshot => {
        if (!snapshot.exists()) {
          return throwError(() => new Error('Internamento não encontrado.'));
        }

        const internamento = snapshot.data() as Internamento;
        const idLeito = internamento.idLeito;
        const idPaciente = internamento.idPaciente;
        if (!idPaciente) {
          return throwError(() => new Error('Paciente não associado ao internamento.'));
        }

        const user = this.authService.getUsuario();
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const momentoEdicao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const atualizacaoInternamento = updateDoc(internamentoRef, {
          status: 'LIBERADO',
          UsuarioEdicao: user?.usuario,
          momentoEdicao: momentoEdicao
        });

        const atualizacaoLeito = idLeito
          ? updateDoc(doc(this.firestore, `leitos/${idLeito}`), { status: 'DISPONIVEL' })
          : Promise.resolve();

        const prontuarioRef = doc(this.firestore, `pacientes/${idPaciente}`);

        const atualizacaoProntuario = getDoc(prontuarioRef).then(pacienteSnap => {
          if (!pacienteSnap.exists()) {
            throw new Error('Paciente não encontrado para atualizar prontuário.');
          }

          const pacienteData = pacienteSnap.data() as Paciente;
          const prontuario = pacienteData.prontuario || {
            consultas: [],
            procedimentos: [],
            internacoes: []
          };


          prontuario.internacoes = prontuario.internacoes || [];
          prontuario.internacoes.push({
            ...internamento,
            status: 'LIBERADO',
            momentoEdicao,
            UsuarioEdicao: user?.usuario
          });

          return updateDoc(prontuarioRef, {
            prontuario
          });
        });

        // Executa tudo junto
        return forkJoin([
          from(atualizacaoInternamento),
          from(atualizacaoLeito),
          from(atualizacaoProntuario)
        ]);
      }),
      map(() => 'Internamento liberado, leito disponível e prontuário atualizado.'),
      catchError(err =>
        throwError(() => new Error(`Erro ao liberar internamento: ${err.message || err}`))
      )
    );
  }

}