import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { catchError, from, map, Observable, of } from 'rxjs';

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
