import { Injectable, inject } from '@angular/core';
import { Montos } from '../interfaces';
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


@Injectable({
  providedIn: 'root'
})
export class MontosService {
  private firestore : Firestore = inject(Firestore);


  async guardarMontos(montos :Montos): Promise<boolean>{
    try {
      const montosColeccion : CollectionReference<Montos> = collection(this.firestore, 'montos') as CollectionReference<Montos>;
      const montoData = {
        ...montos,
        fecha_creacion: Timestamp.now(),
        fecha_actualizacion: Timestamp.now()
      };
      await addDoc(montosColeccion, montoData);
      return true;
    }
    catch(error){
      console.error('Error al guardar montos:', error);
      return false;
    }
  }
}
