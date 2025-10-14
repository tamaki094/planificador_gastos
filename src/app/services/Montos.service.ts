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


}
