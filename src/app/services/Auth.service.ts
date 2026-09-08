import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Firestore, // El servicio principal de Firestore
  collection, // Para obtener una referencia a una colección
  collectionData, // Para obtener un Observable de la colección (con ID)
  doc, // Para obtener una referencia a un documento específico
  docData, // Para obtener un Observable de un documento (con ID)
  query, // Para construir consultas
  where, // Para filtros en las consultas
  getDocs, // Para obtener un snapshot de la consulta (una sola vez)
  setDoc
} from '@angular/fire/firestore';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential
} from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public accessToken?: string;

  private http = inject(HttpClient);
  private firestore : Firestore = inject(Firestore);

  private apiUrl = environment.finance_flow_api.apiUrl;

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => this.currentUserSubject.next(user));
  }

  // ✅ Versión simple que funciona (como la tenías antes)
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/calendar.events');
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      console.log('🔄 Iniciando login con Google...');

      const result = await signInWithPopup(this.auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.accessToken = credential?.accessToken || undefined;

      console.log('✅ Login exitoso:', result.user?.email);

      console.log('🔑 Access Token obtenido:', !!this.accessToken);

      await this.createOrUpdateUser(result.user);


      return result;
    } catch (error: any) {
      console.error('❌ Error en login:', error);

      if (error.code === 'auth/popup-blocked') {
        alert('⚠️ El popup fue bloqueado. Por favor, permite popups para este sitio.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('ℹ️ Usuario cerró el popup');
      }

      throw error;
    }
  }

  private async createOrUpdateUser(user: User): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'usuarios', user.uid);

      const userData: Usuario = {
        uid: user.uid,
        nombre: user.displayName || 'Usuario',
        correo: user.email || '',
        foto_url: user.photoURL || '',
        telefono: user.phoneNumber || '',
        email_verificado: user.emailVerified,
        proveedor: user.providerData[0]?.providerId || 'google',
        fecha_creacion: user.metadata.creationTime ? new Date(user.metadata.creationTime) : new Date(),
        ultimo_login: new Date(),
        estatus_activo: true,
        fecha_actualizacion: new Date()
      };

      console.log('Enviando usuario a API Java...', userData);

      await firstValueFrom(this.http.post(this.apiUrl + 'Usuario' , userData));

      console.log('✅ Usuario guardado/sincronizado en API Java con éxito');

      await setDoc(userRef, userData, { merge: true });

      console.log('✅ Usuario creado/actualizado en Firestore:', user.uid);

    }
    catch (error) {
      console.error('❌ Error al crear/actualizar usuario:', error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
      this.accessToken = undefined;
      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  getCurrentUserUID(): string {
    return this.auth.currentUser?.uid || 'desconocido';
  }

  getCurrentUserEmail(): string {
    return this.auth.currentUser?.email || 'sin-email';
  }

  get accesToken(): string | undefined {
    return this.accessToken;
  }
}
