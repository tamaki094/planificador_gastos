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
  WriteBatch,
  getDocs,
  QuerySnapshot
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


    async guardarSueldo(sueldo: Sueldo): Promise<boolean> {
      try {
        const sueldoColeccion: CollectionReference<Sueldo> = collection(this.firestore, 'sueldo') as CollectionReference<Sueldo>;
        const sueldoQuery: Query<Sueldo> = query(sueldoColeccion, where('usuario', '==', sueldo.usuario)) as Query<Sueldo>;


        const snapshot : QuerySnapshot<Sueldo> = await getDocs(sueldoQuery);

        if (snapshot.size > 0) {
          return false; // Ya existe un sueldo para este usuario
        }

        // Crear nuevo sueldo
        const sueldoData = {
          ...sueldo,
          fecha_creacion: sueldo.fecha_creacion ? Timestamp.fromDate(sueldo.fecha_creacion) : Timestamp.now(),
          fecha_actualizacion: Timestamp.now()
        };

        await addDoc(sueldoColeccion, sueldoData);
        return true; // Sueldo creado exitosamente

      }
      catch (error) {
        console.error('Error al guardar sueldo:', error);
        return false;
      }
    }

}
