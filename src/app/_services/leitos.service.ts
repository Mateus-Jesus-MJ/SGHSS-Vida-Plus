import { inject, Injectable } from "@angular/core";
import { addDoc, arrayRemove, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Leito } from "../_models/leito";
import { catchError, from, map, Observable, of, switchMap } from "rxjs";
import { Ala } from "../_models/ala";
import { fr } from "date-fns/locale";
import { Hospital } from "../_models/Hospital";
import { AuthService } from "./auth.service";


@Injectable({
    providedIn: 'root'
})
export class LeitosService {
    private firestore = inject(Firestore);
    private tabela = 'leitos';
    private leitosRef = collection(this.firestore, this.tabela) as CollectionReference<Leito>
    private authService = inject(AuthService);



    buscarLeitos() {
        const q = query(this.leitosRef);

        return from(getDocs(q)).pipe(
            switchMap(snapshot => {
                const leitosRaw: Leito[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const leitosComDados$ = leitosRaw.map(async (leito) => {
                    const idAla = (leito as any).idAla;
                    if (idAla) {
                        const alaRef = doc(this.firestore, `alas/${idAla}`);
                        const alaSnap = await getDoc(alaRef);
                        if (alaSnap.exists()) {
                            (leito as any).ala = {
                                id: alaSnap.id,
                                ...alaSnap.data()
                            } as Ala;
                        }
                    }

                    const idHospital = (leito as any).idHospital;
                    if (idHospital) {
                        const hospitalRef = doc(this.firestore, `hospitais/${idHospital}`);
                        const hospitalSnap = await getDoc(hospitalRef);
                        if (hospitalSnap.exists()) {
                            (leito as any).hospital = {
                                id: hospitalSnap.id,
                                ...hospitalSnap.data()
                            } as Hospital;
                        }
                    }

                    return leito;
                });

                return from(Promise.all(leitosComDados$));
            })
        );
    }

    buscarPorId(id: string): Observable<Leito | null> {
        const leitoRef = doc(this.firestore, `${this.tabela}/${id}`);

        return from(getDoc(leitoRef)).pipe(
            switchMap(snapshot => {
                if (!snapshot.exists()) return of(null);

                const data = snapshot.data() as Leito;
                const leitoComId: Leito = { id: snapshot.id, ...data };

                const hospitalRef = doc(this.firestore, `hospitais/${data.idHospital}`);

                return from(getDoc(hospitalRef)).pipe(
                    map(hospitalSnap => {
                        const hospitalData = hospitalSnap.exists() ? hospitalSnap.data() as Hospital : undefined;
                        const hospitalCompleto = hospitalData ? { id: hospitalSnap.id, ...hospitalData } : undefined;

                        let alaEncontrada: Ala | undefined;

                        if (hospitalCompleto?.alas && Array.isArray(hospitalCompleto.alas)) {
                            alaEncontrada = hospitalCompleto.alas.find(a => a.id === data.idAla);
                        }

                        return {
                            ...leitoComId,
                            hospital: hospitalCompleto,
                            ala: alaEncontrada
                        } as Leito;
                    })
                );
            })
        );
    }

    incluir(leito: Leito): Observable<any> {
        const qleito = query(this.leitosRef, where('codigo', '==', leito.codigo));

        return new Observable(observer => {
            Promise.all([
                getDocs(qleito)
            ]).then(([snapshot]) => {
                if (!snapshot.empty) {
                    observer.error("Erro ao cadastrar cargo. Motivo: Esse cargo já foi cadastrado!");
                    observer.complete();
                }

                const user = this.authService.getUsuario();
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

                leito.usuarioCriacao = user?.usuario;
                leito.momentoCriacao = momentoCriacao

                addDoc(this.leitosRef, structuredClone(leito)).then(() => {
                    observer.next("Leito adicionado com sucesso!");
                    observer.complete();
                }).catch(error => {
                    observer.error(`Erro ao cadastrar Leito. Motivo: ${error}`);
                });
            }).catch(error => {
                observer.error(`Erro ao cadastrar Leito. Motivo: ${error}`);
            });
        });
    }


    editar(leito: Leito): Observable<any> {
        const qleito = query(this.leitosRef, where('codigo ', '==', leito.codigo));

        return new Observable(observer => {
            Promise.all([
                getDocs(qleito)
            ]).then(([snapshot]) => {
                const outroCargoMesmoNome = snapshot.docs.find(doc => doc.id !== leito.id)

                if (outroCargoMesmoNome) {
                    observer.error("Erro ao editar cargo. Motivo: Esse cargo já foi cadastrado!");
                    return;
                }

                const user = this.authService.getUsuario();
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                const momentoCriacao = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

                leito.usuarioEdicao = user?.usuario;
                leito.momentoEdicao = momentoCriacao;

                const leitoDocRef = doc(this.firestore, this.tabela, leito.id!);
                const { id, ...dadosParaAtualizar } = leito;

                from(updateDoc(leitoDocRef, structuredClone(dadosParaAtualizar)))
                    .subscribe({
                        next: () => {
                            observer.next("Leito editado com sucesso!");
                            observer.complete();
                        },
                        error: (error) => {
                            observer.error(`Erro ao editar leito. Motivo: ${error}`);
                            observer.complete();
                        }
                    })
            }).catch(error => {
                observer.error(`Erro ao editar leito. Motivo: ${error}`);
            });
        });
    }

}