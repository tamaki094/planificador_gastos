import { inject, Injectable } from '@angular/core';

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
import { Gasto } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GastoService {



  firestore : Firestore = inject(Firestore);


   getAllGastosByUser(userId: string): Observable<Gasto[]> {
    const gastosColeccion: CollectionReference<Gasto> = collection(this.firestore, 'gastos') as CollectionReference<Gasto>;
    const gastosQuery: Query<Gasto> = query(gastosColeccion, where('usuario', '==', userId)) as Query<Gasto>;

    return collectionData(gastosQuery, { idField: 'id' })
      .pipe(
        map((gastos: any[]) => gastos.map(gasto => ({
          ...gasto,
          fecha_creacion: gasto.fecha_creacion?.toDate() || new Date()
        })))
      ) as Observable<Gasto[]>;
  }


  /**
   * Obtiene todos los gastos desde Firestore
   * @returns Observable con la lista de gastos
   */
  getAllGastos(tipo : number): Observable<Gasto[]> {
    const gastosColeccion: CollectionReference<Gasto> = collection(this.firestore, 'gastos') as CollectionReference<Gasto>;
    const gastosQuery: Query<Gasto> = query(gastosColeccion, where('tipo_gasto', '==', tipo)) as Query<Gasto>;

    return collectionData(gastosQuery,{ idField: 'id'})
      .pipe(
        map((gastos: any[]) => gastos.map(gasto => ({
          ...gasto,
          fecha_creacion: gasto.fecha_creacion?.toDate() || new Date()
        })))
      ) as Observable<Gasto[]>;
  }


  /**
   * Obtiene un gasto por su ID
   * @param id ID del gasto a obtener
   * @returns Observable con el gasto encontrado o undefined
   */
  getGastoById(id : string): Observable<Gasto | undefined>{
    const gastoDocRef : DocumentReference<Gasto> =  doc(this.firestore, `gastos/${id}`) as DocumentReference<Gasto>;
    return docData(gastoDocRef, { idField: 'id'})
      .pipe(
        map((gasto : any) => gasto ? {
          ...gasto,
          fecha_creacion: gasto.fecha_creacion?.toDate() || new Date()
        }: undefined)
      ) as Observable<Gasto | undefined>;
  }

  /**
   * Obtiene los gastos de un tipo específico
   * @param tipo Tipo de gasto a filtrar
   * @returns Observable con la lista de gastos filtrados
   */
  getGastosByTipo(tipo: number): Observable<Gasto[]>{
    const gastosColeccion : CollectionReference<Gasto> = collection(this.firestore, 'gastos') as CollectionReference<Gasto>;
    const gastoQuery :Query<Gasto> = query(
      gastosColeccion,
      where('tipo_gasto', '==', tipo),
      orderBy('fecha_creacion', 'desc')
    );

    return collectionData(gastoQuery, {idField: 'id'})
    .pipe(
      map((gastos : any[]) => gastos.map(
        gasto => ({
          ...gasto,
          fecha_creacion: gasto.fecha_creacion?.toDate() || new Date()
        })
      ))
    )
  }

  /**
   * Crea un nuevo gasto
   * @param gasto Gasto a crear
   * @returns Promesa con el resultado de la operación
   */
  async crearGasto(gasto : Gasto): Promise<any>{
    console.log('Creando gasto:', gasto);
    const gastosColeccion : CollectionReference<Gasto> = collection(this.firestore, 'gastos') as CollectionReference<Gasto>;
    const gastoData = {
      ...gasto,
      fecha_creacion: gasto.fecha_creacion ? Timestamp.fromDate(gasto.fecha_creacion) : Timestamp.now()
    };
    return await addDoc(gastosColeccion, gastoData);
  }

  /**
   * Actualiza un gasto existente
   * @param id ID del gasto a eliminar
   * @param gasto Gasto a actualizar
   * @returns Promesa con el resultado de la operación
   */
  async actualizarGasto(id: string, gasto: Partial<Gasto>): Promise<void>{
    const gastoDocRef : DocumentReference<Gasto> = doc(this.firestore, `gastos/${id}`) as DocumentReference<Gasto>;
    const gastoData = {
      ...gasto,
      ...(gasto.fecha_creacion && { fecha_creacion: Timestamp.fromDate(gasto.fecha_creacion) })
    };

    return updateDoc(gastoDocRef, gastoData as DocumentData);
  }

  /**
   * Elimina un gasto por su ID
   * @param id ID del gasto a eliminar
   * @returns Promesa con el resultado de la operación
   */
  async eliminarGasto(id: string): Promise<void> {
    const gastoDocRef : DocumentReference<Gasto> = doc(this.firestore, `gastos/${id}`) as DocumentReference<Gasto>;
    return deleteDoc(gastoDocRef);
  }
  async eliminarGastos(gastos: Gasto[]) : Promise<void> {
    const batch : WriteBatch = writeBatch(this.firestore);
    gastos.forEach(gasto => {
      const gastoDocRef = doc(this.firestore, `gastos/${gasto.id}`) as DocumentReference<Gasto>;
      batch.delete(gastoDocRef);
    });
    await batch.commit();
  }
}

