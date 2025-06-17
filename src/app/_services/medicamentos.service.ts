import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, doc, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Medicamento } from '../_models/medicamento';
import { catchError, from, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MedicamentosService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private tabela = 'medicamentos';
  private registrosRef = collection(this.firestore, this.tabela) as CollectionReference<Medicamento>

  buscarTodos() {
    const q = query(this.registrosRef);

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const dados: Medicamento[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          }
        });
        return dados;
      })
    )
  }

  bucarPorId(id: string): Observable<Medicamento | null> {
    const q = doc(this.firestore, `${this.tabela}/${id}}`);
    return from(getDoc(q)).pipe(
      map(snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Medicamento;
          return { id: snapshot.id, ...data }
        } else {
          return null;
        }
      }),
      catchError(error => {
        return of(null)
      }));
  }

  incluir(medicamento: Medicamento): Observable<any> {
    const q = query(this.registrosRef, where('EAN', '==', medicamento.ean));

    return new Observable(observer => {
      Promise.all([
        getDocs(q)
      ]).then(([snapshot]) => {
        if (!snapshot.empty) {
          observer.error("Erro ao cadastrar medicamento. Motivo: Esse medicamento já foi cadastrado!");
          observer.complete();
        }

        const user = this.authService.getUsuario();
        medicamento.usuarioCriacao;
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        medicamento.momentoCriacao = momentoCriacao;

        addDoc(this.registrosRef, structuredClone(medicamento)).then(() => {
          observer.next("Medicamento adicionado com sucesso!");
          observer.complete();
        }).catch(error => {
          observer.error(`Erro ao cadastrar medicamento. Motivo: ${error}`);
        });
      }).catch(error => {
        observer.error(`Erro ao cadastrar medicamento. Motivo: ${error}`);
      });
    })
  }

  editar(medicamento: Medicamento): Observable<any> {
    const q = query(this.registrosRef, where('EAN', '==', medicamento.ean));
    return new Observable(observer => {
      Promise.all([
        getDocs(q)
      ]).then(([snapshot]) => {
        const outroComMesmoCriterio = snapshot.docs.find(doc => doc.id !== medicamento.id);

        if (outroComMesmoCriterio) {
          observer.error("Erro ao cadastrar medicamento. Motivo: Esse medicamento já foi cadastrado!");
          return;
        }

        const user = this.authService.getUsuario();
        medicamento.usuarioEdicao = user?.usuario;
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        medicamento.momentoEdicao = momentoCriacao;

        const medicamentoDocRef = doc(this.firestore, this.tabela, medicamento.id!);
        const { id, ...dadosParaAtualizar } = medicamento;
        from(updateDoc(medicamentoDocRef, structuredClone(dadosParaAtualizar)))
          .subscribe({
            next: () => {
              observer.next("Medicamento editado com sucesso!");
              observer.complete();
            },
            error: (error) => {
              observer.error(`Erro ao editar medicamento. Motivo: ${error}`);
              observer.complete();
            }
          })
      }).catch(error => {
        observer.error(`Erro ao editar medicamento. Motivo: ${error}`);
      });
    });
  }
}
