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
import { Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { getDocs } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class MontosService {
  private firestore : Firestore = inject(Firestore);
  readonly COLECCION = 'montos' as const;

  consultaMontosPorUsuario(usuarioId: string): Observable<Montos | null> {
    const monto: CollectionReference<Montos> = collection(this.firestore, this.COLECCION) as CollectionReference<Montos>;
    const montoQuery: Query<Montos> = query(monto, where('usuario', '==', usuarioId)) as Query<Montos>;

    return collectionData(montoQuery, { idField: 'id' })
      .pipe(
        switchMap((montos: any[]) => {
          if (montos.length === 0) {
            return of(null); // ✅ Retorna Observable de null
          }

          const primerMonto = montos[0];
          console.log(`Monto obtenido de ${usuarioId}:`, primerMonto);

          return of({
            ...primerMonto,
            fecha_creacion: primerMonto.fecha_creacion?.toDate() || new Date(),
            fecha_actualizacion: primerMonto.fecha_actualizacion?.toDate() || new Date()
          });
        })
      );
  }


  async guardarMontos(montos :Montos): Promise<boolean>{
    try {
      const montosColeccion : CollectionReference<Montos> = collection(this.firestore, this.COLECCION) as CollectionReference<Montos>;
      const montoQuery: Query<Montos> = query(montosColeccion, where('usuario', '==', montos.usuario)) as Query<Montos>;

      const snapshot = await getDocs(montoQuery);

      const montoData = {
        ...montos,
        fecha_creacion: Timestamp.now(),
        fecha_actualizacion: Timestamp.now()
      };

      if(snapshot.size > 0){
        await updateDoc(doc(this.firestore, `${this.COLECCION}/${snapshot.docs[0].id}`), montoData);
        return  true;
      }
      alert('Montos guardados correctamente.');
      await addDoc(montosColeccion, montoData);
      return true;
    }
    catch(error){
      return false;
    }
  }
}
