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
import { Contacto, ContactoConUsuario, Gasto, Usuario } from '../interfaces';
import { Auth, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  firestore : Firestore = inject(Firestore);
  auth : Auth = inject(Auth);

  constructor() { }

  getContactosColeccion(contactosQuery: Query<Contacto>): Observable<Contacto[]> {
    return collectionData(contactosQuery, { idField: 'id' })
      .pipe(
        map((contacto: any[]) => contacto.map(contacto => ({
          ...contacto,
          fecha_amigo: contacto.fecha_amigo?.toDate() || new Date(),
        })))
      ) as Observable<Contacto[]>;
  }

   getUsuariosColeccion(usuariosQuery: Query<Usuario>): Observable<Usuario[]> {
    return collectionData(usuariosQuery, { idField: 'id' })
      .pipe(
        map((usuario: any[]) => usuario.map(usuario => ({
          ...usuario,
          fecha_creacion: usuario.fecha_creacion?.toDate() || new Date(),
        })))
      ) as Observable<Usuario[]>;
  }



  getContactosByUser(userId: string): Observable<Contacto[]> {
    console.log('Obteniendo contactos para el usuario:', userId);
    const contacosColeccion: CollectionReference<Contacto> = collection(this.firestore, 'contactos') as CollectionReference<Contacto>;
    const contacosQuery: Query<Contacto> = query(contacosColeccion, where('usuario', '==', userId)) as Query<Contacto>;

    return this.getContactosColeccion(contacosQuery);
  }

  getUserDataByUID(userUID: string): Observable<any> {
    console.log('Obteniendo datos del usuario para UID:', userUID);
    const userRef = doc(this.firestore, 'usuarios', userUID);

    return docData(userRef, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Error al obtener datos del usuario:', error);
        return of({
          uid: userUID,
          nombre: 'Desconocido',
          correo: 'sin-email',
          foto_url: '',
          telefono: '',
          email_verificado: false,
          proveedor: 'desconocido',
          fecha_creacion: new Date(),
          ultimo_login: new Date(),
          estatus_activo: true,
          fecha_actualizacion: new Date()
        });
      })
    )
  }

  // ✅ INNER JOIN con tipado correcto
  getContactosWithUserDataInnerJoin(userId: string): Observable<ContactoConUsuario[]> {
    return this.getContactosByUser(userId).pipe(
      switchMap(contactos => {
        if (contactos.length === 0) {
          return of([]);
        }

        const contactosWithUserData = contactos.map(contacto => {
          return this.getUserDataByUID(contacto.amigo).pipe(
            map(userData => ({
              contacto: contacto,
              userData: userData
            }))
          );
        });
        return combineLatest(contactosWithUserData);
      }),
      // ✅ Filtrar solo usuarios válidos
      map(results => results.filter(item =>
        item.userData !== null &&
        item.userData.uid !== 'Desconocido' // Evitar datos por defecto
      )),
      // ✅ Mapear usando la interface Usuario
      map(results => results.map(item => ({
        ...item.contacto,
        usuarioData: {
          uid: item.userData.uid,
          nombre: item.userData.nombre,
          correo: item.userData.correo,
          foto_url: item.userData.foto_url,
          telefono: item.userData.telefono,
          email_verificado: item.userData.email_verificado,
          proveedor: item.userData.proveedor,
          fecha_creacion: item.userData.fecha_creacion,
          ultimo_login: item.userData.ultimo_login,
          estatus_activo: item.userData.estatus_activo,
          fecha_actualizacion: item.userData.fecha_actualizacion
        } as Usuario
      } as ContactoConUsuario)))
    );
  }

  getUserDataByUsuario(usuario: string): Observable<any> {
    console.log('Obteniendo datos del usuario para usuario:', usuario);
    const usuariosColeccion: CollectionReference<Usuario> = collection(this.firestore, 'usuarios') as CollectionReference<Usuario>;
    const usuariosQuery: Query<Usuario> = query(usuariosColeccion, where('usuario', '==', usuario)) as Query<Usuario>;
    return this.getUsuariosColeccion(usuariosQuery).pipe(
      map(users => users.length > 0 ? users[0] : null)
    );
  }

  buscarUsuarioPorEmail(email: string) : Usuario {
    return {} as Usuario;
  }
  agregarContacto(uid: string, nombre: string, correo: string) {
    throw new Error('Method not implemented.');
  }
}
