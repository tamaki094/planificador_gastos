import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, signOut} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();


  constructor(private auth: Auth) {
    // Escucha cambios en el estado de autenticación
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

   async loginWithGoogle(){
    const provider = new GoogleAuthProvider();
    try{
      const result = await signInWithPopup(this.auth, provider);
      console.log('Usuario autenticado con Google:', result.user);
      return result.user;
    }
    catch(error){
      console.log('Error en login con Google:', error);
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
