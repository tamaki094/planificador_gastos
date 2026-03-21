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
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Contacto, ContactoConUsuario, Gasto, Mensaje, Usuario } from '../interfaces';
import { Auth, user } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  firestore : Firestore = inject(Firestore);
  auth : Auth = inject(Auth)

  constructor() {

  }

  // getMensajesPorAmigo(de: string , para: string): Observable<Gasto[]> {
  //   const  mensajesColeccion: CollectionReference<Mensaje> = collection(this.firestore, 'mensajes') as CollectionReference<Mensaje>;



  // }


}
