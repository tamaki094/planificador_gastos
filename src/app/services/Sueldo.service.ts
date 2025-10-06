import {inject, Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  DocumentReference,
  CollectionReference,
  Query,
  writeBatch,
  WriteBatch
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sueldo } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SueldoService {

  firestore : Firestore = inject(Firestore);

  /**
   *  Obtiene el sueldo de un usuario por su ID
   * @param userId
   * @returns Observable<Sueldo | null>
   */
  getSueldoByUser(userId: string): Observable<Sueldo | null> {
    const sueldoColeccion: CollectionReference<Sueldo> = collection(this.firestore, 'sueldo') as CollectionReference<Sueldo>;
    const sueldoQuery : Query<Sueldo> = query(sueldoColeccion, where('usuario', '==', userId)) as Query<Sueldo>;

    return collectionData(sueldoQuery,{ idField: 'id'})
      .pipe(
        map((sueldos: any[]) => {
           if (sueldos.length === 0) return null; // Default value

        const sueldo = sueldos[0]; // First element
        return {
          ...sueldo,
          fecha_creacion: sueldo.fecha_creacion?.toDate() || new Date()
        };
      })
    ) as Observable<Sueldo | null>;
  }


  async guardarSueldo(sueldo: Sueldo): Promise<any>{
    const sueldoColeccion : CollectionReference<Sueldo> = collection(this.firestore, 'sueldo') as CollectionReference<Sueldo>;
    const sueldoData = {
      ...sueldo,
      fecha_creacion: sueldo.fecha_creacion ? Timestamp.fromDate(sueldo.fecha_creacion) : Timestamp.now()
    };
    return await addDoc(sueldoColeccion, sueldoData);
  }



}
