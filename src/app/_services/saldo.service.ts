import { inject, Injectable } from '@angular/core';
import { addDoc, collection, CollectionReference, Firestore, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Saldo } from '../_models/saldo';
import { forkJoin, from, map, Observable, of, switchMap } from 'rxjs';
import { MedicamentosService } from './medicamentos.service';
import { HospitalService } from './hospital.service';
import { RecebimentoMedicamento } from '../_models/recebimento';

@Injectable({
  providedIn: 'root'
})
export class SaldoService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private medicamentoService = inject(MedicamentosService);
  private hospitalService = inject(HospitalService);


  private tabela = 'saldo';
  private registrosRef = collection(this.firestore, this.tabela) as CollectionReference<Saldo>


  buscarSaldosComInfoCompleta(): Observable<Saldo[]> {
    const q = query(
      this.registrosRef
    );

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      ),
      switchMap((saldos: Saldo[]) => {
        if (saldos.length === 0) return of([]);

        const saldosComInfo$ = saldos.map(saldo =>
          forkJoin({
            medicamento: this.medicamentoService.buscarPorId(saldo.medicamentoId),
            hospital: this.hospitalService.buscarHospitalPorId(saldo.hospitalId)
          }).pipe(
            map(({ medicamento, hospital }) => ({
              ...saldo,
              medicamento: medicamento ?? undefined,
              hospital: hospital ?? undefined
            }))
          )
        );
        return forkJoin(saldosComInfo$);
      })
    );
  }


  receberMedicamento(recebimento: RecebimentoMedicamento): Observable<string> {
    const q = query(
      this.registrosRef,
      where('hospitalId', '==', recebimento.hospitalId),
      where('medicamentoId', '==', recebimento.medicamentoId)
    );



    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const momentoAtual = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const usuario = this.authService.getUsuario();

    recebimento.usuarioRecebimento = usuario?.usuario;
    recebimento.momentoRecebimento = momentoAtual;

    return new Observable(observer => {
      getDocs(q).then(snapshot => {
        if (!snapshot.empty) {
          // Saldo existente → atualizar
          const docRef = snapshot.docs[0].ref;
          const saldoAtual = snapshot.docs[0].data() as Saldo;
          const novaQuantidade = saldoAtual.quantidade + recebimento.quantidade;

          let recebimentos = saldoAtual.recebimentos ?? [];
          recebimentos.push(recebimento);

          updateDoc(docRef, {
            quantidade: novaQuantidade,
            recebimentos: recebimentos,
            momentoAtualizacao: momentoAtual,
            usuarioAtualizacao: usuario?.usuario
          }).then(() => {
            observer.next("Saldo atualizado com sucesso!");
            observer.complete();
          }).catch(error => {
            observer.error(`Erro ao atualizar saldo. Motivo: ${error}`);
          });

        } else {
          // Saldo não existe → criar

          let recebimentos = [];
          recebimentos.push(recebimento);

          const novoSaldo: Saldo = {
            hospitalId: recebimento.hospitalId,
            medicamentoId: recebimento.medicamentoId,
            quantidade: recebimento.quantidade,
            momentoAtualizacao: momentoAtual,
            usuarioAtualizacao: usuario?.nome,
            recebimentos: recebimentos
          };

          addDoc(this.registrosRef, novoSaldo).then(() => {
            observer.next("Saldo criado com sucesso!");
            observer.complete();
          }).catch(error => {
            observer.error(`Erro ao criar saldo. Motivo: ${error}`);
          });
        }
      }).catch(error => {
        observer.error(`Erro ao verificar saldo existente. Motivo: ${error}`);
      });
    });
  }
}
