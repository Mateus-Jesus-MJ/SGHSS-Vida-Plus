import { inject, Injectable } from "@angular/core";
import { addDoc, arrayRemove, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from "./auth.service";
import { Internamento } from "../_models/internamento";
import { from, lastValueFrom, Observable, switchMap } from "rxjs";
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


  incluir(internamento: Internamento): Observable<any>{
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
}