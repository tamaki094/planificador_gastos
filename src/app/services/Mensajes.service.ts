import { inject, Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  CollectionReference,
  serverTimestamp,
} from '@angular/fire/firestore';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Contacto, ContactoConUsuario, Gasto, Mensaje, Usuario } from '../interfaces';
import { Auth, user } from '@angular/fire/auth';
import { addDoc } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class MensajesService {

  firestore : Firestore = inject(Firestore);
  auth : Auth = inject(Auth)

  constructor() {

  }


  async getMensajesPorAmigo(de: string , para: string): Promise<Observable<Mensaje[]>> {
    const  mensajesColeccion: CollectionReference<Mensaje> = collection(this.firestore, 'mensajes') as CollectionReference<Mensaje>;

    const mensajes_enviados = query(
      mensajesColeccion,
      where("de_usuario", "==", de),
      where("para_usuario", "==", para)
    );

    const mensajes_recibidos = query(
      mensajesColeccion,
      where("de_usuario", "==", para),
      where("para_usuario", "==", de)
    );

    // **** Para entender :esto seria lo mismo que hacer dos consultas por separado y luego esperar a que ambas terminen, ****
    // **** pero con una sintaxis más limpia y eficiente.                                                                ****
    // const resultado = await Promise.all([
    //   getDocs(mensajes_enviados),
    //   getDocs(mensajes_recibidos)
    // ]);

    // const snapshotEnviados = resultado[0];
    // const snapshotRecibidos = resultado[1];

    // const [snapshotEnviados, snapshotRecibidos] = await Promise.all([getDocs(mensajes_enviados), getDocs(mensajes_recibidos)]);

    // const mensajes: Mensaje[] = [
    //   ...snapshotEnviados.docs.map(doc => {
    //     const data = doc.data() as Mensaje;
    //     return { ...data, fecha: (data.fecha as any).toDate() };
    //   }),
    //   ...snapshotRecibidos.docs.map(doc => {
    //     const data = doc.data() as Mensaje;
    //     return { ...data, fecha: (data.fecha as any).toDate() };
    //   })
    // ];

     // Combinar ambos observables
    const enviados$ = collectionData(mensajes_enviados, { idField: 'id' }) as Observable<Mensaje[]>;
    const recibidos$ = collectionData(mensajes_recibidos, { idField: 'id' }) as Observable<Mensaje[]>;

    return combineLatest([enviados$, recibidos$]).pipe(
      map(([enviados, recibidos]) => {
        const todos = [...enviados, ...recibidos];

        const mensajesConFechaDate = todos.map(mensaje => {
          let fechaValida: Date = new Date();

          if(mensaje.fecha){
            if(mensaje.fecha &&  typeof(mensaje.fecha as any).toDate() === 'function'){
              fechaValida = (mensaje.fecha as any).toDate();
            }
            else if(mensaje.fecha && (mensaje.fecha as any).seconds){
              fechaValida = new Date((mensaje.fecha as any).seconds * 1000);
            }
            else{
              fechaValida = new Date(mensaje.fecha as any);
            }
          }

          return {
            ...mensaje,
            fecha: fechaValida
          };
        });

        return mensajesConFechaDate.sort((a, b) => {
          const tiempoA = a.fecha ? (a.fecha as any).getTime() : 0;
          const tiempoB = b.fecha ? (b.fecha as any).getTime() : 0;
          return tiempoA - tiempoB;
        });
      })
    );
  }


  async enviarMensaje(mensaje : string, de : string, para : string) : Promise<boolean>{

    try{
      const mensajesColeccion : CollectionReference<Mensaje> = collection(this.firestore, 'mensajes') as CollectionReference<Mensaje>;
      const mensajeData = {
        de_usuario: de,
        fecha: serverTimestamp(),
        mensaje: mensaje,
        para_usuario: para
      }

      await addDoc(mensajesColeccion, mensajeData);

      return true;
    }
    catch(error){
      return false;
    }

  }
}
