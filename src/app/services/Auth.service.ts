import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { OAuthCredential, onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();
  public accesToken : string  | undefined;

  constructor(private auth: Auth) {
    // Escucha cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  async loginWithGoogle(){
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('email');
      provider.addScope('profile');

      console.log('🔄 Iniciando login con Google...');

      const result = await signInWithPopup(this.auth, provider);

      const credential = GoogleAuthProvider.credentialFromResult(result);
      this.accesToken = credential?.accessToken;

      if (!this.accesToken) {
        console.warn('⚠️ No se obtuvo el access token. Revisa los scopes.');
      }
      else {
        console.log('✅ Login con Google exitoso. Access Token obtenido');
      }

      console.log('✅ Usuario autenticado:', result.user?.email);

      return result;

    }
    catch (error: any) {
      console.error('❌ Error durante el login con Google:', error);
      throw error;
    }
  }

   async logout(){
    return await signOut(this.auth)
  }

  getCurrentUser(){
    return this.auth.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }


}
