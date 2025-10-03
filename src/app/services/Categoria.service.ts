import { inject, Injectable } from '@angular/core';
import {
  Firestore, // El servicio principal de Firestore
  collection, // Para obtener una referencia a una colección
  collectionData, // Para obtener un Observable de la colección (con ID)
  doc, // Para obtener una referencia a un documento específico
  docData, // Para obtener un Observable de un documento (con ID)
  query, // Para construir consultas
  where, // Para filtros en las consultas
  getDocs // Para obtener un snapshot de la consulta (una sola vez)
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';
import { Categoria } from '../interfaces';



@Injectable({
  providedIn: 'root'
})


export class CategoriaService {

  firestore = inject(Firestore);

  constructor() { }

  getAllCategorias(): Observable<Categoria[]> {
    const categoriasColeccion = collection(this.firestore, 'categorias');
    return collectionData(categoriasColeccion, { idField: 'id' }) as Observable<Categoria[]>;
  }

  getCategoriasById(id: string): Observable<Categoria | undefined> {
    const categoryDocRef = doc(this.firestore, `categorias/${id}`);
    return docData(categoryDocRef, { idField: 'id' }) as Observable<Categoria | undefined>;
  }

}
