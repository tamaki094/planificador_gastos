import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential
} from '@angular/fire/auth';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public accessToken?: string;

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
