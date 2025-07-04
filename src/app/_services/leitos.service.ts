import { inject, Injectable } from "@angular/core";
import { addDoc, arrayRemove, arrayUnion, collection, CollectionReference, deleteDoc, doc, DocumentReference, Firestore, getDoc, getDocs, query, updateDoc, where } from '@angular/fire/firestore';
import { Leito } from "../_models/leito";
import { from, Observable, switchMap } from "rxjs";
import { Ala } from "../_models/ala";
import { fr } from "date-fns/locale";
import { Hospital } from "../_models/Hospital";


@Injectable({
    providedIn: 'root'
})
export class LeitosService {
    private firestore = inject(Firestore);
    private tabela = 'leitos';
    private leitosRef = collection(this.firestore, this.tabela) as CollectionReference<Leito>



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

}