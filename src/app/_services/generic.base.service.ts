import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, Firestore, getDoc, getDocs, query, QueryConstraint, updateDoc, where } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';
import { WhereFilterOp } from 'firebase/firestore';



@Injectable({
  providedIn: 'root'
})
export abstract class GenericBaseService<T extends { id?: string }> {
  private firestore = inject(Firestore);
  protected abstract collectionName: string;

  protected get collectionRef() {
    return collection(this.firestore, this.collectionName);
  }

  buscarTodos(): Observable<T[]> {
    return from(getDocs(this.collectionRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)))
    );
  }

  buscarComFiltros<T>(filtros: [string, WhereFilterOp, any][]): Observable<T[]> {
  const constraints = filtros.map(([campo, operador, valor]) =>
    where(campo, operador, valor)
  );

  const q = query(this.collectionRef, ...constraints);
  return collectionData(q, { idField: 'id' }) as Observable<T[]>;
}

  buscarPorId(id: string): Observable<T | null> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(getDoc(docRef)).pipe(
      map(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as T : null),
      catchError(() => of(null))
    );
  }

  adicionar(dado: T): Observable<any> {
    return from(addDoc(this.collectionRef, structuredClone(dado)));
  }

  editar(dado: T): Observable<any> {
    const { id, ...data } = dado;
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(updateDoc(docRef, structuredClone(data)));
  }

  excluir(id: string): Observable<any> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(docRef));
  }
}
